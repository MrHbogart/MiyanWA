import { onMounted } from 'vue'
import { useMiyanApi } from '~/composables/useMiyanApi'

const MENU_KEYS = {
  beresht: ['beresht-base-menu', 'beresht-daily-menu'],
  madi: ['madi-base-menu', 'madi-daily-menu'],
}

const MENU_HANDLERS = {
  'beresht-base-menu': (api) => api.getBereshtMenu(),
  'beresht-daily-menu': (api) => api.getBereshtTodayMenu(),
  'madi-base-menu': (api) => api.getMadiMenu(),
  'madi-daily-menu': (api) => api.getMadiTodayMenu(),
}

const defaultMenuState = () => ({ sections: [] })
const hasMenuSections = (menu) => {
  if (!Array.isArray(menu?.sections)) return false
  return menu.sections.some((section) =>
    Array.isArray(section?.items) && section.items.some((item) => item && item.name),
  )
}

async function fetchMenuByKey(key, api) {
  const loader = MENU_HANDLERS[key]
  if (!loader) return defaultMenuState()

  try {
    const result = await loader(api)
    return result || defaultMenuState()
  } catch (error) {
    return defaultMenuState()
  }
}

export function useMenuData(key, options = {}) {
  const api = useMiyanApi()
  const handler = () => fetchMenuByKey(key, api)

  const asyncData = useAsyncData(
    key,
    handler,
    {
      default: defaultMenuState,
      // Keep fetching on client to avoid server-side stalls; layout now stays consistent via content shell wrappers.
      server: false,
      lazy: false,
      dedupe: 'defer',
      ...options,
    },
  )

  if (process.client) {
    const { data, pending, error, refresh } = asyncData

    onMounted(() => {
      if (pending.value) return
      if (error.value || !hasMenuSections(data.value)) {
        refresh()
      }
    })
  }

  return asyncData
}

export function useMenuPrefetch(branch) {
  if (process.server) return

  const targets = MENU_KEYS[branch] || []
  if (!targets.length) return

  const hasStarted = useState(`menu-prefetch:${branch}`, () => false)
  if (hasStarted.value) return

  targets.forEach((key) => {
    useMenuData(key, { server: false, lazy: false })
  })

  hasStarted.value = true
}
