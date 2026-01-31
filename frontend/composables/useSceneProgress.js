import { ref, onMounted, onUnmounted, watch } from 'vue'

const easeOutCubic = t => 1 - Math.pow(1 - t, 3)

export function useSceneProgress(sectionsRef, options = {}) {
  const sceneProgress = ref([])
  const easePower = options.easePower ?? 1
  const easingFn = options.easing ?? easeOutCubic
  const springPoint = options.springPoint ?? 0.68
  const holdFactor = options.holdFactor ?? 0.5
  const releaseCurve = options.releaseCurve ?? 0.9

  const applySpring = value => {
    if (value <= springPoint) {
      return (value / springPoint) * holdFactor
    }
    const remainder = Math.min(1, (value - springPoint) / (1 - springPoint))
    const easedRemainder = Math.pow(remainder, releaseCurve)
    return holdFactor + (1 - holdFactor) * easedRemainder
  }

  let raf = null

  const measure = () => {
    if (typeof window === 'undefined') return
    const viewport = window.innerHeight || 1
    const midpoint = viewport / 2

    sceneProgress.value = (sectionsRef.value || []).map(section => {
      if (!section) return 0
      const rect = section.getBoundingClientRect()
      const sectionMid = rect.top + rect.height / 2
      const distance = Math.min(Math.abs(sectionMid - midpoint), viewport)
      const linear = 1 - distance / viewport
      const clamped = Math.max(0, Math.min(1, linear))
      const eased = easingFn(Math.pow(clamped, easePower))
      const spring = applySpring(eased)
      return Number(spring.toFixed(3))
    })
  }

  const scheduleMeasure = () => {
    if (raf !== null) return
    raf = requestAnimationFrame(() => {
      raf = null
      measure()
    })
  }

  onMounted(() => {
    scheduleMeasure()
    window.addEventListener('scroll', scheduleMeasure, { passive: true })
    window.addEventListener('resize', scheduleMeasure)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', scheduleMeasure)
    window.removeEventListener('resize', scheduleMeasure)
    if (raf !== null) cancelAnimationFrame(raf)
    raf = null
  })

  watch(sectionsRef, scheduleMeasure, { deep: true })

  return {
    sceneProgress,
    refreshScenes: scheduleMeasure,
  }
}
