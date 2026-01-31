<template>
  <div class="min-h-screen brand-surface brand-surface--madi flex flex-col items-center py-8 w-full">
    <div class="content-shell content-shell--flush w-full relative overflow-hidden">
      <StructuredMenu :menu="menu" />
      <div
        v-if="!hasSections"
        class="absolute inset-0 flex items-center justify-center px-6 py-10 bg-white/85 backdrop-blur-[2px] text-center"
      >
        <div class="space-y-4">
          <p class="text-base md:text-lg font-medium text-slate-900">
            <span v-if="pending">{{ translateState('loading') }}</span>
            <span v-else-if="error">{{ translateState('error') }}</span>
            <span v-else>{{ translateState('empty') }}</span>
          </p>
          <button
            v-if="error"
            type="button"
            class="px-4 py-2 bg-slate-900 text-white text-sm uppercase tracking-wide"
            @click="refresh"
          >
            {{ translateState('retry') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StructuredMenu from '@/components/StructuredMenu.vue'
import { useMenuData } from '~/composables/useMenuData'
import { useLang } from '~/composables/useLang'
import { menuStateCopy } from '~/state/menuStateCopy'

const { data: menu, pending, error, refresh } = await useMenuData('madi-base-menu')

const hasSections = computed(() => {
  const sections = menu.value?.sections
  if (!Array.isArray(sections)) return false
  return sections.some((section) =>
    Array.isArray(section?.items) && section.items.some((item) => item && item.name),
  )
})

const langState = useLang()
const translateState = (key) => menuStateCopy[key]?.[langState.value] ?? menuStateCopy[key]?.en ?? ''
</script>
