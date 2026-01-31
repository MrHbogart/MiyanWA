<template>
  <section
    ref="landingRoot"
    class="landing-shell landing-shell--beresht brand-surface brand-surface--beresht content-shell"
    :dir="dirAttr"
    :style="landingStyle"
  >
    <div class="hero-copy" data-reveal>
      <p class="overline" :class="textClass">{{ isRTL ? heroCopy.overline.fa : heroCopy.overline.en }}</p>
      <h1 :class="titleClass" class="copy-breaks">
        {{ isRTL ? heroCopy.title.fa : heroCopy.title.en }}
      </h1>
      <p :class="textClass" class="copy-breaks">
        {{ isRTL ? heroCopy.body.fa : heroCopy.body.en }}
      </p>
    </div>

    <div class="immersive-stack" v-if="firstStoryGroup.length">
      <article
        v-for="(story, idx) in firstStoryGroup"
        :key="story.title.en"
        class="story-scene"
        :ref="el => setStoryScene(el, idx)"
        :style="[sceneStyle(idx), storySurface(story.image)]"
      >
        <div class="story-copy">
          <p class="story-overline" :class="textClass">{{ isRTL ? story.overline.fa : story.overline.en }}</p>
          <h3 :class="titleClass" class="copy-breaks">{{ isRTL ? story.title.fa : story.title.en }}</h3>
          <p :class="textClass" class="copy-breaks">{{ isRTL ? story.copy.fa : story.copy.en }}</p>
        </div>
      </article>
    </div>

    <div class="beresht-atmosphere">
      <div class="mist-line" v-for="n in 3" :key="`beresht-mist-${n}`" :style="mistStyle(n)"></div>
      <div class="atmo-copy" data-reveal>
        <h2 :class="titleClass" class="copy-breaks">{{ isRTL ? experienceCopy.title.fa : experienceCopy.title.en }}</h2>
        <p
          v-for="(paragraph, idx) in experienceCopy.paragraphs"
          :key="`beresht-atmo-${idx}`"
          :class="textClass"
          class="copy-breaks"
        >
          {{ isRTL ? paragraph.fa : paragraph.en }}
        </p>
      </div>
    </div>

    <div class="immersive-stack" v-if="secondStoryGroup.length">
      <article
        v-for="(story, idx) in secondStoryGroup"
        :key="story.title.en"
        class="story-scene"
        :ref="el => setStoryScene(el, idx + firstStoryGroup.length)"
        :style="[sceneStyle(idx + firstStoryGroup.length), storySurface(story.image)]"
      >
        <div class="story-copy">
          <p class="story-overline" :class="textClass">{{ isRTL ? story.overline.fa : story.overline.en }}</p>
          <h3 :class="titleClass" class="copy-breaks">{{ isRTL ? story.title.fa : story.title.en }}</h3>
          <p :class="textClass" class="copy-breaks">{{ isRTL ? story.copy.fa : story.copy.en }}</p>
        </div>
      </article>
    </div>

    <div class="beresht-location" data-reveal>
      <div class="location-copy" :class="textClass">
        <p class="overline">{{ isRTL ? locationInfo.overline.fa : locationInfo.overline.en }}</p>
        <h2 :class="titleClass" class="copy-breaks">{{ isRTL ? locationInfo.title.fa : locationInfo.title.en }}</h2>
        <ul class="location-list">
          <li v-for="(line, idx) in locationLines" :key="`addr-${idx}`">{{ line }}</li>
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
import siteMediaDefaults from '@/state/siteMediaDefaults'
import { useRevealObserver } from '@/composables/useRevealObserver'
import { useScrollVelocity } from '@/composables/useScrollVelocity'
import { useSceneProgress } from '@/composables/useSceneProgress'
import { miyanBereshtLandingCopy } from '@/state/siteCopy'
import LocationMap from '@/components/LocationMap.vue'
import { useLang } from '~/composables/useLang'
import { useMenuPrefetch } from '~/composables/useMenuData'


const landingRoot = ref(null)
const { scrollY, speedFactor } = useScrollVelocity({
  smoothing: 0.24,
  multiplier: 9,
  max: 1.4,
  min: 0.85,
})
const siteMedia = siteMediaDefaults
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

const heroCopy = miyanBereshtLandingCopy.hero
const experienceCopy = miyanBereshtLandingCopy.experience

const locationInfo = miyanBereshtLandingCopy.location
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

function mistStyle(index) {
  const offset = index * 40
  return {
    animationDelay: `${(index * 0.6) / speedFactor.value}s`,
    animationDuration: `${6 / speedFactor.value}s`,
    top: pxToRem(10 + offset)
  }
}

const photoStories = miyanBereshtLandingCopy.photoStories.map((story) => ({
  ...story,
  image: siteMedia[story.imageKey],
}))
const firstStoryGroup = photoStories.slice(0, 2)
const secondStoryGroup = photoStories.slice(2)

const storySections = ref([])
const setStoryScene = (el, idx) => {
  storySections.value[idx] = el || null
}
const { sceneProgress } = useSceneProgress(storySections, {
  easePower: 1.15,
  springPoint: 0.64,
  holdFactor: 0.42,
})
function sceneStyle(idx) {
  const p = sceneProgress.value[idx] ?? 0
  const translate = (1 - p) * 55
  const scale = 0.9 + p * 0.1
  return {
    transform: `translate3d(0, ${pxToRem(translate)}, 0) scale(${scale})`,
    opacity: 0.4 + p * 0.6
  }
}

function storySurface(image) {
  return { '--story-image': `url("${image}")` }
}

const locationLines = computed(() => (isRTL.value ? locationInfo.addressLines.fa : locationInfo.addressLines.en))

const locationCoordinates = computed(() => {
  const coords = locationInfo?.coordinates
  if (!coords) return ''
  return isRTL.value ? coords.fa : coords.en
})

useRevealObserver(landingRoot, { threshold: 0.15 })
useMenuPrefetch('beresht')
</script>

<style scoped>
.landing-shell {
  position: relative;
  min-height: 100svh;
  min-height: calc(var(--app-vh-fixed, var(--vh, 1vh)) * 100);
  padding: clamp(4rem, 7vw, 6rem) clamp(1.5rem, 6vw, 4rem) calc(5rem + env(safe-area-inset-bottom));
  background: transparent;
  color: #241308;
  --viz-velocity: 1;
}
.landing-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(255, 247, 228, 0.5), transparent 65%);
  pointer-events: none;
  z-index: 0;
  opacity: 0.25;
}
.landing-shell > * {
  position: relative;
  z-index: 1;
}

.landing-shell--beresht {
  background-image:
    radial-gradient(circle at 12% 8%, rgba(255, 255, 255, 0.92), transparent 55%),
    radial-gradient(circle at 82% 2%, rgba(255, 255, 255, 0.7), transparent 60%),
    linear-gradient(185deg, #ffffff 0%, #fffefb 42%, #fffdf5 78%, #ffffff 100%);
}

.beresht-hero {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3rem;
}

.hero-emblem {
  flex: 0 0 12.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 0;
  border: none;
  background: transparent;
  box-shadow: none;
  transform: translateY(2.5rem);
  opacity: 0;
  transition: transform calc(1200ms / var(--viz-velocity, 1)) cubic-bezier(.19,.84,.37,1),
    opacity calc(1200ms / var(--viz-velocity, 1)) ease;
}

.hero-emblem img {
  width: 100%;
  height: auto;
}

.hero-copy {
  flex: 1;
  min-width: 17.5rem;
  transform: translateY(2.5rem);
  opacity: 0;
  transition: transform calc(1200ms / var(--viz-velocity, 1)) cubic-bezier(.19,.84,.37,1),
    opacity calc(1200ms / var(--viz-velocity, 1)) ease;
}

.hero-copy h1 {
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  line-height: 1.2;
  margin: 1rem 0;
  font-weight: 400;
}

.hero-copy p {
  color: rgba(38, 28, 18, 0.8);
  line-height: 1.7;
}

.overline {
  letter-spacing: 0.4em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: rgba(95, 61, 39, 0.6);
}

.beresht-atmosphere {
  position: relative;
  border: none;
  padding: clamp(1rem, 3vw, 1.75rem) 0;
  overflow: hidden;
  min-height: 16rem;
  background: transparent;
}

.mist-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 3.5rem;
  background: linear-gradient(90deg, transparent, rgba(232, 191, 153, 0.35), transparent);
  opacity: 0;
  animation: mistDrift 6s ease-in-out infinite;
}

.atmo-copy {
  position: relative;
  z-index: 2;
  max-width: 34rem;
  transform: translateY(2rem);
  opacity: 0;
  transition: transform calc(800ms / var(--viz-velocity, 1)) cubic-bezier(.2,.8,.2,1),
    opacity calc(800ms / var(--viz-velocity, 1)) ease;
}

.atmo-copy h2 {
  margin-bottom: 0.9rem;
  font-size: clamp(1.35rem, 3vw, 1.9rem);
  font-weight: 500;
}

.atmo-copy p {
  color: rgba(47, 29, 17, 0.8);
  line-height: 1.75;
}

.atmo-copy.is-visible {
  transform: translateY(0);
  opacity: 1;
}

.beresht-location {
  margin-top: clamp(3rem, 6vw, 4.5rem);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: clamp(1.25rem, 3vw, 2.25rem);
  padding: clamp(1rem, 4vw, 2.25rem);
  border-radius: 0;
  border: none;
  background: rgba(19, 10, 6, 0.92);
  color: #f9f6f0;
}

.beresht-location p,
.beresht-location li {
  color: rgba(249, 246, 240, 0.85);
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
  .beresht-location {
    padding: max(1rem, 3.5vw);
    gap: max(1rem, 3vw);
    grid-template-columns: 1fr;
  }

  .map-canvas {
    min-height: 12rem;
  }
}

.map-canvas {
  position: relative;
  border-radius: 0;
  overflow: hidden;
  min-height: 14rem;
  border: 1px solid rgba(249, 246, 240, 0.25);
  background: rgba(36, 19, 8, 0.15);
}

.map-canvas :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  font: inherit;
  background: rgba(33, 14, 4, 0.92);
}

.map-launch {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  width: 2rem;
  height: 2rem;
  border-radius: 0;
  border: 1px solid rgba(249, 246, 240, 0.5);
  background: rgba(32, 18, 8, 0.75);
  color: #f9f6f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  text-decoration: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.map-launch:hover {
  background: rgba(74, 43, 20, 0.9);
  border-color: rgba(249, 246, 240, 0.85);
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

.map-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.8;
  border-radius: 0;
  border: none;
}

.map-meta a {
  color: inherit;
  text-decoration: none;
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

@media (min-width: 768px) {
  .beresht-panels {
    display: none;
  }
}

.beresht-panels {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.panel {
  border: none;
  padding: 0 0 1.5rem;
  min-height: auto;
  position: relative;
  transform: translateY(2.5rem);
  opacity: 0;
  transition: transform calc(1200ms / var(--viz-velocity, 1)) cubic-bezier(.19,.84,.37,1),
    opacity calc(1200ms / var(--viz-velocity, 1)) ease;
}

.panel h2 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.panel p,
.panel ul {
  color: rgba(80, 50, 34, 0.85);
  line-height: 1.7;
}

.panel ul {
  padding-left: 0;
  list-style: none;
  border-left: none;
  margin-left: 0.5rem;
  padding-left: 1.25rem;
}

.hero-emblem.is-visible,
.hero-copy.is-visible,
.panel.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.immersive-stack {
  margin-top: clamp(3rem, 6vw, 5rem);
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  position: relative;
  overflow: visible;
  scroll-snap-type: y proximity;
  padding-bottom: clamp(3rem, 5vw, 4rem);
  width: 100%;
  max-width: 100%;
}

.story-scene {
  position: sticky;
  top: clamp(2.5rem, calc(var(--app-vh-fixed, var(--vh, 1vh)) * 18), 7rem);
  isolation: isolate;
  display: flex;
  align-items: flex-end;
  width: 100%;
  margin: auto;
  min-height: min(calc(var(--app-vh-fixed, var(--vh, 1vh)) * 100), 60rem);
  padding: clamp(1.75rem, 3vw, 2.75rem);
  overflow: hidden;
  color: rgba(40, 24, 15, 0.92);
  box-shadow: 0 12px 36px rgba(8, 4, 2, 0.15);
  scroll-snap-align: start;
  background: rgba(255, 255, 255, 0.85);
  padding-left: max(env(safe-area-inset-left), clamp(1.75rem, 3vw, 2.75rem));
  padding-right: max(env(safe-area-inset-right), clamp(1.75rem, 3vw, 2.75rem));
  width: 100%;
  max-width: 100%;
}

.story-scene::before {
  content: '';
  position: absolute;
  inset: -5%;
  background-image: var(--story-image);
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
  filter: none;
  transition: transform 1400ms ease;
}

.story-scene::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0));
}

.story-scene:hover::before {
  transform: scale(1.025);
}

.story-copy {
  position: relative;
  margin-top: auto;
  align-self: flex-end;
  width: 100%;
  padding: var(--story-copy-gutter);
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  color: rgba(255, 215, 72, 0.9);
  font-family: var(--font-base), system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  max-width: min(36rem, calc(100% - (var(--story-copy-gutter) * 2)));
}

.story-overline {
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.7rem;
  color: rgba(255, 145, 0, 0.962);
}

[dir="ltr"] .story-copy { text-align: left; }
[dir="rtl"] .story-copy { text-align: right; }

@media (max-width: 960px), (max-height: 760px) {
  .immersive-stack {
    scroll-snap-type: none;
    gap: clamp(1.25rem, 4vw, 1.75rem);
  }

  .story-scene {
    position: relative;
    top: 0;
    min-height: clamp(22rem, calc(var(--app-vh-fixed, var(--vh, 1vh)) * 70), 40rem);
    padding: clamp(1.25rem, 4vw, 2rem);
    padding-left: max(env(safe-area-inset-left), clamp(1.25rem, 4vw, 2rem));
    padding-right: max(env(safe-area-inset-right), clamp(1.25rem, 4vw, 2rem));
    box-shadow: 0 8px 26px rgba(8, 4, 2, 0.12);
  }

  .story-copy {
    position: relative;
    bottom: auto;
    left: auto;
    right: auto;
    max-width: 100%;
    padding: clamp(1.25rem, 4vw, 2rem);
  }
}

@media (max-width: 48rem) {
  .beresht-hero {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
