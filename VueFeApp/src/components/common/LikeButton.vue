<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { toggleLike as toggleLikeApi } from '../../services/api';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  filmId: string;
  className?: string;
}

const props = defineProps<Props>();
const authStore = useAuthStore();
const loading = ref(false);

const isLiked = computed(() => {
  if (!authStore.user?.favoriteFilms) return false;
  // Ensure we compare IDs correctly (handling potential string/object mismatch)
  return authStore.user.favoriteFilms.some(id => 
    (id.toString() === props.filmId?.toString())
  );
});

const handleToggleLike = async (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  if (!authStore.isAuthenticated) {
    message.warning(t('movie.msg_login_to_vote')); // Reuse login to vote for like
    return;
  }

  loading.value = true;
  try {
    const updatedUser = await toggleLikeApi(props.filmId);
    if (updatedUser) {
      authStore.updateUser(updatedUser);
      // Logic for showing message based on updated state
      const nowLiked = updatedUser.favoriteFilms?.some((id: any) => id.toString() === props.filmId.toString());
      if (nowLiked) {
        message.success(t('profile.favorites_title') + ' +1');
      } else {
        message.info(t('profile.msg_removed_collection'));
      }
    }
  } catch (error) {
    console.error('Like error:', error);
    message.error(t('common.error_occurred'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <button 
    @click="handleToggleLike"
    :disabled="loading"
    :class="[
      'w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-500 active:scale-90',
      isLiked 
        ? 'bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(78,222,163,0.2)]' 
        : 'bg-white/5 border-white/10 hover:bg-white/20',
      loading ? 'opacity-50 cursor-not-allowed' : '',
      className
    ]"
    :title="isLiked ? t('profile.logout') : t('profile.favorites')"
  >
    <i 
      :class="[
        'fa-heart transition-all duration-500 transform',
        isLiked ? 'fa-solid text-primary scale-110' : 'fa-regular text-white hover:scale-110',
        loading ? 'animate-pulse' : ''
      ]"
      :style="{ fontSize: '22px' }"
    ></i>
  </button>
</template>
