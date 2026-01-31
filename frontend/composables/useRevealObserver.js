import { onMounted, onUnmounted, watch } from 'vue'

/**
 * Observes elements within a root container and toggles the `is-visible` class
 * once they intersect the viewport. Intended for luxury landing animations.
 */
export function useRevealObserver(rootRef, options = {}) {
  const selector = options.selector || '[data-reveal]'
  const threshold = options.threshold ?? 0.2
  let observer = null

  const attachObserver = () => {
    detachObserver()
    const rootEl = rootRef?.value
    if (!rootEl) return

    if (typeof IntersectionObserver === 'undefined') {
      rootEl.querySelectorAll(selector).forEach((node) => {
        node.classList.add('is-visible')
      })
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          } else if (!options.once) {
            entry.target.classList.remove('is-visible')
          }
        })
      },
      { threshold }
    )

    rootEl.querySelectorAll(selector).forEach((node) => observer.observe(node))
  }

  const detachObserver = () => {
    if (!observer) return
    observer.disconnect()
    observer = null
  }

  onMounted(() => {
    attachObserver()
  })

  onUnmounted(() => {
    detachObserver()
  })

  // Re-attach if the root element changes (e.g., suspense)
  watch(() => rootRef?.value, () => {
    attachObserver()
  })
}
