// EDIT THESE — placeholders until Alfredo confirms real numbers.
// Nothing here is shown as a final price; the calculator returns pallets +
// an estimate range, and the real number is confirmed by the team.
export const pricing = {
  sqftPerPallet: 450,     // typical big-roll/slab pallet coverage
  wasteBuffer: 0.07,      // 7% for cuts, curves, and waste
  // Price per pallet by grass slug. Set to null to hide pricing entirely.
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
