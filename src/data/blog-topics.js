// Topic queue for the weekly blog post.
//
// WHY THIS FILE EXISTS: the weekly post is written by a scheduled Claude
// session that starts with no memory of what it wrote last week. Left to pick
// its own subject it writes the same two or three articles over and over. It
// reads this list, checks which slugs already exist in src/pages/blog/, and
// takes the first unused topic whose `months` include the current month.
//
// SCOPE, set by Alfredo: Bermuda only. General seasonal care a homeowner can
// act on. Nothing dramatic, no news, no opinion pieces. No byline - these are
// farm notes, not anybody's column.
//
// `months` is 1-12. A topic listing several months can run in any of them, so
// the queue degrades gracefully: if a season runs out of unused topics the
// task says so rather than inventing one.
//
// TO ADD A TOPIC: append an entry. TO RETIRE ONE: delete it, or leave it and
// delete the published .md file if you want it rewritten.
export const blogTopics = [
  // ---- Late winter / early spring: dormancy breaking, green-up ----
  {
    slug: 'when-bermuda-greens-up-north-texas',
    title: 'When Bermuda greens up in North Texas',
    description: 'What wakes Bermuda out of dormancy, roughly when it happens here, and why patience beats pushing it.',
    months: [2, 3],
    cover: 'Soil temperature rather than air temperature is the trigger. What a normal green-up looks like, why parts of a lawn wake at different times, and why fertilising too early feeds weeds instead of grass.',
  },
  {
    slug: 'first-mow-of-the-season-bermuda',
    title: 'The first mow of the season on a Bermuda lawn',
    description: 'When to make the first cut, how low to take it, and what scalping does and does not do.',
    months: [3, 4],
    cover: 'Waiting for consistent green-up before the first cut, taking dormant growth off so light reaches the crowns, bagging the first cut, and not scalping a lawn that is still mostly dormant.',
  },
  {
    slug: 'spring-weeds-in-bermuda-lawns',
    title: 'Spring weeds in a Bermuda lawn',
    description: 'Why weeds show up first, what a thin lawn has to do with it, and the simplest way to crowd them out.',
    months: [3, 4],
    cover: 'Weeds green up before Bermuda does, so early spring always looks worse than it is. Density as the real long-term control. General timing of pre-emergent, without naming products.',
  },

  // ---- Spring: growth, feeding, watering starts ----
  {
    slug: 'watering-bermuda-in-spring',
    title: 'Watering Bermuda in spring',
    description: 'How much water a waking lawn actually needs, and why most people give it too much too early.',
    months: [4, 5],
    cover: 'Deep and infrequent over light and daily. Roots following water down. Spring rain usually covering it. How to tell by looking at the grass rather than the calendar.',
  },
  {
    slug: 'mowing-height-for-bermuda',
    title: 'What height to mow Bermuda',
    description: 'The range Bermuda likes, why lower is not always better, and the one-third rule.',
    months: [4, 5, 6],
    cover: 'Typical maintenance heights. Never removing more than a third of the blade in one cut. How height relates to root depth and heat tolerance. Sharp blades.',
  },
  {
    slug: 'why-bermuda-needs-full-sun',
    title: 'Why Bermuda needs full sun',
    description: 'The light Bermuda has to have, and what a shaded stretch of lawn will keep doing.',
    months: [4, 5, 9],
    cover: 'Six to eight hours of direct light. What thinning under trees looks like and why more fertiliser does not fix it. Being honest that some spots are not Bermuda spots.',
  },
  {
    slug: 'laying-new-bermuda-sod-in-spring',
    title: 'Laying new Bermuda sod in spring',
    description: 'Ground prep, tight seams, and the watering that decides whether new sod takes.',
    months: [4, 5],
    cover: 'Laying fresh, tight seams, rolling, and the first two weeks of watering. Staying off it while it roots. Spring being a forgiving time to lay.',
  },

  // ---- Summer: heat, drought, traffic, recovery ----
  {
    slug: 'watering-bermuda-in-a-texas-summer',
    title: 'Watering Bermuda through a Texas summer',
    description: 'How much, how often, and what time of day, when it stops raining and does not start again.',
    months: [6, 7, 8],
    cover: 'Deep soaking a couple of times a week over daily sprinkling. Early morning rather than evening. Footprinting and colour as signs. What a lawn does when it goes dry and when that is survivable.',
  },
  {
    slug: 'brown-patches-in-summer-bermuda',
    title: 'Brown patches in a summer Bermuda lawn',
    description: 'Dry, dormant, damaged or diseased — telling them apart before you treat the wrong thing.',
    months: [6, 7, 8],
    cover: 'Drought stress versus disease versus pet damage versus mower damage. What each looks like. Why a lawn going off-colour in August is often doing what it should.',
  },
  {
    slug: 'mowing-bermuda-in-peak-heat',
    title: 'Mowing Bermuda in peak heat',
    description: 'How often a growing lawn needs cutting, and the mistakes that cost you in July.',
    months: [6, 7],
    cover: 'Cutting often enough to keep the one-third rule in high summer. Not cutting a drought-stressed lawn short. Clippings as free nitrogen. Blade sharpness in heat.',
  },
  {
    slug: 'bermuda-and-foot-traffic',
    title: 'Bermuda and foot traffic',
    description: 'Why Bermuda takes wear better than most, and where it still gives up.',
    months: [6, 7, 8],
    cover: 'Spreading growth habit filling its own wear. Recovery needing growing season, light and water. Paths that get walked every day being a design problem, not a grass problem.',
  },
  {
    slug: 'laying-sod-in-summer-heat',
    title: 'Laying sod in summer heat',
    description: 'Summer installs work, but the margin for error on watering is a lot smaller.',
    months: [6, 7, 8],
    cover: 'Laying the same day it is cut. Watering immediately and keeping it wet through rooting. Why a summer install is less forgiving than a spring one.',
  },

  // ---- Autumn: slowing down, last feeds, overseeding question ----
  {
    slug: 'getting-bermuda-ready-for-autumn',
    title: 'Getting a Bermuda lawn ready for autumn',
    description: 'What to change as the nights cool and growth slows.',
    months: [9, 10],
    cover: 'Growth slowing and mowing easing off. Keeping water going while it is still warm. Letting the lawn carry a little more height into cooler weather.',
  },
  {
    slug: 'last-mow-before-dormancy',
    title: 'The last mow before dormancy',
    description: 'When to stop cutting, and what height to leave Bermuda going into winter.',
    months: [10, 11],
    cover: 'Mowing until growth genuinely stops. Not leaving it long and matted, not scalping it bare. Clearing leaves so the crowns are not smothered.',
  },
  {
    slug: 'autumn-leaves-on-a-bermuda-lawn',
    title: 'Leaves on a Bermuda lawn',
    description: 'Why a blanket of leaves over dormant grass is worth clearing.',
    months: [10, 11],
    cover: 'Light and air to the crowns. Wet matted leaves holding damp. Mulching thin layers versus clearing heavy ones.',
  },
  {
    slug: 'laying-bermuda-sod-in-autumn',
    title: 'Laying Bermuda sod in autumn',
    description: 'How late you can lay, and what the grass is doing after it goes down.',
    months: [9, 10],
    cover: 'Warm soil and cooler air being good rooting conditions. Needing enough growing time before dormancy. Watering through establishment even as the weather cools.',
  },

  // ---- Winter: dormancy, what not to worry about ----
  {
    slug: 'bermuda-dormancy-in-winter',
    title: 'Bermuda goes brown in winter, and that is normal',
    description: 'What dormancy is, why a brown lawn is not a dead lawn, and what to leave alone.',
    months: [11, 12, 1],
    cover: 'Dormancy as a survival mechanism, not failure. The whole lawn going the same colour. Not fertilising, not overwatering, not panicking. Telling dormant from dead.',
  },
  {
    slug: 'winter-traffic-on-dormant-bermuda',
    title: 'Walking on a dormant Bermuda lawn',
    description: 'What dormant grass can and cannot take while it is not growing.',
    months: [12, 1],
    cover: 'No recovery while dormant, so damage stays until spring. Parking, storage and heavy repeated traffic. Frost and walking on frozen grass.',
  },
  {
    slug: 'planning-a-lawn-over-winter',
    title: 'Planning a new lawn over the winter',
    description: 'The quiet months are the right time to work out ground prep, drainage and sun.',
    months: [12, 1, 2],
    cover: 'Watching where water sits and where the sun actually falls. Levelling and drainage being far easier before sod. Measuring properly so quantities are right.',
  },
  {
    slug: 'what-bermuda-does-under-frost',
    title: 'What a Bermuda lawn does under frost',
    description: 'Cold snaps, hard freezes, and why an established lawn here comes back.',
    months: [1, 2],
    cover: 'Crowns and roots carrying the lawn through. Why North Texas cold is within what Bermuda handles. Not trying to green it up early.',
  },
];
