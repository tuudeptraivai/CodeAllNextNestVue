<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { message } from 'ant-design-vue';
import BookmarkModal from './BookmarkModal.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  filmId: string;
  className?: string;
}

const props = defineProps<Props>();
const authStore = useAuthStore();
const isModalOpen = ref(false);

const isBookmarked = computed(() => {
  return authStore.user?.collections?.some((col: any) => 
    col.films.some((f: any) => (f._id || f).toString() === props.filmId.toString())
  ) || false;
});

const handleOpenModal = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  if (!authStore.isAuthenticated) {
    message.warning(t('movie.msg_login_to_save'));
    return;
  }

  isModalOpen.value = true;
};
</script>

<template>
  <div class="inline-block">
    <button 
      @click="handleOpenModal"
      :class="[
        'w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 active:scale-90',
        isBookmarked 
          ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(78,222,163,0.3)]' 
          : 'bg-white/5 border-white/10 hover:bg-white/10',
        className
      ]"
    >
      <i 
        :class="[
          'fa-bookmark transition-colors duration-300',
          isBookmarked ? 'fa-solid text-primary' : 'fa-regular text-white'
        ]"
        :style="{ fontSize: '20px' }"
      ></i>
    </button>

    <BookmarkModal 
      :film-id="filmId" 
      :is-open="isModalOpen" 
      @close="isModalOpen = false" 
    />
  </div>
</template>
