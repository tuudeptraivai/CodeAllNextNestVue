<script setup lang="ts">
import LikeButton from '@/components/common/LikeButton.vue';
import BookmarkButton from '@/components/common/BookmarkButton.vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

interface Movie {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  poster_url?: string;
  poster?: string;
  thumb_url?: string;
  backdrop?: string;
  year: number;
  quality?: string;
  rating?: number;
  category?: any;
}

interface Props {
  movie: Movie;
  noHover?: boolean;
  onRemove?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  noHover: false
});

const getCategoryName = (cat: any) => {
  if (typeof cat === 'string') return cat;
  if (Array.isArray(cat)) return cat.map(c => c.name || c).join(' • ');
  return cat?.name || '';
};

const movieLink = `/movie/${props.movie.slug}`;
const watchLink = `/watch/${props.movie.slug}`;
const imageUrl = props.movie.poster_url || props.movie.poster;
const backdropUrl = props.movie.thumb_url || props.movie.backdrop || props.movie.poster;
</script>

<template>
  <div class="group relative z-10 hover:z-[9999] transition-all duration-300">
    <!-- Ant Design Popover for Hover Modal -->
    <a-popover 
      v-if="!noHover"
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
              :src="backdropUrl" 
              :alt="movie.title"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-transparent to-transparent"></div>
            <router-link 
              :to="movieLink"
              class="absolute inset-0 flex items-center justify-center group/play"
            >
              <div class="w-12 h-12 rounded-full bg-primary/90 text-on-primary flex items-center justify-center shadow-2xl scale-75 group-hover/play:scale-100 transition-transform duration-300">
                <i class="fa-solid fa-play ml-1 text-on-primary text-xl"></i>
              </div>
            </router-link>
          </div>

          <!-- Popup Content -->
          <div class="p-5 space-y-4 -mt-6 relative z-10">
            <div class="space-y-1">
              <h3 class="text-white text-base font-black uppercase tracking-tight line-clamp-1">{{ movie.title }}</h3>
              <p class="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">{{ getCategoryName(movie.category) }}</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2">
              <router-link 
                :to="movieLink"
                class="flex-1 bg-primary text-on-primary px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/80 transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                <i class="fa-solid fa-play text-[10px]"></i> {{ t('common.watch_now') }}
              </router-link>
              <LikeButton :film-id="movie._id || movie.id || ''" class-name="!w-11 !h-11 !rounded-xl" />
              <BookmarkButton :film-id="movie._id || movie.id || ''" class-name="!w-11 !h-11 !rounded-xl" />
            </div>

            <!-- Meta Info Badges -->
            <div class="flex flex-wrap items-center gap-2">
              <div class="px-2.5 py-1 bg-amber-400 text-[#543b00] text-[9px] font-black rounded-lg flex items-center gap-1">
                IMDb {{ movie.rating || 'N/A' }}
              </div>
              <div class="px-2.5 py-1 bg-white/5 border border-white/10 text-white/80 text-[9px] font-bold rounded-lg">
                T16
              </div>
              <div class="px-2.5 py-1 bg-white/5 border border-white/10 text-white/80 text-[9px] font-bold rounded-lg">
                {{ movie.year }}
              </div>
            </div>

            <!-- Footer Genres -->
            <div class="pt-2 flex items-center gap-2 border-t border-white/5">
              <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
              <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">
                {{ getCategoryName(movie.category) }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- Base Card Trigger -->
      <router-link :to="noHover ? watchLink : movieLink" class="block">
        <div 
          :class="[
            'relative aspect-[2/3] rounded-2xl overflow-hidden transition-all duration-500 shadow-lg',
            !noHover ? 'hover:scale-105 group' : 'hover:scale-105 group'
          ]"
        >
          <img 
            class="w-full h-full object-cover" 
            :src="imageUrl" 
            :alt="movie.title"
            loading="lazy"
          />
          <div class="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-tighter">
            HD • {{ movie.quality || (locale === 'vi' ? 'Vietsub' : 'Subbed') }}
          </div>
          
          <button 
            v-if="onRemove"
            @click.prevent.stop="onRemove"
            class="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-20"
          >
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>

          <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#0b1326] via-[#0b1326]/60 to-transparent">
            <h4 class="text-white font-black uppercase text-xs line-clamp-1">{{ movie.title }}</h4>
            <p class="text-white/60 text-[9px] line-clamp-1">{{ movie.year }}</p>
          </div>
          
          <div v-if="noHover" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div class="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-2xl">
              <i class="fa-solid fa-play ml-1 text-on-primary text-xl"></i>
            </div>
          </div>
        </div>
      </router-link>
    </a-popover>

    <!-- Simple Card for noHover mode -->
    <router-link v-else :to="watchLink" class="block">
      <div class="relative aspect-[2/3] rounded-2xl overflow-hidden transition-all duration-500 shadow-lg hover:scale-105 group">
        <img 
          class="w-full h-full object-cover" 
          :src="imageUrl" 
          :alt="movie.title"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div class="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-2xl">
            <i class="fa-solid fa-play ml-1 text-on-primary text-xl"></i>
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<style>
/* Global styles for Ant Design Popover to match premium look */
.movie-card-popover .ant-popover-inner {
  background-color: transparent !important;
  box-shadow: none !important;
}
.movie-card-popover .ant-popover-inner-content {
  padding: 0 !important;
}
.movie-card-popover .ant-popover-arrow {
  display: none !important;
}
</style>
