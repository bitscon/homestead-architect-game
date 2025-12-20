/**
 * Calculate medication dosage based on animal weight
 * @param weightLbs - Animal weight in pounds
 * @param dosagePerLb - Dosage per pound from medication
 * @returns Calculated dose amount
 */
export function calculateDosage(weightLbs: number, dosagePerLb: number): number {
  return weightLbs * dosagePerLb;
}

/**
 * Format dosage with unit for display
 * @param dose - Calculated dose amount
 * @param unit - Unit (mg, ml, cc, g, etc.)
 * @returns Formatted dosage string
 */
export function formatDosage(dose: number, unit: string | null): string {
  const roundedDose = Math.round(dose * 100) / 100; // Round to 2 decimals
  return `${roundedDose} ${unit || 'units'}`;
}
