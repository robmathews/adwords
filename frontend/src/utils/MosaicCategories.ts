/**
 * Comprehensive Experian Mosaic USA Categories based on real USA Mosaic system
 * 19 overarching groups and 71 underlying types
 */

export interface MosaicCategory {
  id: string;
  name: string;
  description: string;
  traits: string[];
  groupId: string;
  groupName: string;
}

export interface MosaicGroup {
  id: string;
  name: string;
  description: string;
  typeIds: string[];
}

export const MOSAIC_GROUPS: MosaicGroup[] = [
  {
    id: 'A',
    name: 'Power Elite',
    description: 'Wealthy households with substantial assets and the highest incomes in America',
    typeIds: ['A01', 'A02', 'A03', 'A04']
  },
  {
    id: 'B',
    name: 'Sophisticated Squads',
    description: 'Upper-middle-class households with college education and professional careers',
    typeIds: ['B05', 'B06', 'B07', 'B08']
  },
  {
    id: 'C',
    name: 'Accumulated Wealth',
    description: 'Older households that have accumulated wealth over their lifetimes',
    typeIds: ['C09', 'C10', 'C11', 'C12']
  },
  {
    id: 'D',
    name: 'Generational Wealth',
    description: 'Upper-middle-class families living in established neighborhoods',
    typeIds: ['D13', 'D14', 'D15', 'D16']
  },
  {
    id: 'E',
    name: 'Suburban Style',
    description: 'Middle-class families and couples in comfortable suburban communities',
    typeIds: ['E17', 'E18', 'E19', 'E20']
  },
  {
    id: 'F',
    name: 'Flourishing Families',
    description: 'Growing families with moderate incomes in suburban and small-town settings',
    typeIds: ['F21', 'F22', 'F23', 'F24']
  },
  {
    id: 'G',
    name: 'Promising Potential',
    description: 'Young adults and families starting their careers and building their futures',
    typeIds: ['G25', 'G26', 'G27', 'G28']
  },
  {
    id: 'H',
    name: 'Middle America',
    description: 'Middle-class households with moderate incomes and traditional values',
    typeIds: ['H29', 'H30', 'H31', 'H32']
  },
  {
    id: 'I',
    name: 'Striving Singles',
    description: 'Single adults and childless couples working to establish themselves',
    typeIds: ['I33', 'I34', 'I35', 'I36', 'I37']
  },
  {
    id: 'J',
    name: 'Young Achievers',
    description: 'College-educated young adults in urban areas with growing careers',
    typeIds: ['J38', 'J39', 'J40', 'J41']
  },
  {
    id: 'K',
    name: 'Steady Neighborhoods',
    description: 'Stable working-class communities with modest incomes',
    typeIds: ['K42', 'K43', 'K44', 'K45']
  },
  {
    id: 'L',
    name: 'Blue Sky Boomers',
    description: 'Lower and middle-class baby boomer households in small towns',
    typeIds: ['L46', 'L47', 'L48']
  },
  {
    id: 'M',
    name: 'Families in Motion',
    description: 'Diverse families with children adapting to changing circumstances',
    typeIds: ['M49', 'M50', 'M51', 'M52']
  },
  {
    id: 'N',
    name: 'Aspirational Fusion',
    description: 'Ethnically diverse households striving for the American Dream',
    typeIds: ['N53', 'N54', 'N55', 'N56']
  },
  {
    id: 'O',
    name: 'Ambitious Achievers',
    description: 'Hardworking households pursuing economic advancement',
    typeIds: ['O57', 'O58', 'O59']
  },
  {
    id: 'P',
    name: 'Persevering Families',
    description: 'Families facing economic challenges while working toward stability',
    typeIds: ['P60', 'P61', 'P62', 'P63']
  },
  {
    id: 'Q',
    name: 'Challenged Circumstances',
    description: 'Households with limited resources and economic constraints',
    typeIds: ['Q64', 'Q65', 'Q66']
  },
  {
    id: 'R',
    name: 'Factory and Farming',
    description: 'Rural and small-town residents in agricultural and industrial areas',
    typeIds: ['R67', 'R68', 'R69']
  },
  {
    id: 'S',
    name: 'Non-Family Households',
    description: 'Single-person households and non-traditional living arrangements',
    typeIds: ['S70', 'S71']
  }
];

export const MOSAIC_CATEGORIES: MosaicCategory[] = [
  // Group A: Power Elite
  {
    id: 'A01',
    name: 'Upper Crust',
    description: 'America\'s wealthiest households with the highest incomes and most expensive homes',
    traits: [
      'Extremely high income ($500K+)',
      'Luxury property ownership',
      'Private school preference',
      'Investment portfolio management',
      'Exclusive club memberships',
      'Luxury brand loyalty',
      'Philanthropic involvement',
      'International travel',
      'Multiple property ownership',
      'Private healthcare',
      'Art and collectibles interest',
      'Premium financial services'
    ],
    groupId: 'A',
    groupName: 'Power Elite'
  },
  {
    id: 'A02',
    name: 'Winner\'s Circle',
    description: 'Highly successful professionals and executives with substantial assets',
    traits: [
      'Executive-level careers',
      'High disposable income',
      'Suburban estate living',
      'Premium vehicle ownership',
      'Private education investment',
      'Country club lifestyle',
      'Professional networking',
      'Investment savvy',
      'Luxury service usage',
      'Cultural patronage',
      'High-end technology adoption',
      'Exclusive travel experiences'
    ],
    groupId: 'A',
    groupName: 'Power Elite'
  },
  {
    id: 'A03',
    name: 'Executive Suites',
    description: 'Urban professionals living in upscale city neighborhoods and high-rise condos',
    traits: [
      'Urban executive lifestyle',
      'High-rise condo living',
      'Professional services career',
      'City cultural engagement',
      'Fine dining preference',
      'Premium brand consumption',
      'Technology early adoption',
      'Urban convenience priorities',
      'Networking focus',
      'Career advancement driven',
      'Luxury travel',
      'Investment property interest'
    ],
    groupId: 'A',
    groupName: 'Power Elite'
  },
  {
    id: 'A04',
    name: 'Successful Suburbanites',
    description: 'Affluent families in prestigious suburban communities with excellent schools',
    traits: [
      'Prestigious suburban living',
      'Family-oriented wealth',
      'Top-tier school districts',
      'Large single-family homes',
      'Family vacation prioritization',
      'Youth sports investment',
      'Community leadership roles',
      'Environmental consciousness',
      'Home security systems',
      'Multiple vehicle ownership',
      'College preparation focus',
      'Quality healthcare access'
    ],
    groupId: 'A',
    groupName: 'Power Elite'
  },

  // Group B: Sophisticated Squads
  {
    id: 'B05',
    name: 'Cosmopolitan Couples',
    description: 'Educated urban professionals without children living sophisticated lifestyles',
    traits: [
      'Urban professional lifestyle',
      'Dual high incomes',
      'No children currently',
      'Cultural activities engagement',
      'International cuisine',
      'Modern condo/apartment living',
      'Technology integration',
      'Professional development',
      'Social networking',
      'Travel enthusiasm',
      'Premium entertainment',
      'Environmentally conscious'
    ],
    groupId: 'B',
    groupName: 'Sophisticated Squads'
  },
  {
    id: 'B06',
    name: 'Golf Carts and Country Clubs',
    description: 'Affluent retirees living in golf communities and country club neighborhoods',
    traits: [
      'Golf community living',
      'Comfortable retirement',
      'Country club membership',
      'Recreational vehicle ownership',
      'Investment income reliance',
      'Healthcare prioritization',
      'Travel and leisure focus',
      'Grandchildren involvement',
      'Conservative political views',
      'Traditional media consumption',
      'Charitable giving',
      'Premium insurance coverage'
    ],
    groupId: 'B',
    groupName: 'Sophisticated Squads'
  },
  {
    id: 'B07',
    name: 'Money and Brains',
    description: 'Highly educated professionals with substantial incomes in upscale neighborhoods',
    traits: [
      'Advanced degrees',
      'Professional expertise',
      'High intellectual engagement',
      'Technology early adoption',
      'Educational investment',
      'Cultural sophistication',
      'Premium brand preference',
      'International awareness',
      'Investment portfolio focus',
      'Environmental responsibility',
      'Quality over quantity mindset',
      'Professional networking'
    ],
    groupId: 'B',
    groupName: 'Sophisticated Squads'
  },
  {
    id: 'B08',
    name: 'Empty Nest Established',
    description: 'Older couples whose children have left home, living comfortably in established areas',
    traits: [
      'Empty nest phase',
      'Established neighborhood residence',
      'Mortgage-free homeownership',
      'Retirement planning focus',
      'Reduced family expenses',
      'Travel opportunities',
      'Hobby development',
      'Health consciousness',
      'Traditional shopping habits',
      'Conservative financial approach',
      'Community involvement',
      'Grandparent role embrace'
    ],
    groupId: 'B',
    groupName: 'Sophisticated Squads'
  },

  // Group C: Accumulated Wealth
  {
    id: 'C09',
    name: 'Silver Sophisticates',
    description: 'Wealthy seniors with substantial assets accumulated over their lifetimes',
    traits: [
      'Substantial accumulated wealth',
      'Fixed income with assets',
      'Premium healthcare access',
      'Luxury travel capability',
      'Investment income focus',
      'Estate planning concern',
      'Charitable inclinations',
      'Traditional value system',
      'Quality service expectation',
      'Brand loyalty tendency',
      'Family legacy focus',
      'Conservative investment approach'
    ],
    groupId: 'C',
    groupName: 'Accumulated Wealth'
  },
  {
    id: 'C10',
    name: 'Old Money',
    description: 'Established wealthy families with generational assets and traditional values',
    traits: [
      'Generational wealth',
      'Traditional family values',
      'Prestigious address preference',
      'Private club memberships',
      'Heritage brand loyalty',
      'Conservative political views',
      'Philanthropic tradition',
      'Educational institution support',
      'Investment portfolio focus',
      'Estate preservation',
      'Cultural patronage',
      'Traditional communication preferences'
    ],
    groupId: 'C',
    groupName: 'Accumulated Wealth'
  },
  {
    id: 'C11',
    name: 'Suburban Seniors',
    description: 'Comfortable older adults living in suburban areas with good retirement security',
    traits: [
      'Suburban retirement living',
      'Good pension/401k benefits',
      'Paid-off mortgage',
      'Healthcare prioritization',
      'Family time importance',
      'Traditional shopping patterns',
      'Conservative spending habits',
      'Local community involvement',
      'Routine-oriented lifestyle',
      'Traditional media consumption',
      'Brand loyalty',
      'Fixed income management'
    ],
    groupId: 'C',
    groupName: 'Accumulated Wealth'
  },
  {
    id: 'C12',
    name: 'Pools and Patios',
    description: 'Affluent empty nesters enjoying leisure time in comfortable suburban homes',
    traits: [
      'Leisure lifestyle focus',
      'Home entertainment spaces',
      'Outdoor living emphasis',
      'Travel and recreation',
      'Investment property interest',
      'Home improvement projects',
      'Grandchildren spoiling',
      'Health and wellness focus',
      'Conservative financial planning',
      'Traditional retail preference',
      'Community club participation',
      'Quality brand preference'
    ],
    groupId: 'C',
    groupName: 'Accumulated Wealth'
  },

  // Group D: Generational Wealth
  {
    id: 'D13',
    name: 'Booming with Confidence',
    description: 'Baby boomers in their peak earning years with substantial assets',
    traits: [
      'Peak earning phase',
      'Established career success',
      'Investment portfolio growth',
      'Property equity accumulation',
      'Premium lifestyle choices',
      'Educational investment for children',
      'Travel and leisure expansion',
      'Health and wellness prioritization',
      'Technology selective adoption',
      'Brand quality focus',
      'Professional networking',
      'Community leadership roles'
    ],
    groupId: 'D',
    groupName: 'Generational Wealth'
  },
  {
    id: 'D14',
    name: 'Conservative Classics',
    description: 'Traditional middle-class families with stable incomes and conservative values',
    traits: [
      'Traditional family structure',
      'Conservative value system',
      'Stable employment history',
      'Homeownership priority',
      'Educational achievement focus',
      'Community involvement',
      'Religious participation',
      'Brand loyalty tendency',
      'Traditional media consumption',
      'Practical purchasing decisions',
      'Family-centered activities',
      'Local business support'
    ],
    groupId: 'D',
    groupName: 'Generational Wealth'
  },
  {
    id: 'D15',
    name: 'Enterprising Professionals',
    description: 'Mid-career professionals building wealth through business and investments',
    traits: [
      'Entrepreneurial mindset',
      'Business ownership interest',
      'Investment diversification',
      'Professional development focus',
      'Network building emphasis',
      'Technology integration',
      'Growth-oriented spending',
      'Educational advancement',
      'Market awareness',
      'Risk management consciousness',
      'Quality service preference',
      'Innovation adoption'
    ],
    groupId: 'D',
    groupName: 'Generational Wealth'
  },
  {
    id: 'D16',
    name: 'Settled and Sophisticated',
    description: 'Established households with refined tastes and comfortable lifestyles',
    traits: [
      'Refined lifestyle preferences',
      'Cultural engagement',
      'Quality over quantity mindset',
      'Established social networks',
      'Premium brand loyalty',
      'Travel experience prioritization',
      'Home aesthetic focus',
      'Educational value emphasis',
      'Health and wellness consciousness',
      'Environmental responsibility',
      'Investment income supplementation',
      'Traditional communication preferences'
    ],
    groupId: 'D',
    groupName: 'Generational Wealth'
  },

  // Group E: Suburban Style
  {
    id: 'E17',
    name: 'Suburban Sass',
    description: 'Stylish suburban families balancing career success with family life',
    traits: [
      'Fashion and style consciousness',
      'Dual career households',
      'Suburban family lifestyle',
      'Brand awareness',
      'Social media engagement',
      'Children\'s activity investment',
      'Home design interest',
      'Technology integration',
      'Convenience service usage',
      'Health and fitness focus',
      'Educational prioritization',
      'Community social participation'
    ],
    groupId: 'E',
    groupName: 'Suburban Style'
  },
  {
    id: 'E18',
    name: 'Babies and Bliss',
    description: 'Young families with babies and toddlers in comfortable suburban neighborhoods',
    traits: [
      'Young children focus',
      'Family safety prioritization',
      'Baby/toddler product consumption',
      'Childcare service usage',
      'Family-friendly neighborhood preference',
      'Educational planning start',
      'Health and wellness emphasis',
      'Convenience product preference',
      'Social media parenting engagement',
      'Budget consciousness with quality focus',
      'Family activity prioritization',
      'Home safety investment'
    ],
    groupId: 'E',
    groupName: 'Suburban Style'
  },
  {
    id: 'E19',
    name: 'Everyday Moderates',
    description: 'Middle-class households with moderate incomes living practical lifestyles',
    traits: [
      'Practical lifestyle approach',
      'Moderate income management',
      'Value-conscious shopping',
      'Mainstream preferences',
      'Family-oriented decisions',
      'Local community involvement',
      'Traditional entertainment choices',
      'Reliable transportation priority',
      'Home maintenance focus',
      'Budget-friendly recreation',
      'Educational support for children',
      'Healthcare access prioritization'
    ],
    groupId: 'E',
    groupName: 'Suburban Style'
  },
  {
    id: 'E20',
    name: 'Cruisin\' to Retirement',
    description: 'Pre-retirees preparing for the next phase while enjoying current success',
    traits: [
      'Retirement planning acceleration',
      'Peak earning utilization',
      'Travel interest expansion',
      'Home renovation projects',
      'Investment portfolio focus',
      'Health consciousness increase',
      'Leisure activity exploration',
      'Grandparent role preparation',
      'Traditional value reinforcement',
      'Community involvement deepening',
      'Legacy planning consideration',
      'Quality lifestyle prioritization'
    ],
    groupId: 'E',
    groupName: 'Suburban Style'
  },

  // Group F: Flourishing Families
  {
    id: 'F21',
    name: 'Promising Families',
    description: 'Growing families with increasing incomes and bright future prospects',
    traits: [
      'Growing family income',
      'Career advancement trajectory',
      'Young children presence',
      'Educational investment priority',
      'Home ownership aspiration',
      'Family activity focus',
      'Technology adoption for family benefit',
      'Health and safety consciousness',
      'Community involvement',
      'Brand exploration tendency',
      'Future planning orientation',
      'Quality value seeking'
    ],
    groupId: 'F',
    groupName: 'Flourishing Families'
  },
  {
    id: 'F22',
    name: 'Full Steam Ahead',
    description: 'Energetic families in their prime child-rearing years with optimistic outlooks',
    traits: [
      'High energy family lifestyle',
      'Multiple children management',
      'Activity-packed schedules',
      'Sports and recreation involvement',
      'Educational enhancement prioritization',
      'Family vacation planning',
      'Home organization focus',
      'Convenience product reliance',
      'Social networking participation',
      'Brand consciousness',
      'Technology integration for efficiency',
      'Community school involvement'
    ],
    groupId: 'F',
    groupName: 'Flourishing Families'
  },
  {
    id: 'F23',
    name: 'Accumulated Success',
    description: 'Families who have built comfortable lifestyles through steady progress',
    traits: [
      'Steady progress achievement',
      'Comfortable lifestyle establishment',
      'Property equity accumulation',
      'Educational achievement support',
      'Traditional family values',
      'Community leadership roles',
      'Brand loyalty development',
      'Investment beginning focus',
      'Quality service preference',
      'Local business support',
      'Conservative financial approach',
      'Family tradition emphasis'
    ],
    groupId: 'F',
    groupName: 'Flourishing Families'
  },
  {
    id: 'F24',
    name: 'Hometown Prosperity',
    description: 'Successful families in smaller cities and towns with strong local ties',
    traits: [
      'Small town/small city living',
      'Local business success',
      'Community leadership roles',
      'Traditional value systems',
      'Local institution support',
      'Regional brand preference',
      'Family business involvement',
      'Conservative political views',
      'Religious community participation',
      'Local sports team support',
      'Regional travel preferences',
      'Hometown pride emphasis'
    ],
    groupId: 'F',
    groupName: 'Flourishing Families'
  },

  // Group G: Promising Potential
  {
    id: 'G25',
    name: 'Fast Track Couples',
    description: 'Young professional couples on rapid career advancement paths',
    traits: [
      'Rapid career progression',
      'High achievement orientation',
      'Urban or suburban professional living',
      'Technology early adoption',
      'Premium brand experimentation',
      'Professional development investment',
      'Network building focus',
      'Travel and experience prioritization',
      'Convenience service usage',
      'Health and fitness emphasis',
      'Investment beginning',
      'Future planning orientation'
    ],
    groupId: 'G',
    groupName: 'Promising Potential'
  },
  {
    id: 'G26',
    name: 'Twentysomething Professionals',
    description: 'College-educated young adults establishing their careers in urban areas',
    traits: [
      'Recent college graduation',
      'Entry-level professional careers',
      'Urban living preference',
      'Social life prioritization',
      'Technology native status',
      'Brand experimentation',
      'Experience over possessions',
      'Student loan management',
      'Career networking',
      'Health and wellness interest',
      'Environmental consciousness',
      'Social media engagement'
    ],
    groupId: 'G',
    groupName: 'Promising Potential'
  },
  {
    id: 'G27',
    name: 'Building Blocks',
    description: 'Young families and couples working to establish stable foundations',
    traits: [
      'Foundation building phase',
      'Early family formation',
      'First home purchasing',
      'Career establishment focus',
      'Budget-conscious decisions',
      'Future-oriented planning',
      'Value shopping approach',
      'Technology integration',
      'Community involvement beginning',
      'Health consciousness development',
      'Educational planning start',
      'Social network building'
    ],
    groupId: 'G',
    groupName: 'Promising Potential'
  },
  {
    id: 'G28',
    name: 'Mobility Blues',
    description: 'Mobile young adults and families adapting to frequent moves and changes',
    traits: [
      'High mobility lifestyle',
      'Rental accommodation preference',
      'Flexible lifestyle approach',
      'Technology dependence',
      'Convenience prioritization',
      'Minimal possession focus',
      'Network maintenance challenges',
      'Adaptability emphasis',
      'Career flexibility',
      'Experience accumulation',
      'Budget variability management',
      'Community connection challenges'
    ],
    groupId: 'G',
    groupName: 'Promising Potential'
  },

  // Group H: Middle America
  {
    id: 'H29',
    name: 'Middleburg',
    description: 'Traditional middle-class families living the classic American suburban lifestyle',
    traits: [
      'Classic suburban lifestyle',
      'Traditional family structure',
      'Middle-class income stability',
      'Homeownership priority',
      'Community involvement',
      'Local school support',
      'Mainstream entertainment preferences',
      'Brand loyalty tendency',
      'Practical vehicle ownership',
      'Family vacation traditions',
      'Conservative spending habits',
      'Traditional media consumption'
    ],
    groupId: 'H',
    groupName: 'Middle America'
  },
  {
    id: 'H30',
    name: 'Red, White and Blue',
    description: 'Patriotic middle-class households with strong traditional American values',
    traits: [
      'Strong patriotic values',
      'Traditional American lifestyle',
      'Conservative political views',
      'Military support/connection',
      'Flag display tendency',
      'Traditional holiday celebration',
      'American-made product preference',
      'Local community pride',
      'Religious participation',
      'Traditional family roles',
      'Classic entertainment preferences',
      'Mainstream retail shopping'
    ],
    groupId: 'H',
    groupName: 'Middle America'
  },
  {
    id: 'H31',
    name: 'Steady Traditions',
    description: 'Stable families maintaining traditional lifestyles and conservative values',
    traits: [
      'Traditional lifestyle maintenance',
      'Stable employment patterns',
      'Conservative value systems',
      'Family tradition emphasis',
      'Local community loyalty',
      'Religious institution involvement',
      'Traditional shopping patterns',
      'Brand loyalty strength',
      'Practical decision making',
      'Educational value emphasis',
      'Traditional communication preferences',
      'Hometown loyalty'
    ],
    groupId: 'H',
    groupName: 'Middle America'
  },
  {
    id: 'H32',
    name: 'Americana',
    description: 'Quintessential American families embodying middle-class values and aspirations',
    traits: [
      'Quintessential American values',
      'Middle-class aspiration pursuit',
      'Family-centered decisions',
      'Community participation',
      'Traditional entertainment',
      'Mainstream brand preference',
      'Practical lifestyle approach',
      'Educational achievement support',
      'Local business loyalty',
      'Conservative financial management',
      'Traditional communication',
      'American dream pursuit'
    ],
    groupId: 'H',
    groupName: 'Middle America'
  },

  // Group I: Striving Singles
  {
    id: 'I33',
    name: 'Urban Professional Singles',
    description: 'Single professionals living in urban areas focused on career advancement',
    traits: [
      'Urban living preference',
      'Career advancement focus',
      'Single lifestyle optimization',
      'Professional networking',
      'Technology integration',
      'Convenience service usage',
      'Social life prioritization',
      'Cultural activity engagement',
      'Travel interest',
      'Brand experimentation',
      'Health and fitness focus',
      'Environmental consciousness'
    ],
    groupId: 'I',
    groupName: 'Striving Singles'
  },
  {
    id: 'I34',
    name: 'Struggling Singles',
    description: 'Single adults working to establish financial stability and career progress',
    traits: [
      'Financial stability pursuit',
      'Career establishment struggle',
      'Budget-conscious living',
      'Value shopping approach',
      'Skill development focus',
      'Network building necessity',
      'Efficient lifestyle choices',
      'Technology dependence',
      'Health consciousness on budget',
      'Educational advancement pursuit',
      'Community resource utilization',
      'Future planning emphasis'
    ],
    groupId: 'I',
    groupName: 'Striving Singles'
  },
  {
    id: 'I35',
    name: 'College Towns',
    description: 'Students and young adults in college communities with limited incomes',
    traits: [
      'Student lifestyle',
      'Limited income management',
      'Educational prioritization',
      'Social activity emphasis',
      'Technology native status',
      'Budget shopping necessity',
      'Shared living arrangements',
      'Campus community involvement',
      'Future orientation',
      'Brand experimentation',
      'Health and wellness interest',
      'Environmental awareness'
    ],
    groupId: 'I',
    groupName: 'Striving Singles'
  },
  {
    id: 'I36',
    name: 'Dorms to Diplomas',
    description: 'College students and recent graduates transitioning to independent adult life',
    traits: [
      'Educational transition phase',
      'Independence establishment',
      'Career preparation focus',
      'Financial literacy development',
      'Social network expansion',
      'Technology integration',
      'Experience accumulation',
      'Budget management learning',
      'Professional development',
      'Health consciousness development',
      'Brand exploration',
      'Future planning beginning'
    ],
    groupId: 'I',
    groupName: 'Striving Singles'
  },
  {
    id: 'I37',
    name: 'Solo Acts',
    description: 'Independent single adults living alone and managing their own households',
    traits: [
      'Independent lifestyle',
      'Self-reliance emphasis',
      'Efficient household management',
      'Personal interest development',
      'Career focus',
      'Social connection maintenance',
      'Practical decision making',
      'Technology utilization',
      'Health and wellness prioritization',
      'Financial independence pursuit',
      'Quality over quantity approach',
      'Personal growth focus'
    ],
    groupId: 'I',
    groupName: 'Striving Singles'
  },

  // Group J: Young Achievers
  {
    id: 'J38',
    name: 'Digital Dependents',
    description: 'Tech-savvy young adults whose lives are deeply integrated with digital technology',
    traits: [
      'Digital native status',
      'Technology integration in all aspects',
      'Social media engagement',
      'Online shopping preference',
      'Digital entertainment consumption',
      'Mobile-first approach',
      'App-based service usage',
      'Tech product early adoption',
      'Digital communication preference',
      'Online learning engagement',
      'Digital brand interaction',
      'Virtual social networking'
    ],
    groupId: 'J',
    groupName: 'Young Achievers'
  },
  {
    id: 'J39',
    name: 'New Beginnings',
    description: 'Young adults starting their independent lives with optimism and ambition',
    traits: [
      'Fresh start mentality',
      'Optimistic outlook',
      'Goal setting focus',
      'Career exploration',
      'Relationship building',
      'Experience seeking',
      'Brand experimentation',
      'Technology adoption',
      'Health and wellness interest',
      'Educational advancement',
      'Financial goal setting',
      'Community exploration'
    ],
    groupId: 'J',
    groupName: 'Young Achievers'
  },
  {
    id: 'J40',
    name: 'Bright Prospects',
    description: 'Ambitious young professionals with promising career trajectories',
    traits: [
      'High achievement motivation',
      'Career trajectory optimization',
      'Professional development investment',
      'Network building focus',
      'Quality brand preference',
      'Technology leveraging',
      'Travel and experience prioritization',
      'Health and fitness emphasis',
      'Investment beginning',
      'Premium service appreciation',
      'Innovation adoption',
      'Leadership development'
    ],
    groupId: 'J',
    groupName: 'Young Achievers'
  },
  {
    id: 'J41',
    name: 'Young and Restless',
    description: 'Energetic young adults seeking excitement and new experiences',
    traits: [
      'High energy lifestyle',
      'Experience seeking behavior',
      'Social activity prioritization',
      'Adventure and travel interest',
      'Brand experimentation',
      'Technology integration',
      'Entertainment spending',
      'Spontaneous decision making',
      'Social media influence',
      'Health and fitness activity',
      'Risk-taking tendency',
      'Trend following'
    ],
    groupId: 'J',
    groupName: 'Young Achievers'
  },

  // Group K: Steady Neighborhoods
  {
    id: 'K42',
    name: 'Main Street USA',
    description: 'Traditional working-class families in small towns with strong community ties',
    traits: [
      'Small town community living',
      'Working-class employment',
      'Traditional family values',
      'Local business support',
      'Community event participation',
      'Conservative spending habits',
      'Practical vehicle ownership',
      'Local school involvement',
      'Traditional entertainment preferences',
      'Brand loyalty',
      'Religious participation',
      'Hometown pride'
    ],
    groupId: 'K',
    groupName: 'Steady Neighborhoods'
  },
  {
    id: 'K43',
    name: 'Simple Pleasures',
    description: 'Modest-income households finding satisfaction in life\'s basic comforts',
    traits: [
      'Simple lifestyle appreciation',
      'Modest income management',
      'Basic comfort prioritization',
      'Family time importance',
      'Practical decision making',
      'Value shopping approach',
      'Traditional recreation',
      'Local community involvement',
      'Conservative financial approach',
      'Mainstream entertainment',
      'Traditional communication',
      'Practical product preference'
    ],
    groupId: 'K',
    groupName: 'Steady Neighborhoods'
  },
  {
    id: 'K44',
    name: 'Mayberry-ville',
    description: 'Small-town residents living traditional American lifestyles',
    traits: [
      'Small town traditional living',
      'Community-centered lifestyle',
      'Traditional American values',
      'Local institution support',
      'Conservative political views',
      'Family tradition emphasis',
      'Local business loyalty',
      'Traditional shopping patterns',
      'Mainstream brand preference',
      'Religious community involvement',
      'Local sports support',
      'Traditional media consumption'
    ],
    groupId: 'K',
    groupName: 'Steady Neighborhoods'
  },
  {
    id: 'K45',
    name: 'Rustbelt Residents',
    description: 'Working-class households in former industrial areas adapting to economic changes',
    traits: [
      'Industrial area residence',
      'Economic adaptation necessity',
      'Working-class employment',
      'Community solidarity',
      'Practical lifestyle approach',
      'Value-conscious shopping',
      'Traditional family structure',
      'Local community loyalty',
      'Conservative spending habits',
      'Practical transportation needs',
      'Traditional recreation preferences',
      'Community mutual support'
    ],
    groupId: 'K',
    groupName: 'Steady Neighborhoods'
  },

  // Group L: Blue Sky Boomers
  {
    id: 'L46',
    name: 'Booming and Consuming',
    description: 'Baby boomers in small towns with active consumer lifestyles',
    traits: [
      'Active consumer behavior',
      'Small town boomer lifestyle',
      'Established spending patterns',
      'Traditional retail preference',
      'Brand loyalty strength',
      'Community involvement',
      'Travel interest',
      'Health consciousness',
      'Grandparent role enjoyment',
      'Traditional communication',
      'Conservative political views',
      'Local business support'
    ],
    groupId: 'L',
    groupName: 'Blue Sky Boomers'
  },
  {
    id: 'L47',
    name: 'Rooted Flower Power',
    description: 'Former hippies and counterculture participants now living settled lives',
    traits: [
      'Counterculture background',
      'Environmental consciousness',
      'Alternative lifestyle elements',
      'Arts and culture appreciation',
      'Community garden participation',
      'Organic product preference',
      'Independent business support',
      'Creative pursuits',
      'Progressive political views',
      'Traditional craft appreciation',
      'Local food movement',
      'Sustainable living practices'
    ],
    groupId: 'L',
    groupName: 'Blue Sky Boomers'
  },
  {
    id: 'L48',
    name: 'Homemade Happiness',
    description: 'Self-reliant boomers finding satisfaction in home-based activities and crafts',
    traits: [
      'Home-based activity focus',
      'Self-reliance emphasis',
      'Craft and hobby engagement',
      'DIY project preference',
      'Home garden maintenance',
      'Traditional skill preservation',
      'Thrift and resourcefulness',
      'Family recipe traditions',
      'Local community involvement',
      'Practical lifestyle approach',
      'Conservative spending habits',
      'Traditional value emphasis'
    ],
    groupId: 'L',
    groupName: 'Blue Sky Boomers'
  },

  // Group M: Families in Motion
  {
    id: 'M49',
    name: 'Soccer Moms and Dads',
    description: 'Active families heavily involved in children\'s sports and activities',
    traits: [
      'Children\'s sports involvement',
      'Active family lifestyle',
      'Multiple activity scheduling',
      'Sports equipment investment',
      'Family nutrition focus',
      'Community sports support',
      'Transportation efficiency needs',
      'Team fundraising participation',
      'Athletic brand preference',
      'Health and fitness emphasis',
      'Educational achievement support',
      'Social networking through sports'
    ],
    groupId: 'M',
    groupName: 'Families in Motion'
  },
  {
    id: 'M50',
    name: 'Family Scramble',
    description: 'Busy families juggling multiple commitments and activities',
    traits: [
      'Multiple commitment management',
      'Time pressure challenges',
      'Convenience service reliance',
      'Efficiency prioritization',
      'Family coordination needs',
      'Technology assistance usage',
      'Quick meal solutions',
      'Multitasking necessity',
      'Stress management needs',
      'Family communication emphasis',
      'Organization system importance',
      'Balance seeking behavior'
    ],
    groupId: 'M',
    groupName: 'Families in Motion'
  },
  {
    id: 'M51',
    name: 'Active Senior Years',
    description: 'Energetic seniors maintaining active lifestyles and community involvement',
    traits: [
      'Active senior lifestyle',
      'Community involvement',
      'Travel and recreation',
      'Health and wellness focus',
      'Grandparent role engagement',
      'Volunteer activity participation',
      'Learning and education',
      'Social group membership',
      'Cultural activity attendance',
      'Technology selective adoption',
      'Quality service preference',
      'Legacy planning consideration'
    ],
    groupId: 'M',
    groupName: 'Families in Motion'
  },
  {
    id: 'M52',
    name: 'Multi-Cultural Mosaic',
    description: 'Diverse families blending multiple cultural traditions and values',
    traits: [
      'Multi-cultural identity',
      'Cultural tradition blending',
      'Diverse community involvement',
      'Language diversity',
      'International food preferences',
      'Cultural celebration participation',
      'Educational achievement emphasis',
      'Family extended network importance',
      'Cultural product interest',
      'Community diversity appreciation',
      'International media consumption',
      'Cultural bridge building'
    ],
    groupId: 'M',
    groupName: 'Families in Motion'
  },

  // Group N: Aspirational Fusion
  {
    id: 'N53',
    name: 'American Dreamers',
    description: 'Immigrant families and first-generation Americans pursuing economic advancement',
    traits: [
      'American Dream pursuit',
      'Economic advancement focus',
      'Educational achievement emphasis',
      'Family sacrifice willingness',
      'Cultural heritage preservation',
      'Community mutual support',
      'Entrepreneurial interest',
      'Financial goal orientation',
      'Children\'s future prioritization',
      'Hard work ethic',
      'Value-conscious spending',
      'Community bridge building'
    ],
    groupId: 'N',
    groupName: 'Aspirational Fusion'
  },
  {
    id: 'N54',
    name: 'Diverse Dynamics',
    description: 'Ethnically diverse households with varied cultural backgrounds and aspirations',
    traits: [
      'Ethnic diversity',
      'Cultural adaptation',
      'Multi-generational household dynamics',
      'Language diversity management',
      'Cultural food preferences',
      'Educational investment prioritization',
      'Community involvement',
      'Traditional value preservation',
      'Modern lifestyle adaptation',
      'Economic mobility focus',
      'Family unity emphasis',
      'Cultural celebration participation'
    ],
    groupId: 'N',
    groupName: 'Aspirational Fusion'
  },
  {
    id: 'N55',
    name: 'Salsa and Suburbs',
    description: 'Hispanic families adapting to suburban American life while maintaining cultural identity',
    traits: [
      'Hispanic cultural identity',
      'Suburban lifestyle adaptation',
      'Bilingual household dynamics',
      'Extended family importance',
      'Cultural food traditions',
      'Religious participation',
      'Educational achievement focus',
      'Community celebration involvement',
      'Traditional gender roles evolution',
      'Economic opportunity pursuit',
      'Cultural product preference',
      'Family-centered decision making'
    ],
    groupId: 'N',
    groupName: 'Aspirational Fusion'
  },
  {
    id: 'N56',
    name: 'New Americans',
    description: 'Recent immigrants working to establish themselves in American society',
    traits: [
      'Recent immigration experience',
      'Cultural adaptation process',
      'Language learning prioritization',
      'Economic establishment focus',
      'Community network building',
      'Traditional culture preservation',
      'Educational system navigation',
      'Employment opportunity pursuit',
      'Family reunification efforts',
      'Cultural bridge building',
      'Value-conscious consumption',
      'Community mutual assistance'
    ],
    groupId: 'N',
    groupName: 'Aspirational Fusion'
  },

  // Group O: Ambitious Achievers
  {
    id: 'O57',
    name: 'Strivers and Thrivers',
    description: 'Hardworking households pushing for economic and social advancement',
    traits: [
      'Economic advancement drive',
      'Social mobility pursuit',
      'Hard work ethic',
      'Goal-oriented behavior',
      'Educational investment',
      'Skill development focus',
      'Network building efforts',
      'Quality brand aspiration',
      'Future planning emphasis',
      'Family improvement focus',
      'Community involvement',
      'Achievement recognition seeking'
    ],
    groupId: 'O',
    groupName: 'Ambitious Achievers'
  },
  {
    id: 'O58',
    name: 'Aspiring Achievers',
    description: 'Motivated individuals and families working to improve their circumstances',
    traits: [
      'Improvement motivation',
      'Circumstance advancement',
      'Opportunity seeking',
      'Skill building focus',
      'Educational advancement pursuit',
      'Career development emphasis',
      'Financial goal setting',
      'Quality investment choices',
      'Future orientation',
      'Community resource utilization',
      'Mentor relationship seeking',
      'Success story inspiration'
    ],
    groupId: 'O',
    groupName: 'Ambitious Achievers'
  },
  {
    id: 'O59',
    name: 'Up and Coming',
    description: 'Emerging households showing signs of upward mobility and success',
    traits: [
      'Upward mobility trajectory',
      'Success indicator development',
      'Income growth potential',
      'Career advancement progress',
      'Property ownership aspiration',
      'Educational achievement focus',
      'Brand consciousness development',
      'Technology adoption for advancement',
      'Network expansion efforts',
      'Investment beginning',
      'Quality service appreciation',
      'Community status building'
    ],
    groupId: 'O',
    groupName: 'Ambitious Achievers'
  },

  // Group P: Persevering Families
  {
    id: 'P60',
    name: 'Family Thrifts',
    description: 'Families managing limited budgets while providing for children\'s needs',
    traits: [
      'Budget management necessity',
      'Children\'s needs prioritization',
      'Thrift shopping expertise',
      'Coupon and deal utilization',
      'Resourcefulness emphasis',
      'Community resource awareness',
      'Value shopping mastery',
      'Family activity creativity',
      'Educational support despite constraints',
      'Community mutual aid',
      'Practical decision making',
      'Future hope maintenance'
    ],
    groupId: 'P',
    groupName: 'Persevering Families'
  },
  {
    id: 'P61',
    name: 'Sustaining Families',
    description: 'Working families maintaining stability despite economic pressures',
    traits: [
      'Economic pressure management',
      'Family stability maintenance',
      'Multiple income source necessity',
      'Essential prioritization',
      'Community support utilization',
      'Resilience development',
      'Practical lifestyle choices',
      'Educational value emphasis',
      'Family unity importance',
      'Local resource knowledge',
      'Conservative spending habits',
      'Hope and perseverance'
    ],
    groupId: 'P',
    groupName: 'Persevering Families'
  },
  {
    id: 'P62',
    name: 'Overcoming Obstacles',
    description: 'Families working to overcome significant economic and social challenges',
    traits: [
      'Obstacle overcoming focus',
      'Challenge navigation skills',
      'Resilience building',
      'Support system utilization',
      'Resource maximization',
      'Goal persistence',
      'Community connection importance',
      'Survival skill development',
      'Hope maintenance',
      'Family protection priority',
      'Opportunity recognition',
      'Mutual assistance participation'
    ],
    groupId: 'P',
    groupName: 'Persevering Families'
  },
  {
    id: 'P63',
    name: 'Working Hard',
    description: 'Hardworking households putting in extra effort to make ends meet',
    traits: [
      'Extra effort necessity',
      'Multiple job management',
      'Hard work ethic',
      'Family sacrifice willingness',
      'Budget stretching expertise',
      'Community resource awareness',
      'Practical skill development',
      'Time management importance',
      'Family support system',
      'Essential focus',
      'Future improvement hope',
      'Persistence and determination'
    ],
    groupId: 'P',
    groupName: 'Persevering Families'
  },

  // Group Q: Challenged Circumstances
  {
    id: 'Q64',
    name: 'Surviving and Struggling',
    description: 'Households facing significant financial hardships and resource constraints',
    traits: [
      'Financial hardship management',
      'Resource constraint navigation',
      'Survival priority focus',
      'Support service dependence',
      'Community assistance utilization',
      'Basic need prioritization',
      'Resilience necessity',
      'Crisis management skills',
      'Family protection emphasis',
      'Hope maintenance challenges',
      'Mutual aid participation',
      'Resource conservation'
    ],
    groupId: 'Q',
    groupName: 'Challenged Circumstances'
  },
  {
    id: 'Q65',
    name: 'Difficult Times',
    description: 'Families experiencing temporary or ongoing economic difficulties',
    traits: [
      'Economic difficulty experience',
      'Temporary or chronic challenges',
      'Support system importance',
      'Resource assistance need',
      'Family stress management',
      'Basic security focus',
      'Community connection necessity',
      'Coping strategy development',
      'Essential service dependence',
      'Future uncertainty management',
      'Survival prioritization',
      'Mutual support participation'
    ],
    groupId: 'Q',
    groupName: 'Challenged Circumstances'
  },
  {
    id: 'Q66',
    name: 'Limited Resources',
    description: 'Households with very limited financial resources and few economic options',
    traits: [
      'Very limited financial resources',
      'Few economic options',
      'Subsistence living',
      'Public assistance dependence',
      'Community support necessity',
      'Basic survival focus',
      'Resource sharing importance',
      'Crisis vulnerability',
      'Family protection priority',
      'Hope maintenance difficulty',
      'Community connection vital',
      'Survival skill necessity'
    ],
    groupId: 'Q',
    groupName: 'Challenged Circumstances'
  },

  // Group R: Factory and Farming
  {
    id: 'R67',
    name: 'Heartland Communities',
    description: 'Rural residents in agricultural communities with traditional values',
    traits: [
      'Rural agricultural community',
      'Traditional value system',
      'Agricultural lifestyle',
      'Community interdependence',
      'Seasonal income patterns',
      'Conservative political views',
      'Local institution loyalty',
      'Traditional family structure',
      'Practical lifestyle approach',
      'Self-reliance emphasis',
      'Local business support',
      'Traditional recreation preferences'
    ],
    groupId: 'R',
    groupName: 'Factory and Farming'
  },
  {
    id: 'R68',
    name: 'Rural Industrious',
    description: 'Working-class residents in rural industrial areas maintaining strong work ethics',
    traits: [
      'Rural industrial employment',
      'Strong work ethic',
      'Blue-collar job focus',
      'Community solidarity',
      'Practical lifestyle choices',
      'Traditional family values',
      'Local community involvement',
      'Conservative spending habits',
      'Practical transportation needs',
      'Traditional entertainment',
      'Local business loyalty',
      'Community mutual support'
    ],
    groupId: 'R',
    groupName: 'Factory and Farming'
  },
  {
    id: 'R69',
    name: 'Small Town Simplicity',
    description: 'Small town residents living simple lives with strong community connections',
    traits: [
      'Small town residence',
      'Simple lifestyle preference',
      'Strong community connections',
      'Traditional value emphasis',
      'Local institution support',
      'Conservative political views',
      'Family-centered activities',
      'Local business loyalty',
      'Traditional shopping patterns',
      'Community event participation',
      'Religious involvement',
      'Hometown pride'
    ],
    groupId: 'R',
    groupName: 'Factory and Farming'
  },

  // Group S: Non-Family Households
  {
    id: 'S70',
    name: 'Solo and Sophisticated',
    description: 'Single adults living independently with refined tastes and urban lifestyles',
    traits: [
      'Independent single lifestyle',
      'Refined taste development',
      'Urban living preference',
      'Cultural activity engagement',
      'Professional career focus',
      'Quality over quantity approach',
      'Technology integration',
      'Travel and experience prioritization',
      'Social networking',
      'Personal development focus',
      'Premium service appreciation',
      'Environmental consciousness'
    ],
    groupId: 'S',
    groupName: 'Non-Family Households'
  },
  {
    id: 'S71',
    name: 'Singles and Starters',
    description: 'Young single adults beginning their independent lives and careers',
    traits: [
      'Independent life beginning',
      'Career establishment focus',
      'Single lifestyle optimization',
      'Budget management learning',
      'Social life prioritization',
      'Technology native status',
      'Brand experimentation',
      'Experience accumulation',
      'Network building',
      'Personal growth emphasis',
      'Future planning beginning',
      'Community exploration'
    ],
    groupId: 'S',
    groupName: 'Non-Family Households'
  }
];

/**
 * Helper function to get a Mosaic category by ID
 */
export function getMosaicCategoryById(id: string): MosaicCategory | undefined {
  return MOSAIC_CATEGORIES.find(category => category.id === id);
}

/**
 * Helper function to get a Mosaic category by name
 */
export function getMosaicCategoryByName(name: string): MosaicCategory | undefined {
  return MOSAIC_CATEGORIES.find(category => category.name === name);
}

/**
 * Helper function to get all categories in a specific group
 */
export function getMosaicCategoriesByGroup(groupId: string): MosaicCategory[] {
  return MOSAIC_CATEGORIES.filter(category => category.groupId === groupId);
}

/**
 * Helper function to get a Mosaic group by ID
 */
export function getMosaicGroupById(id: string): MosaicGroup | undefined {
  return MOSAIC_GROUPS.find(group => group.id === id);
}

/**
 * Helper function to get a random Mosaic category
 */
export function getRandomMosaicCategory(): MosaicCategory {
  const randomIndex = Math.floor(Math.random() * MOSAIC_CATEGORIES.length);
  return MOSAIC_CATEGORIES[randomIndex];
}

/**
 * Helper function to get a random Mosaic category from a specific group
 */
export function getRandomMosaicCategoryFromGroup(groupId: string): MosaicCategory | undefined {
  const groupCategories = getMosaicCategoriesByGroup(groupId);
  if (groupCategories.length === 0) return undefined;

  const randomIndex = Math.floor(Math.random() * groupCategories.length);
  return groupCategories[randomIndex];
}

/**
 * Helper function to search categories by traits
 */
export function getMosaicCategoriesByTrait(trait: string): MosaicCategory[] {
  return MOSAIC_CATEGORIES.filter(category =>
    category.traits.some(t => t.toLowerCase().includes(trait.toLowerCase()))
  );
}
