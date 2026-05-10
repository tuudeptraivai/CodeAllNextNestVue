<script setup lang="ts">
import { ref } from 'vue';
import { updateAvatar } from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(['close', 'updated']);

const authStore = useAuthStore();
const uploading = ref(false);
const loading = ref(false);

const actorAvatars = [
  { name: 'Xu Kai', region: 'Châu Á', url: 'https://image.tmdb.org/t/p/w500/wEfatQWa3v9tNtmgr5LOOmFSSJj.jpg' },
  { name: 'Deng Enxi', region: 'Châu Á', url: 'https://image.tmdb.org/t/p/w500/mljbAriACCCSNYAe6bDMiCFgViu.jpg' },
  { name: 'Hana Hishikawa', region: 'Châu Á', url: 'https://image.tmdb.org/t/p/w500/epCzuP9ZmBMonKK2Z6FOKoq2b7k.jpg' },
  { name: 'Qi Zhao', region: 'Châu Á', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop' },
  { name: 'Camille Lou', region: 'Châu Âu', url: 'https://image.tmdb.org/t/p/w500/nKYywaCPmKxDEFwJhOyKfOxO8XK.jpg' },
  { name: 'Hugo Becker', region: 'Châu Âu', url: 'https://image.tmdb.org/t/p/w500/o7XNhf8m08RvYrjTJ46H0cRVW8K.jpg' },
  { name: 'Matilde Gioli', region: 'Châu Âu', url: 'https://image.tmdb.org/t/p/w500/9a6EoA8h6VPEe3WXcHkASk0k0Y.jpg' },
  { name: 'David Lowery', region: 'Châu Mỹ', url: 'https://image.tmdb.org/t/p/w500/5zS78ZleGuxFB0XZBqQMbH4udME.jpg' },
  { name: 'Emily Haines', region: 'Châu Mỹ', url: 'https://image.tmdb.org/t/p/w500/xdURiQ9XciiWj5XurPcKxbhYCID.jpg' },
  { name: 'Mark Linkous', region: 'Châu Mỹ', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop' },
];

const handleUpdateAvatar = async (url: string) => {
  loading.value = true;
  try {
    const updatedUser = await updateAvatar(url);
    if (updatedUser) {
      authStore.updateUser(updatedUser);
      message.success(t('profile.msg_avatar_updated'));
      emit('updated');
      emit('close');
    }
  } catch (error) {
    message.error(t('profile.err_update_failed'));
  } finally {
    loading.value = false;
  }
};

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    message.error(t('profile.err_file_too_large'));
    return;
  }

  uploading.value = true;
  try {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await handleUpdateAvatar(base64String);
      uploading.value = false;
    };
    reader.readAsDataURL(file);
  } catch (error) {
    message.error(t('profile.err_upload_failed'));
    uploading.value = false;
  }
};
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="emit('close')"></div>
      
      <div class="relative bg-[#0b1326] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[40px] border border-white/10 flex flex-col shadow-2xl animate-scale">
        <!-- Header -->
        <div class="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 class="text-3xl font-black text-white uppercase tracking-tight">
              {{ t('profile.choose_avatar') }} <span class="text-primary">{{ t('profile.avatar_title') }}</span>
            </h3>
            <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">{{ t('profile.customize_style') }}</p>
          </div>
          <button 
            @click="emit('close')"
            class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
          >
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
          <!-- Upload Section -->
          <div class="space-y-6">
            <h4 class="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span class="w-8 h-[2px] bg-primary"></span>
              {{ t('profile.upload_avatar') }}
            </h4>
            <label class="group relative block w-full aspect-[4/1] rounded-3xl border-2 border-dashed border-white/10 hover:border-primary/50 bg-white/5 transition-all cursor-pointer overflow-hidden">
              <input 
                type="file" 
                class="hidden" 
                accept="image/*"
                @change="handleFileUpload"
              />
              <div class="absolute inset-0 flex flex-col items-center justify-center space-y-2 group-hover:scale-105 transition-transform duration-500">
                <div v-if="uploading" class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <template v-else>
                  <i class="fa-solid fa-cloud-arrow-up text-3xl text-primary/40 group-hover:text-primary transition-colors"></i>
                  <span class="text-xs font-bold text-slate-500 group-hover:text-white transition-colors uppercase tracking-widest">{{ t('profile.drag_drop_placeholder') }}</span>
                </template>
              </div>
            </label>
          </div>

          <!-- Actor Categories -->
          <div v-for="region in ['Châu Á', 'Châu Âu', 'Châu Mỹ']" :key="region" class="space-y-6">
            <h4 class="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span class="w-8 h-[2px] bg-primary"></span>
              {{ t('movie.actors') }} {{ region }}
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div 
                v-for="actor in actorAvatars.filter(a => a.region === region)"
                :key="actor.url"
                @click="handleUpdateAvatar(actor.url)"
                class="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all bg-white/5"
              >
                <img 
                  :src="actor.url" 
                  :alt="actor.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p class="text-[10px] font-black text-white uppercase tracking-tight truncate">{{ actor.name }}</p>
                  <p class="text-[8px] font-bold text-primary uppercase tracking-widest">{{ t('profile.confirm_selection') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(78, 222, 163, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(78, 222, 163, 0.4);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.animate-scale {
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
