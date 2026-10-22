// Deterministischer Zufall (mulberry32): gleicher Seed, gleicher Datensatz.

export function zufall(seed: number) {
  let a = seed >>> 0;
  const naechste = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    zahl: naechste,
    /** Ganze Zahl zwischen min und max (beide inklusive). */
    ganz: (min: number, max: number) => min + Math.floor(naechste() * (max - min + 1)),
    wahl: <T>(liste: readonly T[]): T => liste[Math.floor(naechste() * liste.length)],
  };
}
