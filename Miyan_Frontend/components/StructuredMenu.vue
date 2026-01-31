<template>
  <div
    class="menu-shell w-full"
    :class="menuWidthClass"
    :dir="currentLang === 'fa' ? 'rtl' : 'ltr'"
  >
      <div v-if="sections && sections.length">
          <section
            v-for="(section, sIdx) in sections"
            :key="sIdx"
            class="menu-section pb-10 mb-8 md:mb-10 last:pb-0 last:mb-0"
            :class="{'menu-section--side': isSideSection(section)}"
          >
            <h2
              class="menu-section-title"
              :class="isRTL ? 'text-right' : 'text-left'"
            >
              <span v-if="isRTL" class="block font-b-titr" dir="rtl">{{ translateCopy(section.title) }}</span>
              <span v-else class="block font-cinzel font-semibold tracking-[0.08em]">{{ translateCopy(section.title) }}</span>
            </h2>
            <div
              class="h-px bg-black/70"
              :class="isSideSection(section) ? 'mb-4' : 'mb-6'"
            ></div>
        <div
          class="grid menu-grid"
          :class="isSideSection(section) ? 'gap-2.5 md:gap-3' : 'gap-3 md:gap-5'"
        >
          <article
            v-for="(item, idx) in (section.items || [])"
            :key="idx"
            class="group px-0 md:px-6 menu-item-card"
            :class="isSideSection(section) ? 'menu-item-card--side' : 'menu-item-card--main'"
          >
            <div
              v-if="item && item.name"
              :class="[
                'grid items-start menu-item-layout',
                isSideSection(section) ? 'gap-2 md:gap-2.5 grid-cols-1' : 'gap-3',
                showMedia(item, section) ? 'md:grid-cols-2' : 'grid-cols-1'
              ]"
              dir="ltr"
            >
              <div :class="isRTL ? 'order-2 md:order-2' : 'order-2 md:order-1'">
                <div
                  :class="[
                    'menu-item-body',
                    isSideSection(section) ? 'mb-3' : 'mb-4'
                  ]"
                  :dir="isRTL ? 'rtl' : 'ltr'"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div :class="[isRTL ? 'order-1 text-right flex-1' : 'order-2 text-left flex-1']">
                      <h3 class="menu-item-name mb-2">
                        <span v-if="isRTL" class="block font-b-titr">{{ translateCopy(item.name) }}</span>
                        <span v-else class="block font-cinzel font-semibold tracking-wide">{{ translateCopy(item.name) }}</span>
                      </h3>
                    </div>

                    <div
                      v-if="item.price"
                      class="text-gray-700 min-w-[3rem] menu-price"
                      :class="isRTL ? 'order-1 text-left font-b-titr' : 'order-2 text-right font-cinzel font-semibold tracking-wide'"
                      dir="ltr"
                    >
                      {{ translateCopy(item.price) }}
                    </div>
                  </div>

                  <p v-if="item.description" class="menu-description text-gray-600" :class="isRTL ? 'text-right' : 'text-left'">
                    <span v-if="isRTL" class="block font-b-titr">{{ translateCopy(item.description) }}</span>
                    <span v-else class="block font-cinzel font-normal">{{ translateCopy(item.description) }}</span>
                  </p>
                </div>
              </div>

              <div
                v-if="showMedia(item, section)"
                :class="[
                  isRTL ? 'order-1 md:order-1 overflow-hidden' : 'order-1 md:order-2 overflow-hidden',
                  'menu-item-media'
                ]"
                @click="openItemMedia(item, section)"
              >
                <img
                  :src="resolveImageSrc(item)"
                  :alt="(item.name && typeof item.name === 'object') ? (item.name.en || item.name.fa || '') : (item.name || '')"
                  class="w-full h-40 md:h-56 object-cover transform transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                />
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <ImageModal
      :show="!!selectedMedia"
      :image-src="selectedMedia?.image || ''"
      :image-alt="selectedMedia?.alt || ''"
      :video-src="selectedMedia?.video || ''"
      @close="selectedMedia = null"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ImageModal from './ImageModal.vue'
import { useLang } from '~/composables/useLang'

const props = defineProps({
  menu: {
    type: Object,
    required: true,
  },
})

const selectedMedia = ref(null)
const langState = useLang()
const currentLang = computed(() => langState.value)
const isRTL = computed(() => currentLang.value === 'fa')
const runtimeConfig = useRuntimeConfig()

const INTERNAL_MEDIA_HOSTS = new Set([
  'backend',
  'backend:8000',
  'localhost',
  'localhost:3000',
  'localhost:8000',
  '127.0.0.1',
  '127.0.0.1:3000',
  '127.0.0.1:8000',
])

const mediaOrigin = computed(() => {
  const candidates = [runtimeConfig.public?.siteDomain, runtimeConfig.public?.apiBaseUrl]
  for (const raw of candidates) {
    if (!raw) continue
    try {
      const url = new URL(raw)
      return `${url.protocol}//${url.host}`
    } catch (error) {
      // ignore invalid candidate
    }
  }
  if (process.client && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
})

const showImagesEnabled = computed(() => {
  const menu = props.menu || {}
  if (typeof menu.show_images === 'boolean') return menu.show_images
  if (typeof menu.pictureless === 'boolean') return !menu.pictureless
  return true
})
const menuWidthClass = computed(() => (showImagesEnabled.value ? 'menu-shell--wide' : 'menu-shell--compact'))

// Get sections directly from menu.sections
// The API/mock data structure has sections at the top level
const sections = computed(() => {
  if (!props.menu || !Array.isArray(props.menu.sections)) {
    return []
  }
  return props.menu.sections
    .map((section) => {
      if (!section || typeof section !== 'object') return null
      const items = Array.isArray(section.items) ? section.items.filter((item) => item && item.name) : []
      return {
        ...section,
        items,
        is_main_section: section?.is_main_section !== false,
      }
    })
    .filter((section) => section && Array.isArray(section.items) && section.items.length > 0)
})

const isSideSection = (section) => section?.is_main_section === false

function openItemMedia(item, section) {
  if (!showMedia(item, section)) return
  selectedMedia.value = {
    image: resolveImageSrc(item),
    video: resolveVideoSrc(item),
    alt: resolveItemAlt(item),
  }
}

function showMedia(item, section) {
  if (isSideSection(section)) return false
  if (!showImagesEnabled.value) return false
  return !!resolveImageSrc(item)
}

function extractMediaValue(item, key = 'image') {
  if (!item) return ''
  const media = item[key]
  if (!media) return ''
  if (typeof media === 'string') return media
  if (typeof media === 'object') return media.src || media.url || media.path || ''
  return ''
}

function resolveImageSrc(item) {
  const raw = extractMediaValue(item, 'image')
  return normalizeMediaUrl(raw)
}

function resolveVideoSrc(item) {
  const raw = extractMediaValue(item, 'video')
  return normalizeMediaUrl(raw)
}

function resolveItemAlt(item) {
  if (!item || !item.name) return ''
  if (typeof item.name === 'string') return item.name
  if (typeof item.name === 'object') {
    return item.name.en || item.name.fa || ''
  }
  return ''
}

// Helper to read localized field (expects object with { fa, en })
function translateCopy(obj) {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  if (typeof obj !== 'object') return ''
  const value = obj[currentLang.value] || obj['fa'] || obj['en'] || ''
  return String(value)
}

function normalizeMediaUrl(raw) {
  const value = (raw || '').trim()
  if (!value) return ''

  if (value.startsWith('data:')) return value
  if (value.startsWith('//')) return `https:${value}`

  const baseOrigin = mediaOrigin.value

  try {
    const parsed = new URL(value)
    const hostWithPort = parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.hostname
    const baseUrl = baseOrigin ? new URL(baseOrigin) : null
    const baseHost = baseUrl ? (baseUrl.port ? `${baseUrl.hostname}:${baseUrl.port}` : baseUrl.hostname) : ''

    if (
      baseUrl &&
      (INTERNAL_MEDIA_HOSTS.has(hostWithPort) || (parsed.protocol === 'http:' && hostWithPort === baseHost && baseOrigin.startsWith('https://')))
    ) {
      parsed.protocol = baseUrl.protocol
      parsed.hostname = baseUrl.hostname
      parsed.port = baseUrl.port
      return parsed.toString()
    }

    return parsed.toString()
  } catch (error) {
    // not an absolute URL; fall through to relative handling
  }

  if (!baseOrigin) return value

  try {
    const normalizedPath = value.startsWith('/') ? value : `/${value}`
    return new URL(normalizedPath, baseOrigin).toString()
  } catch (error) {
    return value
  }
}
</script>

<style scoped>
/* Keep menu width consistent even when loaded directly without parent padding. */
.menu-shell {
  --menu-max-width: 70rem;
  width: 100%;
  max-width: min(var(--menu-max-width), calc(100% - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)));
  margin: 0 auto;
  padding: 1.25rem max(env(safe-area-inset-left, 0px), 1rem) 0 max(env(safe-area-inset-right, 0px), 1rem);
  box-sizing: border-box;
}

.menu-shell--wide { --menu-max-width: 72rem; }
.menu-shell--compact { --menu-max-width: 66rem; }

@media (min-width: 768px) {
  .menu-shell {
    padding-left: max(env(safe-area-inset-left, 0px), 1.75rem);
    padding-right: max(env(safe-area-inset-right, 0px), 1.75rem);
  }
}

@media (min-width: 1024px) {
  .menu-shell {
    padding-left: clamp(1.75rem, 4vw, 2.75rem);
    padding-right: clamp(1.75rem, 4vw, 2.75rem);
  }
}

.menu-section-title {
  font-size: clamp(1.9rem, 3vw, 2.15rem);
  font-weight: var(--font-weight-strong, 650);
  letter-spacing: 0.06em;
  line-height: 1.1;
  margin-bottom: 0.5rem;
}
[dir="rtl"] .menu-section-title { letter-spacing: 0.025em; }

.menu-item-name {
  font-size: clamp(1.2rem, 2.4vw, 1.45rem);
  font-weight: var(--font-weight-strong, 650);
  line-height: 1.25;
}

.menu-price {
  font-size: clamp(1.05rem, 1.8vw, 1.2rem);
  font-weight: var(--font-weight-strong, 650);
}

.menu-description {
  font-size: 1rem;
  line-height: 1.6;
}

@media (min-width: 768px) {
  .menu-description { font-size: 1.05rem; }
}

.menu-section--side {
  padding-bottom: 1.5rem;
  margin-bottom: 1.25rem;
}

.menu-section--side .menu-section-title {
  font-size: clamp(1.35rem, 2.6vw, 1.65rem);
  margin-bottom: 0.35rem;
}

.menu-section--side .menu-grid {
  gap: 0.35rem;
}

.menu-item-card--side {
  padding-left: 0;
  padding-right: 0;
}

@media (min-width: 768px) {
  .menu-item-card--side {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}

.menu-item-card--side .menu-item-layout {
  gap: 0.65rem;
}

.menu-item-card--side .menu-item-name {
  font-size: clamp(1.05rem, 1.8vw, 1.2rem);
}

.menu-item-card--side .menu-price {
  font-size: clamp(0.95rem, 1.6vw, 1.05rem);
}

.menu-item-card--side .menu-description {
  font-size: 0.95rem;
  line-height: 1.5;
}

.menu-item-card--side .menu-item-body {
  margin-bottom: 0.5rem;
}

.menu-item-card--side .menu-item-media {
  display: none;
}

/* Smooth transitions for interactive elements */
.group {
  transition: all 0.3s ease;
}

.shadow-sm { box-shadow: 0 0.0625rem 0.1875rem rgba(0,0,0,0.06); }

</style>
