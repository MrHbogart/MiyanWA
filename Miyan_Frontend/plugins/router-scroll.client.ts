import { isParentRouteChange, resetParentScroll } from '~/utils/router-scroll'
import { abortAllPendingRequests } from '~/utils/abortableRequest'

const DISABLE_CLASS = 'no-page-transition'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return

  const router = nuxtApp.$router
  const shouldEnable = () =>
    typeof window === 'undefined' || window.__FIX_SCROLL_BEHAVIOR__ !== false
  let pendingParentReset = false

  router.beforeEach((to, from, next) => {
    abortAllPendingRequests('route-change')

    if (shouldEnable() && isParentRouteChange(from, to)) {
      pendingParentReset = true
      document.body.classList.add(DISABLE_CLASS)
    }

    next()
  })

  router.afterEach(() => {
    if (!pendingParentReset) return
    pendingParentReset = false
    resetParentScroll()
    document.body.classList.remove(DISABLE_CLASS)
  })
})
