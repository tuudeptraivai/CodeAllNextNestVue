import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Actor } from './schemas/actor.schema';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class ActorService implements OnModuleInit {
  private readonly logger = new Logger(ActorService.name);

  constructor(
    @InjectModel(Actor.name) private actorModel: Model<Actor>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const startupSync = this.configService.get('CRAWLER_STARTUP_SYNC') === 'true';
    if (startupSync) {
      this.logger.log('CRAWLER_STARTUP_SYNC is enabled. Triggering initial actor detail sync...');
      // Run in background after a short delay to ensure everything is ready
      setTimeout(() => {
        this.handleCron();
      }, 5000);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const cronEnabled = this.configService.get('CRON_ENABLED') === 'true' || this.configService.get('CRON_ENABLED') === true;
    if (!cronEnabled) {
      this.logger.log('Cron jobs are globally disabled. Skipping actor sync.');
      return;
    }

    this.logger.log('Starting background job to sync missing actor details (Bio, Nationality, Avatar)...');
    const actorsWithMissingInfo = await this.actorModel.find({ 
      $or: [
        { avatar: { $exists: false } }, { avatar: '' }, { avatar: null },
        { bio: { $exists: false } }, { bio: '' }, { bio: null },
        { nationality: { $exists: false } }, { nationality: '' }, { nationality: null }
      ]
    }).limit(50).exec();

    this.logger.log(`Found ${actorsWithMissingInfo.length} actors with missing details.`);
    for (const actor of actorsWithMissingInfo) {
      this.logger.log(`[Sync] Processing actor: ${actor.name}`);
      const details = await this.syncActorDetails(actor.name);
      if (details) {
        if (details.avatar) actor.avatar = details.avatar;
        if (details.bio) actor.bio = details.bio;
        if (details.birthDate) actor.birthDate = details.birthDate;
        if (details.nationality) actor.nationality = details.nationality;
        await actor.save();
        this.logger.log(`Updated details for actor: ${actor.name}`);
      }
      // Sleep to avoid hitting API rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async findAll() {
    return this.actorModel.find().exec();
  }

  async findOne(id: string) {
    const actor = await this.actorModel.findById(id).exec();
    if (!actor) throw new NotFoundException('Actor not found');
    return actor;
  }

  async create(data: any) {
    const newActor = new this.actorModel(data);
    return newActor.save();
  }

  async update(id: string, data: any) {
    return this.actorModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string) {
    return this.actorModel.findByIdAndDelete(id).exec();
  }

  async upsert(data: any) {
    let actor = await this.actorModel.findOne({ name: data.name }).exec();
    
    if (!actor) {
      const details = await this.syncActorDetails(data.name);
      actor = new this.actorModel({ ...data, ...details });
      return actor.save();
    } else if (!actor.avatar || !actor.bio || !actor.nationality) {
      const details = await this.syncActorDetails(data.name);
      if (details) {
        if (!actor.avatar && details.avatar) actor.avatar = details.avatar;
        if (!actor.bio && details.bio) actor.bio = details.bio;
        if (!actor.birthDate && details.birthDate) actor.birthDate = details.birthDate;
        if (!actor.nationality && details.nationality) actor.nationality = details.nationality;
        return actor.save();
      }
    }
    
    return actor;
  }

  async syncActorDetails(actorName: string) {
    const apiKey = this.configService.get('TMDB_API_KEY');
    if (!apiKey) {
      this.logger.warn('TMDB_API_KEY not found in config. Skipping actor sync.');
      return null;
    }

    try {
      // Step 1: Search for the person to get TMDB ID
      const searchUrl = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(actorName)}`;
      const searchResponse = await axios.get(searchUrl);
      const results = searchResponse.data.results;

      if (results && results.length > 0) {
        const tmdbId = results[0].id;
        
        // Step 2: Get detailed info by ID
        const detailUrl = `https://api.themoviedb.org/3/person/${tmdbId}?api_key=${apiKey}&language=en-US`;
        const detailResponse = await axios.get(detailUrl);
        const data = detailResponse.data;

        return {
          avatar: data.profile_path ? `https://image.tmdb.org/p/w500${data.profile_path}` : null,
          bio: data.biography || null,
          birthDate: data.birthday ? new Date(data.birthday) : null,
          nationality: data.place_of_birth || null,
        };
      }
    } catch (error) {
      this.logger.error(`Error syncing actor details for ${actorName}: ${error.message}`);
    }
    return null;
  }
}
