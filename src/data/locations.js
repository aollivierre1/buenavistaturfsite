// The four farms. `street`/`city`/`zip` are the postal address Google matches
// against the Google Business Profile - the single strongest local-search
// signal a site carries - so they also feed the PostalAddress blocks in the
// LocalBusiness schema. Keep them identical to the Business Profile, down to
// the abbreviation: "Rd" in one place and "Road" in the other reads to Google
// as two different addresses.
//
// Ravenna is the primary address, the one used for the business as a whole.
//
// `nearby` is the towns each farm's page names as part of its delivery area.
// They are the real geographic neighbours inside the county that farm already
// serves, and they exist so the four location pages differ from one another in
// substance rather than only in the city name - four pages saying the same
// thing with the word swapped is a doorway-page pattern, and Google demotes
// the lot. ALFREDO: these are a service-area claim on a public page, so check
// each list is somewhere that farm genuinely delivers and cut anything it does
// not.
export const locations = [
  {
    slug: 'ravenna',
    nearby: ['Bonham', 'Honey Grove', 'Dodd City', 'Ector', 'Telephone', 'Sherman'],
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
    nearby: ['Bonham', 'Telephone', 'Honey Grove', 'Trenton', 'Ravenna'],
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
    nearby: ['Sherman', 'Van Alstyne', 'Tioga', 'Gunter', 'Whitesboro', 'Pilot Point'],
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
    nearby: ['Waxahachie', 'Ennis', 'Red Oak', 'Palmer', 'Lancaster', 'Midlothian'],
    street: '621 Wolf Springs Rd E',
    city: 'Ferris',
    zip: '75125',
    name: 'Ferris',
    county: 'Ellis County',
    blurb:
      'Ferris anchors deliveries south of Dallas, serving Ellis County and the southern half of the metroplex.',
  },
];
