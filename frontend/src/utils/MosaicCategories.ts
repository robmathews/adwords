/**
 * Simplified representation of Experian Mosaic categories
 * In a real implementation, this would be more comprehensive
 */

export interface MosaicCategory {
  id: string;
  name: string;
  description: string;
  traits: string[];
}

export const MOSAIC_CATEGORIES: MosaicCategory[] = [
  {
    id: 'A',
    name: 'Affluent Achievers',
    description: 'Affluent homeowners who live in the most expensive homes and enjoy the finest things in life',
    traits: [
      'High income',
      'High disposable income',
      'Executive careers',
      'Luxury purchases',
      'Early technology adopters with high spend'
    ]
  },
  {
    id: 'B',
    name: 'Rising Prosperity',
    description: 'Young, highly educated professionals who live in major cities and commuter towns',
    traits: [
      'Young professionals',
      'High growth career paths',
      'Urban living',
      'Tech-savvy',
      'Modern luxury purchases',
      'Status-conscious consumers'
    ]
  },
  {
    id: 'C',
    name: 'Comfortable Communities',
    description: 'People who live in mid-market homes and work in mid-level jobs',
    traits: [
      'Middle income',
      'Suburban living',
      'Family-oriented',
      'Value-conscious shoppers',
      'Balanced lifestyle'
    ]
  },
  {
    id: 'D',
    name: 'Financially Stretched',
    description: 'People who live in modest homes and have limited resources',
    traits: [
      'Lower middle income',
      'Budget-conscious',
      'Careful purchasers',
      'Deal seekers',
      'Practical consumers'
    ]
  },
  {
    id: 'E',
    name: 'Urban Cohesion',
    description: 'City dwellers who live in close-knit urban communities',
    traits: [
      'Diverse backgrounds',
      'Urban lifestyle',
      'Trend followers',
      'Social media active',
      'Community-oriented'
    ]
  },
  {
    id: 'F',
    name: 'Suburban Mindsets',
    description: 'Families with mid-level incomes living in suburban homes',
    traits: [
      'Family-focused',
      'Traditional values',
      'Regular shoppers',
      'Mainstream tastes',
      'Practical homeowners'
    ]
  },
  {
    id: 'G',
    name: 'Modest Traditions',
    description: 'Older people living in inexpensive homes in suburban areas',
    traits: [
      'Traditional consumers',
      'Value-oriented',
      'Slower technology adoption',
      'Brand loyal',
      'Homeowners'
    ]
  },
  {
    id: 'H',
    name: 'Not Private Households',
    description: 'People living in communal establishments or residential care',
    traits: [
      'Communal living',
      'Managed finances',
      'Specialized needs',
      'Limited consumer power'
    ]
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
 * Helper function to get a random Mosaic category
 */
export function getRandomMosaicCategory(): MosaicCategory {
  const randomIndex = Math.floor(Math.random() * MOSAIC_CATEGORIES.length);
  return MOSAIC_CATEGORIES[randomIndex];
}