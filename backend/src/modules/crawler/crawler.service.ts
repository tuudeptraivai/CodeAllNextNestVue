import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { FilmService } from '../movie/film.service';
import { TypeService } from '../movie/type.service';
import { ActorService } from '../movie/actor.service';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrawlerLog } from './schemas/crawler-log.schema';

@Injectable()
export class CrawlerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CrawlerService.name);
  private readonly apiBaseUrl: string;
  private isSyncing = false;

  constructor(
    private readonly filmService: FilmService,
    private readonly typeService: TypeService,
    private readonly actorService: ActorService,
    private readonly configService: ConfigService,
    @InjectModel(CrawlerLog.name) private crawlerLogModel: Model<CrawlerLog>,
  ) {
    this.apiBaseUrl = this.configService.get<string>('OPHIM_API_BASE_URL') || 'https://ophim1.cc/api';
  }

  async onApplicationBootstrap() {
    const cronEnabled = this.configService.get('CRON_ENABLED') === 'true' || this.configService.get('CRON_ENABLED') === true;
    const startupSync = this.configService.get<boolean>('CRAWLER_STARTUP_SYNC');
    
    if (startupSync && cronEnabled) {
      this.logger.log('Startup sync enabled, starting initial crawl...');
      this.syncMovies(1); // Sync page 1 on startup
    } else if (startupSync && !cronEnabled) {
      this.logger.log('Startup sync requested but skipped because cron jobs are globally disabled.');
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCron() {
    const cronEnabled = this.configService.get('CRON_ENABLED') === 'true' || this.configService.get('CRON_ENABLED') === true;
    const crawlerEnabled = this.configService.get<boolean>('CRAWLER_ENABLED');
    
    if (!cronEnabled) {
      this.logger.debug('Cron jobs are globally disabled. Skipping crawler sync.');
      return;
    }
    
    if (!crawlerEnabled) return;

    if (this.isSyncing) {
      this.logger.warn('Previous sync is still running, skipping this interval.');
      return;
    }

    this.logger.debug('Starting cron job to sync new movies (Page 1)...');
    // For regular cron, we usually only need page 1 to get the latest updates
    await this.syncMovies(1, 1); 
  }

  async syncMovies(startPage: number = 1, endPage?: number) {
    if (this.isSyncing) return;
    this.isSyncing = true;
    
    let syncedCount = 0;
    let currentPage = startPage;
    let totalPages = endPage || startPage;
    
    const log = new this.crawlerLogModel({
      startTime: new Date(),
      status: 'running',
      pagesCrawled: 0,
    });
    await log.save();

    try {
      this.logger.log(`Starting crawl from page ${startPage}...`);
      
      while (currentPage <= totalPages) {
        try {
          this.logger.log(`Fetching page ${currentPage}/${totalPages}...`);
          const url = `${this.apiBaseUrl.replace(/\/$/, '')}/danh-sach/phim-moi-cap-nhat?page=${currentPage}`;
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Referer': 'https://ophim1.com/',
            }
          });

          // Update totalPages if not provided and available in response
          if (!endPage && response.data.pagination) {
            totalPages = response.data.pagination.totalPages;
            this.logger.log(`Detected total pages: ${totalPages}`);
          }

          const movies = response.data.items;
          if (!movies || movies.length === 0) break;

          for (const movieItem of movies) {
            await this.syncMovieDetails(movieItem.slug);
            syncedCount++;
          }
          
          log.pagesCrawled = currentPage - startPage + 1;
          currentPage++;
          
          // Small delay between pages to be nice to the API
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          this.logger.error(`Error syncing page ${currentPage}:`, error.response?.data || error.message);
          currentPage++; // Skip failed page
        }
      }
      log.status = 'success';
    } catch (error) {
      log.status = 'failed';
      log.error = error.message;
      this.logger.error(`Crawl failed: ${error.message}`);
    } finally {
      log.endTime = new Date();
      log.moviesSynced = syncedCount;
      await log.save();
      this.isSyncing = false;
      this.logger.log(`Sync finished. Total movies synced: ${syncedCount}`);
    }
  }

  async syncMovieDetails(slug: string) {
    try {
      this.logger.log(`Syncing details for movie: ${slug}`);
      const url = `${this.apiBaseUrl.replace(/\/$/, '')}/phim/${slug}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://ophim1.com/',
        }
      });
      const movieData = response.data.movie;
      const episodes = response.data.episodes;

      // 1. Handle Genres (Category)
      const genreIds = [];
      if (movieData.category) {
        for (const cat of movieData.category) {
          const type = await this.typeService.upsert({
            name: cat.name,
            slug: cat.slug,
            isPublic: true,
          });
          genreIds.push(type._id);
        }
      }

      // 2. Handle Actors
      const actorIds = [];
      if (movieData.actor && Array.isArray(movieData.actor)) {
        for (const actorName of movieData.actor) {
          if (!actorName || actorName.trim() === "" || actorName === "") continue;
          const actor = await this.actorService.upsert({ name: actorName.trim() });
          actorIds.push(actor._id);
        }
      }

      const normalizeUrl = (url: string) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `https://img.phim.ng/uploads/movies/${url}`;
      };

      // 3. Create Full Movie Data with explicit release year
      const fullMovieData = {
        ...movieData,
        episodes,
        types: genreIds,
        actors: actorIds,
        releaseYear: parseInt(movieData.year),
        thumb_url: normalizeUrl(movieData.thumb_url),
        poster_url: normalizeUrl(movieData.poster_url),
      };

      await this.filmService.createOrUpdate(fullMovieData);
    } catch (error) {
      this.logger.error(`Error syncing movie ${slug}:`, error.response?.data || error.message);
    }
  }

  async syncGenres() {
    try {
      this.logger.log('Syncing genres from OPhim...');
      const response = await axios.get('https://ophim1.com/the-loai');
      const genres = response.data;

      for (const genre of genres) {
        await this.typeService.upsert({
          name: genre.name,
          slug: genre.slug,
          description: `Thể loại ${genre.name}`,
          isPublic: true,
        });
      }
      this.logger.log(`Synced ${genres.length} genres.`);
      return genres;
    } catch (error) {
      this.logger.error('Error syncing genres:', error.message);
      throw error;
    }
  }

  async getLogs() {
    return this.crawlerLogModel.find().sort({ startTime: -1 }).limit(50).exec();
  }
}
