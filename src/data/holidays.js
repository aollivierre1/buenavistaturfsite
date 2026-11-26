// The holiday greeting band shown above the header.
//
// WHY THE DATES ARE COMPUTED RATHER THAN LISTED: half of these move every
// year - Thanksgiving is the fourth Thursday, Memorial Day the last Monday in
// May, Labor Day the first Monday in September, and Easter moves on a lunar
// calculation. A hand-written list of dates works until somebody forgets to
// add next year's, and then the banners stop appearing with nothing to show
// that anything is wrong. These rules are right every year on their own.
//
// WINDOW: each holiday shows for `days` day(s) and clears at 12:01am Central
// the morning after the last one. `days` defaults to 1, so a holiday shows on
// the day itself; set it higher for one you want to run longer (Christmas at
// `days: 3` from the 23rd, say).
//
// TIMES ARE CENTRAL, deliberately. A bare date is parsed as local time by the
// browser, which would clear the band at each visitor's own midnight rather
// than at one moment. Everything here is anchored to America/Chicago so a
// customer in Dallas and one in New York see it go at the same instant.
//
// TO ADD ONE: append to HOLIDAYS. TO DROP ONE: delete it, or set active:false
// on the whole feature in site.js.

const TZ = 'America/Chicago';

// Minutes the zone is offset from UTC at a given instant. Uses Intl rather
// than a hard-coded -6, because four of these holidays fall inside daylight
// saving and five outside it, and the rules for that are not ours to track.
function zoneOffsetMinutes(date) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p = Object.create(null);
  for (const part of dtf.formatToParts(date)) p[part.type] = part.value;
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  return (asUTC - date.getTime()) / 60000;
}

// The instant at which a given Central wall-clock time occurs. Resolved twice
// because the first guess can land on the wrong side of a DST change and get
// the offset for the wrong moment.
function centralInstant(y, month, day, hh = 0, mm = 0) {
  const wall = Date.UTC(y, month - 1, day, hh, mm);
  let t = wall;
  for (let i = 0; i < 2; i++) t = wall - zoneOffsetMinutes(new Date(t)) * 60000;
  return new Date(t);
}

/** The nth given weekday of a month. weekday: 0=Sun .. 6=Sat. */
function nthWeekday(y, month, weekday, n) {
  const first = new Date(Date.UTC(y, month - 1, 1)).getUTCDay();
  return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
}

/** The last given weekday of a month. */
function lastWeekday(y, month, weekday) {
  const daysInMonth = new Date(Date.UTC(y, month, 0)).getUTCDate();
  const last = new Date(Date.UTC(y, month - 1, daysInMonth)).getUTCDay();
  return daysInMonth - ((last - weekday + 7) % 7);
}

/** Easter Sunday, anonymous Gregorian algorithm. Returns [month, day]. */
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100;
  const d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  return [month, ((h + l - 7 * m + 114) % 31) + 1];
}

// `tone` picks the colour treatment in Header.astro. Four, not nine: a
// different palette per holiday reads as a novelty site, and this one is
// deep green and gold all year.
export const HOLIDAYS = [
  {
    id: 'new-year',
    tone: 'evergreen',
    date: (y) => [1, 1],
    message: 'Happy New Year from Buena Vista Turf Farm.',
    submessage: 'Here is to a good growing season ahead.',
  },
  {
    id: 'texas-independence',
    tone: 'brand',
    date: (y) => [3, 2],
    message: 'Happy Texas Independence Day.',
    submessage: 'Proud to grow Texas grass for Texas yards.',
  },
  {
    id: 'easter',
    tone: 'spring',
    date: (y) => easter(y),
    message: 'Happy Easter from all of us at Buena Vista Turf Farm.',
    submessage: 'Wishing you and your family a good day together.',
  },
  {
    id: 'memorial-day',
    tone: 'patriot',
    date: (y) => [5, lastWeekday(y, 5, 1)],
    message: 'Remembering those who served this Memorial Day.',
    submessage: 'With gratitude from everyone at the farm.',
  },
  {
    id: 'independence-day',
    tone: 'patriot',
    date: (y) => [7, 4],
    message: 'Happy Fourth of July from Buena Vista Turf Farm.',
    submessage: 'Enjoy the day, and the yard you worked for.',
  },
  {
    id: 'labor-day',
    tone: 'brand',
    date: (y) => [9, nthWeekday(y, 9, 1, 1)],
    message: 'Happy Labor Day.',
    submessage: 'Thank you to everyone who works with their hands.',
  },
  {
    id: 'veterans-day',
    tone: 'patriot',
    date: (y) => [11, 11],
    message: 'Thank you to all who served. Happy Veterans Day.',
    submessage: 'From everyone at Buena Vista Turf Farm.',
  },
  {
    id: 'thanksgiving',
    tone: 'harvest',
    date: (y) => [11, nthWeekday(y, 11, 4, 4)],
    message: 'Happy Thanksgiving from all of us at Buena Vista Turf Farm.',
    submessage: 'Thank you for letting us be part of your projects this year.',
  },
  {
    id: 'christmas',
    tone: 'evergreen',
    date: (y) => [12, 25],
    message: 'Merry Christmas from all of us at Buena Vista Turf Farm.',
    submessage: 'Wishing you a restful day with the people you like most.',
  },
];

/** Start and end instants for a holiday in a given year. */
export function windowFor(h, year) {
  const [month, day] = h.date(year);
  const span = h.days || 1;
  const start = centralInstant(year, month, day, 0, 0);
  // 12:01am Central the morning after the last day it runs.
  const endDay = new Date(Date.UTC(year, month - 1, day + span));
  const end = centralInstant(
    endDay.getUTCFullYear(), endDay.getUTCMonth() + 1, endDay.getUTCDate(), 0, 1,
  );
  return { start, end };
}

/**
 * The holiday happening right now, or null. Checks last year and next year as
 * well as this one, so a window straddling New Year is still found.
 */
export function activeHoliday(now = new Date()) {
  const y = now.getUTCFullYear();
  for (const year of [y - 1, y, y + 1]) {
    for (const h of HOLIDAYS) {
      const { start, end } = windowFor(h, year);
      if (now >= start && now < end) return { ...h, start, end, year };
    }
  }
  return null;
}
