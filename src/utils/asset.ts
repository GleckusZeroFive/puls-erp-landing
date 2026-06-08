/**
 * Префиксирует абсолютный путь до static-ассета базовым URL из astro.config.
 * В dev BASE_URL = '/', в проде на GitHub Pages = '/puls-erp-landing/'.
 *
 * Применять для всех ссылок на /figma/..., /logo-*.png и подобные.
 */
export function asset(path: string): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : "/" + path;
  return base + clean;
}
