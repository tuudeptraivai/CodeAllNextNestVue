<script setup lang="ts">
interface Props {
  title: string;
  highlight?: string;
  viewAllLink?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="flex items-center justify-between mb-[30px]">
    <div class="flex items-center gap-4">
      <div class="w-1.5 h-8 bg-primary rounded-full"></div>
      <h2 class="text-2xl md:text-3xl font-black text-white uppercase font-display tracking-tight">
        {{ title }} <span v-if="highlight" class="text-primary">{{ highlight }}</span>
      </h2>
    </div>
    <router-link 
      v-if="viewAllLink" 
      :to="viewAllLink" 
      class="text-primary text-xs font-bold uppercase tracking-widest hover:underline transition-all"
    >
      Xem tất cả
    </router-link>
  </div>
</template>
