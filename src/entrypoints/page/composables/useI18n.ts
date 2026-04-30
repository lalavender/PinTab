export function useI18n() {
  function t(key: string): string {
    return browser.i18n.getMessage(key as any)
  }

  return { t }
}
