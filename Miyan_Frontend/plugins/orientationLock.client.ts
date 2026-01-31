import { onNuxtReady } from '#app'

export default defineNuxtPlugin(() => {
  if (process.server) return

  const portraitQuery = window.matchMedia('(orientation: portrait)')

  const isMobileLike = () =>
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches || (window.innerWidth || 0) <= 1024)

  const tryLock = () => {
    if (!isMobileLike()) return
    const orientation = window.screen?.orientation
    if (orientation?.type?.startsWith('portrait')) return
    if (orientation?.lock) {
      orientation.lock('portrait').catch(() => {
        // Best-effort; locking is not always allowed in browsers
      })
    }
  }

  const handleChange = () => {
    tryLock()
  }

  let removePortraitListener: (() => void) | null = null
  if (typeof portraitQuery.addEventListener === 'function') {
    portraitQuery.addEventListener('change', handleChange)
    removePortraitListener = () => portraitQuery.removeEventListener('change', handleChange)
  } else if (typeof portraitQuery.addListener === 'function') {
    portraitQuery.addListener(handleChange)
    removePortraitListener = () => portraitQuery.removeListener(handleChange)
  }

  window.addEventListener('orientationchange', handleChange)
  window.addEventListener('resize', handleChange)

  onNuxtReady(() => {
    tryLock()
  })

  if (import.meta.hot) {
    import.meta.hot.on('vite:beforeFullReload', () => {
      if (removePortraitListener) removePortraitListener()
      window.removeEventListener('orientationchange', handleChange)
      window.removeEventListener('resize', handleChange)
    })
  }
})
