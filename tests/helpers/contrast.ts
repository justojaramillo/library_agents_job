/** Contraste de color según WCAG 2.1 (https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio). */

export type Rgb = { red: number; green: number; blue: number };

const HEX_COLOR = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;

/** Convierte «#RRGGBB» (mayúsculas o minúsculas) en canales de 0 a 255. */
export function hexToRgb(hex: string): Rgb {
  const match = HEX_COLOR.exec(hex);
  if (!match) {
    throw new Error(`Color hexadecimal inválido: ${hex}`);
  }
  return {
    red: parseInt(match[1], 16),
    green: parseInt(match[2], 16),
    blue: parseInt(match[3], 16),
  };
}

/** Pasa un canal sRGB de 0-255 a su valor lineal, como pide la fórmula de luminancia. */
function linearChannel(channel: number): number {
  const proportion = channel / 255;
  if (proportion <= 0.03928) {
    return proportion / 12.92;
  }
  return Math.pow((proportion + 0.055) / 1.055, 2.4);
}

/** Luminancia relativa: 0 es negro absoluto y 1 es blanco absoluto. */
export function relativeLuminance(hex: string): number {
  const { red, green, blue } = hexToRgb(hex);
  return 0.2126 * linearChannel(red) + 0.7152 * linearChannel(green) + 0.0722 * linearChannel(blue);
}

/** Razón de contraste entre dos colores, de 1 (iguales) a 21 (negro sobre blanco). No depende del orden. */
export function contrastRatio(firstHex: string, secondHex: string): number {
  const first = relativeLuminance(firstHex);
  const second = relativeLuminance(secondHex);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}
