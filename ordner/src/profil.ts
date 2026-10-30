// A layout profile: how one company's paper looks. The values come from `Firmendaten`, the look from here, so a second
// test company in step 18 needs a new profile and no new code. It must never be tuned on while it is held back.

export interface Profil {
  id: string;
  /** Font of the company's printed forms. */
  formular: "Courier Prime" | "Arimo";
  /** Handwriting of the people filling them in, picked per document. */
  haende: { schrift: "Reenie Beanie" | "Nothing You Could Do"; groesse: number }[];
  tinte: string;
  /** Strongest slant of a scanned sheet, in degrees. */
  schraeglage: number;
  /** Mixed into every document's seed, so the same company always gives the same folder. */
  saat: number;
}

export const KRONFELD: Profil = {
  id: "kronfeld",
  formular: "Courier Prime",
  haende: [
    { schrift: "Reenie Beanie", groesse: 1.9 },
    { schrift: "Nothing You Could Do", groesse: 1.3 },
  ],
  tinte: "#1d3a8f",
  schraeglage: 0.75,
  saat: 7,
};
