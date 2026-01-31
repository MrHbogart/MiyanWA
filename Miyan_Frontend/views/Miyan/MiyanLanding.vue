<template>
  <section
    ref="landingRoot"
    class="landing-shell landing-shell--miyan brand-surface brand-surface--miyan content-shell"
    :dir="dirAttr"
  >
    <div class="miyan-hero-intro" data-reveal>
      <div class="hero-intro-text hero-intro-single" :class="textClass" data-reveal>
        <div class="hero-intro-headline">
          <p class="overline">{{ isRTL ? heroCopy.overline.fa : heroCopy.overline.en }}</p>
          <h1 :class="titleClass" class="copy-breaks">
            {{ isRTL ? heroCopy.title.fa : heroCopy.title.en }}
          </h1>
          <p class="hero-lede copy-breaks">
            {{ isRTL ? heroCopy.body.fa : heroCopy.body.en }}
          </p>
        </div>
        <div class="hero-intro-divider" aria-hidden="true"></div>
        <div class="hero-intro-meta hero-intro-meta--spread">
          <div class="meta-card" v-for="meta in heroMeta" :key="meta.label.en">
            <span class="meta-label">{{ isRTL ? meta.label.fa : meta.label.en }}</span>
            <span class="meta-value">{{ isRTL ? meta.value.fa : meta.value.en }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="miyan-hero-panel" data-reveal>
      <div class="hero-media" :style="[heroBackgroundStyle, heroMediaMotion]">
        <div class="hero-media-gradient" aria-hidden="true"></div>
      </div>
      <div class="hero-copy-block" :class="textClass" :style="heroCopyMotion" data-reveal>
        <p class="overline">{{ isRTL ? branchSection.overline.fa : branchSection.overline.en }}</p>
        <h1 :class="titleClass" class="copy-breaks">{{ isRTL ? branchSection.title.fa : branchSection.title.en }}</h1>
        <p class="copy-breaks">{{ isRTL ? branchSection.body.fa : branchSection.body.en }}</p>
        <div class="branch-grid">
          <NuxtLink
            v-for="branch in branchSection.cards"
            :key="branch.path"
            :to="localizedBranchPath(branch.path)"
            class="branch-card"
            :class="textClass"
          >
            <span class="branch-name">{{ isRTL ? branch.name.fa : branch.name.en }}</span>
            <span class="branch-area">{{ isRTL ? branch.area.fa : branch.area.en }}</span>
            <p>{{ isRTL ? branch.copy.fa : branch.copy.en }}</p>
            <span class="branch-cta">
              {{ isRTL ? branch.cta.fa : branch.cta.en }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="miyan-modal-panel">
      <div class="modal-body" data-reveal :class="textClass">
        <p class="modal-overline">{{ isRTL ? modalCopy.overline.fa : modalCopy.overline.en }}</p>
        <h2 :class="titleClass" class="copy-breaks">{{ isRTL ? modalCopy.title.fa : modalCopy.title.en }}</h2>
        <p class="modal-intro copy-breaks">{{ isRTL ? modalCopy.body.fa : modalCopy.body.en }}</p>
        <div class="modal-chip">
          {{ isRTL ? modalCopy.accent.fa : modalCopy.accent.en }}
        </div>
        <div class="modal-grid">
          <article
            v-for="(focus, idx) in modalFocus"
            :key="focus.title.en"
            class="modal-focus"
            :class="textClass"
            data-reveal
            :style="{ '--delay': `${idx * 120}ms` }"
          >
            <strong>{{ isRTL ? focus.title.fa : focus.title.en }}</strong>
            <p class="copy-breaks">{{ isRTL ? focus.copy.fa : focus.copy.en }}</p>
          </article>
        </div>
      </div>
    </div>

    <!-- Immersive stack: larger images, less overlay shadow, smoother animations -->
    <div class="immersive-stack">
      <article
        v-for="(story, idx) in photoStories"
        :key="story.title.en"
        class="story-scene"
        :ref="el => setStoryScene(el, idx)"
        :style="[sceneStyle(idx), storySurface(story.image)]"
      >
        <div class="story-copy" :class="textClass">
          <p class="story-overline">{{ isRTL ? story.overline.fa : story.overline.en }}</p>
          <h3 :class="titleClass" class="copy-breaks">{{ isRTL ? story.title.fa : story.title.en }}</h3>
          <p class="copy-breaks">{{ isRTL ? story.copy.fa : story.copy.en }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRevealObserver } from '@/composables/useRevealObserver'
import { useScrollVelocity } from '@/composables/useScrollVelocity'
import { useSceneProgress } from '@/composables/useSceneProgress'

import siteMediaDefaults from '@/state/siteMediaDefaults'
import { miyanLandingCopy } from '@/state/siteCopy'
import { useLang } from '~/composables/useLang'

const landingRoot = ref(null)
const { scrollY } = useScrollVelocity({
  smoothing: 0.22,
  multiplier: 10,
  max: 1.45,
  min: 0.85,
})
const langState = useLang()
const lang = computed(() => langState.value)
const isRTL = computed(() => lang.value === 'fa')
const dirAttr = computed(() => (isRTL.value ? 'rtl' : 'ltr'))
const pxToRem = (valuePx) => `${parseFloat((valuePx / 16).toFixed(3))}rem`

// helper classes (left as minimal additions — they match how Beresht computed them previously)
// If you already define textClass/titleClass globally, these will not conflict.
const textClass = computed(() => (isRTL.value ? 'font-b-titr text-right leading-relaxed' : 'font-sans text-left leading-relaxed'))
const titleClass = computed(() => (isRTL.value ? 'font-b-titr text-right font-bold' : 'font-cinzel font-semibold tracking-wide text-left'))

const heroCopy = miyanLandingCopy.hero

const branchSection = miyanLandingCopy.branches

const heroMeta = miyanLandingCopy.heroMeta

const modalCopy = miyanLandingCopy.modal

const modalFocus = miyanLandingCopy.modalFocus

const heroBackgroundStyle = computed(() => ({
  backgroundImage: `url("${siteMediaDefaults.miyanImg1}")`,
}))

const heroMediaMotion = computed(() => {
  const offset = Math.min(scrollY.value / 600, 1) * 32
  return {
    transform: `translate3d(0, ${pxToRem(-offset)}, 0)`,
  }
})

const heroCopyMotion = computed(() => {
  const offset = Math.min(scrollY.value / 500, 1) * 18
  return {
    transform: `translate3d(0, ${pxToRem(offset)}, 0)`,
  }
})

const photoStories = miyanLandingCopy.photoStories.map((story) => ({
  ...story,
  image: siteMediaDefaults[story.imageKey],
}))

const localizedBranchPath = (rawPath = '') => {
  const normalized = rawPath.replace(/^\/+|\/+$/g, '')
  const currentLang = lang.value || 'fa'
  if (!normalized) return `/${currentLang}/`
  return `/${currentLang}/${normalized}`
}

const storySections = ref([])
const setStoryScene = (el, idx) => {
  storySections.value[idx] = el || null
}
const { sceneProgress } = useSceneProgress(storySections, {
  easePower: 1.3,
  springPoint: 0.58,
  holdFactor: 0.42,
  releaseCurve: 0.8,
})

function sceneStyle(idx) {
  const progress = sceneProgress.value[idx] ?? 0
  const translate = (1 - progress) * 34 // less heavy; smoother
  const scale = 0.94 + progress * 0.06
  return {
    transform: `translate3d(0, ${pxToRem(translate)}, 0) scale(${scale})`,
    opacity: 0.4 + progress * 0.6,
    transition: 'transform 800ms cubic-bezier(.2,.9,.25,1), opacity 700ms ease',
    willChange: 'transform, opacity',
  }
}

function storySurface(image) {
  return { '--story-image': `url("${image}")` }
}

useRevealObserver(landingRoot, { threshold: 0.18 })
</script>

<style scoped>
/* Base shell */
.landing-shell {
  position: relative;
  min-height: 100svh;
  min-height: calc(var(--app-vh-fixed, var(--vh, 1vh)) * 100);
  padding: clamp(4rem, 7vw, 6rem) clamp(1.5rem, 6vw, 4rem) calc(5rem + env(safe-area-inset-bottom));
  background: transparent;
  color: #0f0f0f;
  --viz-velocity: 1;
}

/* Shared reveal motion for hero/modals to mirror other views */
.miyan-hero-intro,
.hero-copy-block,
.modal-body {
  opacity: 0;
  transform: translateY(2rem);
  transition:
    transform calc(1100ms / var(--viz-velocity, 1)) cubic-bezier(.19,.84,.37,1),
    opacity calc(900ms / var(--viz-velocity, 1)) ease;
  will-change: transform, opacity;
}

.miyan-hero-intro.is-visible,
.hero-copy-block.is-visible,
.modal-body.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* HERO PANEL */
.miyan-hero-panel {
  display: grid;
  width: 100%;
  min-height: 100svh;
  min-height: calc(var(--app-vh-fixed, var(--vh, 1vh)) * 100);
  gap: clamp(1.5rem, 3vw, 3rem);
  padding: clamp(1.5rem, 3vw, 3rem);
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  align-items: stretch;
}

/* media: larger, cleaner shadow */
.hero-media {
  position: relative;
  min-height: calc(var(--app-vh-fixed, var(--vh, 1vh)) * 76);
  background-size: cover;
  background-position: center;
  overflow: hidden;
  /* subtle elevated surface rather than heavy shadow */
  box-shadow: 0 8px 24px rgba(10, 7, 5, 0.08);
  transition: transform 1.2s ease, box-shadow 1.2s ease;
  will-change: transform;
}

/* gradient overlay kept but lighter for luxury-minimal */
.hero-media-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(210deg, rgba(255, 255, 255, 0) 40%, rgba(12, 10, 8, 0.55) 100%);
  mix-blend-mode: multiply;
  opacity: 0.9;
  pointer-events: none;
}

/* copy block: refined backdrop, reduced noise */
.hero-copy-block {
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.98), rgba(255, 250, 243, 0.95));
  padding: clamp(1.75rem, 4vw, 3.25rem);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 0;
  transition: transform 1s ease, box-shadow 1s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  font-family: var(--font-base), system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  box-shadow: 0 6px 18px rgba(16, 11, 7, 0.06);
}

/* reduce heavy bright halos, keep subtle artistic sheen */
.hero-copy-block::before {
  content: '';
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle at 12% 18%, rgba(255,255,255,0.65), transparent 40%);
  filter: blur(28px);
  opacity: 0.85;
  pointer-events: none;
}

.hero-copy-block h1 {
  font-size: clamp(2.6rem, 5vw, 4rem);
  line-height: 1.18;
  margin: 0;
}

.hero-copy-block p {
  font-size: 1.05rem;
  line-height: 1.7;
  margin: 0;
  color: rgba(21, 16, 12, 0.9);
}

.hero-copy-block > * {
  opacity: 0;
  transform: translateY(0.8rem);
  transition:
    transform calc(1000ms / var(--viz-velocity, 1)) cubic-bezier(.2,.9,.25,1),
    opacity calc(850ms / var(--viz-velocity, 1)) ease;
  will-change: transform, opacity;
}

.hero-copy-block.is-visible > * {
  opacity: 1;
  transform: translateY(0);
}

.hero-copy-block.is-visible h1 { transition-delay: 70ms; }
.hero-copy-block.is-visible .branch-grid { transition-delay: 140ms; }

/* branch grid */
.branch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 0.9rem;
  margin-top: 1.25rem;
}

.branch-card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1rem 1.1rem;
  border-radius: 0;
  text-decoration: none;
  color: inherit;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 10, 6, 0.08);
  box-shadow: 0 8px 18px rgba(12, 8, 6, 0.08);
  transition: transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease;
}

.branch-card:hover {
  transform: translateY(-0.2rem);
  box-shadow: 0 20px 35px rgba(15, 10, 6, 0.12);
  border-color: rgba(15, 10, 6, 0.18);
}

.branch-card p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(18, 12, 8, 0.85);
}

.branch-name {
  font-size: 1.1rem;
  font-weight: 600;
}

.branch-area {
  font-size: 0.9rem;
  opacity: 0.6;
}

.branch-cta {
  margin-top: 0.5rem;
  font-size: 0.78rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: rgba(18, 12, 8, 0.8);
}

:deep([dir="rtl"] .branch-cta) {
  letter-spacing: 0.06em !important;
}

/* overline */
.overline {
  letter-spacing: 0.35em;
  text-transform: uppercase;
  font-size: 0.72rem;
  opacity: 0.6;
  margin: 0;
}

/* modal panel */
.miyan-modal-panel {
  min-height: 85svh;
  min-height: calc(var(--app-vh-fixed, var(--vh, 1vh)) * 85);
  width: 100%;
  display: flex;
  justify-content: center;
  padding: clamp(1rem, 3vw, 2rem);
}

.modal-body {
  width: min(72rem, 100%);
  padding: clamp(2.25rem, 4vw, 4rem);
  background: linear-gradient(145deg, rgba(255, 248, 232, 0.97), rgba(255, 240, 224, 0.92));
  box-shadow: 0 10px 28px rgba(15, 10, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  font-family: var(--font-base), system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
}

.modal-body::after {
  content: '';
  position: absolute;
  inset: -6%;
  background: radial-gradient(circle at 60% 0%, rgba(255, 255, 255, 0.45), transparent 45%);
  filter: blur(28px);
  opacity: 0.9;
  pointer-events: none;
  z-index: -1;
}

.modal-body > * {
  opacity: 0;
  transform: translateY(0.7rem);
  transition:
    transform calc(950ms / var(--viz-velocity, 1)) cubic-bezier(.2,.9,.25,1),
    opacity calc(820ms / var(--viz-velocity, 1)) ease;
  will-change: transform, opacity;
}

.modal-body.is-visible > * {
  opacity: 1;
  transform: translateY(0);
}

.modal-body.is-visible .modal-grid { transition-delay: 120ms; }

.modal-overline {
  letter-spacing: 0.45em;
  text-transform: uppercase;
  font-size: 0.7rem;
  opacity: 0.65;
  margin: 0;
}

.modal-intro {
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(18, 12, 8, 0.9);
}

.modal-chip {
  align-self: flex-start;
  font-size: 0.78rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.78);
  padding: 0.35rem 1.2rem;
  border-radius: 0;
}

/* modal grid items */
.modal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.modal-focus {
  padding: 1rem 1.1rem;
  background: rgba(255, 255, 255, 0.72);
  min-height: 8rem;
  transition: transform 700ms cubic-bezier(.2,.9,.25,1), opacity 700ms ease;
  opacity: 0;
  transform: translateY(0.6rem);
}

.modal-focus.is-visible {
  opacity: 1;
  transform: translateY(0);
  transition-delay: var(--delay);
}

.modal-focus strong {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.95rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
}

.modal-focus p {
  font-size: 0.9rem;
  margin: 0;
  color: rgba(24, 16, 9, 0.85);
}

/* IMMERSIVE STACK: images are larger, almost full screen */
.immersive-stack {
  margin-top: 3rem;
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  scroll-snap-type: y proximity;
  width: 100%;
  max-width: 100%;
}

/* story scene: bigger, less overlay, improved animation */
.story-scene {
  position: relative;
  isolation: isolate;
  width: 100%;
  min-height: min(100svh, 60rem);
  min-height: min(calc(var(--app-vh-fixed, var(--vh, 1vh)) * 100), 60rem);
  overflow: hidden;
  padding: clamp(1.25rem, 2.5vw, 2rem);
  scroll-snap-align: start;
  background: transparent;
  margin: 0 auto;
  padding-left: max(env(safe-area-inset-left), clamp(1.25rem, 2.5vw, 2rem));
  padding-right: max(env(safe-area-inset-right), clamp(1.25rem, 2.5vw, 2rem));
  width: 100%;
  max-width: 100%;
}

/* image surface: cover and sit behind content; bigger scale so edges feel immersive */
.story-scene::before {
  content: '';
  position: absolute;
  inset: -10%;
  background-image: var(--story-image);
  background-size: cover;
  background-position: center;
  filter: saturate(1.08) contrast(1.02) brightness(0.98);
  transform: scale(1.06);
  transition: transform 1000ms cubic-bezier(.2,.9,.25,1), filter 900ms ease;
  will-change: transform, filter;
  z-index: 0;
}

/* remove heavy color overlay; keep a subtle warm tone for consistency */
.story-scene::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.75) 12%, rgba(0, 0, 0, 0.25) 58%, rgba(0, 0, 0, 0));
  opacity: 1;
  z-index: 0;
  pointer-events: none;
}

/* hover/pointer interactions: gentle parallax */
.story-scene:hover::before,
.story-scene.is-active::before {
  transform: scale(1.09) translateY(-1%);
  filter: saturate(1.12) contrast(1.04) brightness(1.01);
}

/* STORY COPY: remove the shadowy 'glow' behind text — keep clarity and contrast */
.story-copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  color: rgba(255, 255, 255, 0.95);
  font-family: var(--font-base), system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  max-width: min(56ch, 58%);
  margin: var(--story-copy-gutter);
  text-shadow: 0 0.35rem 1.5rem rgba(0, 0, 0, 0.45);
}

/* Removed the previous story-copy::before blurred overlay to satisfy user's request */

/* story typography */
.story-overline {
  letter-spacing: 0.35em;
  text-transform: uppercase;
  font-size: 0.65rem;
  opacity: 0.8;
  margin: 0;
}

.story-copy h3 {
  margin: 0;
  font-size: clamp(1.8rem, 3.7vw, 2.6rem);
  line-height: 1.12;
}

.story-copy p {
  line-height: 1.6;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

/* Marquee hidden to keep hero copy minimal */
.miyan-marquee {
  display: none;
}

/* responsive grid tweaks */
@media (min-width: 1024px) {
  .miyan-hero-panel {
    grid-template-columns: 1.05fr 0.95fr;
    padding: clamp(2rem, 4vw, 4rem);
  }
}

/* hero intro */
.miyan-hero-intro {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: clamp(1.75rem, 4vw, 3.25rem) 0;
  margin-bottom: clamp(2.25rem, 5vw, 3.75rem);
  position: relative;
}

.hero-intro-text {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 1rem);
}

.hero-intro-single {
  width: min(64rem, 100%);
  padding: 0;
  margin-inline: auto;
  background: transparent;
  box-shadow: none;
}

.hero-intro-headline {
  display: grid;
  gap: var(--space-1-5, 0.9rem);
  max-width: 58ch;
  opacity: 0;
  transform: translateY(1.2rem);
  transition:
    transform calc(1050ms / var(--viz-velocity, 1)) cubic-bezier(.2,.9,.25,1),
    opacity calc(900ms / var(--viz-velocity, 1)) ease;
}

.hero-intro-single.is-visible .hero-intro-headline {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 80ms;
}

.hero-intro-text h1 {
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  line-height: 1.18;
  margin: 0 0 var(--space-1, 0.5rem);
  font-weight: 400;
}

.hero-lede {
  color: rgba(38, 28, 18, 0.82);
  line-height: 1.7;
  margin: 0;
}

.hero-intro-text p {
  margin: 0;
}

.hero-intro-divider {
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, rgba(26, 18, 12, 0.1), rgba(26, 18, 12, 0));
  opacity: 0.3;
  margin: var(--space-2, 1rem) 0;
}

:deep([dir="rtl"] .hero-intro-divider) {
  background: linear-gradient(90deg, rgba(26, 18, 12, 0), rgba(26, 18, 12, 0.18));
}

.hero-intro-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--space-1, 0.75rem) var(--space-2, 1.25rem);
  align-items: flex-start;
  opacity: 0;
  transform: translateY(1.3rem);
  transition:
    transform calc(1100ms / var(--viz-velocity, 1)) cubic-bezier(.2,.9,.25,1),
    opacity calc(950ms / var(--viz-velocity, 1)) ease;
}

.hero-intro-single.is-visible .hero-intro-meta {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 140ms;
}

.meta-card {
  padding: var(--space-1-5, 0.85rem) 0 var(--space-1-5, 0.9rem);
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.meta-label {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  opacity: 0.5;
}

.meta-value {
  font-size: 1rem;
  font-weight: 500;
}

.overline {
  letter-spacing: 0.4em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: rgba(84, 62, 49, 0.62);
}

@media (max-width: 960px) {
  .immersive-stack {
    scroll-snap-type: none;
  }

  .story-scene {
    min-height: clamp(22rem, calc(var(--app-vh-fixed, var(--vh, 1vh)) * 78), 46rem);
    padding: clamp(1.1rem, 4vw, 1.75rem);
    padding-left: max(env(safe-area-inset-left), clamp(1.1rem, 4vw, 1.75rem));
    padding-right: max(env(safe-area-inset-right), clamp(1.1rem, 4vw, 1.75rem));
  }
}

/* small adaptive tweaks for very small screens */
@media (max-width: 640px) {
  .miyan-hero-panel {
    padding-left: 0;
    padding-right: 0;
  }
  .story-copy {
    margin: var(--story-copy-gutter);
    max-width: 100%;
  }
  .story-scene {
    min-height: 100svh;
    min-height: calc(var(--app-vh-fixed, var(--vh, 1vh)) * 100);
    padding: 1rem;
  }
  .hero-media {
    min-height: calc(var(--app-vh-fixed, var(--vh, 1vh)) * 48);
  }
}
</style>
