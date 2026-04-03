export type ReminderType = 'watering' | 'pruning' | 'feeding' | 'general';

export interface Garden {
  id: string;
  gardenId: string; // GK-XXXX format
  name: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LibraryPlant {
  id: string;
  commonName: string;
  latinName: string;
  reference: string;
  overview: string;
  image?: string;
  seasonalCare: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
  };
}

export interface Plant extends LibraryPlant {
  gardenId: string;
}

export interface Reminder {
  id: string;
  title: string;
  plantId: string;
  plantName: string;
  type: ReminderType;
  date: string;
  time: string;
  repeat: 'once' | 'weekly' | 'monthly';
  completed: boolean;
  gardenId: string;
}

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const nextMonth = new Date();
nextMonth.setMonth(nextMonth.getMonth() + 1);

const formatDate = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const gardens: Garden[] = [
  {
    id: 'garden-1',
    gardenId: 'GK-W291',
    name: 'The Wisteria House',
    owner: {
      id: 'client-1',
      name: 'Sarah Thompson',
      email: 'sarah@example.com',
    },
  },
  {
    id: 'garden-2',
    gardenId: 'GK-O847',
    name: 'The Oak Lodge Garden',
  },
];

// Plant Library — reusable plant templates not tied to any garden
export const libraryPlants: LibraryPlant[] = [
  {
    id: 'lib-1',
    commonName: 'Wisteria',
    latinName: 'Wisteria sinensis',
    reference: 'RHS Encyclopedia of Plants & Flowers, 2020',
    overview: 'A stunning deciduous climber producing cascades of fragrant, lilac-blue flowers in late spring. Wisteria sinensis is native to China and is one of the most dramatic climbing plants for south- or west-facing walls.',
    seasonalCare: {
      spring: 'Watch for frost damage on new buds. Begin regular watering as growth resumes. Apply balanced fertiliser. Tie in any new growth to supports.',
      summer: 'Prune new whippy growth back to 5-6 leaves in July/August. Water deeply during dry periods. Check ties and supports are secure.',
      autumn: 'Reduce watering. Clear fallen leaves from base. Check for any structural damage to supports before winter winds arrive.',
      winter: 'Prune back to 2-3 buds in January/February. This is essential for good flowering. Check all ties are secure against winter storms.',
    },
  },
  {
    id: 'lib-2',
    commonName: 'English Lavender',
    latinName: 'Lavandula angustifolia',
    reference: 'The Complete Book of Herbs, Jekka McVicar, 2019',
    overview: 'A classic English garden staple producing spikes of purple-blue flowers throughout summer. Beloved for its intensely aromatic foliage and flowers, which attract bees and butterflies in abundance.',
    seasonalCare: {
      spring: 'Light trim to shape in early spring. Do not cut into old wood. Check for any winter die-back and remove dead stems.',
      summer: 'Enjoy the flowers! Harvest stems for drying when flowers first open. Deadhead spent blooms to encourage a second flush.',
      autumn: 'After flowering, give a light trim. Ensure good drainage around the base for winter — lavender hates sitting in wet soil.',
      winter: 'Leave alone. Protect from excessive wet rather than cold. Do not prune in winter.',
    },
  },
  {
    id: 'lib-3',
    commonName: 'Climbing Rose "Generous Gardener"',
    latinName: 'Rosa "The Generous Gardener"',
    reference: 'David Austin Roses Handbook, 2018',
    overview: 'An award-winning David Austin climbing rose with beautifully cupped, pale pink flowers and a delicious old rose and musk fragrance. It flowers repeatedly from June through to autumn.',
    seasonalCare: {
      spring: 'Apply rose fertiliser in March. Tie in new growth to supports. Watch for aphids — encourage ladybirds as natural predators.',
      summer: 'Deadhead regularly for repeat flowering. Water deeply twice weekly at the base. Feed monthly with liquid rose food.',
      autumn: 'Stop deadheading to allow hips to form. Reduce watering. Clear fallen leaves promptly to prevent blackspot overwintering.',
      winter: 'Prune in December-February. Remove dead and diseased wood. Tie in framework branches horizontally to encourage flowering side shoots.',
    },
  },
  {
    id: 'lib-4',
    commonName: 'Box Hedge',
    latinName: 'Buxus sempervirens',
    reference: 'RHS Pruning & Training, 2017',
    overview: 'Classic evergreen hedging plant providing year-round structure and formal elegance to front garden borders. Its small, glossy, dark green leaves respond beautifully to clipping.',
    seasonalCare: {
      spring: 'First trim in late May or early June. Feed with balanced fertiliser. Inspect closely for signs of box blight or caterpillar damage.',
      summer: 'Second trim in August to maintain a crisp shape. Water young plants regularly. Monitor for box moth caterpillars inside the foliage.',
      autumn: 'Remove any fallen debris from within the hedge. Ensure good air circulation by keeping surrounding plants trimmed back.',
      winter: 'No action needed. Brush off heavy snow to prevent branch damage. Avoid walking on frozen ground near roots.',
    },
  },
  {
    id: 'lib-5',
    commonName: 'Japanese Acer',
    latinName: 'Acer palmatum',
    reference: 'Peter Coats, Trees of the World, 2016',
    overview: 'An elegant specimen tree with deeply cut palmate leaves that turn stunning shades of crimson and gold in autumn. Creates a beautiful focal point near patios and seating areas.',
    seasonalCare: {
      spring: 'Protect new growth from late frosts with fleece if needed. Mulch well with leaf mould. Begin regular watering.',
      summer: 'Water deeply in dry weather — crucial for acers. Protect from scorching afternoon sun and drying winds. Check for scale insects.',
      autumn: 'Enjoy the spectacular leaf colour! Reduce watering as leaves fall. Apply a generous autumn mulch around the root zone.',
      winter: 'Minimal pruning if needed — only remove dead or crossing branches in late autumn. Protect from cold, drying winds.',
    },
  },
  {
    id: 'lib-6',
    commonName: 'Foxglove',
    latinName: 'Digitalis purpurea',
    reference: 'Wild Flowers of Britain, Roger Phillips, 2015',
    overview: 'Tall, stately biennial producing dramatic spikes of tubular purple-pink flowers that are irresistible to bees. A native British wildflower that thrives in partial shade and woodland edges.',
    seasonalCare: {
      spring: 'Allow self-sown seedlings to develop. Thin if overcrowded to give each plant room to grow. Mulch around the base.',
      summer: 'Enjoy the dramatic flower spikes! Leave spent spikes if you want self-seeding, or remove to control spread.',
      autumn: 'First-year rosettes will develop. Transplant any seedlings to desired positions while they are still small.',
      winter: 'Hardy — no protection needed. First-year rosettes remain green through winter, ready to flower the following year.',
    },
  },
  {
    id: 'lib-7',
    commonName: 'Silver Birch',
    latinName: 'Betula pendula',
    reference: 'Collins Tree Guide, Owen Johnson, 2015',
    overview: 'A graceful native tree with distinctive white bark that peels in papery layers. One of Britain\'s most elegant trees, with a light, airy canopy of small triangular leaves.',
    seasonalCare: {
      spring: 'No action needed. Enjoy the fresh green canopy emerging. Check for any winter damage to branches.',
      summer: 'Water young trees during prolonged dry spells. Established trees are generally self-sufficient.',
      autumn: 'Rake fallen leaves for composting. The golden autumn colour is brief but beautiful.',
      winter: 'Prune only if necessary to remove dead, damaged, or crossing branches. Admire the white bark against the winter sky.',
    },
  },
  {
    id: 'lib-8',
    commonName: 'Hellebore',
    latinName: 'Helleborus orientalis',
    reference: 'The Plant Lover\'s Guide to Hellebores, 2014',
    overview: 'One of the most valuable winter-flowering perennials, producing elegant nodding flowers in shades of white, pink, plum and green from January to March.',
    seasonalCare: {
      spring: 'Remove old, tatty foliage to show off the flowers. Mulch with garden compost. Allow seedlings to develop if wanted.',
      summer: 'Leave alone — hellebores are dormant in summer. Ensure they are not crowded out by vigorous neighbours.',
      autumn: 'Tidy any damaged leaves. Ensure the planting area is clear and ready for winter flowers to emerge.',
      winter: 'Enjoy the flowers! Remove old leaves in late winter to give the blooms centre stage. No feeding needed.',
    },
  },
  {
    id: 'lib-9',
    commonName: 'Hawthorn Hedge',
    latinName: 'Crataegus monogyna',
    reference: 'Hedgerow, John Wright, 2016',
    overview: 'A robust native hedging plant that forms a dense, thorny boundary, alive with white blossom in spring and red berries in autumn. Arguably Britain\'s finest hedging plant.',
    seasonalCare: {
      spring: 'Enjoy the spectacular white blossom in May. Avoid trimming until after flowering to preserve the display.',
      summer: 'Trim once in late summer (August) after nesting season. Check for any gaps that need filling with new planting.',
      autumn: 'Leave the red haws for birds — they are a vital winter food source. Clear any fallen debris from the base.',
      winter: 'Lay or coppice old hedges if rejuvenation is needed. Plant new bare-root whips November to March.',
    },
  },
];

// Garden-specific plants (linked from library or created custom)
export const plants: Plant[] = [
  { ...libraryPlants[0], id: 'plant-1', gardenId: 'garden-1' },
  { ...libraryPlants[1], id: 'plant-2', gardenId: 'garden-1' },
  { ...libraryPlants[2], id: 'plant-3', gardenId: 'garden-1' },
  { ...libraryPlants[3], id: 'plant-4', gardenId: 'garden-1' },
  { ...libraryPlants[4], id: 'plant-5', gardenId: 'garden-1' },
  { ...libraryPlants[5], id: 'plant-6', gardenId: 'garden-1' },
  { ...libraryPlants[6], id: 'plant-7', gardenId: 'garden-2' },
  { ...libraryPlants[7], id: 'plant-8', gardenId: 'garden-2' },
  { ...libraryPlants[8], id: 'plant-9', gardenId: 'garden-2' },
];

export const reminders: Reminder[] = [
  { id: 'rem-1', title: 'Water the roses deeply', plantId: 'plant-3', plantName: 'Climbing Rose', type: 'watering', date: formatDate(tomorrow), time: '09:00', repeat: 'weekly', completed: false, gardenId: 'garden-1' },
  { id: 'rem-2', title: 'Prune wisteria side shoots', plantId: 'plant-1', plantName: 'Wisteria', type: 'pruning', date: formatDate(nextWeek), time: '10:00', repeat: 'once', completed: false, gardenId: 'garden-1' },
  { id: 'rem-3', title: 'Feed lavender with potash', plantId: 'plant-2', plantName: 'English Lavender', type: 'feeding', date: formatDate(nextMonth), time: '11:00', repeat: 'once', completed: false, gardenId: 'garden-1' },
  { id: 'rem-4', title: 'Winter mulch applied to beds', plantId: 'plant-1', plantName: 'Wisteria', type: 'general', date: '15/11/2025', time: '14:00', repeat: 'once', completed: true, gardenId: 'garden-1' },
];

export const chatResponses: Record<string, string> = {
  'How often should I water my roses?': 'Based on your garden profile, your Climbing Rose "Generous Gardener" benefits from deep watering twice a week during dry spells. Water at the base early in the morning, and avoid wetting the leaves to prevent blackspot. In cooler, wetter weather, reduce to once a week.',
  'What should I do in my garden this month?': `It's a busy month in your garden! Here's your to-do list:\n\n🌱 **Pruning**: Check wisteria and roses for any needed training\n💧 **Watering**: Resume regular watering for your Japanese Acer as new growth starts\n🌿 **Feeding**: Apply potash-rich feed to your wisteria to encourage flowers\n✂️ **Tidying**: Clear winter debris from borders\n🌸 **Watch for**: Foxglove seedlings emerging — thin if overcrowded`,
  'Is my lavender supposed to look like this?': 'At this time of year, your English Lavender may look a bit grey and woody — that\'s perfectly normal for early spring! It will green up as the weather warms. In late spring, give it a light trim to shape, but never cut into old wood. If you\'re seeing brown, mushy stems, that could indicate root rot from wet soil — let me know and we can investigate further.',
};

export function getUKSeason(): { season: string; tip: string; emoji: string } {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return { season: 'Spring', tip: "It's spring — time to feed, mulch, and prepare your borders for the growing season ahead.", emoji: '🌱' };
  if (month >= 5 && month <= 7) return { season: 'Summer', tip: "It's summer — keep on top of watering, deadheading, and enjoy your garden in full bloom!", emoji: '☀️' };
  if (month >= 8 && month <= 10) return { season: 'Autumn', tip: "It's autumn — time to mulch your beds, plant spring bulbs, and tidy borders before the frost.", emoji: '🍂' };
  return { season: 'Winter', tip: "It's winter — plan next year's planting, prune deciduous trees, and enjoy the structural beauty of your garden.", emoji: '❄️' };
}

export function generateGardenId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'GK-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
