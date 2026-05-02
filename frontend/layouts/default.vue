<template>
  <div id="app" class="min-h-screen flex flex-col text-gray-900" :dir="currentDir">
    <Header :scrolled="scrolled" />
    <main class="flex-1 flex flex-col" :style="pageGradientStyle">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLang } from '~/composables/useLang'
import { useNavAttached } from '~/composables/useHeaderState'

const lang = useLang()
const route = useRoute()
const router = useRouter()
const navAttached = useNavAttached()
const scrolled = ref(false)

const currentDir = computed(() => (lang.value === 'fa' ? 'rtl' : 'ltr'))

const gradientThemes = {
  Miyan: {
    colors: ['#fffefc', '#fff9ef', '#fff4d2'],
    baseAngle: '146deg',
    angles: {
      MiyanLanding: '150deg',
      MiyanGallery: '136deg',
      MiyanProjects: '160deg',
    },
    duration: '32s',
  },
  MiyanBeresht: {
    colors: ['#fffdfb', '#fffaf8', '#fff7f0'],
    baseAngle: '132deg',
    angles: {
      MiyanBereshtLanding: '134deg',
      MiyanBereshtBaseMenu: '118deg',
      MiyanBereshtDailyMenu: '148deg',
    },
    duration: '30s',
  },
  MiyanMadi: {
    colors: ['#fbf8ff', '#e8f1ff', '#dbe4ff'],
    baseAngle: '118deg',
    angles: {
      MiyanMadiLanding: '110deg',
      MiyanMadiBaseMenu: '124deg',
      MiyanMadiDailyMenu: '142deg',
    },
    duration: '28s',
  },
}

const defaultTheme = gradientThemes.Miyan
const pageThemeMeta = computed(() => route.meta?.pageTheme || {})
const currentTheme = computed(() => gradientThemes[pageThemeMeta.value.group] ?? defaultTheme)
const currentThemeGroup = computed(() => pageThemeMeta.value.group || 'Miyan')

const pageGradientStyle = computed(() => {
  const theme = currentTheme.value
  const variantKey = pageThemeMeta.value.view
  const angle = (theme.angles && theme.angles[variantKey]) || theme.baseAngle
  const [first, middle, last] = theme.colors
  const stops = `${first} 0%, ${middle} 52%, ${last} 100%`

  return {
    backgroundImage: `linear-gradient(${angle}, ${stops})`,
    backgroundSize: '220% 220%',
    backgroundPosition: 'center',
    animation: `gradientDrift ${theme.duration} ease-in-out infinite`,
    transition: 'background-image 1.2s ease, background-position 1.2s ease',
    minHeight: 'max(100svh, calc(var(--app-vh-fixed, var(--app-vh, 1vh)) * 100))',
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  }
})

function handleScroll() {
  if (typeof window === 'undefined') return
  const y = window.scrollY || window.pageYOffset || 0
  scrolled.value = y > 40
}

watch(currentDir, (dir) => {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('dir', dir)
  document.documentElement.setAttribute('lang', lang.value)
}, { immediate: true })

let removeRouteHook = null
let removeWheelUnlock = null
let removeTouchUnlock = null

function ensureScrollUnlocked() {
  if (typeof document === 'undefined') return
  if (document.querySelector('.modal-overlay')) return
  if (document.documentElement.style.overflow === 'hidden') {
    document.documentElement.style.overflow = ''
  }
  if (document.body) {
    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = ''
    }
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', ensureScrollUnlocked, { passive: true })
    window.addEventListener('touchstart', ensureScrollUnlocked, { passive: true })
    handleScroll()
    ensureScrollUnlocked()
    removeWheelUnlock = () => window.removeEventListener('wheel', ensureScrollUnlocked)
    removeTouchUnlock = () => window.removeEventListener('touchstart', ensureScrollUnlocked)
  }

  removeRouteHook = router.afterEach((to, from) => {
    if (typeof window === 'undefined') return
    window.requestAnimationFrame(() => {
      handleScroll()
      ensureScrollUnlocked()
      const parentTo = (to?.meta?.pageTheme?.group) || currentThemeGroup.value
      const parentFrom = (from?.meta?.pageTheme?.group) || parentTo
      if (!parentFrom || parentFrom !== parentTo) {
        navAttached.value = false
      }
    })
  })
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll)
    if (typeof removeWheelUnlock === 'function') {
      removeWheelUnlock()
      removeWheelUnlock = null
    }
    if (typeof removeTouchUnlock === 'function') {
      removeTouchUnlock()
      removeTouchUnlock = null
    }
  }
  if (typeof removeRouteHook === 'function') {
    removeRouteHook()
    removeRouteHook = null
  }
})
</script>

<style scoped>
main {
  animation-name: gradientDrift;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
</style>
