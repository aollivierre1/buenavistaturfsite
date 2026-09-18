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

// The Office Administrator posting is the same job at every site, so the write-up
// lives here once and each location reuses it.
const officeAdministrator = {
  title: 'Farm Office Administrator',
  type: 'Full-time',
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
};

export const openings = [
  {
    title: 'CDL Driver / Delivery',
    slug: 'cdl-driver-delivery',
    type: 'Full-time',
    summary:
      'Run fresh-cut pallets from our farms to job sites across Dallas-Fort Worth. Valid CDL required.',
    about:
      'Sod is perishable, so the delivery is part of the product. We are looking for a dependable CDL driver who takes care of the load, the equipment, and the customer’s property.',
    sections: [
      {
        heading: 'Driving & delivery',
        items: [
          'Deliver pallets of fresh-cut sod to homeowner, landscaper, builder, and sports turf job sites',
          'Work to the cut and delivery schedule so sod reaches the customer fresh',
          'Unload safely and place pallets where the crew needs them',
          'Represent the farm well with customers on site',
        ],
      },
      {
        heading: 'Equipment & safety',
        items: [
          'Complete daily vehicle inspection reports',
          'Keep the truck, trailer, and forklift clean and in safe working order',
          'Wear and maintain required safety equipment',
          'Report any accident, damage, or mechanical issue the same day',
        ],
      },
      {
        heading: 'Paperwork',
        items: [
          'Keep delivery tickets and signatures accurate and complete',
          'Keep license, medical card, and vehicle permits current',
        ],
      },
    ],
    requirements: [
      'Valid CDL and a clean driving record',
      'Forklift experience, or willingness to be trained',
      'Able to work outdoors in Texas heat and lift repeatedly',
      'Dependable, on time, and straightforward with customers',
      'Early starts through the growing season',
    ],
  },
  {
    ...officeAdministrator,
    slug: 'farm-office-administrator-fannin-county',
    location: 'Fannin County',
  },
  {
    ...officeAdministrator,
    slug: 'farm-office-administrator-blue-ridge',
    location: 'Blue Ridge',
  },
  {
    title: 'Farm Help',
    slug: 'farm-help',
    type: 'Full-time',
    summary:
      'General field work across our four farms — planting, irrigation, harvest, and keeping the fields and equipment in shape. No experience required; we train.',
    about:
      'Farm help is where most of our long-tenured team started. Show up, work safe, take care of the equipment, and we will train you on the rest.',
    sections: [
      {
        heading: 'Field work',
        items: [
          'Plant, maintain, and harvest turf across our fields',
          'Move and stack pallets of fresh-cut sod for loading',
          'Help with irrigation lines, sprinklers, and watering',
          'Keep fields, roads, and yards clear and in order',
        ],
      },
      {
        heading: 'Equipment',
        items: [
          'Operate farm equipment once trained — mowers, harvesters, tractors, forklifts',
          'Run daily checks and basic upkeep on assigned equipment',
          'Report mechanical problems before they become breakdowns',
        ],
      },
      {
        heading: 'How we work',
        items: [
          'Follow safety procedures on every task',
          'Treat farm property and customer property with the same care',
          'Work as part of a crew and pitch in where the day requires',
        ],
      },
    ],
    requirements: [
      'No experience required — we train',
      'Able to work outdoors in all weather and lift repeatedly',
      'Dependable attendance and reliable transportation',
      'Willing to learn equipment operation',
      'Early starts, and some weekend work through the growing season',
    ],
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
