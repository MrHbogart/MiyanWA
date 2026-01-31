function normalizePath(path) {
  if (!path) return ''
  if (typeof path !== 'string') return ''
  return path.replace(/\/+/g, '/')
}

export function resolveParentId(route) {
  if (!route) return ''
  const metaParent = route.meta?.pageTheme?.group
  if (metaParent) return metaParent

  const normalized = normalizePath(route.path || '')
  if (!normalized) return ''
  const segments = normalized.split('/').filter(Boolean)
  // With lang prefix the second segment is the parent; otherwise use the first.
  return segments[1] || segments[0] || ''
}

export function isParentRouteChange(from, to) {
  return resolveParentId(from) !== resolveParentId(to)
}

export function resetParentScroll() {
  if (typeof window === 'undefined') return
  if (window.__DISABLE_SCROLL_RESET__) return
  const scroller = document.scrollingElement || document.documentElement || document.body
  if (!scroller) return

  const previousBehavior = scroller.style.scrollBehavior
  if (previousBehavior !== 'auto') {
    scroller.style.scrollBehavior = 'auto'
  }

  window.scrollTo(0, 0)

  if (previousBehavior && previousBehavior !== 'auto') {
    requestAnimationFrame(() => {
      scroller.style.scrollBehavior = previousBehavior
    })
  }
}
