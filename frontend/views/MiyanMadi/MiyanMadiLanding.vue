<template>
  <section
    ref="landingRoot"
    class="landing-shell landing-shell--madi brand-surface brand-surface--madi content-shell"
    :dir="dirAttr"
    :style="landingStyle"
  >
    <div class="madi-hero" :style="heroOrbitStyle">
      <p class="overline" :class="textClass">{{ isRTL ? heroCopy.overline.fa : heroCopy.overline.en }}</p>
      <h1 data-reveal :class="titleClass" class="copy-breaks">
        {{ isRTL ? heroCopy.title.fa : heroCopy.title.en }}
      </h1>
      <p data-reveal :class="textClass" class="copy-breaks">
        {{ isRTL ? heroCopy.body.fa : heroCopy.body.en }}
      </p>
    </div>

    <div class="immersive-stack" v-if="primaryStory">
      <article
        class="story-scene"
        :ref="el => setStoryScene(el, 0)"
        :style="[sceneStyle(0), storySurface(primaryStory.image)]"
      >
        <div class="story-copy" :class="textClass">
          <p class="story-overline">{{ isRTL ? primaryStory.overline.fa : primaryStory.overline.en }}</p>
          <h3 :class="titleClass" class="copy-breaks">{{ isRTL ? primaryStory.title.fa : primaryStory.title.en }}</h3>
          <p class="copy-breaks">{{ isRTL ? primaryStory.copy.fa : primaryStory.copy.en }}</p>
        </div>
      </article>
    </div>

    <div class="madi-atmosphere">
      <div class="mist-line" v-for="n in 3" :key="`primary-${n}`" :style="mistStyle(n)"></div>
      <div class="atmo-copy" data-reveal>
        <h2 :class="titleClass" class="copy-breaks">{{ isRTL ? atmosphereCopy.title.fa : atmosphereCopy.title.en }}</h2>
        <p
          v-for="(paragraph, idx) in atmosphereCopy.paragraphs"
          :key="`atmo-${idx}`"
          :class="textClass"
          class="copy-breaks"
        >
          {{ isRTL ? paragraph.fa : paragraph.en }}
        </p>
      </div>
    </div>

    <div class="immersive-stack" v-if="secondaryStories.length">
      <article
        v-for="(story, idx) in secondaryStories"
        :key="story.title.en"
        class="story-scene"
        :ref="el => setStoryScene(el, idx + 1)"
        :style="[sceneStyle(idx + 1), storySurface(story.image)]"
      >
        <div class="story-copy" :class="textClass">
          <p class="story-overline">{{ isRTL ? story.overline.fa : story.overline.en }}</p>
          <h3 :class="titleClass" class="copy-breaks">{{ isRTL ? story.title.fa : story.title.en }}</h3>
          <p class="copy-breaks">{{ isRTL ? story.copy.fa : story.copy.en }}</p>
        </div>
      </article>
    </div>

    <div class="madi-location" data-reveal>
      <div class="location-copy" :class="textClass">
        <p class="overline">{{ isRTL ? locationInfo.overline.fa : locationInfo.overline.en }}</p>
        <h2 :class="titleClass" class="copy-breaks">{{ isRTL ? locationInfo.title.fa : locationInfo.title.en }}</h2>
        <ul class="location-list">
          <li v-for="(line, idx) in locationLines" :key="`madi-address-${idx}`">{{ line }}</li>
        </ul>
        <p class="location-hours copy-breaks">{{ isRTL ? locationInfo.hours.fa : locationInfo.hours.en }}</p>
      </div>
      <div class="location-map" role="region" :aria-label="isRTL ? locationInfo.title.fa : locationInfo.title.en">
        <div class="map-canvas">
          <LocationMap :center="mapCenter || []" :zoom="mapZoom" :marker-label="mapMarkerLabel" />
          <a
            v-if="hasMapLink"
            class="map-launch"
            :href="mapLink"
            target="_blank"
            rel="noopener"
            :aria-label="isRTL ? locationInfo.cta.fa : locationInfo.cta.en"
          >
            ↗
          </a>
          <span v-else class="map-launch" aria-hidden="true">↗</span>
        </div>
        <div class="map-meta">
          <a v-if="hasMapLink" class="map-coords" :href="mapLink" target="_blank" rel="noopener">{{ locationCoordinates }}</a>
          <span v-else class="map-coords">{{ locationCoordinates }}</span>
          <a v-if="hasMapLink" class="map-cta" :href="mapLink" target="_blank" rel="noopener">
            {{ isRTL ? locationInfo.cta.fa : locationInfo.cta.en }}
          </a>
          <span v-else class="map-cta">{{ isRTL ? locationInfo.cta.fa : locationInfo.cta.en }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRevealObserver } from '@/composables/useRevealObserver'
import { useScrollVelocity } from '@/composables/useScrollVelocity'
import { useSceneProgress } from '@/composables/useSceneProgress'
import siteMediaDefaults from '@/state/siteMediaDefaults'
import { miyanMadiLandingCopy } from '@/state/siteCopy'
import LocationMap from '@/components/LocationMap.vue'
import { useLang } from '~/composables/useLang'
import { useMenuPrefetch } from '~/composables/useMenuData'

const siteMedia = siteMediaDefaults
const landingRoot = ref(null)
const { scrollY, speedFactor } = useScrollVelocity({
  smoothing: 0.2,
  multiplier: 11,
  max: 1.5,
  min: 0.85,
})
const langState = useLang()
const lang = computed(() => langState.value)
const isRTL = computed(() => lang.value === 'fa')
const dirAttr = computed(() => (isRTL.value ? 'rtl' : 'ltr'))
const textClass = computed(() => (isRTL.value ? 'font-b-titr text-right leading-relaxed' : 'font-sans text-left leading-relaxed'))
const titleClass = computed(() => (isRTL.value ? 'font-b-titr text-right font-bold' : 'font-cinzel font-semibold tracking-wide text-left'))
const pxToRem = (valuePx) => `${parseFloat((valuePx / 16).toFixed(4))}rem`
const landingStyle = computed(() => ({
  '--viz-velocity': speedFactor.value.toFixed(3)
}))

const heroCopy = miyanMadiLandingCopy.hero
const atmosphereCopy = miyanMadiLandingCopy.atmosphere

const heroOrbitStyle = computed(() => {
  const curve = Math.pow(Math.min(scrollY.value / 500, 1), 0.75)
  const offsetY = curve * -36 * speedFactor.value
  return {
    transform: `translate3d(0, ${pxToRem(offsetY)}, 0)`
  }
})

function mistStyle(index) {
  const offset = index * 40
  return {
    animationDelay: `${(index * 0.6) / speedFactor.value}s`,
    animationDuration: `${6 / speedFactor.value}s`,
    top: pxToRem(10 + offset)
  }
}

const photoStories = miyanMadiLandingCopy.photoStories.map((story) => ({
  ...story,
  image: siteMedia[story.imageKey],
}))
const [primaryStory, ...secondaryStories] = photoStories

const locationInfo = miyanMadiLandingCopy.location

const locationLines = computed(() => (isRTL.value ? locationInfo.addressLines.fa : locationInfo.addressLines.en))

const locationCoordinates = computed(() => {
  const coords = locationInfo?.coordinates
  if (!coords) return ''
  return isRTL.value ? coords.fa : coords.en
})
const mapCenter = computed(() => {
  const center = locationInfo?.mapCenter
  const lat = Number(center?.lat)
  const lng = Number(center?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return [lat, lng]
})
const mapZoom = locationInfo?.mapZoom ?? 16
const mapMarkerLabel = computed(() => (isRTL.value ? locationInfo?.mapLabel?.fa : locationInfo?.mapLabel?.en) || '')
const mapLink = computed(() => {
  if (!mapCenter.value) return ''
  const [lat, lng] = mapCenter.value
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
})
const hasMapLink = computed(() => mapLink.value.length > 0)

const storySections = ref([])
const setStoryScene = (el, idx) => {
  storySections.value[idx] = el || null
}
const { sceneProgress } = useSceneProgress(storySections, {
  easePower: 1.2,
  springPoint: 0.6,
  holdFactor: 0.45,
})

function sceneStyle(idx) {
  const progress = sceneProgress.value[idx] ?? 0
  const translate = (1 - progress) * 34
  const scale = 0.9 + progress * 0.08
  return {
    transform: `translate3d(0, ${pxToRem(translate)}, 0) scale(${scale})`,
    opacity: 0.45 + progress * 0.55,
  }
}

function storySurface(image) {
  return { '--story-image': `url("${image}")` }
}

useRevealObserver(landingRoot, { threshold: 0.18 })
useMenuPrefetch('madi')
</script>

<style scoped>
.landing-shell {
  position: relative;
  min-height: 100svh;
  min-height: calc(var(--app-vh-fixed, var(--vh, 1vh)) * 100);
  padding: clamp(4rem, 7vw, 6rem) clamp(1.5rem, 6vw, 4rem) calc(5rem + env(safe-area-inset-bottom));
  color: #0f2535;
  --viz-velocity: 1;
}
.landing-shell::before {
  content: '';
  position: absolute;
  inset: 2.5rem;
  pointer-events: none;
  opacity: 0.25;
}
.landing-shell > * {
  position: relative;
  z-index: 1;
}

.landing-shell--madi {
  background: radial-gradient(circle at 20% 20%, rgba(173, 220, 255, 0.4), transparent 55%),
    radial-gradient(circle at 80% 10%, rgba(209, 232, 255, 0.45), transparent 60%),
    linear-gradient(180deg, #f7fbff 0%, #f0f6ff 70%, #e7f1ff 100%);
}

.madi-hero {
  max-width: 45rem;
  transition: transform calc(700ms / var(--viz-velocity, 1)) cubic-bezier(.2,.8,.2,1);
}

.overline {
  letter-spacing: 0.4em;
  text-transform: uppercase;
  font-size: 0.75rem;
  opacity: 0.6;
}

.madi-hero h1 {
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  line-height: 1.3;
  margin: 1rem 0;
  font-weight: 400;
}

.madi-hero p {
  font-size: 1.05rem;
  line-height: 1.8;
  color: rgba(28, 67, 95, 0.8);
}

.madi-atmosphere {
  position: relative;
  border: none;
  padding: clamp(1rem, 3vw, 1.75rem) 0;
  overflow: hidden;
  min-height: 16.25rem;
  background: transparent;
  box-shadow: none;
}

.mist-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 3.75rem;
  background: linear-gradient(90deg, transparent, rgba(163, 209, 255, 0.4), transparent);
  opacity: 0;
  animation: mistDrift 6s ease-in-out infinite;
}

.atmo-copy {
  position: relative;
  z-index: 2;
  max-width: 32.5rem;
  transform: translateY(2.5rem);
  opacity: 0;
  transition: transform calc(800ms / var(--viz-velocity, 1)) cubic-bezier(.2,.8,.2,1),
    opacity calc(800ms / var(--viz-velocity, 1)) ease;
}

.atmo-copy h2 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.atmo-copy p {
  color: rgba(23, 60, 94, 0.78);
  line-height: 1.7;
}

.atmo-copy.is-visible {
  transform: translateY(0);
  opacity: 1;
}

.immersive-stack {
  margin: clamp(2rem, 5vw, 3.5rem) 0;
  display: grid;
  gap: clamp(1.5rem, 4vw, 2rem);
  position: relative;
  padding-bottom: clamp(3rem, 4vw, 4rem);
  width: 100%;
  max-width: 100%;
}

.story-scene {
  position: sticky;
  top: clamp(2.5rem, calc(var(--app-vh-fixed, var(--vh, 1vh)) * 20), 6rem);
  min-height: min(calc(var(--app-vh-fixed, var(--vh, 1vh)) * 100), 52rem);
  border-radius: 0;
  overflow: hidden;
  background: rgba(10, 36, 58, 0.6);
  box-shadow: none;
  isolation: isolate;
  padding-left: max(env(safe-area-inset-left), clamp(1.5rem, 4vw, 3rem));
  padding-right: max(env(safe-area-inset-right), clamp(1.5rem, 4vw, 3rem));
  width: 100%;
  max-width: 100%;
}

.story-scene::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--story-image);
  background-size: cover;
  background-position: center;
  filter: grayscale(0.1);
  opacity: 0.8;
}

.story-scene::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(1, 18, 35, 0.95) 0%,
    rgba(1, 18, 35, 0.65) 28%,
    rgba(1, 18, 35, 0.3) 60%,
    rgba(1, 18, 35, 0.15) 100%
  );
}

.story-copy {
  position: relative;
  z-index: 1;
  padding: clamp(1.5rem, 4vw, 3rem);
  color: #e8f5ff;
  max-width: 32rem;
}

.story-copy h3 {
  margin: 0.15rem 0 0.6rem;
}

.story-copy p {
  margin: 0;
  line-height: 1.6;
}

.story-overline {
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.7rem;
  color: rgba(183, 214, 255, 0.85);
}

.madi-location {
  margin: clamp(3rem, 6vw, 4.5rem) 0 0;
  padding: clamp(1rem, 4vw, 2.25rem);
  border-radius: 0;
  border: none;
  background: rgba(6, 52, 92, 0.9);
  color: #e8f5ff;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: clamp(1.25rem, 3vw, 2.25rem);
}

.madi-location p,
.madi-location li {
  color: rgba(232, 245, 255, 0.85);
}

.location-list {
  margin: 0.75rem 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-weight: 500;
}

.location-map {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (max-width: 540px) {
  .madi-location {
    padding: max(1rem, 3.5vw);
    gap: max(1rem, 3vw);
    grid-template-columns: 1fr;
  }

  .map-canvas {
    min-height: 12rem;
  }
}

@media (max-width: 960px), (max-height: 760px) {
  .immersive-stack {
    gap: clamp(1.25rem, 4vw, 1.75rem);
  }

  .story-scene {
    position: relative;
    top: 0;
    min-height: clamp(22rem, calc(var(--app-vh-fixed, var(--vh, 1vh)) * 72), 40rem);
    padding-left: max(env(safe-area-inset-left), clamp(1.5rem, 4vw, 3rem));
    padding-right: max(env(safe-area-inset-right), clamp(1.5rem, 4vw, 3rem));
  }
}

.map-canvas {
  position: relative;
  border-radius: 0;
  overflow: hidden;
  min-height: 14rem;
  border: 1px solid rgba(232, 245, 255, 0.12);
  background: rgba(6, 35, 57, 0.3);
}

.map-canvas :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  font: inherit;
  background: rgba(5, 23, 38, 0.95);
}

.map-launch {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  width: 2rem;
  height: 2rem;
  border-radius: 0;
  border: 1px solid rgba(232, 245, 255, 0.4);
  background: rgba(15, 37, 53, 0.75);
  color: #e8f5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  text-decoration: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.map-launch:hover {
  background: rgba(23, 72, 112, 0.9);
  border-color: rgba(232, 245, 255, 0.7);
}

.map-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.7;
  border: none;
  border-radius: 0;
}

.map-meta a {
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  gap: 0.4rem;
}

.map-meta a:hover {
  text-decoration: underline;
}

@media (max-width: 680px) {
  .map-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }
}

.location-hours {
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 0.6rem;
}

.location-copy h2 {
  font-family: var(--font-base), 'Cinzel', serif;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.location-copy p,
.location-list li {
  font-family: var(--font-base), system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-size: 0.95rem;
  line-height: 1.6;
}

@keyframes mistDrift {
  0% {
    transform: translateX(-40%);
    opacity: 0;
  }
  20% {
    opacity: 0.6;
  }
  60% {
    opacity: 0.5;
  }
  100% {
    transform: translateX(40%);
    opacity: 0;
  }
}

@media (max-width: 48rem) {
  .landing-shell {
    padding-top: 4rem;
  }
}
</style>
