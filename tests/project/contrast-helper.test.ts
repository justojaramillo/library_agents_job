import { describe, expect, it } from "vitest";
import { contrastRatio, hexToRgb, relativeLuminance } from "../helpers/contrast";

describe("Cálculo de contraste WCAG (helper de pruebas)", () => {
  it("negro sobre blanco da el contraste máximo, 21", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
  });

  it("blanco sobre blanco da el contraste mínimo, 1", () => {
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("no depende del orden de los colores", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(contrastRatio("#000000", "#FFFFFF"), 10);
  });

  it("gris #777777 sobre blanco da el valor conocido de 4,48", () => {
    expect(contrastRatio("#777777", "#FFFFFF")).toBeCloseTo(4.48, 2);
  });

  it("acepta hexadecimales en mayúsculas y en minúsculas", () => {
    expect(contrastRatio("#1d4ed8", "#ffffff")).toBeCloseTo(contrastRatio("#1D4ED8", "#FFFFFF"), 10);
  });

  it("la luminancia del negro es 0 y la del blanco es 1", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 10);
  });

  it("separa los canales rojo, verde y azul", () => {
    expect(hexToRgb("#0F172A")).toEqual({ red: 15, green: 23, blue: 42 });
  });

  it("rechaza un color que no sea #RRGGBB", () => {
    expect(() => hexToRgb("#abc")).toThrow();
    expect(() => hexToRgb("azul")).toThrow();
  });
});
