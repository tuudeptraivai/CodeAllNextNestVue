<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { 
  fetchWatchHistory, 
  fetchBookmarks, 
  deleteWatchHistory, 
  createCollection, 
  removeFilmFromCollection,
  changePassword,
  createPaymentUrl
} from '../services/api';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import MovieCard from '../components/movie/MovieCard.vue';
import AvatarSelectionModal from '../components/profile/AvatarSelectionModal.vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const router = useRouter();
const authStore = useAuthStore();

// Tabs management
const activeTab = ref(t('profile.watch_history'));
const navItems = computed(() => [
  { label: t('profile.watch_history'), icon: 'fa-solid fa-clock-rotate-left' },
  { label: t('profile.favorites'), icon: 'fa-solid fa-heart' },
  { label: t('profile.watchlist'), icon: 'fa-solid fa-bookmark' },
  { label: t('payment.upgrade'), icon: 'fa-solid fa-crown' },
  { label: t('profile.settings'), icon: 'fa-solid fa-gear' },
  { label: t('profile.logout'), icon: 'fa-solid fa-right-from-bracket', danger: true },
]);

// Data state
const history = ref<any[]>([]);
const likedFilms = ref<any[]>([]);
const loading = ref(false);
const showAvatarModal = ref(false);

// Collection state
const showCreateCollection = ref(false);
const newCollectionName = ref("");

// Password state
const passwordData = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const loadData = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  loading.value = true;
  try {
    if (activeTab.value === t('profile.watch_history')) {
      history.value = await fetchWatchHistory();
    } else if (activeTab.value === t('profile.favorites') || activeTab.value === t('profile.watchlist')) {
      const data = await fetchBookmarks();
      if (data) {
        likedFilms.value = data.films || [];
        if (data.collections) {
          authStore.updateUser({ ...authStore.user!, collections: data.collections });
        }
      }
    }
  } catch (error) {
    console.error("Failed to load profile data:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

watch(activeTab, (newTab) => {
  if (newTab === t('profile.logout')) {
    handleLogout();
  } else {
    loadData();
  }
});

const handleLogout = () => {
  authStore.logout();
  router.push('/');
  message.success(t('profile.msg_logged_out'));
};

const handleDeleteHistory = async (filmId: string) => {
  try {
    await deleteWatchHistory(filmId);
    history.value = history.value.filter(h => h.id !== filmId);
    message.success(t('profile.msg_deleted_history'));
  } catch (error) {
    message.error(t('profile.err_delete_history'));
  }
};

const handleCreateCollection = async () => {
  if (!newCollectionName.value.trim()) return;
  loading.value = true;
  try {
    const updatedUser = await createCollection(newCollectionName.value);
    if (updatedUser && updatedUser.collections) {
      authStore.updateUser(updatedUser);
      newCollectionName.value = "";
      showCreateCollection.value = false;
      message.success(t('profile.msg_collection_created'));
    }
  } catch (error) {
    message.error(t('profile.err_collection_create'));
  } finally {
    loading.value = false;
  }
};

const handleRemoveFromCollection = async (filmId: string, collectionName: string) => {
  try {
    const updatedUser = await removeFilmFromCollection(filmId, collectionName);
    if (updatedUser && updatedUser.collections) {
      authStore.updateUser(updatedUser);
      message.success(t('profile.msg_removed_collection'));
    }
  } catch (error) {
    message.error(t('profile.err_remove_collection'));
  }
};

const handleChangePassword = async () => {
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    message.error(t('profile.err_password_mismatch'));
    return;
  }
  if (passwordData.value.newPassword.length < 6) {
    message.error(t('profile.err_password_short'));
    return;
  }

  loading.value = true;
  try {
    await changePassword({
      oldPassword: passwordData.value.oldPassword,
      newPassword: passwordData.value.newPassword
    });
    message.success(t('profile.msg_password_changed'));
    passwordData.value = { oldPassword: "", newPassword: "", confirmPassword: "" };
  } catch (error: any) {
    message.error(error.response?.data?.message || t('profile.err_password_failed'));
  } finally {
    loading.value = false;
  }
};

const formatTime = (seconds: number) => {
  if (!seconds) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const userAvatar = computed(() => authStore.user?.avatar || "https://lh3.googleusercontent.com/a/ACg8ocL8jXw9z1zXw9z1zXw9z1zXw9z1zXw9z1zXw9z1zX=s96-c");
const userRoleLabel = computed(() => {
  if (authStore.user?.role === 'admin') return t('profile.admin');
  if (authStore.user?.membership === 'premium') return t('payment.premium_pack');
  if (authStore.user?.membership === 'promax') return t('payment.promax_pack');
  return t('payment.free_member');
});

const handleBuyPackage = async (pack: 'premium' | 'promax') => {
  loading.value = true;
  try {
    message.loading(t('payment.msg_redirecting'));
    const res = await createPaymentUrl(pack);
    if (res.url) {
      window.location.href = res.url;
    }
  } catch (error) {
    message.error(t('payment.failed_title'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-background font-body selection:bg-primary selection:text-black">
    <Header />
    
    <main class="pt-32 pb-20 px-6 md:px-16 max-w-[1440px] mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <!-- Sidebar -->
        <aside class="space-y-8">
          <div class="glass-panel p-8 rounded-[40px] text-center space-y-6 relative overflow-hidden group">
            <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-blue-600/10"></div>
            
            <div class="relative pt-4">
              <div 
                class="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary shadow-2xl relative cursor-pointer"
                @click="showAvatarModal = true"
              >
                <img 
                  class="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                  :src="userAvatar" 
                  alt="Profile"
                />
                <div class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <i class="fa-solid fa-camera text-white text-xl"></i>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <h2 class="text-2xl font-black text-white uppercase font-display tracking-tight">
                {{ authStore.user?.username || "Guest" }}
              </h2>
              <p class="text-primary text-xs font-bold uppercase tracking-widest">
                {{ userRoleLabel }}
              </p>
            </div>
          </div>

          <nav class="glass-panel p-4 rounded-[32px] space-y-2">
            <button 
              v-for="item in navItems"
              :key="item.label"
              @click="activeTab = item.label"
              :class="[
                'w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all uppercase tracking-widest font-bold text-xs',
                activeTab === item.label
                  ? 'bg-primary text-black shadow-[0_0_20px_rgba(78,222,163,0.3)]' 
                  : item.danger 
                    ? 'text-red-400 hover:bg-red-400/10' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
              ]"
            >
              <i :class="[item.icon, 'text-lg']"></i>
              <span>{{ item.label }}</span>
            </button>
          </nav>
        </aside>

        <!-- Content Area -->
        <div class="lg:col-span-3 space-y-12">
          <!-- Watch History -->
          <div v-if="activeTab === t('profile.watch_history')" class="space-y-8">
            <div class="flex items-center justify-between border-b border-white/5 pb-6">
              <h3 class="text-2xl font-black text-white uppercase font-display tracking-tight">
                {{ t('profile.history_title') }} <span class="text-primary">{{ t('profile.history_highlight') }}</span>
              </h3>
              <div class="flex gap-4">
                <button 
                  @click="loadData"
                  class="p-2 text-white/40 hover:text-white transition-colors"
                  :title="t('profile.refresh')"
                >
                  <i class="fa-solid fa-rotate"></i>
                </button>
                <button class="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white">{{ t('profile.clear_all') }}</button>
              </div>
            </div>

            <div v-if="loading" class="flex justify-center py-20">
              <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>

            <div v-else-if="history.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <router-link 
                v-for="item in history" 
                :key="item.id" 
                :to="`/watch/${item.filmSlug}?ep=${item.episodeSlug}${item.watchTime > 0 ? `&t=${item.watchTime}` : ''}`"
                class="group glass-panel rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all hover:border-primary/50"
              >
                <div class="relative aspect-video overflow-hidden">
                  <img 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    :src="item.thumbnail || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400'" 
                    :alt="item.filmName"
                  />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <i class="fa-solid fa-play text-primary text-3xl"></i>
                  </div>
                  <div class="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                    <div 
                      class="h-full bg-primary transition-all duration-1000" 
                      :style="{ width: `${item.duration > 0 ? Math.min((item.watchTime / item.duration) * 100, 100) : 0}%` }"
                    ></div>
                  </div>
                  
                  <button 
                    @click.prevent.stop="handleDeleteHistory(item.id)"
                    class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white hover:bg-red-500/80 transition-all z-20"
                    title="Xóa khỏi lịch sử"
                  >
                    <i class="fa-solid fa-xmark text-[10px]"></i>
                  </button>
                </div>
                <div class="p-4 space-y-2">
                  <h4 class="text-white font-bold text-sm uppercase tracking-tight line-clamp-1">
                    {{ item.filmName }} <span class="text-primary">- Tập {{ item.episodeName }}</span>
                  </h4>
                  <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    {{ item.watchTime > 0 ? t('profile.watched_minutes', { min: Math.floor(item.watchTime / 60) }) : t('profile.start_watching') }}
                  </p>
                </div>
              </router-link>
            </div>

            <div v-else class="text-center py-20 space-y-4">
              <i class="fa-solid fa-history text-6xl text-white/10"></i>
              <p class="text-slate-500 font-bold uppercase tracking-widest">{{ t('profile.no_history') }}</p>
            </div>
          </div>

          <!-- Favorite Films -->
          <div v-if="activeTab === t('profile.favorites')" class="space-y-8">
            <div class="flex items-center justify-between border-b border-white/5 pb-6">
              <h3 class="text-2xl font-black text-white uppercase font-display tracking-tight">
                {{ t('profile.favorites_title') }} <span class="text-primary">{{ t('profile.favorites_highlight') }}</span>
              </h3>
              <span class="text-xs font-bold uppercase tracking-widest text-slate-500">{{ likedFilms.length }} {{ t('nav.movies') }}</span>
            </div>

            <div v-if="loading" class="flex justify-center py-20">
              <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>

            <div v-else-if="likedFilms.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              <MovieCard v-for="movie in likedFilms" :key="movie._id || movie.id" :movie="movie" />
            </div>

            <div v-else class="text-center py-20 space-y-4">
              <i class="fa-solid fa-heart-crack text-6xl text-white/10"></i>
              <p class="text-slate-500 font-bold uppercase tracking-widest">{{ t('profile.no_favorites') }}</p>
              <router-link to="/" class="inline-block px-8 py-3 bg-primary text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform">{{ t('profile.find_movies_now') }}</router-link>
            </div>
          </div>

          <!-- Collections (Danh sách chờ) -->
          <div v-if="activeTab === t('profile.watchlist')" class="space-y-8">
            <div class="flex items-center justify-between border-b border-white/5 pb-6">
              <h3 class="text-2xl font-black text-white uppercase font-display tracking-tight">
                {{ t('profile.watchlist_title') }} <span class="text-primary">{{ t('profile.watchlist_highlight') }}</span>
              </h3>
              <div class="flex gap-4">
                <button 
                  @click="loadData"
                  class="p-2 text-white/40 hover:text-white transition-colors"
                  :title="t('profile.refresh')"
                >
                  <i class="fa-solid fa-rotate"></i>
                </button>
                <button 
                  v-if="!showCreateCollection"
                  @click="showCreateCollection = true"
                  class="px-6 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                >
                  <i class="fa-solid fa-plus mr-2"></i> {{ t('profile.create_new') }}
                </button>
              </div>
            </div>

            <div v-if="showCreateCollection" class="glass-panel p-6 rounded-3xl border-primary/30 space-y-4 max-w-md animate-in fade-in slide-in-from-top-2">
              <h4 class="text-white font-bold uppercase tracking-tight">{{ t('profile.new_list_title') }}</h4>
              <input 
                type="text" 
                :placeholder="t('profile.new_list_placeholder')" 
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                v-model="newCollectionName"
                @keyup.enter="handleCreateCollection"
              />
              <div class="flex gap-2">
                <button 
                  @click="showCreateCollection = false"
                  class="flex-1 px-4 py-2 rounded-xl text-white/60 font-bold hover:bg-white/5 transition-colors"
                >
                  {{ t('common.cancel') }}
                </button>
                <button 
                  @click="handleCreateCollection"
                  :disabled="loading || !newCollectionName.trim()"
                  class="flex-1 bg-primary text-black px-4 py-2 rounded-xl font-bold disabled:opacity-50"
                >
                  {{ loading ? t('profile.updating') : t('movie.post_comment') }}
                </button>
              </div>
            </div>

            <div v-if="authStore.user?.collections && authStore.user.collections.length > 0" class="space-y-12">
              <div v-for="col in authStore.user.collections" :key="col.name" class="space-y-6">
                <div class="flex items-center gap-4">
                  <div class="w-1 h-8 bg-primary rounded-full"></div>
                  <h4 class="text-xl font-bold text-white uppercase tracking-tight">{{ col.name }}</h4>
                  <span class="text-[10px] font-black bg-white/5 px-2 py-1 rounded border border-white/10 text-white/40 uppercase">{{ col.films?.length || 0 }} {{ t('nav.movies') }}</span>
                </div>
                
                <div v-if="col.films?.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  <MovieCard 
                    v-for="movie in col.films" 
                    :key="movie._id || movie.id" 
                    :movie="movie" 
                    :no-hover="true"
                    :on-remove="() => handleRemoveFromCollection(movie._id || movie.id, col.name)"
                  />
                </div>
                <div v-else class="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center space-y-3">
                  <p class="text-white/20 text-xs font-bold uppercase tracking-widest">{{ t('profile.no_films_in_collection') }}</p>
                  <router-link to="/" class="text-primary text-[10px] font-black uppercase hover:underline">{{ t('profile.find_movies_now') }}</router-link>
                </div>
              </div>
            </div>

            <div v-else-if="!showCreateCollection" class="text-center py-20 space-y-4">
              <i class="fa-solid fa-bookmark text-6xl text-white/10"></i>
              <p class="text-slate-500 font-bold uppercase tracking-widest">{{ t('profile.no_collections') }}</p>
            </div>
          </div>

          <!-- Upgrade Membership -->
          <div v-if="activeTab === t('payment.upgrade')" class="space-y-12">
            <div class="border-b border-white/5 pb-6">
              <h3 class="text-2xl font-black text-white uppercase font-display tracking-tight">
                {{ t('payment.upgrade_title') }} <span class="text-primary">{{ t('payment.upgrade_highlight') }}</span>
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Premium Pack -->
              <div class="glass-panel p-8 rounded-[40px] border-primary/30 relative overflow-hidden group">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
                <div class="space-y-6 relative">
                  <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <i class="fa-solid fa-star text-3xl"></i>
                  </div>
                  <div class="space-y-2">
                    <h4 class="text-2xl font-black text-white uppercase tracking-tight">{{ t('payment.premium_pack') }}</h4>
                    <p class="text-primary text-2xl font-black">{{ t('payment.premium_price') }}<span class="text-xs text-white/40 ml-2">/ tháng</span></p>
                  </div>
                  <ul class="space-y-3">
                    <li class="flex items-center gap-3 text-white/60 text-sm">
                      <i class="fa-solid fa-check text-primary"></i>
                      {{ t('payment.premium_desc') }}
                    </li>
                  </ul>
                  <button 
                    @click="handleBuyPackage('premium')"
                    :disabled="loading || authStore.user?.membership === 'premium' || authStore.user?.membership === 'promax'"
                    class="w-full bg-primary text-black py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {{ authStore.user?.membership === 'premium' || authStore.user?.membership === 'promax' ? t('payment.membership_status') : t('payment.buy_now') }}
                  </button>
                </div>
              </div>

              <!-- Promax Pack -->
              <div class="glass-panel p-8 rounded-[40px] border-purple-500/30 relative overflow-hidden group bg-gradient-to-br from-purple-500/5 to-transparent">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
                <div class="space-y-6 relative">
                  <div class="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <i class="fa-solid fa-crown text-3xl"></i>
                  </div>
                  <div class="space-y-2">
                    <h4 class="text-2xl font-black text-white uppercase tracking-tight">{{ t('payment.promax_pack') }}</h4>
                    <p class="text-purple-400 text-2xl font-black">{{ t('payment.promax_price') }}<span class="text-xs text-white/40 ml-2">/ tháng</span></p>
                  </div>
                  <ul class="space-y-3">
                    <li class="flex items-center gap-3 text-white/60 text-sm">
                      <i class="fa-solid fa-check text-purple-400"></i>
                      {{ t('payment.promax_desc') }}
                    </li>
                  </ul>
                  <button 
                    @click="handleBuyPackage('promax')"
                    :disabled="loading || authStore.user?.membership === 'promax'"
                    class="w-full bg-purple-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {{ authStore.user?.membership === 'promax' ? t('payment.membership_status') : t('payment.buy_now') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Current Status -->
            <div v-if="authStore.user?.membershipExpiresAt" class="glass-panel p-6 rounded-3xl border-white/5 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <i class="fa-solid fa-calendar-days text-primary"></i>
                <span class="text-white/60 text-sm uppercase font-bold tracking-widest">{{ t('payment.expires_at') }}:</span>
                <span class="text-white font-black">{{ new Date(authStore.user.membershipExpiresAt).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>

          <!-- Settings -->
          <div v-if="activeTab === t('profile.settings')" class="space-y-12 max-w-2xl">
            <div class="border-b border-white/5 pb-6">
              <h3 class="text-2xl font-black text-white uppercase font-display tracking-tight">
                {{ t('profile.settings_title') }} <span class="text-primary">{{ t('profile.settings_highlight') }}</span>
              </h3>
            </div>

            <section class="glass-panel p-8 rounded-[32px] space-y-8">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <i class="fa-solid fa-key text-xl"></i>
                </div>
                <div>
                  <h4 class="text-lg font-bold text-white uppercase tracking-tight">{{ t('profile.change_password') }}</h4>
                  <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{{ t('profile.change_password_desc') }}</p>
                </div>
              </div>

              <form @submit.prevent="handleChangePassword" class="space-y-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">{{ t('profile.current_password') }}</label>
                  <input 
                    type="password" 
                    class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all"
                    placeholder="••••••••"
                    v-model="passwordData.oldPassword"
                    required
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">{{ t('profile.new_password') }}</label>
                    <input 
                      type="password" 
                      class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all"
                      placeholder="••••••••"
                      v-model="passwordData.newPassword"
                      required
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">{{ t('auth.confirm_password') }}</label>
                    <input 
                      type="password" 
                      class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all"
                      placeholder="••••••••"
                      v-model="passwordData.confirmPassword"
                      required
                    />
                  </div>
                </div>

                <div class="pt-4">
                  <button 
                    type="submit"
                    :disabled="loading"
                    class="w-full md:w-auto bg-primary text-black px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(78,222,163,0.3)]"
                  >
                    {{ loading ? t('profile.updating') : t('profile.update_password') }}
                  </button>
                </div>
              </form>
            </section>

            <section class="glass-panel p-8 rounded-[32px] border-red-500/20 bg-red-500/5 space-y-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <i class="fa-solid fa-triangle-exclamation text-xl"></i>
                </div>
                <div>
                  <h4 class="text-lg font-bold text-white uppercase tracking-tight">{{ t('profile.danger_zone') }}</h4>
                  <p class="text-xs text-red-400/60 font-bold uppercase tracking-widest mt-1">{{ t('profile.danger_zone_desc') }}</p>
                </div>
              </div>
              <button class="text-red-400 text-xs font-bold uppercase tracking-widest hover:underline">{{ t('profile.delete_account') }}</button>
            </section>
          </div>
        </div>
      </div>
    </main>

    <Footer />

    <!-- Avatar Modal -->
    <AvatarSelectionModal 
      :show="showAvatarModal" 
      @close="showAvatarModal = false" 
      @updated="loadData"
    />
  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Outfit', sans-serif;
}

.glass-panel {
  background: rgba(45, 52, 73, 0.4);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.bg-background {
  background-color: #0b1326;
}

.text-primary {
  color: #4eeea3;
}

.bg-primary {
  background-color: #4eeea3;
}

.border-primary {
  border-color: #4eeea3;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #0b1326;
}
::-webkit-scrollbar-thumb {
  background: rgba(78, 222, 163, 0.2);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #4eeea3;
}

.animate-in {
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
