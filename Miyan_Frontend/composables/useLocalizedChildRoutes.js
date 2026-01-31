import { ref, watch, computed, unref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SUPPORTED_LANG_SET, useLang } from '~/composables/useLang'

function resolveItems(source) {
  const resolved = unref(source)
  if (Array.isArray(resolved)) return resolved
  return []
}

export function useLocalizedChildRoutes(navItems = []) {
  const route = useRoute()
  const router = useRouter()
  const lang = useLang()

  const items = computed(() => resolveItems(navItems))
  const orderedPaths = computed(() => items.value.map(item => item.path.replace(/^\/+/, '')))
  const childTransition = ref('swipe-left')
  let previousPath = route.path

  const resolveLang = () => {
    const routeLang = route.params.lang
    if (typeof routeLang === 'string' && SUPPORTED_LANG_SET.has(routeLang)) {
      return routeLang
    }

    const segments = route.path.split('/').filter(Boolean)
    const first = segments[0]
    if (SUPPORTED_LANG_SET.has(first)) return first

    return lang.value
  }

  const getLocalizedPath = (rawPath = '') => {
    const normalized = rawPath.replace(/^\/+/, '').replace(/\/+$/, '')
    const currentLang = resolveLang()
    if (!normalized) return `/${currentLang}/`
    return `/${currentLang}/${normalized}`
  }

  const shiftChild = (step) => {
    const names = orderedPaths.value
    if (!names.length) return
    const currentRelative = route.path.split('/').filter(Boolean).slice(1).join('/') || ''
    const currentIndex = names.indexOf(currentRelative)
    if (currentIndex === -1) return

    const nextIndex = currentIndex + step
    if (nextIndex < 0 || nextIndex >= names.length) return

    router.push(getLocalizedPath(names[nextIndex]))
  }

  watch(() => route.path, (nextPath) => {
    if (!nextPath) {
      previousPath = null
      return
    }

    const names = orderedPaths.value
    const normalize = (path) => (path || '').split('/').filter(Boolean).slice(1).join('/')
    const fromIndex = names.indexOf(normalize(previousPath))
    const toIndex = names.indexOf(normalize(nextPath))
    if (fromIndex !== -1 && toIndex !== -1) {
      childTransition.value = toIndex > fromIndex ? 'swipe-left' : 'swipe-right'
    }
    previousPath = nextPath
  }, { immediate: true })

  watch(items, () => {
    previousPath = route.path
  })

  return {
    childTransition,
    getLocalizedPath,
    resolveLang,
    shiftChild,
  }
}
