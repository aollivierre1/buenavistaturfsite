// Pallet math and delivery zones for the sod calculator.
//
// sqftPerPallet is CONFIRMED: the original site used 450 and labelled it
// "1 pallet ≈ 450 sq ft". Recovered from the Manus bundle before the move.
//
// Prices stay null — the calculator returns pallets and an estimate range,
// and the team confirms the real number. See recoveredPricing below before
// turning any of this on.
export const pricing = {
  sqftPerPallet: 450,
  wasteBuffer: 0.07,      // original site offered 5–10%; 7% sits mid-range
  // Price per pallet by grass slug. null hides pricing entirely.
  perPallet: {
    'bermuda-419': null,
    'celebration': null,
    'ironcutter': null,
    'st-augustine': null,
    'tahoma-31': null,
    'zeon-zoysia': null,
  },
  deliveryZones: [
    { id: 'farm-pickup', label: 'Pick up at the farm', note: 'No delivery charge' },
    { id: 'zone-1', label: 'Within 30 miles of a farm', note: '' },
    { id: 'zone-2', label: '30–60 miles', note: '' },
    { id: 'zone-3', label: '60+ miles / outside DFW', note: 'Quoted individually' },
  ],
};

// REFERENCE ONLY — NOT WIRED UP.
//
// These are the per-square-foot rates the old Manus site published. They are
// recovered history, not confirmed current pricing, so nothing reads this.
// Alfredo: confirm these are still right, then copy the perPallet column into
// pricing.perPallet above to switch pricing on.
//
// perPallet is perSqFt * 450.
export const recoveredPricing = {
  source: 'buenavistaturf.com Manus build, captured 2026-08-13',
  rates: {
    'bermuda-419':  { perSqFt: 0.63, perPallet: 283.50 },
    'celebration':  { perSqFt: 0.58, perPallet: 261.00 },
    'ironcutter':   { perSqFt: 0.94, perPallet: 423.00 },
    'st-augustine': { perSqFt: 1.65, perPallet: 742.50 },
    'tahoma-31':    { perSqFt: 0.84, perPallet: 378.00 },
    'zeon-zoysia':  { perSqFt: 1.80, perPallet: 810.00 },
  },
};
