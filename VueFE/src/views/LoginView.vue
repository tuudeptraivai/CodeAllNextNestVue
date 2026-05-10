<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { login } from '@/services/api';
import Header from '@/components/Header.vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = t('auth.err_missing_fields');
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const response = await login({ email: email.value, password: password.value });
    
    if (response.user && response.access_token) {
      authStore.setCredentials(response.user, response.access_token);
      message.success(t('auth.msg_login_success'));
      router.push('/');
    } else {
      throw new Error("Invalid response data");
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('auth.err_login_failed');
    message.error(error.value);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#0b1326] flex flex-col font-body selection:bg-primary selection:text-black">
    <Header />
    
    <div class="flex-grow flex items-center justify-center px-6 py-20 relative overflow-hidden">
      <!-- Background Decorations -->
      <div class="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]"></div>

      <div class="w-full max-w-[450px] relative z-10">
        <div class="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[40px] shadow-2xl space-y-10">
          <div class="text-center space-y-4">
            <h1 class="text-4xl font-black text-white uppercase tracking-tighter">{{ t('auth.login_welcome') }} <span class="text-primary">{{ t('auth.login_back') }}</span></h1>
            <p class="text-slate-400 font-medium">{{ t('auth.login_desc') }}</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <div v-if="error" class="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-bold text-center">
              {{ error }}
            </div>

            <div class="space-y-2">
              <label class="text-xs font-black uppercase tracking-widest text-white/40 ml-4">{{ t('common.email') }}</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-5 flex items-center text-white/20 group-focus-within:text-primary transition-colors">
                  <i class="fa-solid fa-envelope"></i>
                </div>
                <input 
                  v-model="email"
                  type="email" 
                  placeholder="name@example.com"
                  class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-black uppercase tracking-widest text-white/40 ml-4">{{ t('common.password') }}</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-5 flex items-center text-white/20 group-focus-within:text-primary transition-colors">
                  <i class="fa-solid fa-lock"></i>
                </div>
                <input 
                  v-model="password"
                  type="password" 
                  placeholder="••••••••"
                  class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              :disabled="loading"
              class="w-full bg-primary text-black py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              <template v-if="loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                {{ t('common.processing') }}
              </template>
              <template v-else>
                {{ t('auth.login_button') }}
                <i class="fa-solid fa-arrow-right"></i>
              </template>
            </button>
          </form>

          <div class="text-center">
            <p class="text-slate-500 font-medium">{{ t('auth.no_account') }} 
              <router-link to="/register" class="text-primary font-bold hover:underline">{{ t('auth.register_now') }}</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
