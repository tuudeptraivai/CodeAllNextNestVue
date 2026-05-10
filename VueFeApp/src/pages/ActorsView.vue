<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchActors } from '../services/api';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const allActors = ref<any[]>([]);
const filteredActors = ref<any[]>([]);
const loading = ref(true);
const page = ref(parseInt(route.query.page as string) || 1);
const perPage = 18;
const keyword = ref((route.query.q as string) || "");

const loadActors = async () => {
  loading.value = true;
  try {
    const response = await fetchActors();
    // Xử lý nếu API trả về mảng trực tiếp
    allActors.value = Array.isArray(response) ? response : (response.data || []);
    filterAndPaginate();
  } catch (error) {
    console.error("Failed to load actors:", error);
  } finally {
    loading.value = false;
  }
};

const filterAndPaginate = () => {
  let result = allActors.value;
  if (keyword.value) {
    result = result.filter(a => a.name.toLowerCase().includes(keyword.value.toLowerCase()));
  }
  
  const start = (page.value - 1) * perPage;
  filteredActors.value = result.slice(start, start + perPage);
};

const totalPages = computed(() => {
  const count = keyword.value 
    ? allActors.value.filter(a => a.name.toLowerCase().includes(keyword.value.toLowerCase())).length
    : allActors.value.length;
  return Math.ceil(count / perPage) || 1;
});

onMounted(loadActors);

const handleSearch = () => {
  page.value = 1;
  router.replace({ query: { q: keyword.value, page: '1' } });
  filterAndPaginate();
};

const changePage = (newPage: number) => {
  page.value = newPage;
  router.replace({ query: { ...route.query, page: page.value.toString() } });
  filterAndPaginate();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
  <div class="min-h-screen bg-[#0b1326] font-body selection:bg-primary selection:text-black">
    <Header />
    
    <main class="pt-32 pb-20 px-6 md:px-16 max-w-[1440px] mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div class="space-y-4">
          <div class="flex items-center gap-3 text-primary text-xs font-black uppercase tracking-[0.3em]">
            <span class="w-10 h-[2px] bg-primary"></span>
            {{ t('movie.actors') }}
          </div>
          <h1 class="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
            {{ t('actor.list_title') }} <span class="text-primary">{{ t('actor.list_highlight') }}</span>
          </h1>
        </div>

        <div class="relative w-full md:w-96 group">
          <i class="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors"></i>
          <input 
            v-model="keyword"
            @input="handleSearch"
            type="text" 
            :placeholder="t('actor.list_title') + '...'"
            class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
          />
        </div>
      </div>

      <div v-if="loading" class="min-h-[400px] flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      <template v-else>
        <div v-if="filteredActors.length > 0">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            <router-link 
              v-for="actor in filteredActors" 
              :key="actor._id" 
              :to="`/actor/${actor._id}`"
              class="group"
            >
              <div class="space-y-4 text-center">
                <div class="relative aspect-square rounded-full overflow-hidden border-4 border-white/5 group-hover:border-primary transition-all duration-500 shadow-2xl scale-95 group-hover:scale-100">
                  <img 
                    :src="actor.thumb_url || actor.avatar || '/placeholder-actor.jpg'" 
                    :alt="actor.name"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div class="space-y-1">
                  <h4 class="text-white font-black uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">{{ actor.name }}</h4>
                  <p class="text-[10px] text-white/30 font-bold uppercase tracking-widest">{{ actor.countFilms || 0 }} {{ t('nav.movies').toLowerCase() }}</p>
                </div>
              </div>
            </router-link>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-20 flex items-center justify-center gap-4">
            <button @click="changePage(page - 1)" :disabled="page === 1" class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black disabled:opacity-20 transition-all">
              <i class="fa-solid fa-chevron-left text-sm"></i>
            </button>
            <div class="flex gap-2 text-lg font-black">
              <span class="text-primary">{{ page }}</span>
              <span class="text-white/20">/</span>
              <span class="text-white/40">{{ totalPages }}</span>
            </div>
            <button @click="changePage(page + 1)" :disabled="page === totalPages" class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black disabled:opacity-20 transition-all">
              <i class="fa-solid fa-chevron-right text-sm"></i>
            </button>
          </div>
        </div>
        
        <div v-else class="min-h-[300px] flex items-center justify-center text-center">
          <p class="text-white/20 font-black uppercase tracking-widest text-xl italic">{{ t('common.no_results') }}</p>
        </div>
      </template>
    </main>

    <Footer />
  </div>
</template>
