<template>
  <div>
    <!-- Hero Section -->
    <section class="relative w-full flex items-center justify-center overflow-hidden"
      :style="{ height: 'calc(var(--app-vh-fixed, var(--vh, 1vh)) * 100)' }">
        <div class="absolute inset-0 z-0 hero-fill-safe">
          <video ref="heroVideo"
            :src="siteMedia.miyanHeroVideo"
            autoplay
            muted
            loop
            playsinline
            class="absolute inset-0 w-full h-full object-cover hero-video"
          />
        <div
          class="absolute inset-0 transition-all"
          :style="{ 
            background: `rgba(0,0,0,${modalOverlayAlpha})`, 
            transition: overlayTransition 
          }"
        ></div>
      </div>
      <div class="relative z-10 text-center px-6 max-w-xs mx-auto hero-content">
        <img 
          :src="siteMedia.miyanLogo" 
          alt="Miyan Logo" 
          class="w-full h-auto drop-shadow-lg brightness-0 invert"
        />
      </div>
    </section>

    <Transition :name="childTransition" mode="out-in">
      <MiyanLanding :key="route.fullPath" />
    </Transition>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useHeroIntro } from '@/composables/useHeroIntro'
import { useLocalizedChildRoutes } from '@/composables/useLocalizedChildRoutes'
import { navigationCopy } from '@/state/siteCopy'
import siteMediaDefaults from '@/state/siteMediaDefaults'
import MiyanLanding from './MiyanLanding.vue'

const siteMedia = siteMediaDefaults
const route = useRoute()

const { heroVideo, modalOverlayAlpha, overlayTransition } = useHeroIntro({
  overlayBase: 0.4,
  scrollRange: 380,
})

const { childTransition } = useLocalizedChildRoutes(navigationCopy.miyan)
</script>

<style scoped>
.nav-placeholder {
  position: relative;
}

.nav-placeholder section {
  width: 100%;
}
/* Smooth video transforms and lock object-position guidance to global styles. */
.hero-video {
  transition: transform 320ms cubic-bezier(.2,.9,.25,1), opacity 260ms ease;
  will-change: transform, opacity;
  /* ensure video covers without sudden scale jumps */
  min-width: 100%;
  min-height: 100%;
  transform-origin: center center;
}
.hero-content {
  transition: transform 420ms cubic-bezier(.2,.9,.25,1), opacity 320ms ease;
  will-change: transform, opacity;
}

@media (max-width: 640px) and (orientation: portrait) {
  /* Shift only the video surface on small portrait screens; overlays/logo stay centered */
  .hero-video {
    object-position: calc(50% - 100px) center;
  }
}
</style>
