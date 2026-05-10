<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { 
  fetchFilmBySlug, 
  fetchComments, 
  postComment,
  voteComment 
} from '../services/api';
import { message } from 'ant-design-vue';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import LikeButton from '../components/common/LikeButton.vue';
import BookmarkButton from '../components/common/BookmarkButton.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const route = useRoute();
const authStore = useAuthStore();

const movie = ref<any>(null);
const comments = ref<any[]>([]);
const loading = ref(true);
const newComment = ref("");
const posting = ref(false);
const episodePage = ref(0);
const replyingToId = ref<string | null>(null);
const replyContent = ref("");
const EPISODES_PER_PAGE = 50;

const episodes = computed(() => movie.value?.episodes?.[0]?.server_data || []);
const totalEpisodePages = computed(() => Math.ceil(episodes.value.length / EPISODES_PER_PAGE));
const currentEpisodes = computed(() => episodes.value.slice(
  episodePage.value * EPISODES_PER_PAGE,
  (episodePage.value + 1) * EPISODES_PER_PAGE
));

const loadData = async (slug: string) => {
  loading.value = true;
  try {
    const movieData = await fetchFilmBySlug(slug);
    movie.value = movieData;

    if (movieData?._id || movieData?.id) {
      const commentData = await fetchComments(movieData._id || movieData.id);
      comments.value = commentData;
    }
  } catch (error) {
    console.error("Failed to fetch movie details:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData(route.params.slug as string);
});

watch(() => route.params.slug, (newSlug) => {
  if (newSlug) loadData(newSlug as string);
});

const handlePostComment = async () => {
  const filmId = movie.value?._id || movie.value?.id;
  if (!newComment.value.trim() || !authStore.user || !filmId) return;

  posting.value = true;
  try {
    await postComment(filmId, newComment.value);
    newComment.value = "";
    message.success(t('movie.msg_comment_posted'));
    const commentData = await fetchComments(filmId);
    comments.value = commentData;
  } catch (error) {
    console.error("Failed to post comment:", error);
    message.error(t('movie.err_post_comment'));
  } finally {
    posting.value = false;
  }
};

const handlePostReply = async (parentId: string) => {
  const filmId = movie.value?._id || movie.value?.id;
  if (!replyContent.value.trim() || !authStore.user || !filmId) return;
  posting.value = true;
  try {
    await postComment(filmId, replyContent.value, parentId);
    replyContent.value = "";
    replyingToId.value = null;
    message.success(t('movie.msg_reply_posted'));
    const commentData = await fetchComments(filmId);
    comments.value = commentData;
  } catch (error) {
    console.error("Failed to post reply:", error);
    message.error(t('movie.err_post_reply'));
  } finally {
    posting.value = false;
  }
};

const handleVote = async (commentId: string, type: 'up' | 'down') => {
  if (!authStore.user) {
    message.warning(t('movie.msg_login_to_vote'));
    return;
  }
  try {
    await voteComment(commentId, type);
    const comment = comments.value.find(c => c._id === commentId);
    if (comment) {
      if (type === 'up') comment.upVotes = (comment.upVotes || 0) + 1;
      else comment.downVotes = (comment.downVotes || 0) + 1;
    }
  } catch (error) {
    console.error("Failed to vote:", error);
  }
};

const rootComments = computed(() => comments.value.filter(c => !c.parentCommentId || c.parentCommentId === null));
const getReplies = (parentId: string) => comments.value.filter(c => String(c.parentCommentId) === String(parentId));

const getCategoryName = (movieData: any) => {
  if (Array.isArray(movieData.category)) {
    return movieData.category.map((c: any) => c.name).join(", ");
  }
  return movieData.category;
};
</script>

<template>
  <div class="min-h-screen bg-[#0b1326] text-[#dae2fd] font-body selection:bg-primary selection:text-black">
    <Header />

    <div v-if="loading" class="min-h-screen flex items-center justify-center bg-[#0b1326]">
      <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="!movie" class="min-h-screen flex flex-col items-center justify-center bg-[#0b1326] space-y-6">
      <h1 class="text-4xl font-black text-white uppercase tracking-tighter">{{ t('movie.not_found') }}</h1>
      <p class="text-white/40 font-bold uppercase tracking-widest text-sm">{{ t('movie.not_found_desc') }}</p>
      <router-link to="/" class="bg-primary text-black font-bold px-10 py-4 rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/20">
        {{ t('common.back_to_home') }}
      </router-link>
    </div>

    <main v-else>
      <!-- Hero Cinematic Section -->
      <header class="relative w-full h-[500px] md:h-[700px] overflow-hidden">
        <img 
          :alt="movie.title" 
          class="absolute inset-0 w-full h-full object-cover" 
          :src="movie.thumb_url || movie.poster_url"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#0b1326] via-[#0b1326]/60 to-transparent"></div>
        <div class="absolute bottom-0 left-0 w-full px-6 md:px-16 pb-12 z-10">
          <div class="max-w-[1440px] mx-auto flex flex-col md:flex-row items-end gap-10">
            <!-- Main Poster -->
            <div class="hidden md:block w-64 flex-shrink-0 relative group">
              <router-link :to="`/watch/${movie.slug}`" class="block aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105 border border-white/10">
                <img 
                  :alt="movie.title" 
                  class="w-full h-full object-cover" 
                  :src="movie.poster_url || movie.thumb_url"
                />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <i class="fa-solid fa-play text-5xl text-primary"></i>
                </div>
              </router-link>
            </div>
            <!-- Movie Details -->
            <div class="flex-grow space-y-6">
              <div class="flex flex-wrap gap-2">
                <span class="bg-primary/20 backdrop-blur-md text-primary px-3 py-1 rounded-full text-[10px] font-bold border border-primary/30 uppercase tracking-widest">
                  {{ movie.quality || "Ultra HD" }}
                </span>
                <span class="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold border border-white/20 uppercase tracking-widest">
                  {{ movie.lang || "Vietsub" }}
                </span>
                <span class="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold border border-white/20 uppercase tracking-widest">
                  {{ movie.time || "N/A" }}
                </span>
              </div>
              <h1 class="text-4xl md:text-7xl font-black text-white drop-shadow-xl uppercase tracking-tighter leading-none">
                {{ movie.title }}
              </h1>
              <div class="text-lg text-[#bbcabf] max-w-2xl font-medium leading-relaxed line-clamp-3 md:line-clamp-none" v-html="movie.description"></div>
              
              <div class="flex flex-wrap gap-4 pt-4">
                <router-link :to="`/watch/${movie.slug}`" class="bg-primary text-black px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all hover:-translate-y-1 active:scale-95 shadow-lg shadow-primary/20">
                  <i class="fa-solid fa-play"></i>
                  {{ t('common.watch_now') }}
                </router-link>
                <LikeButton :film-id="movie._id || movie.id || ''" class-name="!w-14 !h-14 !rounded-xl bg-white/10" />
                <BookmarkButton :film-id="movie._id || movie.id || ''" class-name="!w-14 !h-14 !rounded-xl bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Layout -->
      <div class="max-w-[1440px] mx-auto px-6 md:px-16 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <!-- Left Column -->
        <div class="lg:col-span-8 space-y-16">
          <!-- Episode Selector -->
          <section>
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h2 class="text-3xl font-bold text-white tracking-tight">{{ t('movie.episodes_list') }}</h2>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(_, idx) in totalEpisodePages"
                  :key="idx"
                  @click="episodePage = idx"
                  :class="[
                    'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border',
                    episodePage === idx 
                      ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(78,222,163,0.3)]' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                  ]"
                >
                  {{ idx * EPISODES_PER_PAGE + 1 }} - {{ Math.min((idx + 1) * EPISODES_PER_PAGE, episodes.length) }}
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              <template v-if="currentEpisodes.length > 0">
                <router-link 
                  v-for="(ep, index) in currentEpisodes"
                  :key="index"
                  :to="`/watch/${movie.slug}?ep=${ep.slug}`"
                  :class="[
                    'aspect-square flex items-center justify-center rounded-lg font-bold text-sm transition-all duration-300 border',
                    index === 0 && episodePage === 0
                      ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(78,222,163,0.3)]' 
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white'
                  ]"
                >
                  {{ ep.name }}
                </router-link>
              </template>
              <div v-else class="col-span-full bg-white/5 p-10 rounded-xl text-center border border-dashed border-white/10">
                <p class="text-white/20 font-bold uppercase tracking-widest">{{ t('movie.single_movie_no_episodes') }}</p>
              </div>
            </div>
          </section>

          <!-- Comment Section -->
          <section>
            <h2 class="text-3xl font-bold text-white tracking-tight mb-8">{{ t('movie.comments') }}</h2>
            <div class="space-y-6">
              <!-- Input -->
              <div v-if="authStore.user" class="bg-white/5 rounded-2xl p-8 flex flex-col gap-6 border border-white/10">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 overflow-hidden">
                    <img v-if="authStore.user.avatar" :src="authStore.user.avatar" class="w-full h-full object-cover" alt="" />
                    <span v-else>{{ authStore.user.username?.[0] || 'U' }}</span>
                  </div>
                  <div>
                    <p class="text-white font-bold">{{ authStore.user.username }}</p>
                    <p class="text-[10px] text-white/40 font-bold uppercase tracking-widest">{{ t('movie.fan') }}</p>
                  </div>
                </div>
                <textarea 
                  v-model="newComment"
                  class="bg-black/20 border border-white/10 rounded-xl p-5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 h-32 font-medium transition-all" 
                  :placeholder="t('movie.leave_comment_placeholder')"
                ></textarea>
                <div class="flex justify-end">
                  <button 
                    @click="handlePostComment"
                    :disabled="posting || !newComment.trim()"
                    class="bg-primary text-black px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {{ posting ? t('movie.posting') : t('movie.post_comment') }}
                  </button>
                </div>
              </div>
              <div v-else class="bg-white/5 rounded-2xl p-10 text-center border border-dashed border-white/10">
                <i class="fa-solid fa-lock text-3xl text-white/10 mb-4"></i>
                <p class="text-[#bbcabf] font-medium mb-6">{{ t('movie.login_to_comment') }}</p>
                <router-link to="/login" class="bg-primary/10 hover:bg-primary/20 text-primary px-8 py-3 rounded-xl font-bold text-sm transition-all border border-primary/20 inline-block uppercase tracking-widest">
                  {{ t('auth.login_now') }}
                </router-link>
              </div>

              <!-- List -->
              <div class="space-y-8">
                <div v-for="comment in rootComments" :key="comment._id" class="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                  <div class="p-8">
                    <div class="flex items-center gap-4 mb-6">
                      <div class="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                        <img v-if="comment.userId?.avatar" :src="comment.userId.avatar" class="w-full h-full object-cover" alt="" />
                        <span v-else>{{ comment.userId?.username?.[0] || 'U' }}</span>
                      </div>
                      <div>
                        <h5 class="text-white font-bold">{{ comment.userId?.username || t('movie.anonymous_user') }}</h5>
                        <p class="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                          {{ new Date(comment.createdAt).toLocaleDateString() }}
                        </p>
                      </div>
                    </div>
                    <p class="text-[#bbcabf] font-medium leading-relaxed mb-6">{{ comment.content }}</p>
                    <div class="flex gap-6 text-xs font-bold text-white/40">
                      <button 
                        @click="handleVote(comment._id, 'up')"
                        class="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <i class="fa-solid fa-thumbs-up text-sm"></i> {{ comment.upVotes || 0 }}
                      </button>
                      <button 
                        @click="replyingToId = replyingToId === comment._id ? null : comment._id"
                        class="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <i class="fa-solid fa-message text-sm"></i> {{ t('movie.reply') }}
                      </button>
                    </div>

                    <!-- Reply Input -->
                    <div v-if="replyingToId === comment._id" class="mt-8 pt-8 border-t border-white/5 space-y-4">
                      <textarea 
                        v-model="replyContent"
                        class="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 h-24 font-medium text-sm transition-all" 
                        :placeholder="t('movie.reply_placeholder', { name: comment.userId?.username })"
                      ></textarea>
                      <div class="flex justify-end gap-3">
                        <button @click="replyingToId = null" class="px-6 py-2 rounded-lg text-[10px] font-black uppercase text-white/40 hover:text-white transition-all">{{ t('common.cancel') }}</button>
                        <button 
                          @click="handlePostReply(comment._id)"
                          :disabled="posting || !replyContent.trim()"
                          class="bg-primary text-black px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                          {{ t('movie.reply') }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Replies -->
                  <div v-if="getReplies(comment._id).length > 0" class="bg-white/[0.02] border-t border-white/5">
                    <div v-for="reply in getReplies(comment._id)" :key="reply._id" class="p-6 ml-12 border-b border-white/5 last:border-0">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 font-bold text-xs overflow-hidden">
                          <img v-if="reply.userId?.avatar" :src="reply.userId.avatar" class="w-full h-full object-cover" alt="" />
                          <span v-else>{{ reply.userId?.username?.[0] || 'U' }}</span>
                        </div>
                        <div>
                          <h6 class="text-white font-bold text-sm">{{ reply.userId?.username || "Người dùng" }}</h6>
                          <p class="text-[9px] text-white/30 font-bold uppercase">{{ new Date(reply.createdAt).toLocaleDateString() }}</p>
                        </div>
                      </div>
                      <p class="text-sm text-[#bbcabf] font-medium leading-relaxed">{{ reply.content }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Right Column (Actors) -->
        <aside class="lg:col-span-4">
          <div class="bg-white/5 rounded-2xl p-8 sticky top-24 border border-white/10">
            <h3 class="text-2xl font-bold text-white tracking-tight mb-8">{{ t('movie.actors') }}</h3>
            <div v-if="movie.actors && movie.actors.length > 0" class="space-y-6">
              <router-link 
                v-for="actor in movie.actors" 
                :key="actor._id" 
                :to="`/actor/${actor._id}`" 
                class="flex items-center gap-4 group"
              >
                <div class="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/10 group-hover:border-primary transition-all duration-300 shadow-lg">
                  <img :src="actor.avatar" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                </div>
                <div class="flex flex-col">
                  <h4 class="text-white font-bold group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">{{ actor.name }}</h4>
                  <p class="text-[10px] text-[#bbcabf] uppercase font-black tracking-widest mt-1">{{ t('movie.actor') }}</p>
                </div>
              </router-link>
            </div>
            <div v-else class="text-center py-10">
              <p class="text-white/20 font-bold uppercase tracking-widest text-xs">{{ t('movie.actor_info_updating') }}</p>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </main>
  </div>
</template>

<style scoped>
.play-glow {
  box-shadow: 0 0 30px rgba(78, 222, 163, 0.4);
}
</style>
