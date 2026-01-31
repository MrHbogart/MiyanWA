import { SUPPORTED_LANGS, setLang } from '~/composables/useLang'

export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/_')) {
    return
  }

  const fallback = 'fa'
  const paramsLang = Array.isArray(to.params.lang) ? to.params.lang[0] : to.params.lang
  const candidateFromPath = to.path.split('/').filter(Boolean)[0] || ''
  const candidate = typeof paramsLang === 'string' && paramsLang.length ? paramsLang : candidateFromPath

  if (!SUPPORTED_LANGS.includes(candidate)) {
    if (!candidate || to.path === '/') {
      return navigateTo(`/${fallback}/`, { redirectCode: 301 })
    }

    const segments = to.path.split('/').filter(Boolean)
    segments[0] = fallback
    const normalized = `/${segments.join('/')}`.replace(/\/+/g, '/').replace(/\/+$|$/, '/')
    return navigateTo(normalized, { redirectCode: 301 })
  }

  setLang(candidate)
})
