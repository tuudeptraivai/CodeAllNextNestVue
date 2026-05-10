<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { addFilmToCollections, fetchBookmarks } from '@/services/api';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  filmId: string;
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const authStore = useAuthStore();
const selectedCollections = ref<string[]>([]);
const loading = ref(false);
const initialLoading = ref(false);

const collections = computed(() => authStore.user?.collections || []);

// Fetch fresh data when modal opens
const loadUserCollections = async () => {
  if (authStore.isAuthenticated) {
    initialLoading.value = true;
    try {
      const data = await fetchBookmarks();
      if (data && data.collections) {
        authStore.updateUser({ ...authStore.user!, collections: data.collections });
      }
    } catch (error) {
      console.error("Failed to load collections:", error);
    } finally {
      initialLoading.value = false;
    }
  }
};

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    // If collections are empty, try to fetch them
    if (collections.value.length === 0) {
      await loadUserCollections();
    }
    
    // Set initial selected state
    const alreadyIn = collections.value
      ?.filter(col => col.films.some((f: any) => (f._id || f).toString() === props.filmId.toString()))
      .map(col => col.name) || [];
    selectedCollections.value = alreadyIn;
  }
});

const handleClose = () => {
  emit('close');
};

const handleAddToCollections = async () => {
  loading.value = true;
  try {
    const updatedUser = await addFilmToCollections(props.filmId, selectedCollections.value);
    if (updatedUser) {
      authStore.updateUser(updatedUser);
      message.success(t('profile.msg_collection_created'));
      handleClose();
    }
  } catch (error) {
    message.error(t('profile.err_update_failed'));
  } finally {
    loading.value = false;
  }
};

const options = computed(() => collections.value.map(col => ({
  label: col.name,
  value: col.name,
  isAlreadyIn: col.films.some((f: any) => (f._id || f).toString() === props.filmId.toString())
})));
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
    @click="handleClose"
  >
    <div 
      id="bookmark-modal-container"
      class="bg-[#1a1f2e] border border-white/10 rounded-3xl w-full max-w-sm min-h-[250px] flex flex-col shadow-2xl relative animate-in fade-in slide-in-from-top-10 duration-300" 
      @click.stop
    >
      <!-- Header with Add Button at Top Right -->
      <div class="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 class="text-white text-base font-black uppercase tracking-tight">{{ t('bookmark.add_to_collection') }}</h3>
        <div class="flex items-center gap-2">
          <button 
            v-if="collections.length > 0"
            @click="handleAddToCollections"
            :disabled="loading"
            class="bg-primary text-[#003824] px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {{ loading ? "..." : t('common.send') }}
          </button>
          <button @click="handleClose" class="text-white/40 hover:text-white transition-colors p-1">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- Body Content -->
      <div class="flex-1 p-6 flex flex-col justify-center">
        <div v-if="initialLoading" class="flex justify-center py-4">
          <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div v-else-if="collections.length > 0" class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">{{ t('bookmark.select_collection') }}</label>
          
          <a-config-provider
            :theme="{
              token: {
                colorPrimary: '#4edea3',
                colorBgContainer: 'rgba(255,255,255,0.05)',
                colorBorder: 'rgba(255,255,255,0.1)',
                colorText: '#ffffff',
                colorTextPlaceholder: 'rgba(255,255,255,0.3)',
              }
            }"
          >
            <a-select
              v-model:value="selectedCollections"
              mode="multiple"
              show-search
              :placeholder="t('profile.new_list_placeholder')"
              class="w-full custom-antd-select"
              :dropdown-style="{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', zIndex: 10001 }"
            >
              <a-select-option v-for="opt in options" :key="opt.value" :value="opt.value">
                <div class="flex items-center justify-between w-full">
                  <span class="text-white">{{ opt.label }}</span>
                  <span v-if="opt.isAlreadyIn" class="text-[10px] text-primary font-black ml-2 uppercase">{{ t('bookmark.in_list') }}</span>
                </div>
              </a-select-option>
            </a-select>
          </a-config-provider>
          
          <div class="mt-2 text-[9px] text-white/30 italic">Bạn có thể chọn nhiều danh sách cùng lúc</div>
        </div>
        
        <div v-else class="text-center space-y-4">
          <p class="text-white/60 text-xs font-bold">{{ t('profile.no_collections') }}</p>
          <router-link 
            to="/profile" 
            class="text-primary text-[10px] font-black uppercase border-b border-primary/30 hover:border-primary transition-all pb-0.5"
            @click="handleClose"
          >
            {{ t('profile.create_new') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-antd-select :deep(.ant-select-selector) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  color: white !important;
}

.custom-antd-select :deep(.ant-select-selection-item) {
  background-color: rgba(78, 222, 163, 0.2) !important;
  border-color: rgba(78, 222, 163, 0.3) !important;
  color: #4edea3 !important;
}

.custom-antd-select :deep(.ant-select-selection-item-remove) {
  color: #4edea3 !important;
}

:deep(.ant-select-dropdown) {
  background-color: #1a1f2e !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:deep(.ant-select-item-option-selected:not(.ant-select-item-option-disabled)) {
  background-color: rgba(78, 222, 163, 0.1) !important;
}

:deep(.ant-select-item-option-active:not(.ant-select-item-option-disabled)) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}
</style>
