import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Tracks scroll velocity and exposes a normalized speed factor (0.85 → 1.6)
 * so sections can speed up / slow down their animations based on user scroll.
 */
export function useScrollVelocity(options = {}) {
  const smoothing = options.smoothing ?? 0.2
  const multiplier = options.multiplier ?? 10
  const min = options.min ?? 0.85
  const max = options.max ?? 1.6

  const scrollY = ref(0)
  const velocity = ref(0)
  const direction = ref(1)
  const speedFactor = ref(1)

  let lastY = 0
  let lastTime = 0
  let rafId = null

  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())
  const getScroll = () => (typeof window !== 'undefined'
    ? window.scrollY || window.pageYOffset || 0
    : 0)

  const update = () => {
    const currentY = getScroll()
    const time = now()
    const delta = currentY - lastY
    const elapsed = Math.max(16, time - lastTime || 16)
    const rawVelocity = delta / elapsed
    const easedVelocity = velocity.value + (rawVelocity - velocity.value) * (1 - smoothing)

    velocity.value = Number(easedVelocity.toFixed(4))
    direction.value = delta >= 0 ? 1 : -1
    scrollY.value = currentY
    lastY = currentY
    lastTime = time

    const amplified = Math.abs(velocity.value) * multiplier
    const nextFactor = Math.min(max, Math.max(min, 1 + amplified))
    speedFactor.value = Number(nextFactor.toFixed(3))
  }

  const scheduleUpdate = () => {
    if (rafId) return
    rafId = requestAnimationFrame(() => {
      update()
      rafId = null
    })
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    lastY = getScroll()
    lastTime = now()
    scrollY.value = lastY
    update()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
  })

  onUnmounted(() => {
    if (typeof window === 'undefined') return
    window.removeEventListener('scroll', scheduleUpdate)
    if (rafId) cancelAnimationFrame(rafId)
  })

  return {
    scrollY,
    velocity,
    direction,
    speedFactor
  }
}
