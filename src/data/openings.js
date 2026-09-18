// Default open roles.
//
// These render server-side, so they are in the HTML for search engines and work
// with JavaScript off. Roles posted from /admin are served by /api/openings and
// replace this list at runtime — so day-to-day posting and closing still needs
// no code change. Edit here when the standing roles themselves change.
//
// A role with a `slug` and `sections` also gets its own page at
// /careers/<slug>/, which is the link to hand out when advertising the job.
// A role without them links straight to the application form.
export const openings = [
  {
    title: 'CDL Driver / Delivery',
    type: 'Full-time',
    summary:
      'Run fresh-cut pallets from our farms to job sites across Dallas-Fort Worth. Valid CDL required.',
  },
  {
    title: 'Farm Office Administrator',
    slug: 'farm-office-administrator',
    type: 'Full-time',
    location: 'Fannin County',
    summary:
      'Order entry, delivery scheduling, and customer calls — the person who keeps the paperwork and the routes straight.',
    about:
      'Buena Vista Turf Farm is a growing agricultural operation seeking a detail-oriented Office Administrator to support our farm team and operations.',
    sections: [
      {
        heading: 'Office & facility management',
        items: [
          'Maintain clean, organized, and dust-free office environment',
          'Keep exterior grounds free of debris and maintain landscaping',
          'Monitor and manage office safety and compliance standards',
        ],
      },
      {
        heading: 'Communication & coordination',
        items: [
          'Handle phone transfers to main office',
          'Facilitate daily coordination between office, field leaders, farm management, and driving operations',
          'Serve as communication hub for farm operations',
        ],
      },
      {
        heading: 'Inventory & assets',
        items: [
          'Track and manage office key distribution system',
          'Monitor company credit card usage and accountability',
          'Coordinate equipment inventory oversight',
          'Maintain vehicle documentation (insurance, registrations, permits)',
        ],
      },
      {
        heading: 'Personnel administration',
        items: [
          'Process new hire employment documents and identity verification',
          'Monitor employee time records and attendance accuracy',
          'Process time-off requests and payroll coordination',
          'Manage exit procedures and equipment/uniform returns',
          'Oversee employee recognition programs and celebrations',
          'Coordinate employee housing maintenance and inspections',
          'Manage uniform ordering and vendor coordination',
        ],
      },
      {
        heading: 'Fleet & safety',
        items: [
          'Verify driver completion of daily inspection reports',
          'Coordinate driver safety equipment (hard hats, vests, etc.)',
          'Manage vehicle transportation documentation',
          'Handle accident reporting and documentation',
        ],
      },
      {
        heading: 'Operational support',
        items: [
          'Process and coordinate customer order fulfillment',
          'Manage order documentation and communication',
          'Process vendor invoices and expense tracking',
          'Track mileage reimbursement for personal vehicle use',
        ],
      },
    ],
    requirements: [
      'Strong organizational and multitasking skills',
      'Proficiency with office software and databases',
      'Excellent communication abilities',
      'Attention to detail',
      'Ability to work independently and collaboratively',
    ],
    notes: ['No smoking or pets permitted in office.'],
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
