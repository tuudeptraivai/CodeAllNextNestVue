<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchFilmsByFilter, fetchTypes } from '../services/api';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import MovieCard from '../components/movie/MovieCard.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const movies = ref<any[]>([]);
const types = ref<any[]>([]);
const loading = ref(false);
const page = ref(parseInt(route.query.page as string) || 1);
const totalPages = ref(1);

const filters = ref({
  keyword: (route.query.q as string) || "",
  type: (route.query.type as string) || "",
  year: (route.query.year as string) || "",
});

const years = Array.from({ length: 25 }, (_, i) => (2025 - i).toString());

const loadData = async () => {
  loading.value = true;
  try {
    const [moviesRes, typesRes] = await Promise.all([
      fetchFilmsByFilter({ 
        keyword: filters.value.keyword,
        type: filters.value.type,
        year: filters.value.year,
        page: page.value,
        limit: 18 
      }),
      fetchTypes()
    ]);
    movies.value = moviesRes.data;
    totalPages.value = moviesRes.pagination?.totalPages || 1;
    types.value = typesRes;
  } catch (error) {
    console.error("Failed to load search data:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

let debounceTimer: any = null;

watch([() => filters.value.keyword, () => filters.value.type, () => filters.value.year], (newValues, oldValues) => {
  page.value = 1;
  updateUrl();
  
  const keywordChanged = newValues[0] !== oldValues[0];
  
  if (debounceTimer) clearTimeout(debounceTimer);
  
  if (keywordChanged) {
    debounceTimer = setTimeout(() => {
      loadData();
    }, 500);
  } else {
    loadData();
  }
});

// Watch for page changes
watch(page, () => {
  updateUrl();
  loadData();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const updateUrl = () => {
  const query: any = {};
  if (filters.value.keyword) query.q = filters.value.keyword;
  if (filters.value.type) query.type = filters.value.type;
  if (filters.value.year) query.year = filters.value.year;
  if (page.value > 1) query.page = page.value.toString();
  
  router.replace({ query });
};

const clearFilters = () => {
  filters.value = { keyword: "", type: "", year: "" };
  page.value = 1;
};
</script>

<template>
  <div class="min-h-screen bg-[#0b1326] font-body selection:bg-primary selection:text-black">
    <Header />
    
    <main class="pt-32 pb-20 px-6 md:px-16 max-w-[1440px] mx-auto">
      <div class="flex items-center gap-4 mb-10">
        <div class="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/10">
          <i class="fa-solid fa-filter text-xl"></i>
        </div>
        <h1 class="text-4xl font-black text-white uppercase tracking-tighter">
          {{ t('search.title_explore') }} <span class="text-primary">{{ t('search.title_cinema') }}</span>
        </h1>
      </div>

      <!-- Horizontal Filter Bar -->
      <div class="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-10 mb-16 shadow-2xl">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
          <div class="space-y-4">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">{{ t('search.filter_label') }}</label>
            <div class="relative group">
              <i class="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors"></i>
              <input v-model="filters.keyword" type="text" :placeholder="t('search.filter_placeholder')" class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold placeholder:text-white/10" />
            </div>
          </div>
          <div class="space-y-4">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">{{ t('search.category_label') }}</label>
            <div class="relative">
              <select v-model="filters.type" class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold appearance-none cursor-pointer">
                <option value="">{{ t('search.category_all') }}</option>
                <option v-for="t in types" :key="t._id" :value="t.slug">{{ t.name }}</option>
              </select>
              <i class="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"></i>
            </div>
          </div>
          <div class="space-y-4">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">{{ t('search.year_label') }}</label>
            <div class="relative">
              <select v-model="filters.year" class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold appearance-none cursor-pointer">
                <option value="">{{ t('search.year_all') }}</option>
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
              <i class="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"></i>
            </div>
          </div>
          <button @click="clearFilters" class="h-[58px] bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
            <i class="fa-solid fa-xmark"></i> {{ t('search.clear_filters') }}
          </button>
        </div>
      </div>

      <!-- Results -->
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
        <div v-else class="min-h-[300px] flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-white/5 rounded-[40px] py-20">
          <p class="text-white/20 font-black uppercase tracking-widest text-xl italic">{{ t('search.no_results_found') }}</p>
        </div>
      </template>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
select option { background-color: #1a2333; color: white; }
</style>
