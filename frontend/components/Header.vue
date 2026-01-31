<template>
  <header
    dir="ltr"
    class="fixed w-full top-0 left-0 z-40"
    :class="scrolled ? 'header-visible' : 'header-hidden'"
    :style="[headerStyle, headerVisualStyle]"
  >
    <!-- Enhanced status-safe-area overlay for notch / status bar with smooth transitions -->
    <div class="header-content-wrapper">
      <div :class="['header-grid', scrolled ? 'header-visible' : 'header-hidden']">
        <div class="flex items-center justify-center header-logo">
          <NuxtLink :to="linkTargets.beresht" class="logo-link" :class="{ 'is-active': isActive(linkTargets.beresht) }">
            <div class="logo-link-inner">
              <template v-if="lang === 'fa'">
                <img :src="siteMedia.bereshtLogo" alt="Miyan Beresht" class="logo-img" />
              </template>
              <template v-else>
                <span class="logo-text">Beresht</span>
              </template>
            </div>
          </NuxtLink>
        </div>
        <div class="flex items-center justify-center header-logo">
          <NuxtLink :to="linkTargets.home" class="logo-link" :class="{ 'is-active': isActive(linkTargets.home) }">
            <div class="logo-link-inner">
              <template v-if="lang === 'fa'">
                <img :src="siteMedia.miyanLogo" alt="Miyan" class="logo-img" />
              </template>
              <template v-else>
                <span class="logo-text logo-text--center">Miyan</span>
              </template>
            </div>
          </NuxtLink>
        </div>
        <div class="flex items-center justify-center header-logo">
          <NuxtLink :to="linkTargets.madi" class="logo-link" :class="{ 'is-active': isActive(linkTargets.madi) }">
            <div class="logo-link-inner">
              <template v-if="lang === 'fa'">
                <img :src="siteMedia.madiLogo" alt="Miyan Madi" class="logo-img" />
              </template>
              <template v-else>
                <span class="logo-text">Madi</span>
              </template>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import siteMediaDefaults from '@/state/siteMediaDefaults'
import { useLang } from '~/composables/useLang'
import { useHeaderHeight, useNavAttached } from '~/composables/useHeaderState'

const { scrolled } = defineProps({ scrolled: { type: Boolean, default: false } })

const route = useRoute()
const langState = useLang()
const siteMedia = siteMediaDefaults
const headerHeight = useHeaderHeight()
const navAttached = useNavAttached()

const linkTargets = computed(() => {
  const currentLang = langState.value || 'fa'
  const normalize = (slug = '') => slug.replace(/^\/+/, '')
  const toPath = (slug = '') => {
    const normalized = normalize(slug)
    return normalized ? `/${currentLang}/${normalized}` : `/${currentLang}/`
  }
  return {
    home: toPath(),
    beresht: toPath('beresht'),
    madi: toPath('madi'),
  }
})

const normalizePath = (p = '') => `/${p.replace(/^\/+|\/+$/g, '')}`
const isActive = (target) => {
  const current = normalizePath(route.path)
  const targetPath = normalizePath(target)
  const langRoot = normalizePath(langState.value || 'fa')

  if (targetPath === langRoot) {
    return current === langRoot
  }

  return current === targetPath || current.startsWith(`${targetPath}/`)
}
const lang = computed(() => langState.value)

// Header state
// Background opacity: header fades when navbar attaches
// Initially: 0.85 (when scrolled), becomes 1 when navbar attaches
const headerTargetOpacity = computed(() => {
  // When navbar is attached, header becomes fully opaque
  if (navAttached.value) return 1
  // Otherwise, follow scroll state (0.85 when scrolled, 0 when not)
  return scrolled ? 0.85 : 0
})
const headerBgOpacity = ref(headerTargetOpacity.value)
watch(headerTargetOpacity, (v) => {
  headerBgOpacity.value = v
}, { immediate: true })

// Header style with backdrop filter
const headerStyle = computed(() => ({
  backdropFilter: scrolled ? 'saturate(120%) blur(6px)' : 'none',
  paddingTop: 'env(safe-area-inset-top)',
  WebkitPaddingTop: 'env(safe-area-inset-top)',
  paddingLeft: 'env(safe-area-inset-left)',
  paddingRight: 'env(safe-area-inset-right)'
}))

const headerVisualStyle = computed(() => {
  const opacity = headerBgOpacity.value
  const activeFillAlpha = Math.max(0, Math.min(1, opacity))
  return {
    backgroundColor: `rgba(255,255,255, ${opacity})`,
    borderBottom: opacity ? '0px solid rgba(255,255,255,0.06)' : 'none',
    transition: 'background 400ms ease, backdrop-filter 400ms ease',
    boxShadow: '0 8px 18px -16px rgba(0, 0, 0, 0.28)',
    '--header-surface-opacity': opacity,
    '--header-active-fill-alpha': activeFillAlpha
  }
})

// Update header bottom Y position
function updateHeaderBottom() {
  if (typeof document === 'undefined') return
  const el = document.querySelector('header')
  if (!el) {
    return
  }
  const rect = el.getBoundingClientRect()

  // Expose header height via CSS variable
  try {
    const h = Math.ceil(rect.height)
    document.documentElement.style.setProperty('--header-height', `${h - 2}px`)
    headerHeight.value = h
  } catch (e) {
    // no-op
  }
}

// Setup theme meta tags
function ensureThemeMeta() {
  if (typeof document === 'undefined') return null
  let m = document.querySelector('meta[name="theme-color"]')
  if (!m) {
    m = document.createElement('meta')
    m.setAttribute('name', 'theme-color')
    document.head.appendChild(m)
  }
  return m
}

const themeMeta = (typeof window !== 'undefined') ? ensureThemeMeta() : null
if (themeMeta) try { themeMeta.setAttribute('content', '#000000') } catch (e) {}

// Watch header opacity to update theme meta
watch(headerBgOpacity, (v) => {
  if (!themeMeta) return
  const opacity = Math.max(0, Math.min(1, Number(v) || 0))
  try { themeMeta.setAttribute('content', opacity > 0.02 ? '#ffffff' : '#000000') } catch (e) {}
}, { immediate: true })

// Setup apple meta tag for status bar
function ensureAppleMeta() {
  if (typeof document === 'undefined') return null
  let m = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  if (!m) {
    m = document.createElement('meta')
    m.setAttribute('name', 'apple-mobile-web-app-status-bar-style')
    document.head.appendChild(m)
  }
  return m
}

const appleMeta = (typeof window !== 'undefined') ? ensureAppleMeta() : null
if (appleMeta) {
  try { appleMeta.setAttribute('content', 'black-translucent') } catch (e) {}
}

// Observe header size changes
let resizeObs = null
onMounted(() => {
  if (typeof window === 'undefined') return
  updateHeaderBottom()
  try {
    resizeObs = new ResizeObserver(updateHeaderBottom)
    const el = document.querySelector('header')
    if (el) resizeObs.observe(el)
  } catch (e) {
    window.addEventListener('resize', updateHeaderBottom)
  }
  window.addEventListener('scroll', updateHeaderBottom, { passive: true })
})

onUnmounted(() => {
  if (typeof window === 'undefined') return
  if (resizeObs) resizeObs.disconnect()
  window.removeEventListener('resize', updateHeaderBottom)
  window.removeEventListener('scroll', updateHeaderBottom)
})
</script>

<style scoped>
header { 
  height: auto;
  min-height: 68px;
  transition: background-color 400ms ease, backdrop-filter 400ms ease;
}

@media (max-width: 640px) {
  header {
    min-height: 62px;
  }
}

@media (orientation: landscape) and (max-width: 900px) {
  header {
    min-height: 68px;
  }
}

/* Child visibility transitions */
.header-hidden { opacity: 0; transform: translateY(-6px); transition: opacity 320ms ease, transform 320ms cubic-bezier(.2,.9,.2,1) }
.header-visible { opacity: 1; transform: translateY(0); transition: opacity 320ms ease, transform 320ms cubic-bezier(.2,.9,.2,1) }

.header-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  column-gap: 0;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0;
}
.header-logo {
  height: 68px;
  margin-left: 0;
  margin-right: 0;
}
@media (min-width: 768px) {
  .header-logo { height: 72px; }
}

.logo-link {
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  height: 100%;
  width: 100%;
  cursor: pointer;
  border-radius: 0px;
  padding: 0;
  transition: transform 300ms cubic-bezier(.19,.9,.33,1.19), filter 300ms cubic-bezier(.19,.9,.33,1.19);
}

.logo-link:not(.is-active):hover,
.logo-link:not(.is-active):focus,
.logo-link:not(.is-active):active {
  transform: scale(1.03);
}

.logo-link-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: var(--logo-link-pad-y, 0.45rem) var(--logo-link-pad-x, 0.8rem);
}
.logo-link.is-active {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 255, 255, 0) 0%,
    rgba(240, 240, 240, 0.8) 5%,
    rgba(255, 255, 255, 0) 40%,
    rgba(255, 255, 255, 0) 100%
  );
  box-shadow: 0 10px 18px -14px rgba(0, 0, 0, 0.35);
}
.logo-img {
  height: 78%;
  width: auto;
  aspect-ratio: 4/1;
  object-fit: contain;
  filter: brightness(0.96) grayscale(0);
  transition: filter 300ms cubic-bezier(.19,.9,.33,1.19), transform 300ms cubic-bezier(.19,.9,.33,1.19);
}
/* Only non-active gets hover animation */
.logo-link:not(.is-active):hover .logo-img,
.logo-link:not(.is-active):focus .logo-img,
.logo-link:not(.is-active):active .logo-img {
  filter: brightness(1.05);
  transform: scale(1.03) translateY(-1px);
}

/* English logo text styling */
.logo-text {
  display: inline-flex;
  align-items: center;
  text-align: center;
  height: 100%;
  font-family: var(--font-en, 'Cinzel', serif);
  font-weight: 500;
  letter-spacing: 0.04em;
  color: #1f2937;
  line-height: 1;
  padding: 0 8px;
  font-size: 22px;
}
@media (min-width: 768px) {
  .logo-text { font-size: 25px; }
}
.logo-text--center { font-weight: 600; font-size: 24px; }
@media (min-width: 768px) { .logo-text--center { font-size: 26px; } }
.logo-link:not(.is-active):hover .logo-text,
.logo-link:not(.is-active):focus .logo-text,
.logo-link:not(.is-active):active .logo-text {
  filter: brightness(1.05);
  transform: scale(1.03) translateY(-1px);
  transition: transform 300ms cubic-bezier(.19,.9,.33,1.19);
}

:global(header .max-w-6xl) {
  padding-left: clamp(1.25rem, 4vw, 2.5rem);
  padding-right: clamp(1.25rem, 4vw, 2.5rem);
}

/* Wrapper for header content that spans full width in landscape */
:global(.header-content-wrapper) {
  max-width: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  padding-left: max(0rem, env(safe-area-inset-left));
  padding-right: max(0rem, env(safe-area-inset-right));
  box-sizing: border-box;
}

@media (min-width: 768px) {
  :global(.header-content-wrapper) {
    padding: 0;
    padding-top: max(1rem, calc(env(safe-area-inset-top) + 1rem));
  }
}

@media (orientation: landscape) {
  :global(.header-content-wrapper) {
    padding: 0;
    padding-left: max(0rem, env(safe-area-inset-left));
    padding-right: max(0rem, env(safe-area-inset-right));
  }
}

@media (orientation: portrait) {
  :global(header .max-w-6xl) {
    padding-left: max(env(safe-area-inset-left), clamp(1.25rem, 4vw, 2.5rem));
    padding-right: max(env(safe-area-inset-right), clamp(1.25rem, 4vw, 2.5rem));
  }
}
</style>
