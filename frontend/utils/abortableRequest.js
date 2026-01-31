const pendingControllers = new Set()

export function createAbortableRequest(timeoutMs = 12000) {
  if (typeof AbortController === 'undefined') {
    return {
      signal: undefined,
      abort: () => {},
      finalize: () => {},
    }
  }

  const controller = new AbortController()
  pendingControllers.add(controller)

  let timeoutId = null
  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      controller.abort('timeout')
    }, timeoutMs)
  }

  return {
    signal: controller.signal,
    abort: () => controller.abort('manual'),
    finalize: () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      pendingControllers.delete(controller)
    },
    controller,
  }
}

export function abortAllPendingRequests(reason = 'route-change') {
  pendingControllers.forEach((controller) => {
    try {
      controller.abort(reason)
    } catch (error) {
      console.warn('Failed to abort request', error)
    }
  })
  pendingControllers.clear()
}
