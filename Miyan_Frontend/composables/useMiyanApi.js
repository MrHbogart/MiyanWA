import axios from 'axios'
import { createAbortableRequest } from '~/utils/abortableRequest'

const DEFAULT_API_BASE_URL = 'https://miyangroup.com/api'

const CACHE_CONFIG = {
  defaultMaxAge: 3600000,
  backgroundRefreshThreshold: 300000,
  retryAttempts: 2,
  retryDelay: 1000,
  requestTimeout: 15000,
}

const CACHE_KEYS = {
  BERESHT_MENU: 'bereshtMenu',
  BERESHT_TODAY_MENU: 'bereshtTodayMenu',
  MADI_MENU: 'madiMenu',
  MADI_TODAY_MENU: 'madiTodayMenu',
}

const normalizeBaseUrl = (url) => url.replace(/\/+$/, '')

const INTERNAL_HTTP_HOSTS = new Set([
  'backend',
  'backend:8000',
  'localhost',
  'localhost:3000',
  'localhost:8000',
  '127.0.0.1',
  '127.0.0.1:3000',
  '127.0.0.1:8000',
])

const pathWithSearch = (url) => `${url.pathname}${url.search}`

function resolveProtocolSafeBaseUrl(rawBaseUrl, fallbackDomain) {
  const normalized = normalizeBaseUrl(rawBaseUrl || DEFAULT_API_BASE_URL)
  if (typeof window === 'undefined' || window.location.protocol !== 'https:') {
    return normalized
  }

  try {
    const parsed = new URL(normalized)
    if (parsed.protocol !== 'http:') {
      return normalized
    }

    const hostWithPort = parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.hostname
    if (INTERNAL_HTTP_HOSTS.has(hostWithPort)) {
      return `${window.location.origin}${pathWithSearch(parsed)}`
    }

    if (fallbackDomain) {
      return `${normalizeBaseUrl(fallbackDomain)}${pathWithSearch(parsed)}`
    }

    parsed.protocol = 'https:'
    return normalizeBaseUrl(parsed.toString())
  } catch (error) {
    console.warn('Failed to normalize API base URL', error)
    if (fallbackDomain) {
      return normalizeBaseUrl(fallbackDomain)
    }
  }

  return normalized
}

function unwrapResults(payload) {
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'results')) {
    return payload.results
  }
  return payload
}

function isMenuMatch(menu, targets = []) {
  const type = (menu?.menu_type || menu?.menuType || '').toString().toLowerCase()
  const titleFa = (menu?.title?.fa || '').toString().toLowerCase()
  const titleEn = (menu?.title?.en || '').toString().toLowerCase()

  return targets.some((target) => {
    const needle = target.toLowerCase()
    return type === needle || titleFa.includes(needle) || titleEn.includes(needle)
  })
}

function normalizeMenuPayload(payload, { prefer } = {}) {
  const data = unwrapResults(payload)
  if (!data) return null
  if (!Array.isArray(data)) return data

  const preferred = prefer ? data.find((menu) => prefer(menu)) : null
  if (preferred) return preferred
  return data[0] || null
}

function createCachedClient({ apiBaseUrl, enableCache, fallbackDomain }) {
  const storage = enableCache && typeof window !== 'undefined' ? window.localStorage : null

  const base = resolveProtocolSafeBaseUrl(apiBaseUrl, fallbackDomain)

  const axiosInstance = axios.create({
    baseURL: `${base}/`,
    withCredentials: true,
    xsrfCookieName: 'miyan_csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    timeout: 10000,
  })

  function getValidCachedData(storageKey, maxAge) {
    if (!storage) return { valid: false, data: null, needsRefresh: false }
    try {
      const cached = storage.getItem(storageKey)
      if (!cached) return { valid: false, data: null, needsRefresh: false }

      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp

      if (age < maxAge) {
        return {
          valid: true,
          data,
          needsRefresh: age > CACHE_CONFIG.backgroundRefreshThreshold,
        }
      }

      return { valid: false, data, needsRefresh: false }
    } catch (error) {
      console.warn(`Error reading cache for ${storageKey}:`, error)
      return { valid: false, data: null, needsRefresh: false }
    }
  }

  function setCachedData(storageKey, data) {
    if (!storage) return
    try {
      storage.setItem(storageKey, JSON.stringify({ data, timestamp: Date.now(), version: '1.0' }))
    } catch (error) {
      console.warn(`Error setting cache for ${storageKey}:`, error)
    }
  }

  async function fetchWithRetry(endpoint, retryAttempts, options = {}) {
    let lastError
    const requestTarget = endpoint.startsWith('http') ? endpoint : endpoint.replace(/^\/+/, '')
    const timeoutMs = options.timeoutMs ?? CACHE_CONFIG.requestTimeout

    for (let attempt = 0; attempt <= retryAttempts; attempt += 1) {
      const abortable = createAbortableRequest(timeoutMs)
      try {
        const response = await axiosInstance.get(requestTarget, { signal: abortable.signal })
        return response.data
      } catch (error) {
        lastError = error
        const aborted =
          error?.code === 'ERR_CANCELED' ||
          error?.message === 'route-change' ||
          error?.message === 'timeout' ||
          error?.name === 'CanceledError'
        if (aborted) {
          break
        }
        if (attempt < retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, CACHE_CONFIG.retryDelay * (attempt + 1)))
        }
      } finally {
        abortable.finalize()
      }
    }

    throw lastError
  }

  async function refreshInBackground(key, endpoint, storageKey, retryAttempts) {
    if (!storage) return
    try {
      const data = await fetchWithRetry(endpoint, retryAttempts)
      setCachedData(storageKey, unwrapResults(data))
    } catch (error) {
      console.warn(`Background refresh failed for ${key}:`, error)
    }
  }

  async function fetchWithCache(key, endpoint, options = {}) {
    const {
      maxAge = CACHE_CONFIG.defaultMaxAge,
      backgroundRefresh = true,
      retryAttempts = CACHE_CONFIG.retryAttempts,
      timeoutMs = CACHE_CONFIG.requestTimeout,
    } = options

    const storageKey = `cache:${key}`

    const cachedData = getValidCachedData(storageKey, maxAge)
    if (cachedData.valid) {
      if (backgroundRefresh && cachedData.needsRefresh) {
        refreshInBackground(key, endpoint, storageKey, retryAttempts)
      }
      return cachedData.data
    }

    try {
      const data = await fetchWithRetry(endpoint, retryAttempts, { timeoutMs })
      const dataToCache = unwrapResults(data)
      setCachedData(storageKey, dataToCache)
      return dataToCache
    } catch (error) {
      const aborted =
        error?.code === 'ERR_CANCELED' ||
        error?.message === 'route-change' ||
        error?.message === 'timeout' ||
        error?.name === 'CanceledError'
      if (aborted) {
        return cachedData.data || null
      }
      if (cachedData.data) {
        console.warn(`Using stale cache for ${key} due to API error:`, error.message)
        return cachedData.data
      }
      console.warn(`Failed to fetch ${key}:`, error.message || error)
      return null
    }
  }

  return {
    getBereshtTodayMenu: async () => {
      const results = await fetchWithCache(CACHE_KEYS.BERESHT_TODAY_MENU, '/beresht/menu/today/', { maxAge: 300000 })
      return normalizeMenuPayload(results, {
        prefer: (menu) => isMenuMatch(menu, ['today', "today's special", 'پخت روز']),
      })
    },
    getBereshtMenu: async () => {
      const results = await fetchWithCache(CACHE_KEYS.BERESHT_MENU, '/beresht/menu/main/', { maxAge: 3600000 })
      return normalizeMenuPayload(results, {
        prefer: (menu) => isMenuMatch(menu, ['main', 'menu', 'منوی نوشیدنی']),
      })
    },
    getMadiTodayMenu: async () => {
      const results = await fetchWithCache(CACHE_KEYS.MADI_TODAY_MENU, '/madi/menu/today/', { maxAge: 300000 })
      return normalizeMenuPayload(results, {
        prefer: (menu) => isMenuMatch(menu, ['today', "today's special", 'پخت روز']),
      })
    },
    getMadiMenu: async () => {
      const results = await fetchWithCache(CACHE_KEYS.MADI_MENU, '/madi/menu/main/', { maxAge: 3600000 })
      return normalizeMenuPayload(results, {
        prefer: (menu) => isMenuMatch(menu, ['main', 'menu', 'منوی نوشیدنی']),
      })
    },
  }
}

let browserClient

export function useMiyanApi() {
  const runtimeConfig = useRuntimeConfig()
  const apiBaseUrl = runtimeConfig.public.apiBaseUrl || DEFAULT_API_BASE_URL
  const siteDomain = runtimeConfig.public.siteDomain

  if (process.client) {
    if (!browserClient) {
      browserClient = createCachedClient({ apiBaseUrl, enableCache: true, fallbackDomain: siteDomain })
    }
    return browserClient
  }

  return createCachedClient({ apiBaseUrl, enableCache: false, fallbackDomain: siteDomain })
}
