// Pallet math, prices and delivery zones for the sod calculator.
//
// sqftPerPallet is CONFIRMED: the original site used 450 and labelled it
// "1 pallet ≈ 450 sq ft". Recovered from the Manus bundle before the move.
//
// The rates below came off the published Manus site (captured 2026-08-13) and
// were confirmed still current by Alfredo on 2026-11-06 before being switched
// on. perPallet is perSqFt * 450 and must stay consistent with it - the grass
// pages show both numbers side by side, so a mismatch is visible to customers.
//
// Setting a grass's entry to null hides its price everywhere - the grass page,
// the index card, the calculator and the Product schema all check for it - so
// a variety that is out of stock or quoted individually can be switched off on
// its own without touching anything else.
export const pricing = {
  sqftPerPallet: 450,
  wasteBuffer: 0.07,      // original site offered 5–10%; 7% sits mid-range
  currency: 'USD',
  rates: {
    'bermuda-419':  { perSqFt: 0.63, perPallet: 283.50 },
    'celebration':  { perSqFt: 0.58, perPallet: 261.00 },
    'ironcutter':   { perSqFt: 0.94, perPallet: 423.00 },
    'st-augustine': { perSqFt: 1.65, perPallet: 742.50 },
    'tahoma-31':    { perSqFt: 0.84, perPallet: 378.00 },
    'zeon-zoysia':  { perSqFt: 1.80, perPallet: 810.00 },
  },
  deliveryZones: [
    { id: 'farm-pickup', label: 'Pick up at the farm', note: 'No delivery charge' },
    { id: 'zone-1', label: 'Within 30 miles of a farm', note: '' },
    { id: 'zone-2', label: '30–60 miles', note: '' },
    { id: 'zone-3', label: '60+ miles / outside DFW', note: 'Quoted individually' },
  ],
};

// null for a grass with no published price, so callers can test one thing.
export const priceFor = (slug) => pricing.rates[slug] || null;

// Money for display. Whole dollars where the cents are zero, because
// "$810" reads as a price and "$810.00" reads as an invoice.
export const money = (n) =>
  '$' + Number(n).toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2,
    maximumFractionDigits: 2,
  });
