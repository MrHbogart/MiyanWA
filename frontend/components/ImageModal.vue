<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="shouldRender"
        class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click="emitClose"
      >
        <div class="modal-frame">
          <div class="media-shell">
            <img
              v-if="hasImage"
              :src="effectiveImageSrc"
              :alt="imageAlt"
              class="media-item"
              :class="{ 'media-item--hidden': shouldShowVideo }"
              loading="lazy"
              decoding="async"
            />

            <img
              v-if="isGifVideo && hasAnimatedImage"
              :src="gifPlaybackSrc"
              :alt="imageAlt"
              class="media-item"
              :class="{ 'media-item--hidden': !shouldShowVideo }"
              decoding="async"
            />

            <video
              v-else-if="hasVideoAsset"
              ref="videoRef"
              :src="effectiveVideoSrc"
              :poster="effectiveImageSrc"
              class="media-item"
              :class="{ 'media-item--hidden': !shouldShowVideo }"
              playsinline
              preload="auto"
              muted
              @ended="handleVideoEnded"
              @loadeddata="handleVideoLoaded"
              @canplay="handleVideoCanPlay"
            ></video>

            <div v-if="videoLoading && !isGifVideo" class="media-overlay">
              <span class="media-spinner" aria-hidden="true"></span>
              <p class="text-xs tracking-wide uppercase">Loading video…</p>
            </div>

            <button
              v-if="canManuallyTriggerVideo"
              type="button"
              class="play-overlay"
              @click.stop="attemptVideoPlayback(true)"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  imageSrc: {
    type: String,
    default: '',
  },
  imageAlt: {
    type: String,
    default: '',
  },
  videoSrc: {
    type: String,
    default: '',
  },
  autoplayDelay: {
    type: Number,
    default: 2000,
  },
  videoTimeout: {
    type: Number,
    default: 10000,
  },
})

const emit = defineEmits(['close'])
const videoRef = ref(null)
const showVideo = ref(false)
const videoLoading = ref(false)
const canManuallyTriggerVideo = ref(false)
const minDelayElapsed = ref(false)
const waitingForCanPlay = ref(false)
let autoplayTimer = null
let timeoutTimer = null
let interactionCleanup = null

const isGifVideo = computed(() => (props.videoSrc || '').trim().toLowerCase().endsWith('.gif'))
const effectiveImageSrc = computed(() => props.imageSrc || (isGifVideo.value ? props.videoSrc : ''))
const gifPlaybackSrc = computed(() => (isGifVideo.value ? props.videoSrc : ''))
const effectiveVideoSrc = computed(() => (isGifVideo.value ? '' : props.videoSrc))

const hasImage = computed(() => !!effectiveImageSrc.value)
const hasAnimatedImage = computed(() => !!gifPlaybackSrc.value)
const hasVideoAsset = computed(() => !!effectiveVideoSrc.value || isGifVideo.value)
const shouldRender = computed(() => props.show && (hasImage.value || hasVideoAsset.value))
const shouldShowVideo = computed(() => showVideo.value && hasVideoAsset.value)
let previousOverflow = ''
let previousBodyOverflow = ''
let previousThemeColor = ''

function ensureThemeMeta() {
  if (typeof document === 'undefined') return null
  let m = document.querySelector('meta[name="theme-color"]')
  if (!m) {
    m = document.createElement('meta')
    m.setAttribute('name', 'theme-color')
    document.head.appendChild(m)
  }
  return m
}

function setThemeColor(color) {
  const meta = ensureThemeMeta()
  if (!meta) return
  try {
    meta.setAttribute('content', color)
  } catch (e) {
    // ignore
  }
}

function emitClose() {
  emit('close')
}

function stopTimers() {
  if (autoplayTimer) {
    clearTimeout(autoplayTimer)
    autoplayTimer = null
  }
  if (timeoutTimer) {
    clearTimeout(timeoutTimer)
    timeoutTimer = null
  }
}

function resetVideoState() {
  showVideo.value = false
  videoLoading.value = false
  canManuallyTriggerVideo.value = false
  minDelayElapsed.value = false
  waitingForCanPlay.value = false
  const el = videoRef.value
  if (el) {
    try {
      el.pause()
      el.currentTime = 0
    } catch (error) {
      // ignore seek errors
    }
  }
}

function onScrollClose() {
  emit('close')
}

function onKey(event) {
  if (event.key === 'Escape') emit('close')
}

function attachGlobalInteractions() {
  if (interactionCleanup) return
  const close = () => emit('close')
  const onClick = () => close()
  const onTouch = () => close()
  const onWheel = () => close()
  const onScroll = () => close()

  window.addEventListener('click', onClick, { passive: true })
  window.addEventListener('touchstart', onTouch, { passive: true })
  window.addEventListener('wheel', onWheel, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })

  interactionCleanup = () => {
    window.removeEventListener('click', onClick)
    window.removeEventListener('touchstart', onTouch)
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('scroll', onScroll)
    interactionCleanup = null
  }
}

async function attemptVideoPlayback(manual = false) {
  if (showVideo.value) return
  if (!manual && !minDelayElapsed.value) return

  if (isGifVideo.value) {
    showVideo.value = true
    videoLoading.value = false
    canManuallyTriggerVideo.value = false
    return
  }

  if (!effectiveVideoSrc.value || !videoRef.value) return

  const ready = videoRef.value.readyState >= 2
  if (!ready) {
    waitingForCanPlay.value = true
    videoLoading.value = true
    return
  }

  stopTimers()
  videoLoading.value = true
  canManuallyTriggerVideo.value = false
  waitingForCanPlay.value = false

  try {
    videoRef.value.currentTime = 0
  } catch (error) {
    // ignore
  }

  try {
    await videoRef.value.play()
    videoLoading.value = false
    showVideo.value = true
    timeoutTimer = setTimeout(() => {
      handleVideoEnded()
    }, props.videoTimeout)
  } catch (error) {
    videoLoading.value = false
    showVideo.value = false
    if (!manual) {
      canManuallyTriggerVideo.value = true
    } else {
      console.warn('Video playback failed', error)
    }
  }
}

function prepareVideo() {
  if (!effectiveVideoSrc.value || !videoRef.value || isGifVideo.value) return
  try {
    videoRef.value.load()
  } catch (error) {
    // ignore load errors
  }
}

function handleVideoLoaded() {
  if (timeoutTimer) {
    clearTimeout(timeoutTimer)
    timeoutTimer = null
  }
}

function handleVideoCanPlay() {
  if (!effectiveVideoSrc.value || isGifVideo.value) return
  if (minDelayElapsed.value) {
    attemptVideoPlayback(false)
  } else {
    waitingForCanPlay.value = true
  }
}

function handleVideoEnded() {
  stopTimers()
  resetVideoState()
}

function scheduleAutoplay() {
  if (!hasVideoAsset.value) return
  stopTimers()
  minDelayElapsed.value = false
  waitingForCanPlay.value = false
  autoplayTimer = setTimeout(() => {
    minDelayElapsed.value = true
    attemptVideoPlayback(false)
  }, props.autoplayDelay)
}

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      if (typeof document !== 'undefined') {
        previousOverflow = document.documentElement.style.overflow
        previousBodyOverflow = document.body?.style?.overflow || ''
        document.documentElement.style.overflow = 'hidden'
        if (document.body) document.body.style.overflow = 'hidden'
        const meta = ensureThemeMeta()
        previousThemeColor = meta?.getAttribute('content') || ''
        setThemeColor('#000000')
      }
      resetVideoState()
      requestAnimationFrame(() => {
        attachGlobalInteractions()
      })
      if (hasVideoAsset.value) {
        if (!isGifVideo.value) {
          prepareVideo()
        }
        scheduleAutoplay()
      }
    } else {
      stopTimers()
      resetVideoState()
      if (interactionCleanup) interactionCleanup()
      if (typeof document !== 'undefined') {
        document.documentElement.style.overflow = previousOverflow || ''
        if (document.body) document.body.style.overflow = previousBodyOverflow || ''
        if (previousThemeColor) {
          setThemeColor(previousThemeColor)
          previousThemeColor = ''
        }
      }
    }
  },
  { immediate: true }
)

watch(
  () => [effectiveVideoSrc.value, gifPlaybackSrc.value],
  () => {
    if (props.show) {
      resetVideoState()
      if (hasVideoAsset.value) {
        if (!isGifVideo.value) {
          prepareVideo()
        }
        scheduleAutoplay()
      }
    }
  }
)

onMounted(() => {
  window.addEventListener('scroll', onScrollClose, { passive: true })
  window.addEventListener('touchmove', onScrollClose, { passive: true })
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  stopTimers()
  resetVideoState()
  if (interactionCleanup) interactionCleanup()
  if (typeof document !== 'undefined') {
    document.documentElement.style.overflow = previousOverflow || ''
    if (document.body) document.body.style.overflow = previousBodyOverflow || ''
  }
  if (previousThemeColor) {
    setThemeColor(previousThemeColor)
    previousThemeColor = ''
  }
  window.removeEventListener('scroll', onScrollClose)
  window.removeEventListener('touchmove', onScrollClose)
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.modal-overlay {
  inset: 0;
  top: 0;
  left: 0;
  right: 0;
  width: 100vw;
  max-width: 100vw;
  height: calc(var(--app-vh, var(--vh, 1vh)) * 100);
  min-height: calc(var(--app-vh, var(--vh, 1vh)) * 100);
  max-height: calc(var(--app-vh, var(--vh, 1vh)) * 100);
  padding: 0;
  transition: width 450ms ease, height 450ms ease, transform 450ms ease;
  will-change: width, height, transform;
}

@supports (width: 100dvw) {
  .modal-overlay {
    width: calc(var(--app-vw, var(--vw, 1vw)) * 100);
    max-width: calc(var(--app-vw, var(--vw, 1vw)) * 100);
  }
}

@supports (height: 100dvh) {
  .modal-overlay {
    height: 100dvh;
    min-height: 100dvh;
    max-height: 100dvh;
  }
}

.modal-frame {
  width: 100%;
  max-width: 100%;
  height: calc(var(--app-vh, var(--vh, 1vh)) * 100);
  max-height: calc(var(--app-vh, var(--vh, 1vh)) * 100);
  min-height: calc(var(--app-vh, var(--vh, 1vh)) * 100);
  padding: clamp(0.75rem, 2vw, 1.25rem);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 450ms ease, height 450ms ease, padding 450ms ease;
  will-change: width, height, padding;
}

.media-shell {
  position: relative;
  display: block;
  width: 100%;
  max-width: 100%;
  height: calc(var(--app-vh, var(--vh, 1vh)) * 100);
  max-height: calc(var(--app-vh, var(--vh, 1vh)) * 100);
  padding: 0;
  border-radius: 0;
  overflow: hidden;
  background: transparent;
  box-shadow: none;
  transition: width 450ms ease, height 450ms ease;
  will-change: width, height;
}

.media-item {
  position: absolute;
  inset: 0;
  margin: auto;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  transition: opacity 0.3s ease, transform 450ms ease;
  display: block;
}

.media-item--hidden {
  opacity: 0;
  pointer-events: none;
}

.media-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-family: var(--font-base), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.media-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0;
  border: 0.25rem solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
  text-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.5);
  transition: background 0.2s ease;
}

.play-overlay:hover {
  background: rgba(0, 0, 0, 0.55);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .media-shell {
    width: 90vw;
    max-width: 90vw;
    height: min(calc(var(--vh, 1vh) * 70), 70vh);
    max-height: min(calc(var(--vh, 1vh) * 70), 70vh);
    padding: 0;
  }

  .media-item {
    max-height: 100%;
    width: auto;
  }
}
</style>
