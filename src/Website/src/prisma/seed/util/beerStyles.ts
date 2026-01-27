interface BeerStyle {
  name: string;
  description: string;
  glassware: string;
  abvRange: [number, number];
  ibuRange: [number, number];
}

const beerStyles: BeerStyle[] = [
  {
    name: 'IPA',
    description:
      'India Pale Ale (IPA) is a hop-forward beer known for its distinctively bitter and citrusy flavor. It often features floral, piney, and fruity notes, with a moderate to high alcohol content. IPAs are usually served in a pint glass, and their alcohol by volume (ABV) typically falls in the range of 6.0% to 7.5%. The International Bitterness Units (IBU) range from 40 to 70, giving it a pleasantly bitter profile.',
    glassware: 'Pint Glass',
    abvRange: [6.0, 7.5],
    ibuRange: [40, 70],
  },
  {
    name: 'Stout',
    description:
      'Stout is a dark, rich beer characterized by its roasted malt and coffee flavors. It has a creamy texture and can often include hints of chocolate, caramel, and even oatmeal. Typically served in a pint glass, stouts have an ABV range of 4.0% to 7.0% and an IBU range of 30 to 40, providing a balanced bitterness.',
    glassware: 'Pint Glass',
    abvRange: [4.0, 7.0],
    ibuRange: [30, 40],
  },
  {
    name: 'Pilsner',
    description:
      'Pilsner is a pale lager celebrated for its crisp and refreshing taste. It offers a clean, balanced flavor profile with a slightly bitter finish. Pilsners are commonly served in tall, slender pilsner glasses and have an ABV range of 4.0% to 6.0%. The IBU typically ranges from 25 to 45, providing a mild hop presence that complements the malt sweetness.',
    glassware: 'Pilsner Glass',
    abvRange: [4.0, 6.0],
    ibuRange: [25, 45],
  },
  {
    name: 'Wheat Beer',
    description:
      "Wheat beer is a light and cloudy ale with a slightly fruity flavor and often a touch of spice. It's typically served in weizen glasses. The ABV range for wheat beers falls between 4.0% and 5.5%, with an IBU range of 10 to 20, making it a refreshing and approachable choice, perfect for warm days.",
    glassware: 'Weizen Glass',
    abvRange: [4.0, 5.5],
    ibuRange: [10, 20],
  },
  {
    name: 'Porter',
    description:
      'Porter is a dark, full-bodied beer known for its rich malt character with notes of chocolate, caramel, and roasted coffee. This beer is typically served in pint glasses. Porters have an ABV range of 4.0% to 6.5% and an IBU range of 20 to 40, providing a harmonious balance between malt sweetness and hop bitterness.',
    glassware: 'Pint Glass',
    abvRange: [4.0, 6.5],
    ibuRange: [20, 40],
  },
  {
    name: 'Belgian Tripel',
    description:
      "Belgian Tripel is a strong and complex ale with a fruity and spicy character. It is served in chalices to enhance its aroma. The ABV range is relatively high, typically ranging from 7.5% to 10.5%, while the IBU falls between 20 and 40, providing a subdued bitterness. The beer's strength and flavor make it a sipping choice.",
    glassware: 'Chalice',
    abvRange: [7.5, 10.5],
    ibuRange: [20, 40],
  },
  {
    name: 'Saison',
    description:
      'Saison is a farmhouse ale known for its fruity, spicy, and often slightly tart character. Served in tulip glasses, saisons have an ABV range of 5.0% to 7.0% and an IBU range of 20 to 35. This style offers a refreshing and unique flavor profile, making it a versatile choice for different occasions.',
    glassware: 'Tulip Glass',
    abvRange: [5.0, 7.0],
    ibuRange: [20, 35],
  },
  {
    name: 'Amber Ale',
    description:
      'Amber Ale is a well-balanced beer with a pleasant blend of caramel malt sweetness and hop bitterness. Typically served in pint glasses, amber ales have an ABV range of 4.5% to 6.2% and an IBU range of 20 to 40, creating a harmonious and approachable beer with a rich amber hue.',
    glassware: 'Pint Glass',
    abvRange: [4.5, 6.2],
    ibuRange: [20, 40],
  },
  {
    name: 'Barleywine',
    description:
      'Barleywine is a robust ale with a high alcohol content and a complex malt character. It is typically served in snifter glasses to concentrate its aroma. The ABV for barleywines ranges from 8.0% to 12.0%, and the IBU can be notably high, falling between 50 and 100, resulting in a strong, bold, and flavorful beer.',
    glassware: 'Snifter Glass',
    abvRange: [8.0, 12.0],
    ibuRange: [50, 100],
  },
  {
    name: 'Hefeweizen',
    description:
      'Hefeweizen is a wheat beer with a hazy appearance and distinctive banana-clove flavors. Served in weizen glasses, hefeweizens have an ABV range of 4.0% to 5.6% and a mild IBU range of 8 to 15. The combination of yeast and wheat imparts a refreshing and slightly spicy character.',
    glassware: 'Weizen Glass',
    abvRange: [4.0, 5.6],
    ibuRange: [8, 15],
  },
];

export default beerStyles;
