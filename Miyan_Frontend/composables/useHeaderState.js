export function useHeaderHeight() {
  return useState('headerHeight', () => 0)
}

export function useNavAttached() {
  return useState('navAttached', () => false)
}
