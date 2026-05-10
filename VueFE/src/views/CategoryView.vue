<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchFilmsByFilter } from '@/services/api';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import MovieCard from '@/components/movie/MovieCard.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const movies = ref<any[]>([]);
const loading = ref(true);
const page = ref(parseInt(route.query.page as string) || 1);
const totalPages = ref(1);

const categorySlug = computed(() => route.params.slug as string);

const displayTitle = computed(() => {
  if (categorySlug.value === 'phim-le') return t('nav.single_movie');
  if (categorySlug.value === 'phim-bo') return t('nav.series');
  return categorySlug.value.replace(/-/g, ' ');
});

const loadMovies = async () => {
  loading.value = true;
  try {
    const params: any = { 
      page: page.value, 
      limit: 18,
      type: categorySlug.value
    };
    
    const response = await fetchFilmsByFilter(params);
    movies.value = response.data;
    totalPages.value = response.pagination?.totalPages || 1;
  } catch (error) {
    console.error("Failed to fetch category movies:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadMovies);

watch(categorySlug, () => {
  page.value = 1;
  loadMovies();
});

watch(page, () => {
  router.replace({ query: { ...route.query, page: page.value.toString() } });
  loadMovies();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>

<template>
  <div class="min-h-screen bg-[#0b1326] font-body selection:bg-primary selection:text-black">
    <Header />
    
    <main class="pt-32 pb-20 px-6 md:px-16 max-w-[1440px] mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div class="space-y-4">
          <div class="flex items-center gap-3 text-primary text-xs font-black uppercase tracking-[0.3em]">
            <span class="w-10 h-[2px] bg-primary"></span>
            {{ t('category.title') }}
          </div>
          <h1 class="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
            {{ displayTitle }}
          </h1>
        </div>
        
        <router-link to="/search" class="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 hover:bg-white/10 transition-all">
          <i class="fa-solid fa-sliders"></i>
          {{ t('search.clear_filters') }}
        </router-link>
      </div>

      <div v-if="loading" class="min-h-[400px] flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      <template v-else>
        <div v-if="movies.length > 0">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            <MovieCard v-for="movie in movies" :key="movie._id" :movie="movie" />
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-20 flex items-center justify-center gap-4">
            <button @click="page--" :disabled="page === 1" class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black disabled:opacity-20 transition-all">
              <i class="fa-solid fa-chevron-left text-sm"></i>
            </button>
            <div class="flex gap-2 text-lg font-black">
              <span class="text-primary">{{ page }}</span>
              <span class="text-white/20">/</span>
              <span class="text-white/40">{{ totalPages }}</span>
            </div>
            <button @click="page++" :disabled="page === totalPages" class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black disabled:opacity-20 transition-all">
              <i class="fa-solid fa-chevron-right text-sm"></i>
            </button>
          </div>
        </div>
        <div v-else class="min-h-[300px] flex flex-col items-center justify-center text-center py-20 border border-dashed border-white/5 rounded-[40px]">
          <p class="text-white/20 font-black uppercase tracking-widest text-xl italic">{{ t('common.no_results') }}</p>
        </div>
      </template>
    </main>

    <Footer />
  </div>
</template>
