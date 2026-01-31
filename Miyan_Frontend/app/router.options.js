// Custom scroll behavior: only scroll to top when parent route (branch) changes.
export default {
  scrollBehavior(to, from, savedPosition) {
    // If there is a saved position (back/forward), honor it.
    if (savedPosition) return savedPosition

    const resolveParent = (route) => {
      if (!route) return ''
      const metaParent = route.meta?.pageTheme?.group
      if (metaParent) return metaParent
      const segs = (route.path || '').split('/').filter(Boolean)
      // Index 1 is the parent when lang prefix exists; otherwise fallback to index 0.
      return segs[1] || segs[0] || ''
    }

    const toParent = resolveParent(to)
    const fromParent = resolveParent(from)

    // If parent changed (navigating between top-level branches), scroll to top.
    if (toParent !== fromParent) {
      return { left: 0, top: 0 }
    }

    // For child route navigations within same parent, keep current scroll position.
    return false
  }
}
