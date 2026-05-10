<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, EffectFade, Thumbs } from 'swiper/modules';
import { useI18n } from 'vue-i18n';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/thumbs';

const { t } = useI18n();

import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import MovieCard from '../components/movie/MovieCard.vue';
import LandscapeMovieSlider from '../components/movie/LandscapeMovieSlider.vue';
import TopSeriesSection from '../components/movie/TopSeriesSection.vue';
import LikeButton from '../components/common/LikeButton.vue';
import BookmarkButton from '../components/common/BookmarkButton.vue';
import SectionHeader from '../components/common/SectionHeader.vue';
import { MOCK_MOVIES, type Movie } from '../data/mockData';
import { 
  fetchTopLikedFilms, 
  fetchHotCategories, 
  fetchNewFilms, 
  fetchTopSeries, 
  fetchFilmsByFilter 
} from '../services/api';

const categoryGradients = [
  'from-red-600 to-red-900',
  'from-blue-600 to-purple-900',
  'from-purple-600 to-pink-900',
  'from-orange-600 to-red-900',
  'from-red-800 to-amber-900',
  'from-pink-600 to-rose-900',
];

const fallbackCategories = [
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { name: 'Thái Lan', slug: 'thai-lan' },
  { name: 'Chiếu Rạp', slug: 'chieu-rap' },
  { name: 'Kinh Dị', slug: 'kinh-di' },
  { name: 'Cổ Trang', slug: 'co-trang' },
  { name: 'Chiến Tranh', slug: 'chien-tranh' },
];

const heroMovies = ref<Movie[]>([]);
const hotFilms = computed(() => heroMovies.value);
const countryFilms = computed(() => heroMovies.value);
const hotCategories = ref<any[]>([]);
const topSeries = ref<Movie[]>([]);
const koreanSeries = ref<Movie[]>([]);
const chineseSeries = ref<Movie[]>([]);
const westernSeries = ref<Movie[]>([]);
const newReleases = ref<Movie[]>([]);
const loading = ref(true);
const thumbsSwiper = ref<SwiperType | null>(null);

const setThumbsSwiper = (swiper: SwiperType) => {
  thumbsSwiper.value = swiper;
};

onMounted(async () => {
  try {
    const [hero, cats, news, series, kr, cn, west] = await Promise.all([
      fetchTopLikedFilms().catch(() => []),
      fetchHotCategories().catch(() => []),
      fetchNewFilms(12).catch(() => []),
      fetchTopSeries(10).catch(() => []),
      fetchFilmsByFilter({ country: 'han-quoc', limit: 10 }).catch(() => ({ data: [] })),
      fetchFilmsByFilter({ country: 'trung-quoc', limit: 10 }).catch(() => ({ data: [] })),
      fetchFilmsByFilter({ country: 'au-my', limit: 10 }).catch(() => ({ data: [] }))
    ]);

    heroMovies.value = hero.length > 0 ? hero : MOCK_MOVIES.slice(0, 6);
    hotCategories.value = cats.length > 0 ? cats.slice(0, 6) : fallbackCategories;
    newReleases.value = news.length > 0 ? news : MOCK_MOVIES.slice(6, 12);
    topSeries.value = series.length > 0 ? series : MOCK_MOVIES.slice(0, 10);
    koreanSeries.value = kr.data?.length > 0 ? kr.data : MOCK_MOVIES.slice(0, 8);
    chineseSeries.value = cn.data?.length > 0 ? cn.data : MOCK_MOVIES.slice(8, 16);
    westernSeries.value = west.data?.length > 0 ? west.data : MOCK_MOVIES.slice(3, 11);
    
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    heroMovies.value = MOCK_MOVIES.slice(0, 6);
    newReleases.value = MOCK_MOVIES.slice(6, 12);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-[#0b1326] selection:bg-primary selection:text-black">
    <Header />

    <div v-if="loading" class="min-h-screen flex items-center justify-center bg-[#0b1326]">
      <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <main v-else class="min-h-screen pt-20 overflow-x-hidden">
      <!-- Hero Slider Section -->
      <section class="relative w-full h-[70vh] md:h-[85vh] group">
        <Swiper
          :modules="[Autoplay, EffectFade, Thumbs]"
          effect="fade"
          :autoplay="{ delay: 3000, disableOnInteraction: false }"
          :thumbs="{ swiper: thumbsSwiper }"
          class="w-full h-full"
        >
          <SwiperSlide v-for="movie in hotFilms" :key="(movie._id || movie.id || '').toString()">
            <div class="relative w-full h-full">
              <!-- Backdrop Image -->
              <div 
                class="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] scale-110 group-hover:scale-100"
                :style="{ backgroundImage: `url(${movie.thumb_url || movie.backdrop || movie.poster})` }"
              >
                <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 30px 30px;"></div>
              </div>

              <!-- Content Overlay -->
              <div class="absolute inset-0 bg-gradient-to-r from-[#0b1326] via-[#0b1326]/60 to-transparent">
                <div class="max-w-[1440px] mx-auto px-6 md:px-16 h-full flex items-center">
                  <div class="max-w-[700px] space-y-8 mt-12 md:mt-20">
                    <div class="space-y-4">
                      <h1 class="text-5xl md:text-8xl font-black text-white uppercase font-display leading-[0.85] tracking-tighter drop-shadow-2xl">
                        {{ movie.title }}
                      </h1>
                      <p class="text-primary font-bold text-sm md:text-base uppercase tracking-[0.2em] leading-relaxed line-clamp-2">
                        {{ movie.description?.split('.')?.[0] || t('home.hero_fallback_desc') }}
                      </p>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center gap-6 pt-4">
                      <router-link :to="`/watch/${movie.slug}`" class="w-16 h-16 md:w-20 md:h-20 bg-primary text-black rounded-full flex items-center justify-center play-glow transition-all active:scale-95 shadow-2xl shadow-primary/40">
                        <i class="fa-solid fa-play ml-1 text-black text-2xl"></i>
                      </router-link>
                      
                      <router-link :to="`/movie/${movie.slug}`" class="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:bg-primary hover:text-black transition-all">
                        {{ t('common.watch_now') }}
                      </router-link>

                      <div class="flex items-center gap-3">
                        <LikeButton :film-id="movie._id || movie.id || ''" class-name="!w-12 !h-12" />
                        <BookmarkButton :film-id="movie._id || movie.id || ''" class-name="!w-12 !h-12" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        <!-- Thumbnails -->
        <div class="absolute bottom-12 right-6 md:right-16 z-20 w-full max-w-[400px] hidden md:block">
          <Swiper
            @swiper="setThumbsSwiper"
            :space-between="10"
            :slides-per-view="6"
            :watch-slides-progress="true"
            :modules="[Thumbs]"
            class="thumbs-swiper"
          >
            <SwiperSlide v-for="movie in countryFilms" :key="(movie._id || movie.id || '').toString()" class="cursor-pointer opacity-40 hover:opacity-100 transition-all [&.swiper-slide-thumb-active]:opacity-100 [&.swiper-slide-thumb-active]:ring-2 [&.swiper-slide-thumb-active]:ring-primary rounded-lg overflow-hidden border border-white/20">
              <img :src="movie.poster_url || movie.poster" alt="thumb" class="w-full h-full object-cover aspect-[2/3]" />
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="max-w-[1440px] mx-auto px-6 md:px-16 mt-16 md:mt-24 space-y-8">
        <h2 class="text-2xl md:text-3xl font-black text-white uppercase font-display tracking-tight">
          {{ t('home.categories_title') }} <span class="text-primary">{{ t('home.categories_highlight') }}</span>
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          <router-link 
            v-for="(cat, index) in hotCategories" 
            :key="cat.slug || cat._id" 
            :to="`/category/${cat.slug || cat.name}`"
            :class="[
              'relative h-32 md:h-40 rounded-2xl overflow-hidden group p-6 flex flex-col justify-end bg-gradient-to-br hover:scale-105 transition-all duration-300 shadow-xl',
              categoryGradients[index % categoryGradients.length]
            ]"
          >
            <div class="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <i class="fa-solid fa-film text-6xl text-white"></i>
            </div>
            <div class="relative z-10 space-y-2">
              <h4 class="text-white text-xl md:text-2xl font-black uppercase tracking-tight">
                {{ typeof cat.name === 'string' ? cat.name : (cat.name?.name || 'Category') }}
              </h4>
              <div class="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                {{ t('home.view_topic') }} <i class="fa-solid fa-chevron-right text-[8px]"></i>
              </div>
            </div>
          </router-link>
        </div>
      </section>

      <!-- Featured Sections -->
      <section class="max-w-[1440px] mx-auto px-6 md:px-16 mt-16 md:mt-24 space-y-12">
        <LandscapeMovieSlider 
          id="korean"
          :title="t('home.korean_series')" 
          :highlight="t('home.highlight_new')" 
          :movies="koreanSeries" 
        />
        
        <LandscapeMovieSlider 
          id="chinese"
          :title="t('home.chinese_series')" 
          :highlight="t('home.highlight_new')" 
          :movies="chineseSeries" 
        />

        <LandscapeMovieSlider 
          id="western"
          :title="t('home.western_series')" 
          :highlight="t('home.highlight_only_new')" 
          :movies="westernSeries" 
        />
      </section>

      <!-- Content Grid Sections -->
      <section class="max-w-[1440px] mx-auto px-6 md:px-16 mt-16 space-y-24 pb-24">
        <TopSeriesSection :movies="topSeries" />

        <div class="space-y-10">
          <SectionHeader :title="t('home.new_releases')" :highlight="t('home.highlight_update')" view-all-link="/movie" />
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            <div v-for="movie in newReleases" :key="movie.id || movie._id">
              <MovieCard :movie="movie" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  </div>
</template>

<style scoped>
.play-glow {
  box-shadow: 0 0 30px rgba(78, 222, 163, 0.4);
}
.play-glow:hover {
  box-shadow: 0 0 50px rgba(78, 222, 163, 0.6);
}

.thumbs-swiper :deep(.swiper-slide) {
  height: auto;
}
</style>
