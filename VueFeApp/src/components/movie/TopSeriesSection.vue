<script setup lang="ts">
import { computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Autoplay } from 'swiper/modules';
import type { Movie } from '../../data/mockData';
import LikeButton from '../../components/common/LikeButton.vue';
import BookmarkButton from '../../components/common/BookmarkButton.vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

const { t } = useI18n();
const $q = useQuasar();
const isMobile = computed(() => $q.platform.is.mobile || window.innerWidth < 1024);

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

interface Props {
  movies: Movie[];
}

defineProps<Props>();

const getCategoryName = (cat: any) => {
  if (typeof cat === 'string') return cat;
  if (Array.isArray(cat)) return cat.map(c => c.name || c).join(' • ');
  return cat?.name || '';
};
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-8 items-start relative">
    <!-- Left Title Section -->
    <div class="w-full lg:w-48 flex-shrink-0 pt-4 relative z-10 bg-[#0b1326]">
      <h2 class="text-2xl md:text-3xl font-black text-white uppercase font-display leading-tight">
        {{ t('home.top_10_series_title') }} <span class="text-primary block">{{ t('home.top_10_series_highlight') }}</span>
      </h2>
      <div class="mt-4 flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
        {{ t('home.trending') }} <span class="w-8 h-[1px] bg-white/10"></span>
      </div>
    </div>

    <div class="w-full flex-1 relative group/slider min-w-0">
      <Swiper
        :modules="[Navigation, Autoplay]"
        :space-between="20"
        :slides-per-view="2"
        :autoplay="{ delay: 3000, disableOnInteraction: false }"
        :navigation="{
          nextEl: '.next-top-series',
          prevEl: '.prev-top-series',
        }"
        :breakpoints="{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1440: { slidesPerView: 6 },
        }"
        class="w-full movie-swiper overflow-hidden"
      >
        <SwiperSlide v-for="(movie, index) in movies.slice(0, 10)" :key="(movie.id || movie._id || index).toString()" class="pb-12">
          <a-popover 
            v-if="!isMobile"
            placement="right"
            trigger="hover"
            :mouse-enter-delay="0.3"
            overlay-class-name="movie-card-popover"
            :destroy-tooltip-on-hide="true"
          >
            <template #content>
              <div class="bg-[#1a1f2e] w-[280px] overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <!-- Popup Image Header -->
                <div class="relative aspect-video">
                  <img 
                    class="w-full h-full object-cover" 
                    :src="movie.thumb_url || movie.backdrop || movie.poster" 
                    :alt="movie.title"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-transparent to-transparent"></div>
                  <router-link 
                    :to="`/movie/${movie.slug}`"
                    class="absolute inset-0 flex items-center justify-center group/play"
                  >
                    <div class="w-10 h-10 rounded-full bg-primary/90 text-black flex items-center justify-center shadow-2xl scale-75 group-hover/play:scale-100 transition-transform duration-300">
                      <i class="fa-solid fa-play ml-1 text-black text-sm"></i>
                    </div>
                  </router-link>
                </div>

                <!-- Popup Content -->
                <div class="p-4 space-y-4 -mt-6 relative z-10">
                  <div class="space-y-1">
                    <h3 class="text-white text-base font-black uppercase tracking-tight line-clamp-1">{{ movie.title }}</h3>
                    <p class="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">{{ getCategoryName(movie.category) }}</p>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center gap-2">
                    <router-link 
                      :to="`/movie/${movie.slug}`"
                      class="flex-1 bg-primary text-black px-3 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-primary/80 transition-all active:scale-95"
                    >
                      <i class="fa-solid fa-play text-[10px]"></i> {{ t('common.watch_now') }}
                    </router-link>
                    <LikeButton :film-id="movie._id || movie.id || ''" class-name="!w-10 !h-10 !rounded-lg" />
                    <BookmarkButton :film-id="movie._id || movie.id || ''" class-name="!w-10 !h-10 !rounded-lg" />
                  </div>

                  <!-- Meta Info Badges -->
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="px-2 py-1 bg-amber-400 text-[#543b00] text-[9px] font-black rounded-md flex items-center gap-1">
                      IMDb {{ movie.rating || '8.5' }}
                    </div>
                    <div class="px-2 py-1 bg-white/5 border border-white/10 text-white/80 text-[9px] font-bold rounded-md">
                      T16
                    </div>
                    <div class="px-2 py-1 bg-white/5 border border-white/10 text-white/80 text-[9px] font-bold rounded-md">
                      {{ movie.year }}
                    </div>
                  </div>

                  <!-- Footer Genres -->
                  <div class="pt-2 flex items-center gap-2 border-t border-white/5">
                    <span class="w-1 h-1 rounded-full bg-primary/40"></span>
                    <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">
                      {{ getCategoryName(movie.category) }}
                    </p>
                  </div>
                </div>
              </div>
            </template>

            <!-- Base Card Trigger -->
            <router-link :to="`/movie/${movie.slug}`" class="group block relative z-10 transition-all duration-300">
              <!-- Ranking Number -->
              <div class="absolute -bottom-6 -left-4 z-20 text-7xl md:text-8xl font-black italic text-transparent stroke-text select-none transition-opacity">
                {{ index + 1 }}
              </div>

              <!-- Base Card -->
              <div class="block space-y-4 relative z-10 hover:scale-105 transition-all duration-500">
                <div class="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-white/5">
                  <img 
                    :src="movie.poster_url || movie.poster" 
                    :alt="movie.title" 
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  <!-- Progress Badge -->
                  <div class="absolute bottom-3 right-3 flex gap-1">
                    <div class="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10 uppercase">
                      {{ movie?.quality || 'HD' }}
                    </div>
                    <div class="bg-green-600/90 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase">
                      {{ t('common.episode') }} {{ index + 5 }}
                    </div>
                  </div>
                </div>

                <div class="pl-12 md:pl-16 space-y-1 min-h-[80px]">
                  <h4 class="text-white font-bold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">{{ movie.title }}</h4>
                  <p class="text-slate-500 text-[10px] font-medium uppercase tracking-tight line-clamp-1">{{ getCategoryName(movie.category) }}</p>
                </div>
              </div>
            </router-link>
          </a-popover>

          <!-- For Mobile (without Popover) -->
          <router-link v-else :to="`/movie/${movie.slug}`" class="group block relative z-10 transition-all duration-300 pb-12">
             <!-- Ranking Number -->
             <div class="absolute -bottom-6 -left-4 z-20 text-7xl md:text-8xl font-black italic text-transparent stroke-text select-none transition-opacity">
                {{ index + 1 }}
              </div>

              <!-- Base Card -->
              <div class="block space-y-4 relative z-10 hover:scale-105 transition-all duration-500">
                <div class="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-white/5">
                  <img 
                    :src="movie.poster_url || movie.poster" 
                    :alt="movie.title" 
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  <!-- Progress Badge -->
                  <div class="absolute bottom-3 right-3 flex gap-1">
                    <div class="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10 uppercase">
                      {{ movie?.quality || 'HD' }}
                    </div>
                    <div class="bg-green-600/90 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase">
                      {{ t('common.episode') }} {{ index + 5 }}
                    </div>
                  </div>
                </div>

                <div class="pl-12 md:pl-16 space-y-1 min-h-[80px]">
                  <h4 class="text-white font-bold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">{{ movie.title }}</h4>
                  <p class="text-slate-500 text-[10px] font-medium uppercase tracking-tight line-clamp-1">{{ getCategoryName(movie.category) }}</p>
                </div>
              </div>
          </router-link>
        </SwiperSlide>
      </Swiper>

      <!-- Navigation Buttons -->
      <button class="prev-top-series absolute left-4 top-1/2 -translate-y-12 z-30 w-12 h-12 rounded-full bg-white/90 text-black shadow-2xl flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-white hover:text-black">
        <i class="fa-solid fa-chevron-left text-sm"></i>
      </button>
      <button class="next-top-series absolute right-4 top-1/2 -translate-y-12 z-30 w-12 h-12 rounded-full bg-white/90 text-black shadow-2xl flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-white hover:text-black">
        <i class="fa-solid fa-chevron-right text-sm"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.stroke-text {
  -webkit-text-stroke: 2px rgba(255, 255, 255, 0.2);
  text-shadow: 0 0 30px rgba(0,0,0,0.5);
}
</style>
