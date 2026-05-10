<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { 
  fetchFilmBySlug, 
  fetchNewFilms, 
  fetchComments, 
  postComment,
  voteComment,
  saveWatchHistory
} from '@/services/api';
import { message } from 'ant-design-vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import VideoPlayer from '@/components/movie/VideoPlayer.vue';
import BookmarkButton from '@/components/common/BookmarkButton.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const movie = ref<any | null>(null);
const loading = ref(true);
const recommended = ref<any[]>([]);
const comments = ref<any[]>([]);
const newComment = ref("");
const posting = ref(false);
const episodePage = ref(0);
const replyingToId = ref<string | null>(null);
const replyContent = ref("");
const EPISODES_PER_PAGE = 56;

const epSlug = computed(() => route.query.ep as string);
const timeParam = computed(() => route.query.t as string);

const servers = computed(() => movie.value?.episodes || []);
const currentServer = computed(() => servers.value[0] || null);
const episodeList = computed(() => currentServer.value?.server_data || []);
const currentEpisode = computed(() => {
  if (epSlug.value) {
    return episodeList.value.find((e: any) => e.slug === epSlug.value) || episodeList.value[0];
  }
  return episodeList.value[0];
});

const loadData = async (slug: string) => {
  loading.value = true;
  try {
    const [movieData, recData] = await Promise.all([
      fetchFilmBySlug(slug),
      fetchNewFilms(6)
    ]);
    movie.value = movieData;
    recommended.value = recData;

    if (movieData?._id || movieData?.id) {
      const commentData = await fetchComments(movieData._id || movieData.id);
      comments.value = commentData;
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
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

const handleTimeUpdate = (currentTime: number, duration: number) => {
  if (authStore.user && movie.value?._id && currentEpisode.value) {
    saveWatchHistory({
      filmId: movie.value._id,
      filmTitle: movie.value.title,
      thumbnail: movie.value.thumb_url || movie.value.poster_url,
      episodeSlug: currentEpisode.value.slug,
      episodeName: currentEpisode.value.name,
      currentTime: currentTime,
      duration: duration
    }).catch(err => console.error('Failed to save progress:', err));
  }
};

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
    // Update local state for better UX instead of re-fetching everything
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

const getCategoryNames = (movieData: any) => {
  if (Array.isArray(movieData.category)) {
    return movieData.category.map((c: any) => c.name).join(", ");
  }
  return movieData.category;
};
</script>

<template>
  <div class="min-h-screen pt-24 pb-20 bg-[#0b1326] text-[#dae2fd] font-body selection:bg-primary selection:text-black">
    <Header />

    <div v-if="loading" class="min-h-screen flex items-center justify-center bg-[#0b1326]">
      <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <main v-else-if="movie" class="w-full">
      <!-- Cinematic Video Player Area -->
      <section class="px-6 md:px-16 mb-10">
        <div class="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 group bg-black">
          <template v-if="currentEpisode?.link_m3u8">
            <VideoPlayer 
              :url="currentEpisode.link_m3u8"
              :poster="movie.thumb_url || movie.poster_url"
              :initial-time="parseInt(timeParam || '0')"
              @timeupdate="handleTimeUpdate"
            />
          </template>
          <template v-else-if="currentEpisode?.link_embed">
            <iframe 
              class="w-full h-full"
              :src="timeParam ? `${currentEpisode.link_embed}&t=${timeParam}` : currentEpisode.link_embed" 
              :title="movie.title"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </template>
          <div v-else class="w-full h-full flex items-center justify-center">
            <p class="text-white/20 font-bold uppercase tracking-widest">{{ t('movie.not_found') }}</p>
          </div>
          
          <!-- Top Player Overlay Tags -->
          <div class="absolute top-6 left-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <span class="bg-primary/80 backdrop-blur-md text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {{ movie.quality || 'Ultra HD' }}
            </span>
            <span class="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {{ movie.lang || 'Subtitle' }}
            </span>
          </div>
        </div>
      </section>

      <!-- Content Grid -->
      <section class="max-w-[1440px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <!-- Main Content (Left) -->
        <div class="lg:col-span-8 space-y-12">
          <div class="space-y-6">
            <div class="flex flex-wrap items-center gap-4">
              <h1 class="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                {{ movie.title }} <span class="text-primary">- {{ currentEpisode?.name || 'Full' }}</span>
              </h1>
              <div class="flex gap-2 items-center">
                <span class="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px] border border-primary/20 uppercase">4K</span>
                <BookmarkButton :film-id="movie._id" class-name="!w-10 !h-10 !rounded-xl bg-white/5" />
              </div>
            </div>
            
            <div class="text-[#bbcabf] font-medium leading-relaxed max-w-4xl" v-html="movie.description"></div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-white/5">
              <div class="space-y-1">
                <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{{ t('footer.connect') }}</p>
                <p class="text-white font-bold">{{ movie.year || movie.releaseYear }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Thời lượng</p>
                <p class="text-white font-bold">{{ movie.time || '120 mins' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{{ t('footer.explore') }}</p>
                <p class="text-white font-bold truncate">{{ getCategoryNames(movie) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Đánh giá</p>
                <div class="flex items-center gap-1.5">
                  <i class="fa-solid fa-star text-primary text-xs"></i>
                  <span class="text-white font-bold">{{ movie.rating || '4.9' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Episode List -->
          <div class="space-y-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 class="text-2xl font-bold text-white uppercase tracking-tight border-l-4 border-primary pl-4">{{ t('movie.episodes_list') }}</h2>
              <div v-if="Math.ceil(episodeList.length / EPISODES_PER_PAGE) > 1" class="flex flex-wrap gap-2">
                <button
                  v-for="(_, idx) in Math.ceil(episodeList.length / EPISODES_PER_PAGE)"
                  :key="idx"
                  @click="episodePage = idx"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border',
                    episodePage === idx 
                      ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                  ]"
                >
                  {{ idx * EPISODES_PER_PAGE + 1 }} - {{ Math.min((idx + 1) * EPISODES_PER_PAGE, episodeList.length) }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              <router-link
                v-for="ep in episodeList.slice(episodePage * EPISODES_PER_PAGE, (episodePage + 1) * EPISODES_PER_PAGE)"
                :key="ep.slug"
                :to="{ path: route.path, query: { ...route.query, ep: ep.slug } }"
                :class="[
                  'relative h-12 flex items-center justify-center rounded-xl font-bold text-sm transition-all border',
                  currentEpisode?.slug === ep.slug
                    ? 'bg-primary text-black border-primary shadow-xl shadow-primary/20 scale-105 z-10'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                ]"
              >
                {{ ep.name }}
              </router-link>
            </div>
          </div>

          <!-- Comments -->
          <div class="space-y-10 pt-10 border-t border-white/5">
            <h2 class="text-2xl font-bold text-white uppercase tracking-tight">{{ t('movie.comments') }}</h2>
            <div v-if="authStore.user" class="flex gap-4">
              <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/20 overflow-hidden shrink-0">
                <img v-if="authStore.user.avatar" :src="authStore.user.avatar" class="w-full h-full object-cover" alt="" />
                <span v-else>{{ authStore.user.username?.[0] }}</span>
              </div>
              <div class="flex-grow space-y-3">
                <textarea 
                  v-model="newComment"
                  class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary h-32 transition-all resize-none font-medium" 
                  :placeholder="t('movie.leave_comment_placeholder')"
                ></textarea>
                <div class="flex justify-end">
                  <button 
                    @click="handlePostComment"
                    :disabled="posting || !newComment.trim()"
                    class="bg-primary text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {{ posting ? t('movie.posting') : t('movie.post_comment') }}
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="bg-white/5 border border-dashed border-white/10 rounded-3xl p-10 text-center">
              <p class="text-slate-400 font-medium mb-4">{{ t('movie.login_to_comment') }}</p>
              <router-link to="/login" class="bg-white text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs">{{ t('auth.login_now') }}</router-link>
            </div>

            <div class="space-y-8">
              <div v-for="comment in rootComments" :key="comment._id" class="space-y-6">
                <div class="flex gap-4 group">
                  <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 font-bold border border-white/10 overflow-hidden shrink-0">
                    <img v-if="comment.userId?.avatar" :src="comment.userId.avatar" class="w-full h-full object-cover" alt="" />
                    <span v-else>{{ comment.userId?.username?.[0] }}</span>
                  </div>
                  <div class="flex-grow space-y-2">
                    <div class="flex items-center gap-3">
                      <span class="text-white font-bold">{{ comment.userId?.username || t('movie.anonymous_user') }}</span>
                      <span class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{{ new Date(comment.createdAt).toLocaleDateString() }}</span>
                    </div>
                    <p class="text-[#dae2fd] leading-relaxed">{{ comment.content }}</p>
                      <button 
                        @click="handleVote(comment._id, 'up')"
                        class="flex items-center gap-2 hover:text-primary transition-colors text-primary/60 hover:text-primary text-[10px] font-black uppercase"
                      >
                        <i class="fa-solid fa-thumbs-up text-sm"></i> {{ comment.upVotes || 0 }}
                      </button>
                      <button 
                        @click="replyingToId = replyingToId === comment._id ? null : comment._id"
                        class="flex items-center gap-2 hover:text-primary transition-colors text-[10px] font-black uppercase text-primary/60 hover:text-primary ml-4"
                      >
                        <i class="fa-solid fa-message text-sm"></i> {{ t('movie.reply') }}
                      </button>

                    <div v-if="replyingToId === comment._id" class="mt-6 p-6 rounded-2xl bg-white/5 border border-white/10">
                      <textarea 
                        v-model="replyContent"
                        class="w-full bg-[#060e20] border border-white/10 rounded-xl p-3 text-white h-24 font-medium text-xs transition-all resize-none" 
                        :placeholder="t('movie.reply_placeholder', { name: comment.userId?.username })"
                      ></textarea>
                      <div class="flex justify-end gap-2 mt-3">
                        <button @click="replyingToId = null" class="px-4 py-1.5 text-[9px] font-black uppercase text-white/40 hover:text-white">{{ t('common.cancel') }}</button>
                        <button 
                          @click="handlePostReply(comment._id)"
                          :disabled="posting || !replyContent.trim()"
                          class="bg-primary text-black px-5 py-1.5 rounded-lg font-black text-[9px] uppercase transition-all disabled:opacity-50"
                        >
                          {{ t('common.send') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Replies -->
                <div v-if="getReplies(comment._id).length > 0" class="ml-16 space-y-6">
                  <div v-for="reply in getReplies(comment._id)" :key="reply._id" class="flex gap-4">
                    <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 font-bold text-xs border border-white/10 overflow-hidden shrink-0">
                      <img v-if="reply.userId?.avatar" :src="reply.userId.avatar" class="w-full h-full object-cover" alt="" />
                      <span v-else>{{ reply.userId?.username?.[0] }}</span>
                    </div>
                    <div class="space-y-1">
                      <div class="flex items-center gap-3">
                        <span class="text-white font-bold text-sm">{{ reply.userId?.username || 'Ẩn danh' }}</span>
                        <span class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{{ new Date(reply.createdAt).toLocaleDateString() }}</span>
                      </div>
                      <p class="text-[#bbcabf] text-sm leading-relaxed">{{ reply.content }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <aside class="lg:col-span-4 space-y-10">
          <div class="bg-white/5 rounded-2xl p-8 sticky top-24 border border-white/10">
            <h3 class="text-xl font-bold text-white uppercase tracking-tight mb-8 border-l-4 border-primary pl-4">{{ t('watch.related_movies') }}</h3>
            <div class="space-y-6">
              <router-link 
                v-for="item in recommended" 
                :key="item._id" 
                :to="`/movie/${item.slug}`"
                class="flex gap-4 group"
              >
                <div class="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-primary transition-all shadow-lg">
                  <img :src="item.thumb_url || item.poster_url" class="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                </div>
                <div class="flex flex-col justify-center gap-1">
                  <h4 class="text-white font-bold text-sm group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight">{{ item.title }}</h4>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="text-slate-500 text-[10px] font-bold uppercase">{{ item.year || 2024 }}</span>
                    <div class="flex items-center gap-1">
                      <i class="fa-solid fa-star text-primary text-[10px]"></i>
                      <span class="text-white text-[10px] font-bold">4.9</span>
                    </div>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </aside>
      </section>

      <Footer />
    </main>
  </div>
</template>

<style scoped>
/* Swiper Customization */
:deep(.artplayer-container) {
  width: 100% !important;
  height: 100% !important;
}
</style>
