<template>
  <footer
    class="w-full mt-0 py-10 bg-black/90"
    :dir="isRTL ? 'rtl' : 'ltr'"
    :style="footerSafeArea"
  >
    <div class="max-w-6xl mx-auto px-6 text-sm text-white flex flex-col gap-8">
      <div class="grid gap-6 md:grid-cols-4" :class="isRTL ? 'text-right' : 'text-left'">
        <div class="space-y-2" :class="textClass">
          <p class="footer-heading text-sm uppercase tracking-[0.3em] text-white font-semibold">
            {{ isRTL ? 'میان' : 'Miyan' }}
          </p>
          <p class="text-base leading-relaxed text-white/70 font-normal">
            {{ footerAbout }}
          </p>
        </div>

        <div v-for="section in footerSections" :key="section.key" class="space-y-2" :class="textClass">
          <p class="footer-heading text-sm uppercase tracking-[0.18em] text-white font-semibold">{{ section.title }}</p>
          <ul class="space-y-1.5 text-white/70 font-normal">
            <li v-for="link in section.links" :key="link.label">
              <NuxtLink
                v-if="link.path"
                :to="buildPath(link.path)"
                class="hover:text-white transition-colors"
                :dir="link.dir || (isRTL ? 'rtl' : 'ltr')"
              >
                {{ link.label }}
              </NuxtLink>
              <a
                v-else
                :href="link.href"
                class="hover:text-white transition-colors"
                :dir="link.dir || (isRTL ? 'rtl' : 'ltr')"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex flex-row items-center justify-between gap-4 pt-4 flex-nowrap" dir="ltr">
        <div class="flex flex-col items-start gap-0 text-white/80 font-cinzel tracking-[0.18em]">
          <span class="font-cinzel text-sm leading-snug">© {{ currentYear }} Miyan Group</span>
          <a
            class="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[0.7rem] leading-snug"
            :dir="isRTL ? 'rtl' : 'ltr'"
            href="https://www.linkedin.com/in/hosseinsaeidi/"
            target="_blank"
            rel="noopener"
          >
            <span class="footer-heading font-cinzel font-medium text-[0.7rem] uppercase tracking-[0.18em]">Nous Design</span>
          </a>
        </div>

        <div class="flex items-center gap-2 flex-nowrap">
          <button
            @click.prevent="changeLang('fa')"
            :class="['px-2 py-1 rounded-none text-xs tracking-wide', lang === 'fa' ? 'bg-white text-black font-semibold' : 'text-white/70']"
          >
            FA
          </button>
          <button
            @click.prevent="changeLang('en')"
            :class="['px-2 py-1 rounded-none text-xs tracking-wide', lang === 'en' ? 'bg-white text-black font-semibold' : 'text-white/70']"
          >
            EN
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLang, setLang } from '~/composables/useLang'
import { footerCopy } from '@/state/siteCopy'

const router = useRouter()
const route = useRoute()
const langState = useLang()
const lang = computed(() => langState.value)
const isRTL = computed(() => lang.value === 'fa')
const currentYear = new Date().getFullYear()
const footerSafeArea = {
  paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)',
  paddingLeft: 'env(safe-area-inset-left)',
  paddingRight: 'env(safe-area-inset-right)',
}
const textClass = computed(() => (isRTL.value ? 'font-b-titr text-right leading-relaxed' : 'font-sans text-left leading-relaxed'))

const footerAbout = computed(() => (isRTL.value ? footerCopy.about.fa : footerCopy.about.en))

const footerSections = computed(() =>
  (footerCopy.sections || []).map((section) => ({
    key: section.key,
    title: isRTL.value ? section.title.fa : section.title.en,
    links: (section.links || []).map((link) => ({
      ...link,
      label: isRTL.value ? link.label.fa : link.label.en,
    })),
  }))
)

const buildPath = (slug = '') => {
  const normalized = slug.replace(/^\/+|\/+$/g, '')
  const currentLang = lang.value || 'fa'
  return normalized ? `/${currentLang}/${normalized}` : `/${currentLang}/`
}

function changeLang(l) {
  if (lang.value === l) return
  setLang(l)

  const segments = route.fullPath.split('/').filter(Boolean)
  if (segments[0] === 'en' || segments[0] === 'fa') {
    segments.shift()
  }

  const suffix = segments.length ? `/${segments.join('/')}` : '/'
  const newPath = `/${l}${suffix}`.replace(/\/+$/, '/')
  router.replace(newPath)
}
</script>

<style scoped>
footer {
  background: #000 !important;
  color: #fff;
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.footer-heading {
  position: relative;
  display: inline-block;
  margin: 0;
  padding-top: 0.05rem;
  line-height: 1.1;
  text-decoration-line: overline;
  text-decoration-color: rgba(255, 255, 255, 0.9);
  text-decoration-thickness: 1px;
  text-decoration-style: solid;
  text-decoration-skip-ink: auto;
}

/* Landscape: extend footer to use full device width */
@media (orientation: landscape) {
  footer {
    margin-left: calc(env(safe-area-inset-left, 0px) * -1);
    margin-right: calc(env(safe-area-inset-right, 0px) * -1);
    width: calc(100% + env(safe-area-inset-left, 0px) + env(safe-area-inset-right, 0px));
    max-width: calc(100% + env(safe-area-inset-left, 0px) + env(safe-area-inset-right, 0px));
  }
}
</style>
