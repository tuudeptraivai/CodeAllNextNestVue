<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchActorById, fetchFilmsByFilter } from '@/services/api';
import MovieCard from '@/components/movie/MovieCard.vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const route = useRoute();
const actor = ref<any | null>(null);
const actorFilms = ref<any[]>([]);
const loading = ref(true);

const loadData = async () => {
  loading.value = true;
  try {
    const actorId = route.params.id as string;
    const actorData = await fetchActorById(actorId);
    actor.value = actorData;

    if (actorData) {
      // Fetch films using the actor's ID
      const filmsRes = await fetchFilmsByFilter({ actors: actorId, limit: 12 });
      actorFilms.value = filmsRes.data || [];
    }
  } catch (error) {
    console.error("Failed to load actor detail:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
watch(() => route.params.id, loadData);

const formatDate = (dateString: string) => {
  if (!dateString) return t('actor.unknown');
  return new Date(dateString).toLocaleDateString(locale.value === 'vi' ? 'vi-VN' : 'en-US');
};
</script>

<template>
  <div class="min-h-screen bg-[#0b1326] font-body selection:bg-primary selection:text-black">
    <Header />
    
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="!actor" class="min-h-screen flex flex-col items-center justify-center space-y-6">
      <h1 class="text-4xl font-black text-white uppercase tracking-tighter">{{ t('actor.not_found') }}</h1>
      <router-link to="/actors" class="bg-primary text-[#003824] px-8 py-3 rounded-xl font-bold uppercase tracking-widest active:scale-95 transition-all">
        {{ t('actor.back_to_actors') }}
      </router-link>
    </div>

    <main v-else class="min-h-screen pt-24 md:pt-32 pb-24">
      <section class="max-w-[1440px] mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
        <!-- Left Column: Image & Bio Info -->
        <div class="space-y-8">
          <div class="aspect-[3/4] rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl shadow-slate-950">
            <img 
              className="w-full h-full object-cover" 
              :src="actor.avatar || actor.thumb_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name)}&background=random`" 
              :alt="actor.name"
            />
          </div>
          <div class="glass-panel p-8 rounded-3xl space-y-6">
            <div class="space-y-2">
              <span class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] block">{{ t('actor.full_name') }}</span>
              <p class="text-white font-medium text-lg">{{ actor.name }}</p>
            </div>
            <div class="space-y-2">
              <span class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] block">{{ t('actor.birthday') }}</span>
              <p class="text-white font-medium text-lg">{{ formatDate(actor.birthDate || actor.birthday) }}</p>
            </div>
            <div class="space-y-2">
              <span class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] block">{{ t('actor.nationality') }}</span>
              <p class="text-white font-medium text-lg">{{ actor.nationality || actor.country || t('actor.unknown') }}</p>
            </div>
            <div class="space-y-2">
              <span class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] block">{{ t('actor.role') }}</span>
              <p class="text-white font-medium text-lg">{{ t('movie.actor') }}</p>
            </div>
          </div>
        </div>

        <!-- Right Column: Bio & Movies -->
        <div class="md:col-span-2 space-y-12">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-10 bg-primary rounded-full"></div>
              <h1 class="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                {{ actor.name }}
              </h1>
            </div>
            <div class="text-[#bbcabf] text-lg leading-relaxed pt-4 max-w-2xl" v-html="actor.bio || actor.content || t('actor.bio_placeholder', { name: actor.name })">
            </div>
          </div>

          <div class="space-y-8">
            <div class="flex items-center justify-between border-b border-white/5 pb-6">
              <h3 class="text-2xl font-black text-white uppercase tracking-tight">
                {{ t('actor.movies_featured') }}
              </h3>
              <span class="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{{ t('actor.film_count', { count: actorFilms.length }) }}</span>
            </div>
            
            <div v-if="actorFilms.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              <MovieCard v-for="movie in actorFilms" :key="movie._id" :movie="movie" />
            </div>
            <div v-else class="glass-panel p-12 rounded-3xl text-center">
              <p class="text-white/20 font-black uppercase tracking-widest italic">{{ t('actor.no_movies') }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>
