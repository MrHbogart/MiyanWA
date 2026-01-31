import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useHeaderHeight, useNavAttached } from '~/composables/useHeaderState'

/**
 * Simplified composable for managing navbar attachment/detachment
 * - Fixed positioning when navbar reaches header
 * - Simple opacity and backdrop-filter transitions
 * - No complex overlay animations or state flags
 */
export function useNavbarAttachment(navbarRef, navbarSentinel) {
  const headerHeight = useHeaderHeight()
  const globalNavAttached = useNavAttached()
  const attached = ref(false)
  const navHeight = ref(0)
  let rafId = null

  const syncAttachment = (value) => {
    attached.value = value
    globalNavAttached.value = value
  }

  // Simple animation timings
  const TRANSITION_DURATION = 350
  const EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)'

  /**
   * Check if navbar sentinel has reached header
   * Sentinel position relative to header determines attachment state
   */
  function checkAttachment() {
    const sent = navbarSentinel.value
    if (!sent) {
      syncAttachment(false)
      return
    }
    
    const rect = sent.getBoundingClientRect()
    const headerH = headerHeight.value || 0
    const shouldAttach = rect.top <= headerH

    if (shouldAttach !== attached.value || shouldAttach !== globalNavAttached.value) {
      syncAttachment(shouldAttach)
    }
  }

  /**
   * Update navbar height for sentinel placeholder
   */
  function updateNavHeight() {
    if (navbarRef.value) {
      navHeight.value = navbarRef.value.offsetHeight || 0
    }
  }

  /**
   * RAF-throttled scroll tracking
   */
  function onScrollTrack() {
    if (rafId || typeof window === 'undefined') return
    rafId = window.requestAnimationFrame(() => {
      checkAttachment()
      rafId = null
    })
  }

  /**
   * Resize and load handlers
   */
  function onResize() {
    updateNavHeight()
    checkAttachment()
  }

  function onNavWheel(e) {
    // Forward wheel scroll to the page so the navbar never traps scroll
    if (typeof window === 'undefined') return
    if (Math.abs(e.deltaY) > 0 || Math.abs(e.deltaX) > 0) {
      e.preventDefault()
      window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: 'auto' })
    }
  }

  function onLoad() {
    updateNavHeight()
    checkAttachment()
  }

  const isNavFixed = computed(() => attached.value)

  /**
   * Opacity changes when navbar becomes fixed
   * When floating: navbar is fully opaque (1)
   * When attached: navbar becomes slightly transparent (0.85)
   */
  const navTargetOpacity = computed(() => (isNavFixed.value ? 0.85 : 1))
  const navBgOpacity = ref(navTargetOpacity.value)
  watch(navTargetOpacity, (v) => { 
    navBgOpacity.value = v 
  }, { immediate: true })

  const baseShadow = '0 10px 18px -16px rgba(0, 0, 0, 0.26)'
  const attachedShadow = '0 10px 20px -14px rgba(0, 0, 0, 0.3)'

  /**
   * Navbar inline styles - simple fixed positioning
   * Transparency fades from header to navbar during attachment
   */
  const navInlineStyle = computed(() => {
    const opacity = navBgOpacity.value
    const activeFillAlpha = Math.max(0, Math.min(1, opacity))
    const baseStyle = {
      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      '--nav-surface-opacity': opacity,
      '--nav-active-fill-alpha': activeFillAlpha,
      transition: `background ${TRANSITION_DURATION}ms ${EASING}, backdrop-filter ${TRANSITION_DURATION}ms ${EASING}, box-shadow ${TRANSITION_DURATION}ms ${EASING}`,
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: '20',
      boxShadow: baseShadow,
      overflow: 'visible'
    }

    if (isNavFixed.value) {
      // Fixed state - attached to header with backdrop and shadow
      // Use negative left/right offsets and expanded width so the bar visually
      // fills the entire device viewport (including unsafe insets). Inner
      // padding uses safe-area insets so content stays away from notches.
      return {
        ...baseStyle,
        position: 'fixed',
        top: 'var(--header-height)',
        left: 'calc(env(safe-area-inset-left, 0px) * -1)',
        right: 'calc(env(safe-area-inset-right, 0px) * -1)',
        width: 'calc(100% + env(safe-area-inset-left, 0px) + env(safe-area-inset-right, 0px))',
        height: navHeight.value ? `${navHeight.value}px` : undefined,
        zIndex: '30',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        backdropFilter: 'saturate(120%) blur(6px)',
        boxShadow: attachedShadow
      }
    }

    // Natural flow state - no backdrop or shadow
    return {
      ...baseStyle,
      backdropFilter: 'none',
      boxShadow: baseShadow
    }
  })

  /**
   * Sentinel style - takes up space when navbar is fixed
   * No animation - instantly adjusts to prevent layout jumps
   */
  const sentinelStyle = computed(() => {
    if (isNavFixed.value) {
      return { 
        height: `${navHeight.value || 0}px`, 
        transition: 'none',
        backgroundColor: 'transparent'
      }
    }
    return { 
      height: '0px', 
      transition: 'none',
      backgroundColor: 'transparent'
    }
  })

  onMounted(() => {
    if (typeof window === 'undefined') return
    syncAttachment(false)
    updateNavHeight()
    checkAttachment()

    const navEl = navbarRef.value
    if (navEl) {
      navEl.addEventListener('wheel', onNavWheel, { passive: false })
    }

    window.addEventListener('scroll', onScrollTrack, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('load', onLoad)
  })

  onUnmounted(() => {
    if (typeof window === 'undefined') return
    window.removeEventListener('scroll', onScrollTrack)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('load', onLoad)
    const navEl = navbarRef.value
    if (navEl) {
      navEl.removeEventListener('wheel', onNavWheel)
    }
    if (rafId) window.cancelAnimationFrame(rafId)
    syncAttachment(false)
  })

  return {
    attached,
    isNavFixed,
    navInlineStyle,
    sentinelStyle,
    navbarRef,
    navbarSentinel
  }
}
