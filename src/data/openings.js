// Default open roles.
//
// These render server-side, so they are in the HTML for search engines and work
// with JavaScript off. Roles posted from /admin are served by /api/openings and
// replace this list at runtime — so day-to-day posting and closing still needs
// no code change. Edit here when the standing roles themselves change.
export const openings = [
  {
    title: 'CDL Driver / Delivery',
    type: 'Full-time',
    summary:
      'Run fresh-cut pallets from our farms to job sites across Dallas-Fort Worth. Valid CDL required.',
  },
  {
    title: 'Farm Office Administrator',
    type: 'Full-time',
    summary:
      'Order entry, delivery scheduling, and customer calls — the person who keeps the paperwork and the routes straight.',
  },
  {
    title: 'Farm Help',
    type: 'Full-time',
    summary:
      'General field work across our four farms — planting, irrigation, harvest, and keeping the fields and equipment in shape. No experience required; we train.',
  },
];

// Generic interest categories, kept underneath the posted roles so people can
// still apply speculatively.
export const roleCategories = [
  'Field / harvest crew',
  'Equipment operator',
  'CDL driver / delivery',
  'Irrigation',
  'Sales / customer service',
  'Office / administration',
  'Other',
];
