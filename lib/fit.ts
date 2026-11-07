/**
 * Scale a single-line element's font-size so its rendered width equals its container width.
 * Measures at a fixed base size, then sets the exact size. Call again on resize / font load.
 */
export function fitToWidth(el: HTMLElement, container: HTMLElement, base = 100): number {
  el.style.fontSize = `${base}px`;
  const natural = el.scrollWidth || el.getBoundingClientRect().width;
  const target = container.clientWidth;
  if (!natural || !target) return base;
  const size = (target / natural) * base;
  el.style.fontSize = `${size}px`;
  return size;
}
