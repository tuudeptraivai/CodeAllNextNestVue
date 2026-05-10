<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { verifyPayment } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const success = ref(false);
const messageText = ref("");

onMounted(async () => {
  try {
    const params = route.query;
    console.log("VNPay Return Params:", params);
    const res = await verifyPayment(params);
    console.log("Verify Result:", res);
    
    if (res.success) {
      success.value = true;
      if (authStore.user) {
        const updatedUser = {
          ...authStore.user,
          membership: res.pack
        };
        authStore.updateUser(updatedUser);
        console.log("User updated to:", res.pack);
      }
    } else {
      success.value = false;
      messageText.value = res.message || t('payment.failed_desc');
    }
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    success.value = false;
    messageText.value = error.response?.data?.message || t('payment.failed_desc');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-background font-body">
    <Header />
    
    <main class="pt-32 pb-20 px-6 flex items-center justify-center">
      <div class="glass-panel p-12 rounded-[40px] max-w-lg w-full text-center space-y-8 animate-in">
        <div v-if="loading" class="space-y-6">
          <div class="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-white/60 font-bold uppercase tracking-widest text-sm">{{ t('common.processing') }}</p>
        </div>

        <template v-else>
          <div v-if="success" class="space-y-6">
            <div class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
              <i class="fa-solid fa-circle-check text-5xl"></i>
            </div>
            <div class="space-y-2">
              <h2 class="text-3xl font-black text-white uppercase tracking-tight">{{ t('payment.success_title') }}</h2>
              <p class="text-white/60 text-sm leading-relaxed">{{ t('payment.success_desc') }}</p>
            </div>
          </div>

          <div v-else class="space-y-6">
            <div class="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto">
              <i class="fa-solid fa-circle-xmark text-5xl"></i>
            </div>
            <div class="space-y-2">
              <h2 class="text-3xl font-black text-white uppercase tracking-tight">{{ t('payment.failed_title') }}</h2>
              <p class="text-white/60 text-sm leading-relaxed">{{ messageText }}</p>
            </div>
          </div>

          <button 
            @click="router.push('/profile')"
            class="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-black transition-all"
          >
            {{ t('payment.back_to_profile') }}
          </button>
        </template>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
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
