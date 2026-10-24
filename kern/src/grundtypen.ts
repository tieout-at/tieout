// Base types of the core. Amounts are always whole cents, rates basis points (1 % = 100 bp),
// quantities and hours hundredths of their unit (86 Stk = 8600, 12 h = 1200). Everything is net.

export type Cent = number;
export type Bp = number;
/** Quantity or hours in hundredths of the unit. */
export type Hundertstel = number;
/** Date as ISO text "YYYY-MM-DD". */
export type Datum = string;
/** Point in time as ISO text "YYYY-MM-DDThh:mm". */
export type Zeitpunkt = string;

export type Einheit = "Stk" | "m" | "m²" | "psch" | "h";
