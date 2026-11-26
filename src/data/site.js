export const site = {
  name: 'Buena Vista Turf Farm',
  shortName: 'Buena Vista Turf',
  phone: '972-226-8873',
  phoneHref: 'tel:+19722268873',
  url: 'https://buenavistaturf.com', // apex is canonical; Netlify redirects www -> apex
  tagline: 'Family-run standards, field-tested quality.',
  description:
    'North Texas sod farm growing Bermuda, Zoysia, and St Augustine turf. Fresh-cut delivery to DFW homeowners, landscapers, builders, and sports turf managers.',
  // Office and delivery hours, the same at all four farms. `days`/`opens`/
  // `closes` feed the openingHoursSpecification in the LocalBusiness schema,
  // which is what Google reads for the "Hours" line in a local result, so the
  // 24-hour times matter and the display string is only for people.
  //
  // Sod pickup is BY APPOINTMENT ONLY - these hours are when someone is there,
  // not an invitation to turn up with a trailer. schema.org has no field for
  // that condition, so it travels as visible text on every page that shows the
  // hours rather than as structured data.
  // Seasonal greeting band, above the header on every page. Separate from
  // serviceAlert below on purpose: that one is an amber warning and is the
  // wrong voice entirely for a holiday message.
  //
  // `until` is the day AFTER the last day it should show, and it is enforced
  // twice. The build leaves the band out once the date has passed, and a few
  // lines in Header.astro remove it in the browser as well - because a static
  // site only re-renders when something pushes, and a Thanksgiving greeting
  // still sitting there in December reads as a dead site. The client-side
  // check means it disappears on time whether or not anything deploys.
  //
  // TO TAKE IT DOWN EARLY: set active to false. TO REUSE IT NEXT YEAR: change
  // the message and the dates.
  holiday: {
    active: true,
    message: 'Happy Thanksgiving from all of us at Buena Vista Turf Farm.',
    submessage: 'Thank you for letting us be part of your projects this year.',
    until: '2026-11-30',   // clears on 30 Nov, after the long weekend
  },

  // Site-wide service notice, shown as a band above the header on every page.
  //
  // TO TAKE IT DOWN: set active to false. That is the whole job - nothing else
  // needs touching, and the message text can stay here for the next time.
  //
  // Leave this up only while it is true. A stale outage notice costs more than
  // no notice at all: a customer who reads "we cannot receive email" a week
  // after it was fixed stops trusting anything else the site says.
  serviceAlert: {
    active: false,
    message: 'Buena Vista Turf is currently impacted by a widespread Microsoft outage '
      + 'disrupting Microsoft Outlook and Exchange Online mailboxes. This will impact '
      + 'services and notifications that rely on email communication. Please continue '
      + 'to call in or use live messaging for support needs.',
  },

  // The monday.com form that quote requests and trade account requests both go
  // to. Submissions land directly on the Shawn Lead List board; the website is
  // only showing the form, so there is no Netlify submission, no /admin record
  // and no notification email for these two any more.
  //
  // This is the only public URL monday exposes for the form (its shortener).
  // If the embed renders monday's full page chrome, or refuses to frame, open
  // the form in monday -> Share -> Embed and paste the forms.monday.com URL it
  // gives you here instead. Nothing else needs changing.
  mondayForm: {
    url: 'https://wkf.ms/45BxMlD',
    // Shown as the iframe's accessible name and on the fallback link.
    title: 'Request a quote from Buena Vista Turf Farm',
  },

  // Credentials shown in the trust bar under the hero. These are claims about
  // real organisations made on a public page, so each one has to be true and
  // current: a lapsed membership or a title a year out of date is worse than
  // saying nothing, because a customer who checks finds the error.
  //
  // ALFREDO: confirm the exact wording of the chairman title (chairman vs
  // board chair vs past chairman) and that the TNLA membership is current.
  credentials: [
    {
      label: 'Turfgrass Producers of Texas',
      detail: 'Our CEO serves as Chairman',
      url: 'https://www.texasturf.com/',
    },
    {
      label: 'Texas Nursery & Landscape Association',
      detail: 'Member',
      url: 'https://tnlaonline.org/',
    },
  ],
  hours: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '08:00',
    closes: '17:00',
    display: 'Monday – Friday, 8am – 5pm',
    pickup: 'Sod pickup by appointment only',
  },
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
  pinterest: '905bdc38ac57a1fe54d96c2c4cf4a3d2', // Pinterest domain claim (p:domain_verify)
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
  { label: 'Contractors', href: '/contractors' },
  { label: 'Blog', href: '/blog' },
  { label: 'Managers Pictures', href: '/managers-pictures' },
  { label: 'Locations', href: '/locations' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact Us', href: '/contact' },
];
