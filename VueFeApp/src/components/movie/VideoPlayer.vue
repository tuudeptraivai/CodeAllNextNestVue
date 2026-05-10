<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

interface Props {
  url: string;
  poster?: string;
  initialTime?: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['timeupdate']);

const artRef = ref<HTMLDivElement | null>(null);
let art: Artplayer | null = null;

const initPlayer = () => {
  if (!artRef.value) return;

  if (art) {
    art.destroy();
  }

  art = new Artplayer({
    container: artRef.value,
    url: props.url,
    poster: props.poster || '',
    volume: 0.7,
    isLive: false,
    muted: false,
    autoplay: false,
    pip: true,
    autoSize: true,
    autoMini: true,
    screenshot: true,
    setting: true,
    loop: false,
    flip: true,
    playbackRate: true,
    aspectRatio: true,
    fullscreen: true,
    fullscreenWeb: true,
    subtitleOffset: true,
    miniProgressBar: true,
    mutex: true,
    backdrop: true,
    playsInline: true,
    autoPlayback: true,
    airplay: true,
    theme: '#4edea3', // Primary color
    customType: {
      m3u8: (video: HTMLVideoElement, url: string) => {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        }
      },
    },
  });

  // Handle initial time
  if (props.initialTime && props.initialTime > 0) {
    art.once('ready', () => {
      if (art) art.seek = props.initialTime!;
    });
  }

  // Time update for history saving
  art.on('video:timeupdate', () => {
    if (art) {
      emit('timeupdate', art.video.currentTime, art.video.duration);
    }
  });

  // Auto skip intro button example (Optional)
  art.on('ready', () => {
    console.info('ArtPlayer is ready');
  });
};

onMounted(() => {
  initPlayer();
});

onBeforeUnmount(() => {
  if (art) {
    if (art.mini) {
      art.mini = false;
    }
    art.destroy(true);
    art = null;
  }
});

// Re-init player when URL changes (switching episodes)
watch(() => props.url, () => {
  initPlayer();
});
</script>

<template>
  <div ref="artRef" class="w-full h-full"></div>
</template>

<style>
.artplayer-container {
  border-radius: inherit;
}
</style>
