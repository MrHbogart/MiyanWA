import { onNuxtReady } from '#app'

let rafId: number | null = null
let stableHeight = 0
let stableWidth = 0

function measureViewport() {
  if (typeof window === 'undefined') return { h: 0, w: 0 }
  const vv = window.visualViewport
  const h = (vv?.height || window.innerHeight || document.documentElement.clientHeight || 0)
  const w = (vv?.width || window.innerWidth || document.documentElement.clientWidth || 0)
  return { h, w }
}

function setViewportUnit(force = false) {
  if (typeof window === 'undefined') return
  const { h, w } = measureViewport()
  if (!h || !w) return

  const heightDelta = Math.abs(h - stableHeight)
  const widthDelta = Math.abs(w - stableWidth)
  const aspectDelta = stableWidth && stableHeight ? Math.abs(h / w - stableHeight / stableWidth) : 1
  const orientationFlip = widthDelta > 60 && aspectDelta > 0.2
  const isRealResize = widthDelta > 80 || orientationFlip

  // Always write dynamic vars for components that rely on them
  const vh = h * 0.01
  const vw = w * 0.01
  document.documentElement.style.setProperty('--app-vh', `${vh}px`)
  document.documentElement.style.setProperty('--vh', `${vh}px`)
  document.documentElement.style.setProperty('--app-vw', `${vw}px`)
  document.documentElement.style.setProperty('--vw', `${vw}px`)

  // Only update the "fixed" baseline on first paint or true resizes (rotation / split view changes)
  if (force || stableHeight === 0 || stableWidth === 0 || isRealResize) {
    stableHeight = h
    stableWidth = w
    document.documentElement.style.setProperty('--app-vh-fixed', `${vh}px`)
    document.documentElement.style.setProperty('--app-vw-fixed', `${vw}px`)
  }
}

function scheduleViewportUpdate() {
  if (rafId !== null) return
  rafId = window.requestAnimationFrame(() => {
    setViewportUnit()
    rafId = null
  })
}

export default defineNuxtPlugin(() => {
  if (process.server) return

  const onResize = () => scheduleViewportUpdate()

  // Capture baseline once on load
  setViewportUnit(true)

  window.addEventListener('orientationchange', onResize, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })

  // visualViewport API gives us the 'real' inner area on mobile (handles Safari address-bar)
  if (window.visualViewport) {
    // Resize on visualViewport.resize to respond to address-bar show/hide and keyboard
    window.visualViewport.addEventListener('resize', onResize, { passive: true })
    // Also listen to scroll since some browsers update visual viewport while scrolling
    window.visualViewport.addEventListener('scroll', onResize, { passive: true })
  }

  onNuxtReady(() => {
    setViewportUnit(true)
  })

  if (import.meta.hot) {
    import.meta.hot.on('vite:beforeFullReload', () => {
      window.removeEventListener('orientationchange', onResize)
      window.removeEventListener('resize', onResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onResize)
        window.visualViewport.removeEventListener('scroll', onResize)
      }
    })
  }
})
