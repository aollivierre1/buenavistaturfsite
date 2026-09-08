export const site = {
  name: 'Buena Vista Turf Farm',
  shortName: 'Buena Vista Turf',
  phone: '972-226-8873',
  phoneHref: 'tel:+19722268873',
  url: 'https://buenavistaturf.com', // apex is canonical; Netlify redirects www -> apex
  tagline: 'Family-run standards, field-tested quality.',
  description:
    'North Texas sod farm growing Bermuda, Zoysia, and St Augustine turf. Fresh-cut delivery to DFW homeowners, landscapers, builders, and sports turf managers.',
  serviceArea: [
    'Dallas-Fort Worth',
    'Ravenna',
    'Ivanhoe',
    'Collinsville',
    'Ferris',
    'Fannin County',
    'Grayson County',
    'Ellis County',
  ],
};

// Social profiles, recovered from the pre-migration site.
export const socials = [
  { label: 'Facebook',  href: 'https://www.facebook.com/buenallc' },
  { label: 'Instagram', href: 'https://www.instagram.com/bvtfllc/' },
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/company/buena-vista-turf-farm' },
  { label: 'TikTok',    href: 'https://www.tiktok.com/@buenavistaturf' },
  { label: 'YouTube',   href: 'https://www.youtube.com/@therealbuenavistaturf' },
];

// Tracking. Set a value to switch a tag on; leave null and nothing is emitted.
// ga4 was recovered from the pre-migration site — it is the farm's existing
// Google Analytics property, so historical data continues in the same place.
export const analytics = {
  ga4: 'G-BJPY2EFZFB',
  metaPixel: null, // <- put the Meta Pixel ID here (digits only) to enable it
  // The farm's existing Chatbase assistant, recovered from the pre-migration
  // site. Set to null to remove the widget.
  chatbase: 'v7GMh_HXo4aG6EEJzOveu',
};

export const nav = [
  { label: 'About Us', href: '/about-us' },
  { label: 'Grasses', href: '/grasses' },
  { label: 'Turf Tips', href: '/turf-tips' },
  { label: 'Sod Calculator', href: '/quote' },
  { label: 'Blog', href: '/blog' },
  { label: 'Managers Pictures', href: '/managers-pictures' },
  { label: 'Locations', href: '/locations' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact Us', href: '/contact' },
];
