<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <footer class="bg-background/50 border-t border-white/5 py-12 md:py-20 mt-20">
    <div class="max-w-[1440px] mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div class="space-y-6">
        <span class="text-2xl font-black italic text-primary uppercase font-display tracking-tighter">CINEPHILE</span>
        <p class="text-on-surface-variant text-sm leading-relaxed">
          {{ t('footer.desc') }}
        </p>
      </div>
      <div>
        <h4 class="text-white font-bold mb-6">{{ t('footer.explore') }}</h4>
        <ul class="space-y-4 text-sm text-on-surface-variant">
          <li><router-link to="/phim-le" class="hover:text-primary transition-colors">{{ t('footer.movies') }}</router-link></li>
          <li><router-link to="/phim-bo" class="hover:text-primary transition-colors">{{ t('footer.series') }}</router-link></li>
          <li><router-link to="/search" class="hover:text-primary transition-colors">{{ t('footer.tv') }}</router-link></li>
          <li><router-link to="/actors" class="hover:text-primary transition-colors">{{ t('footer.actors') }}</router-link></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-bold mb-6">{{ t('footer.support') }}</h4>
        <ul class="space-y-4 text-sm text-on-surface-variant">
          <li><a href="#" class="hover:text-primary transition-colors">{{ t('footer.help') }}</a></li>
          <li><a href="#" class="hover:text-primary transition-colors">{{ t('footer.terms') }}</a></li>
          <li><a href="#" class="hover:text-primary transition-colors">{{ t('footer.privacy') }}</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-white font-bold mb-6">{{ t('footer.connect') }}</h4>
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all cursor-pointer">
            <i class="fa-brands fa-facebook-f"></i>
          </div>
          <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all cursor-pointer">
            <i class="fa-solid fa-share-nodes"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="max-w-[1440px] mx-auto px-6 md:px-16 mt-12 pt-8 border-t border-white/5 text-center">
      <p class="text-slate-500 text-xs">{{ t('footer.copyright') }}</p>
    </div>
  </footer>
</template>
