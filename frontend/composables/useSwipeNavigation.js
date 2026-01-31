import { onMounted, onUnmounted, watch } from 'vue'

export function useSwipeNavigation(targetRef, options = {}) {
  const threshold = options.threshold ?? 60
  let startX = 0
  let startY = 0
  let dx = 0
  let dy = 0
  let active = false
  let el = null

  const onTouchStart = (event) => {
    const touch = event.touches ? event.touches[0] : event
    startX = touch.clientX
    startY = touch.clientY
    dx = 0
    dy = 0
    active = true
  }

  const onTouchMove = (event) => {
    if (!active) return
    const touch = event.touches ? event.touches[0] : event
    dx = touch.clientX - startX
    dy = touch.clientY - startY
    if (Math.abs(dy) > Math.abs(dx)) return
    event.preventDefault()
  }

  const onTouchEnd = () => {
    if (!active) return
    if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && typeof options.onLeft === 'function') {
        options.onLeft()
      } else if (dx > 0 && typeof options.onRight === 'function') {
        options.onRight()
      }
    }
    active = false
    startX = 0
    startY = 0
    dx = 0
    dy = 0
  }

  const attach = () => {
    detach()
    el = targetRef?.value || null
    if (!el) return
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
  }

  const detach = () => {
    if (!el) return
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
    el = null
  }

  onMounted(attach)
  onUnmounted(detach)
  watch(() => targetRef?.value, attach)
}
