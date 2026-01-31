import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Controls the black intro overlay that reveals the hero video only after
 * the minimum required asset (the video) is ready to play.
 */
export function useHeroIntro(options = {}) {
  const overlayStart = options.overlayStart ?? 1
  const overlayBase = options.overlayBase ?? 0.4
  const overlayMin = options.overlayMin ?? 0
  const scrollRange = options.scrollRange ?? 380
  const fadeDuration = options.fadeDuration ?? 1400
  const fallbackDelay = options.fallbackDelay ?? 6000

  const heroVideo = ref(null)
  const modalOverlayAlpha = ref(overlayStart)
  const overlayTransition = ref('background 0ms linear')

  let readyForScroll = false
  let releaseTimer = null
  let fallbackTimer = null
  let videoReadyHandler = null

  const updateOverlayFromScroll = () => {
    if (!readyForScroll) return
    const y = window.scrollY || window.pageYOffset || 0
    const t = Math.min(1, y / scrollRange)
    const value = overlayBase - t * (overlayBase - overlayMin)
    modalOverlayAlpha.value = Number(value.toFixed(3))
  }

  const releaseOverlay = () => {
    if (readyForScroll || releaseTimer) return

    overlayTransition.value = `background ${fadeDuration}ms cubic-bezier(.55,.06,.21,.95)`
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
        modalOverlayAlpha.value = overlayBase
      })
    } else {
      modalOverlayAlpha.value = overlayBase
    }

    releaseTimer = setTimeout(() => {
      readyForScroll = true
      overlayTransition.value = 'background 340ms cubic-bezier(.46,1.2,.34,1.01)'
      releaseTimer = null
    }, fadeDuration)
  }

  const detachVideoListeners = (video) => {
    if (!video || !videoReadyHandler) return
    video.removeEventListener('loadeddata', videoReadyHandler)
    video.removeEventListener('canplay', videoReadyHandler)
    video.removeEventListener('canplaythrough', videoReadyHandler)
    videoReadyHandler = null
  }

  const attachVideoListeners = () => {
    const video = heroVideo.value
    if (!video) return

    videoReadyHandler = () => {
      releaseOverlay()
      detachVideoListeners(video)
    }

    if (video.readyState >= 3) {
      releaseOverlay()
      detachVideoListeners(video)
      return
    }

    video.addEventListener('loadeddata', videoReadyHandler)
    video.addEventListener('canplay', videoReadyHandler)
    video.addEventListener('canplaythrough', videoReadyHandler)
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      if (window.history && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual'
      }
      window.scrollTo({ top: 0, behavior: 'auto' })
      window.addEventListener('scroll', updateOverlayFromScroll, { passive: true })
    }

    attachVideoListeners()
    fallbackTimer = setTimeout(releaseOverlay, fallbackDelay)
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', updateOverlayFromScroll)
    }
    if (releaseTimer) {
      clearTimeout(releaseTimer)
      releaseTimer = null
    }
    if (fallbackTimer) {
      clearTimeout(fallbackTimer)
      fallbackTimer = null
    }
    detachVideoListeners(heroVideo.value)
  })

  return {
    heroVideo,
    modalOverlayAlpha,
    overlayTransition,
  }
}
