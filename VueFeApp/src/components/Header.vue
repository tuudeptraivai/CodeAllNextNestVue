<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const authStore = useAuthStore();
const { t, locale } = useI18n();

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const isProfileOpen = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const handleLogout = () => {
  authStore.logout();
  router.push('/');
  isProfileOpen.value = false;
};

const changeLanguage = (lang: string) => {
  locale.value = lang;
  localStorage.setItem('locale', lang);
};

const navLinks = computed(() => [
  { name: t('nav.home'), path: '/' },
  { name: t('nav.movies'), path: '/category/phim-le' },
  { name: t('nav.series'), path: '/category/phim-bo' },
  { name: t('nav.actors'), path: '/actors' },
  { name: t('nav.explore'), path: '/search' },
]);
</script>

<template>
  <nav 
    :class="[
      'fixed top-0 left-0 w-full z-[1000] transition-all duration-500 px-6 md:px-16 py-4 flex items-center justify-between',
      isScrolled ? 'bg-[#0b1326]/90 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent'
    ]"
  >
    <!-- Logo -->
    <router-link to="/" class="flex items-center gap-2 group">
      <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
        <span class="text-black font-black text-2xl tracking-tighter">V</span>
      </div>
      <span class="text-2xl font-black text-white uppercase tracking-tighter hidden sm:block">CINE<span class="text-primary">PHILE</span></span>
    </router-link>

    <!-- Desktop Nav -->
    <div class="hidden md:flex items-center gap-10">
      <router-link 
        v-for="link in navLinks" 
        :key="link.path" 
        :to="link.path"
        class="text-xs font-black text-white/60 hover:text-primary transition-colors uppercase tracking-[0.2em] relative group"
        active-class="!text-primary"
      >
        {{ link.name }}
        <span class="absolute -bottom-2 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full"></span>
      </router-link>
    </div>

    <!-- User Actions -->
    <div class="flex items-center gap-6">
      <router-link to="/search" class="text-white/40 hover:text-white transition-colors">
        <i class="fa-solid fa-magnifying-glass text-xl"></i>
      </router-link>

      <!-- Language Switcher -->
      <div class="flex items-center gap-3 border-l border-white/10 pl-6 h-6">
        <button 
          @click="changeLanguage('vi')" 
          :class="['w-6 h-6 rounded-full overflow-hidden border-2 transition-all hover:scale-110 active:scale-95', locale === 'vi' ? 'border-primary' : 'border-transparent opacity-40 hover:opacity-100']"
          title="Tiếng Việt"
        >
          <img src="https://flagcdn.com/w40/vn.png" class="w-full h-full object-cover" alt="VN" />
        </button>
        <button 
          @click="changeLanguage('en')" 
          :class="['w-6 h-6 rounded-full overflow-hidden border-2 transition-all hover:scale-110 active:scale-95', locale === 'en' ? 'border-primary' : 'border-transparent opacity-40 hover:opacity-100']"
          title="English"
        >
          <img src="https://flagcdn.com/w40/us.png" class="w-full h-full object-cover" alt="US" />
        </button>
      </div>

      <div v-if="authStore.isAuthenticated" class="relative">
        <button 
          @click="isProfileOpen = !isProfileOpen"
          class="flex items-center gap-4 group"
        >
          <div class="text-right hidden sm:block space-y-0.5">
            <p class="text-[11px] font-black text-white uppercase tracking-widest leading-none">{{ authStore.userDisplayName }}</p>
            <p class="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em] leading-none">{{ authStore.userRole }}</p>
          </div>
          <div class="relative w-10 h-10 rounded-full border-2 border-white/10 group-hover:border-primary/50 transition-all p-0.5 shadow-xl">
            <img 
              :src="authStore.user?.avatar || '/placeholder-avatar.jpg'" 
              class="w-full h-full rounded-full object-cover" 
              alt="Avatar" 
            />
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-[#0b1326] rounded-full"></div>
          </div>
        </button>

        <!-- Dropdown Menu (Match Screenshot Style) -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform scale-95 opacity-0 -translate-y-2"
          enter-to-class="transform scale-100 opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform scale-100 opacity-100 translate-y-0"
          leave-to-class="transform scale-95 opacity-0 -translate-y-2"
        >
          <div v-if="isProfileOpen" class="absolute top-full right-0 mt-4 w-56 bg-[#121a2b]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-[1100]">
            <router-link to="/profile" @click="isProfileOpen = false" class="flex items-center gap-3 px-6 py-4 hover:bg-white/5 text-white/60 hover:text-primary transition-all">
              <i class="fa-solid fa-user text-sm"></i>
              <span class="text-[10px] font-black uppercase tracking-widest">{{ t('nav.profile_settings') }}</span>
            </router-link>
            <button @click="handleLogout" class="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-all">
              <i class="fa-solid fa-right-from-bracket text-sm"></i>
              <span class="text-[10px] font-black uppercase tracking-widest">{{ t('nav.logout') }}</span>
            </button>
          </div>
        </transition>
      </div>

      <router-link 
        v-else 
        to="/login"
        class="bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all active:scale-95"
      >
        {{ t('nav.login') }}
      </router-link>

      <!-- Mobile Menu Toggle -->
      <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="lg:hidden text-white/60 hover:text-white">
        <i v-if="!isMobileMenuOpen" class="fa-solid fa-bars text-2xl"></i>
        <i v-else class="fa-solid fa-xmark text-2xl"></i>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="isMobileMenuOpen" class="absolute top-full left-0 w-full bg-[#0b1326]/95 backdrop-blur-2xl border-b border-white/5 p-8 flex flex-col gap-6 lg:hidden">
        <router-link 
          v-for="link in navLinks" 
          :key="link.path" 
          :to="link.path"
          class="text-lg font-black text-white/60 hover:text-primary transition-all uppercase tracking-widest"
          @click="isMobileMenuOpen = false"
        >
          {{ link.name }}
        </router-link>
      </div>
    </transition>
  </nav>
</template>
