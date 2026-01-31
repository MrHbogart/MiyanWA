export const SUPPORTED_LANGS = ['fa', 'en']
export const SUPPORTED_LANG_SET = new Set(SUPPORTED_LANGS)

export function useLang() {
  return useState('lang', () => 'fa')
}

export function setLang(value) {
  const lang = useLang()
  lang.value = value
}
