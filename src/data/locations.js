// The four farms. `street`/`city`/`zip` are the postal address Google matches
// against the Google Business Profile - the single strongest local-search
// signal a site carries - so they also feed the PostalAddress blocks in the
// LocalBusiness schema. Keep them identical to the Business Profile, down to
// the abbreviation: "Rd" in one place and "Road" in the other reads to Google
// as two different addresses.
//
// Ravenna is the primary address, the one used for the business as a whole.
export const locations = [
  {
    slug: 'ravenna',
    street: '5186 FM 274',
    city: 'Ravenna',
    zip: '75476',
    primary: true,
    name: 'Ravenna',
    county: 'Fannin County',
    blurb:
      'Our Fannin County fields serve the northeast side of the metro and the rural corridor toward Bonham and Sherman.',
  },
  {
    slug: 'ivanhoe',
    street: '1664 CR 2225',
    city: 'Ivanhoe',
    zip: '75447',
    name: 'Ivanhoe',
    county: 'Fannin County',
    blurb:
      'Ivanhoe acreage supports large-volume Bermuda orders and builder-lot schedules across North Texas.',
  },
  {
    slug: 'collinsville',
    street: '2095 Batey Rd',
    city: 'Collinsville',
    zip: '76233',  // ZIP not on the contact card; Batey Rd is 76233, Grayson County - confirm against the Business Profile
    name: 'Collinsville',
    county: 'Grayson County',
    blurb:
      'Collinsville covers the north metro, Denton County growth corridor, and the US-75 delivery lane.',
  },
  {
    slug: 'ferris',
    street: '621 Wolf Springs Rd E',
    city: 'Ferris',
    zip: '75125',
    name: 'Ferris',
    county: 'Ellis County',
    blurb:
      'Ferris anchors deliveries south of Dallas, serving Ellis County and the southern half of the metroplex.',
  },
];
