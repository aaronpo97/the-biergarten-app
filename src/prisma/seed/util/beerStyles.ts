interface BeerStyle {
  name: string;
  description: string;
  glassware: string;
  abvRange: [number, number];
  ibuRange: [number, number];
}

const beerStyles: BeerStyle[] = [
  {
    name: 'Bock',
    description:
      'Bock is a bottom fermenting lager that generally takes extra months of lagering (cold storage) to smooth out such a strong brew. Bock beer in general is stronger than your typical lager, more of a robust malt character with a dark amber to brown hue. Hop bitterness can be assertive enough to balance, though must not get in the way of the malt flavor, most are only lightly hopped.',
    glassware: 'Tulip',
    abvRange: [6.3, 7.6],
    ibuRange: [20, 30],
  },
  {
    name: 'Doppelbock',
    description:
      '“Doppel” meaning “double,” this style is a bigger and stronger version of the lower-gravity German-Style Bock beers. Originally made by monks in Munich, the Doppelbock beer style is very food-friendly and rich in melanoidins reminiscent of toasted bread. Color is copper to dark brown. Malty sweetness is dominant but should not be cloying. Malt character is more reminiscent of fresh and lightly toasted Munich-style malt, more so than caramel or toffee malt. Doppelbocks are full-bodied, and alcoholic strength is on the higher end.',
    glassware: 'Tulip',
    abvRange: [6.6, 7.9],
    ibuRange: [17, 27],
  },
  {
    name: 'Eisbock',
    description:
      'Eisbock is an extremely strong beer with a typical alcohol content well beyond 7 percent',
    glassware: 'Snifter',
    abvRange: [7, 14],
    ibuRange: [25, 35],
  },
  {
    name: 'Maibock',
    description:
      'Also called “Heller Bock” (meaning “Pale Bock”), the German-Style Maibock is paler in color and more hop-centric than traditional Bock beers. A lightly toasted and/or bready malt character is often evident.',
    glassware: 'Goblet (or Chalice)',
    abvRange: [6.3, 8.1],
    ibuRange: [20, 38],
  },
  {
    name: 'Weizenbock',
    description:
      'The German-style Weizenbock is a wheat version of a German-Style Bock, or a bigger and beefier Dunkelweizen. Malt melanoidins and Weizen Ale yeast are the star ingredients. If served with yeast, the appearance may appropriately be very cloudy. With flavors of bready malt and dark fruits like plum, raisin, and grape, this style is low on bitterness and high on carbonation. Balanced clove-like phenols and fruity, banana-like esters produce a well-rounded aroma.',
    glassware: 'Tulip',
    abvRange: [7, 9.5],
    ibuRange: [15, 35],
  },
  {
    name: 'Altbier',
    description:
      'A Düsseldorf specialty, an Altbier is a German-style Brown Ale. The word alt literally translates to "old" in German, and traditionally Altbiers are conditioned for longer than normal periods of time. Other sources note that "alt" is derived from the Latin word "altus," which means "high" and refers to the rising yeast. Take your pick, but the extended conditioning mellows out this ale\'s fruitiness and produces an exceptionally smooth, clean, and delicate brew. Its color ranges from amber to dark brown, carbonation is moderate, and while known to express the slightly spicy, herbal character of Noble hops, the key word here is balance. A stronger version brewed less frequently, "Sticke Alt" is a maltier and hoppier take on the Altbier.',
    glassware: 'Stange (Slender Cylinder)',
    abvRange: [4, 7],
    ibuRange: [25, 50],
  },
  {
    name: 'American Brown Ale',
    description:
      'Roasted malt, caramel-like and chocolate-like characters should be of medium intensity in both flavor and aroma for the American brown ale. American-style brown ales have evident low to medium hop flavor and aroma and medium to high hop bitterness. The history of this style dates back to U.S. homebrewers who were inspired by English-style brown ales and porters. It sits in flavor between those British styles and is more bitter than both.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4.2, 8.8],
    ibuRange: [25, 45],
  },
  {
    name: 'Belgian Dark Ale',
    description:
      'Belgian Darks offer a massive range of characters. The colors play within the amber to light brown and even deep garnet range of hues, topped with thick, rocky heads of great retention. Aromas can offer anything from traces of yeast, spices, malt, floral attributes, and on occasion, slightly intoxicating notes. Flavors run the gamut from dry and spiced, to sweet and malty. Most examples of Belgian Dark Ale have a low level of bitterness.',
    glassware: 'Goblet (or Chalice)',
    abvRange: [4.5, 7.5],
    ibuRange: [15, 25],
  },
  {
    name: 'English Brown Ale',
    description:
      'Spawned from the Mild Ale tradition, English Brown Ales tend to be maltier and sweeter on the palate, with a somewhat fuller body. Color can range from a medium amber/reddish hue to dark brown. Some versions will lean towards fruity esters, while others tend to be drier with nutty characteristics. Roasty malt notes give this style complexity, but almost every example has both a minimal amount of hop aroma and low degree of hop bitterness. As with most historical English styles, alcohol levels are kept low to promote drinkability.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4.2, 7],
    ibuRange: [15, 25],
  },
  {
    name: 'English Dark Mild Ale',
    description:
      'The quintessential British session beer, like its name suggests, a Mild is known for its low level of hop character. Similarly, the alcohol content is traditionally very low, too. Colors can range from medium amber to rich brown. Low carbonation with a nearly still, slightly bubbly head and little to no hop aroma. Grainy to toasty malts might be present, but expect some body from the high dextrins produced during brewing. Traditionally Dark Milds were a draft beer made popular in London and the Midlands of England.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [3, 6],
    ibuRange: [20, 30],
  },
  {
    name: 'Dubbel',
    description:
      'The Belgian Dubbel is a rich, malty beer with some spicy or phenolic and mild alcoholic characteristics. Not as much fruitiness as a Belgian Strong Dark Ale, but some dark fruit aromas and flavors may be present. Medium amber to deep brown, this style is recognizable for its mild hop bitterness with no lingering hop flavors. A Dubbel is also likely to show signs of a sweeter caramel flavor from the use of crystal malt or dark candi sugar. Look for a medium to full body with an expressive carbonation and some dryness in the finish. Traditionally a Trappist ale, many breweries now make similar "Abbey Dubbels" to try and emulate the monastic originals (Trappist Westvleteren 8, Westmalle Trappist Dubbel, and Chimay Première).',
    glassware: 'Goblet (or Chalice)',
    abvRange: [6, 9],
    ibuRange: [15, 30],
  },
  {
    name: 'Roggenbier',
    description:
      'Roggenbier is akin to a Dunkelweizen made with rye rather than wheat, but with a greater body and light finishing hops. Expect a very pronounced spiciness and sour-like rye character, malty flavor, and a clean hop character. Often unfiltered and bottle-conditioned, Roggenbiers tend to be rather turbid and foamy.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4.5, 6],
    ibuRange: [10, 20],
  },
  {
    name: 'Scottish Ale',
    description:
      'Scottish-Style Ales vary depending on strength and flavor, but in general retain a malt-forward character with some degree of caramel-like malt flavors and a soft and chewy mouthfeel. Some examples feature a light smoked peat flavor. Hops do not play a huge role in this style. The numbers commonly associated with brands of this style (60/70/80 and others) reflect the Scottish tradition of listing the cost, in shillings, of a hogshead (large cask) of beer. Overly smoked versions would be considered specialty examples. Smoke or peat should be restrained.',
    glassware: 'Tulip',
    abvRange: [2.8, 5.3],
    ibuRange: [9, 25],
  },
  {
    name: 'Winter Warmer',
    description:
      'These malty, sweet offerings tend to be a favorite winter seasonal. A big malt presence, both in flavor and body, leads the way. The color of this style ranges from brownish reds to nearly pitch black. Hop bitterness is generally low and balanced, but hop character can be pronounced in the aroma. Alcohol warmth is not uncommon. Many English versions contain no spices, though some brewers of spiced seasonal ales will slap "Winter Warmer" on the label. Those that are spiced, tend to follow the "wassail" tradition of blending robust ales with some combination of cinnamon, ginger, nutmeg, and the like before hops became the chief "spice" in beer. American varieties many have a larger presence of hops both in bitterness and flavor.',
    glassware: 'Goblet (or Chalice)',
    abvRange: [5.5, 8],
    ibuRange: [35, 50],
  },
  {
    name: 'American Amber / Red Lager',
    description:
      'A widely available, sessionable craft beer style that showcases both malt and hops. Amber lagers are a medium-bodied lager with a toasty or caramel-like malt character. Hop bitterness can range from very low to medium-high. Brewers may use decoction mash and dry-hopping to achieve advanced flavors.',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [4.8, 5.4],
    ibuRange: [18, 30],
  },
  {
    name: 'Czech Amber Lager',
    description: '(In progress)',
    glassware: 'Mug (or Seidel, Stein)',
    abvRange: [4.4, 5.8],
    ibuRange: [20, 35],
  },
  {
    name: 'Czech Dark Lager',
    description: '(In progress.)',
    glassware: 'Mug (or Seidel, Stein)',
    abvRange: [4.4, 5.8],
    ibuRange: [18, 34],
  },
  {
    name: 'European Dark Lager',
    description:
      'This style encompasses a wide range of dark beers including India Pale Lagers, Czech lagers, and lagers brewed with adjuncts or non-traditional ingredients. In time these entries will be moved into more accurate categories.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4, 7],
    ibuRange: [15, 40],
  },
  {
    name: 'Märzen',
    description:
      'Märzenbier ranges from dark amber to deep copper in color. It\'s a full-bodied lager that\'s rich, malty (toasty, bready, biscuity, caramel, roasty), moderately hopped (floral, spicy, herbal), and finishes clean and dry like a good lager should. Alcohol can bite and warm a bit, but overall should be tame.\n\nHistorically, Märzen (March in German) was brewed in the spring, lagered in caves (stored cold) during the summer months, and served in the fall. From 1872 to the 1990s, the style was served at, and widely associated with, Oktoberfest in Munich until the lighter Festbier became popular and adopted as the official Oktoberfestbier. That said, brewers around the world still brew "Oktoberfest" and "Fest" beers that lean toward the Märzen style.',
    glassware: 'Mug (or Seidel, Stein)',
    abvRange: [5.8, 6.3],
    ibuRange: [18, 24],
  },
  {
    name: 'Munich Dunkel',
    description:
      'An old friend of Bavaria, Munich Dunkels are smooth, rich, and complex without being overly heady or heavy. They boast brilliant ruby hues from the large amounts of Munich malts used, and these malts also create a fuller-bodied beer. In addition, the decoction brewing process lends much depth and richness of flavor. Little to no hop aroma is detectable; the nose is dominated by malty notes of bread, nuts, and perhaps a touch of chocolate. Hop varieties used tend to be German Noble varieties like Tettnanger and Hallertau. Bitterness is often moderate, with just enough to balance out any sweetness.',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [4, 6],
    ibuRange: [15, 25],
  },
  {
    name: 'Rauchbier',
    description:
      'Rauchbier is an old German beer style with origins in the 1500s from the district of Franconia and the town of Bamberg. Typically dark to amber in color, it shares similarities with Oktoberfestbier. Green malts are dried over an open fire of beechwood, imparting a unique smokiness ("rauch" is German for smoke) to the final beverage. Expect toasty-rich malt in aroma and flavor, restrained bitterness, low to high smoke flavor, clean fermentation profile, and an attenuated finish.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4.8, 6],
    ibuRange: [20, 30],
  },
  {
    name: 'Schwarzbier',
    description:
      "Schwarzbier (\"shvahrts-beer\"), is simply German for black beer. It doesn't mean that it's necessarily heavy or light in body, although most examples tend to be lighter. Unlike Porters or Stouts and other dark beers, they are not overly bitter with the burnt and heavily roasted malt characteristics that these styles tend to depend on. Instead, hops are used to achieve a good portion of the bitterness. Smooth on the palate, soul lifting, and refreshing with a dry finish, Schwartzbiers make a great alternative for the winter months, especially when you're looking for a lighter beer, but one with depth of color and a bittersweet taste that might bring to mind coffee, cocoa, or licorice.",
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [3.8, 5.2],
    ibuRange: [20, 30],
  },
  {
    name: 'Vienna Lager',
    description:
      'Named after the city in which it originated, a traditional Vienna Lager is brewed using a three step decoction boiling process. Munich, Pilsner, Vienna, and dextrin malts are used, as well as wheat in some cases. Its color reliably falls between pale amber and medium amber—there should be a reddish hue to examples of this style. Noble hops are used subtly, with the resulting beer having a crisp quality, a toasty flavor and some residual caramel-like sweetness. Vienna Lager and German Märzen have much in common. Although Austrian in origin and rare these days, some classic examples come from Mexico, such as Dos Equis Amber, the result of late 19th century brewers immigrating from Austria.',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [4.5, 5.5],
    ibuRange: [15, 30],
  },
  {
    name: 'Bière de Champagne / Bière Brut',
    description:
      "First brewed in Belgium, Bière de Champagne or Bière Brut typically undergo a lengthy maturation. Some are even cave-aged in the Champagne region of France and are then subjected to remuage and dégorgement, which is the \"methode de champenoise'' process of removing yeast from the bottle. Most are delicate, high in alcohol, and highly carbonated. Less frequently you'll come across a spiced example. The color of Bière de Champagne can range from very pale gold to a darker pale amber. Often presented in 750 milliliter champagne-style corked and caged bottles.",
    glassware: 'Flute',
    abvRange: [6, 12],
    ibuRange: [10, 35],
  },
  {
    name: 'Braggot',
    description:
      'With references dating into the 12th century, Braggot was historically made by blending spices and herbs with mead and beer. Many taverns would make this blend right at the bar, though brewers would also blend them as well. The ultimate goal is a beverage with perceivable honey and beer qualities (meaning malt, hops and/or yeast) that compliment each other, though not necessarily equally present. Ideally, there should be a balance between the honey character and malt flavor with the hop bitterness not overpowering the sweetness while remaining noticeable.',
    glassware: 'Tulip',
    abvRange: [6, 12],
    ibuRange: [20, 40],
  },
  {
    name: 'California Common / Steam Beer',
    description:
      'The California Common, or Steam Beer, is a hybrid style unique to the US. It\'s usually brewed with a special strain of lager yeast that works better at warmer (ale-like) temperatures. This method dates back to the late 1800\'s in California when refrigeration was a great luxury. At the time, brewers had to improvise to cool the beer down, so shallow fermenters were used. In a way, the lager yeast was trained to ferment quicker at warmer temperatures. Today\'s examples are light amber to tawny red in color, medium bodied, and possess a malty character. Some mild fruitiness along with an herbal yet assertive hop bitterness are also typical. San Francisco\'s Anchor Brewing Company trademarked the term "Steam Beer" and as such all other examples of the style must be legally referred to as "California Common."',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4, 6],
    ibuRange: [35, 45],
  },
  {
    name: 'Cream Ale',
    description:
      'Cream Ales, spawned from the American light lager style, are brewed as an ale though are sometimes finished with a lager yeast or with lager beer mixed into the final product. Adjuncts such as corn or rice are frequently used to lighten the body but it is not uncommon for smaller craft brewers to make all malt Cream Ales. Pale straw to pale gold in color, they were known to have a low degree of hop bittering yet some hop aroma. More recently, a number of breweries have put their stamp on the style by giving it more of a hoppy character, nudging it toward Imperial. Well carbonated and well attenuated.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4, 8.5],
    ibuRange: [10, 22],
  },
  {
    name: 'American IPA',
    description:
      "Today's American India Pale Ale (IPA) is a different soul from the IPA style first reincarnated in the 1980s. More flavorful and aromatic than the withering English IPA, its color can range from very pale golden to reddish amber. Hops are the star here, and those used in the style tend to be American with an emphasis on herbal, piney, and/or fruity (especially citrusy) varieties. Southern Hemisphere and experimental hops do appear with some frequency though, as brewers seek to distinguish their flagship IPA from a sea of competitors. Bitterness levels vary, but typically run moderate to high. Medium bodied with a clean, bready, and balancing malt backbone, the American IPA has become a dominant force in the marketplace, influencing brewers and beer cultures worldwide.",
    glassware: 'Tulip',
    abvRange: [5.5, 7.5],
    ibuRange: [50, 70],
  },
  {
    name: 'Belgian IPA',
    description:
      "Inspired by American India Pale Ales and Double IPAs, more and more Belgian brewers (like Chouffe & Urthel) are brewing hoppy pale colored ales for the US market. There's been an increase of American brewers making Belgian IPAs, too. Generally, Belgian IPAs are considered too hoppy by Belgian beer drinkers. Various malts are used, but the beers of this style are finished with Belgian yeast strains (bottle-conditioned) while the hops employed tend to be American. You'll generally find a cleaner bitterness versus American IPAs, and a pronounced dry edge, akin to an IPA crossed with a Belgian Tripel. Alcohol by volume is on the high side. Many examples are quite cloudy, and feature tight lacing, excellent head retention, and fantastic billowy heads that mesmerize (thanks, in part, to the hops). Belgian IPA is still very much a developing style.",
    glassware: 'Tulip',
    abvRange: [6, 11],
    ibuRange: [50, 80],
  },
  {
    name: 'Black IPA',
    description:
      'Black India Pales Ales (or Cascadian Dark Ales) are characterized by the perception of caramel malt and dark roasted malt flavor and aroma. Hop bitterness is perceived to be medium-high to high. Hop flavor and aroma are medium-high. Fruity, citrus, piney, floral and herbal character from hops of all origins may contribute to the overall experience.',
    glassware: 'Tulip',
    abvRange: [6.3, 7.6],
    ibuRange: [50, 70],
  },
  {
    name: 'Brut IPA',
    description:
      'One of the newest styles to excite brewers and drinkers alike, Brut IPA first appeared in California in late 2017 and is notable for its effervescence and extreme dryness. Pale straw to pale gold, this style is intended to be lighter in color and body than a typical American IPA. For that reason, the mash is often some combination of Pilsner malt, wheat, corn, and/or rice. The addition of an amylase enzyme reduces the final gravity even further. Bitterness is also kept to a minimum. Fruit-forward flavors and aromas are achieved by late hopping, dry hopping, and the use of neutral ale yeast strains. In short, these beers are highly attenuated, late hopped IPAs inspired by the appearance and mouthfeel of Champagne.',
    glassware: 'Tulip',
    abvRange: [6, 7.5],
    ibuRange: [20, 40],
  },
  {
    name: 'English IPA',
    description:
      'Historically, English breweries exported a variety of beer styles to colonies across the British empire. But shipping ales to troops stationed in India was a particular challenge in an age when the journey took months and every cask contained wild Brettanomyces yeast. To withstand the voyage, Pale Ales were tweaked to be maltier, higher in alcohol content, and hoppier, as hops are a natural preservative. Historians believe that India Pale Ale (IPA) was then watered down for the troops, while officers and the elite would savor the beer at full strength. Over time, taxation has caused the English IPA to assume a lower alcohol. The leaner the brew the less malt is required, and less is the need for a strong hop presence, which would easily put the brew out of balance. Expect earthy, floral English hop character and a malt profile defined by notes of biscuit, toast, and toffee.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4.5, 7],
    ibuRange: [35, 60],
  },
  {
    name: 'Imperial IPA',
    description:
      'We have west coast American brewers to thank for this somewhat reactionary style. Take an India Pale Ale and feed it steroids, and you\'ll end up with a Double or Imperial IPA. Although generally recognizable alongside its sister styles in the IPA family, you should expect something more robust, malty, and alcoholic with a characteristically intense hop profile in both taste and aroma. In short, these are boldly flavored, medium-bodied beers that range in color from deep gold to medium amber. The "imperial" usage comes from Russian Imperial Stout, a style of strong Stout originally brewed in England during the late 1700s for the Russian imperial court. Today Double IPA is often the preferred name in the United States.',
    glassware: 'Tulip',
    abvRange: [7, 12],
    ibuRange: [65, 100],
  },
  {
    name: 'Milkshake IPA',
    description: '(In progress.)',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [6.3, 7.5],
    ibuRange: [10, 30],
  },
  {
    name: 'New England IPA',
    description:
      'Emphasizing hop aroma and flavor without bracing bitterness, the New England IPA leans heavily on late and dry hopping techniques to deliver a bursting juicy, tropical hop experience. The skillful balance of technique and ingredient selection, often including the addition of wheat or oats, lends an alluring haze to this popular take on the American IPA.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [6.3, 7.5],
    ibuRange: [50, 70],
  },
  {
    name: 'American Amber / Red Ale',
    description:
      'Like most amber beers, American amber ale is named after the golden to amber color this American version of English pale ale exhibits. The color is derived from the use of caramel and crystal malt additions, which are roasted to provide amber beers with the color, body and flavor many beer fans have come to appreciate. Falling under the ale beer type, amber ales ferment at warmer temperatures for what is typically a much shorter amount of time than lager style beers.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4.4, 6.1],
    ibuRange: [25, 45],
  },
  {
    name: 'American Blonde Ale',
    description:
      'One of the most approachable styles, a golden or Blonde Ale is an easy-drinking beer that is visually appealing and has no particularly dominating malt or hop characteristics. Rounded and smooth, it is an American classic known for its simplicity. Sometimes referred to as “Golden Ale.” These beers can have honey, spices and fruit added, and may be fermented with lager or ale yeast.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4.1, 5.1],
    ibuRange: [15, 25],
  },
  {
    name: 'American Pale Ale',
    description:
      'Originally British in origin, this style is now popular worldwide and the use of local or imported ingredients produces variances in character from region to region. American versions tend to be cleaner and hoppier (with the piney, citrusy Cascade variety appearing frequently) than British versions, which are usually more malty, buttery, aromatic, and balanced. Pale Ales range in color from deep gold to medium amber. Fruity esters and diacetyl can vary from none to moderate, and hop aroma can range from lightly floral to bold and pungent. In general, expect a good balance of caramel malt and expressive hops with a medium body and a mildly bitter finish.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4.5, 6.5],
    ibuRange: [25, 50],
  },
  {
    name: 'Belgian Blonde Ale',
    description:
      'The Belgian-style Blonde Ale is typically easy-drinking, with a low but pleasing hop bitterness. This is a light- to medium-bodied ale, with a low malt aroma that has a spiced and sometimes fruity-ester character. Sugar is sometimes added to lighten the perceived body. This style is medium in sweetness and not as bitter as Belgian-style tripels or golden strong ales. It is usually brilliantly clear. The overall impression is balanced between light sweetness, spice and low to medium fruity ester flavors.',
    glassware: 'Tulip',
    abvRange: [6.3, 7.9],
    ibuRange: [15, 30],
  },
  {
    name: 'Belgian Pale Ale',
    description:
      "The Belgian brewing scene is littered with Belgian Pales, which were initially brewed to compete with Pilseners during the WWII era. Traditionally, they differ from other regional Pale Ales by being less bitter, using aged hops for a delicate hop finish, and having sweet to toasty malt overtones. They should be decanted properly, leaving the yeast in the bottle. This will showcase their brilliant color range from pale straw yellow to various amber hues. Most will be crowned with thick, clinging, rocky white heads. Flavors and aromas will vary. Some have natural spice character contributed by yeast and hops, while others are deliberately spiced. There's also a more recent trend to make hoppier Pale Ales to entice the US market and its hopheads. See: De Ranke XX Bitter.",
    glassware: 'Tulip',
    abvRange: [4.5, 7],
    ibuRange: [20, 30],
  },
  {
    name: 'Bière de Garde',
    description:
      'Biere de Garde translates as “beer for keeping.” This French style is popping up more and more from US producers. Blonde, amber and brown versions exist. Biere de Garde examples are light amber to chestnut brown or red in color. This style is characterized by a toasted malt aroma and slight malt sweetness. Flavor of alcohol is evident. Often bottle-conditioned, with some yeast character.',
    glassware: 'Tulip',
    abvRange: [4.4, 8],
    ibuRange: [20, 30],
  },
  {
    name: 'English Bitter',
    description:
      'The Bitter style came from brewers who wanted to differentiate these ales from other mild brews—enter pale malts and more hops. Usually gold to copper in color, most examples are light bodied and low in carbonation. Intended to be sessionable, alcohol should be low and not perceived on the palate. The hop bitterness meanwhile, is moderate to assertive. Most English Bitters have a fruitiness in the aroma and flavor; diacetyl can also be present. These beers are traditionally served cask conditioned, but many breweries now have bottled versions, too.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [3, 5],
    ibuRange: [20, 35],
  },
  {
    name: 'English Pale Ale',
    description:
      "The English Pale Ale can be traced back to the 19th century and the city of Burton-upon-Trent, a place with an abundance of hard water, rich in calcium sulfate. As well as enhancing a beer's hop bitterness, this hard water helps achieve clarity. English Pale Ale can fall anywhere on the color spectrum between golden and reddish amber and should generally have good head retention. A mix of fruity, hoppy, earthy, buttery, and malty aromas and flavors can be found in the sip, not unlike a classic Bitter. Traditionally all ingredients are English in origin.",
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [3.8, 6],
    ibuRange: [20, 40],
  },
  {
    name: 'English Pale Mild Ale',
    description:
      'Similar in many ways to an ordinary Bitter, yet not as hoppy, the English Pale Mild Ale is a delicate, malt-forward brew. Lighter in color than Dark Milds, this style ranges from a pale amber to a deep amber or even an amber brown. Fruitiness, sulfur, and buttery diacetyl may be present in the nose, while hops—traditionally English in origin—are generally subdued yet offer a balancing bitterness. The low alcohol range makes this type of ale a perfect session beer. Not as popular as it has been in the past, Pale Mild is nonetheless an ale for those who appreciate nuance and a bit of history in their pint glass.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [3, 5],
    ibuRange: [15, 25],
  },
  {
    name: 'Extra Special / Strong Bitter (ESB)',
    description:
      'Extra Special Bitters are essentially more aggressive and more balanced Bitters, both in alcohol and hop character. They shouldn\'t be overpowering, however. The color range will be similar, though ESBs lean toward the darker end of the scale; dark golds to copper. Low in carbonation, this style is commonly served on cask. Malts, often toasty and fruity, tend to be more pronounced, with the possibility of some diacetyl notes. And despite the word "bitter" in the name, these beers are not really all that bitter. The key to an ESB is balance and drinkability.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4, 7],
    ibuRange: [20, 40],
  },
  {
    name: 'Grisette',
    description: '(In progress.)',
    glassware: 'Tulip',
    abvRange: [3.1, 3.9],
    ibuRange: [20, 30],
  },
  {
    name: 'Irish Red Ale',
    description:
      'Irish red ale is known for its unique malty taste and is on the lower side of the bitterness and alcohol content scales. If you love American craft beer, the Irish red ale beer remains a great style for beer lovers to seek out and appreciate.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4, 6],
    ibuRange: [20, 30],
  },
  {
    name: 'Kölsch',
    description:
      'First brewed in Köln, Germany, this formerly obscure style is now found at many US brewpubs and a number of breweries have released their own creative takes using American hops and other nontraditional ingredients. Light to medium in body with a soft mouthfeel and a straw yellow or pale gold color, Kölsch has a spicy, herbal Noble hop bitterness that is medium to slightly assertive—less than a Pilsner, but not by much. A somewhat fruity or vinous (grape-y from malts) quality and a crisp, dryish finish make up the rest of the flavor profile.',
    glassware: 'Stange (Slender Cylinder)',
    abvRange: [4, 6],
    ibuRange: [18, 25],
  },
  {
    name: 'Saison',
    description:
      'Beers in this category are gold to light amber in color. Often bottle-conditioned, with some yeast character and high carbonation. Belgian-style Saison may have Brettanomyces or lactic character, and fruity, horsey, goaty and/or leather-like aromas and flavors. Specialty ingredients, including spices, may contribute a unique and signature character. Commonly called “farmhouse ales” and originating as summertime beers in Belgium, these are not just warm-weather treats. US craft brewers brew them year-round and have taken to adding a variety of additional ingredients.',
    glassware: 'Tulip',
    abvRange: [4.4, 8.4],
    ibuRange: [20, 38],
  },
  {
    name: 'American Adjunct Lager',
    description:
      'Light bodied, pale, fizzy lagers made popular by the large macro-breweries (large breweries) of America after Prohibition. Low bitterness, thin malts, and moderate alcohol. Focus is less on flavor and more on mass-production and consumption, cutting flavor and sometimes costs with adjunct cereal grains, like rice and corn.',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [4, 6],
    ibuRange: [8, 18],
  },
  {
    name: 'American Lager',
    description:
      'American lager has little in the way of hop and malt character. A straw to gold, very clean and crisp, highly carbonated lager. Hop aroma and flavor are low to medium-low, deriving from noble-type hops. Hop bitterness is medium. Toasted, biscuit-like, and/or bready malt flavors along with low levels of fermented-malt-derived sulfur compounds may be evident.',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [4.1, 5.1],
    ibuRange: [30, 45],
  },
  {
    name: 'Bohemian / Czech Pilsner',
    description:
      'The Bohemian Pilsener has a slightly sweet and evident malt character and a toasted, biscuit-like, bready malt character. Hop bitterness is perceived as medium with a low to medium-low level of noble-type hop aroma and flavor. This style originated in 1842, with “pilsener” originally indicating an appellation in the Czech Republic. Classic examples of this style used to be conditioned in wooden tanks and had a less sharp hop bitterness despite the similar IBU ranges to German-style Pilsener. Low-level diacetyl is acceptable. Bohemian-Style Pilseners are darker in color and higher in final gravity than their German counterparts.',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [4.1, 5.1],
    ibuRange: [30, 45],
  },
  {
    name: 'Czech Pale Lager',
    description: '(In progress.)',
    glassware: 'Mug (or Seidel, Stein)',
    abvRange: [3, 4.1],
    ibuRange: [20, 35],
  },
  {
    name: 'European / Dortmunder Export Lager',
    description:
      'Sometimes referred to as a “Dortmunder export,” the European-Style Export has the malt-forward flavor and sweetness of a German-style Helles, but the bitter base of a German-style Pilsener. This lager is all about balance, with medium hop character and firm but low malt sweetness. Look for toasted malt flavors and spicy floral hop aromas.',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [5.1, 6.1],
    ibuRange: [23, 29],
  },
  {
    name: 'European Pale Lager',
    description:
      'Similar to Munich Helles, many European countries reacted to the popularity of early pale lagers by brewing their own. Hop flavor is significant and of noble varieties, bitterness is moderate, and both are backed by a solid malt body and sweet notes from an all-malt base.',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [4, 6],
    ibuRange: [18, 25],
  },
  {
    name: 'European Strong Lager',
    description:
      "Many breweries around the world brew a stronger version of their regular lager. In the US, there is Ice Beer and Malt Liquor, both of which rely on a high amount of rice or corn to lighten the flavor. Many European and Asian breweries also have a strong lager similar to Malt Liquor, although these examples are made with more malt or all malt. Many breweries rush the fermentation so the final brew won't be too light, and signs of higher alcohols will be noticed in the aroma and flavor.",
    glassware: 'Goblet (or Chalice)',
    abvRange: [7, 12],
    ibuRange: [15, 40],
  },
  {
    name: 'Festbier / Wiesnbier',
    description:
      "Festbier is the modern day \"Oktoberfestbier\" that's served at the official Oktoberfest in Germany, as governed by the Munich city committee. Traditionally, the majority of the beer served was the dark, rich Märzen lagers that we've all come to love and associate with Oktoberfest, but that hasn't been the case since the 1990s. Now, it's all about Festbier, which is a bright and golden beer that's akin to an export-style (slightly stronger and maltier) Helles lager. Paulaner Brauerei is credited with creating the style back in the mid-1970s. According to many sources, their brewmaster wanted to give the people something \"more poundable.\" Gotta love that.\n\nDrinkers can expect Festbiers to showcase a clean, but strong malty backbone, light hop profile, and incredible drinkability.\n\nAnd you might see the style referred to as Wiesnbier, Wies'n, or Wiesn. The latter is what locals in Munich call Oktoberfest, based on Theresienwiese, which is the meadow/fairgrounds where it's hosted. This is not to be confused with Weissbier, Weißbier, or Weizenbier (wheat beer).",
    glassware: 'Mug (or Seidel, Stein)',
    abvRange: [5.8, 6.3],
    ibuRange: [18, 25],
  },
  {
    name: 'German Pilsner',
    description:
      'A classic German-style Pilsner is straw to pale in color with a malty sweetness that can be perceived in aroma and flavor. Perception of hop bitterness is medium to high. Noble-type hop aroma and flavor are moderate and quite obvious. Distinctly different from the Bohemian-style pilsner, this style is lighter in color and body and has a lower perceived hop bitterness.',
    glassware: 'Flute',
    abvRange: [4.6, 5.3],
    ibuRange: [25, 40],
  },
  {
    name: 'Helles',
    description:
      '“Helles” means “pale in color,” as these beers are often golden. The German-style Helles lager is a bit rounder or fuller-bodied than light lager and even all-malt pilsners. Helles lager beers offer a touch of sweetness that balance a measurable addition of spicy German hop flavor and light bitterness. The malt character is soft and bready, making it a terrific complement to light dishes such as salad or fresh shellfish, like clams. Clean and crisp, this is a refreshing beer with substance. Low levels of yeast-produced sulfur aromas and flavors may be common.',
    glassware: 'Flute',
    abvRange: [4.8, 5.6],
    ibuRange: [18, 25],
  },
  {
    name: 'Imperial Pilsner',
    description:
      'Similar to a Pilsner in appearance, but expect a more pronounced malty backbone and an intense bitterness. Malt flavors tend to be quite sweet in many examples. Alcohol can be quite aggressive and lend some spicy notes to the flavor.',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [6.5, 9],
    ibuRange: [30, 65],
  },
  {
    name: 'India Pale Lager (IPL)',
    description:
      'The India Pale Lager is a hybrid of the American IPA with many examples giving a nod to IPAs on the west coast. Typically golden in color with some hop haze in some examples. Malt profiles are often clean and bready, allowing the focus to be on the hop varieties featured by the brewer. Bitterness levels vary, but range from moderate to high.',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [5.5, 7],
    ibuRange: [30, 70],
  },
  {
    name: 'Kellerbier / Zwickelbier',
    description:
      "A rather old, rare, and unique German beer style, Kellerbiers are unfiltered and unpasteurized lagers that date back to at least the Middle Ages. The beer is matured, unbunged (beer is exposed), in deep vaults. The final product is a smooth, naturally cloudy beer that's rich in vitamins from the yeast. Hop bitterness can be high and alcohol will vary. Zwickelbier is similar to a Keller, but not as pronounced.",
    glassware: 'Mug (or Seidel, Stein)',
    abvRange: [4, 7],
    ibuRange: [20, 40],
  },
  {
    name: 'Light Lager',
    description:
      "The Light Lager is generally a lighter version of a brewery's premium lager, some are lower in alcohol but all are lower in calories and carbohydrates compared to other beers. Typically a high amount of cereal adjuncts like rice or corn are used to help lighten the beer as much as possible. Very low in malt flavor with a light and dry body. The hop character is low and should only balance with no signs of flavor or aroma. European versions are about half the alcohol (2.5-3.5%",
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [2.5, 5],
    ibuRange: [8, 12],
  },
  {
    name: 'Malt Liquor',
    description:
      'Straw to pale amber in color, most Malt Liquors are made with excessive amounts of adjuncts, such as corn, rice, and refined brewing sugar (dextrose). As a result, there are very few "all malt" malt liquors. Hops are used sparingly, just enough bitterness to balance off any cloyingness. Higher alcohol versions tend to have loads of fusel alcohol, which gives off solvent or fuel-like aromas and flavors. They are highly attenuated, meaning a higher ratio of fermentable sugars are present compared to some other beers, allowing the brewer to achieve a high alcohol content without using as many ingredients. Some breweries enable the use of special enzymes to further break down the malt and adjuncts so they will yield a higher percentage of alcohol. This makes for quite a dry beer, with only a small amount of unfermented sugars and a strong kick from the higher',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [6, 9],
    ibuRange: [10, 30],
  },
  {
    name: 'American Porter',
    description:
      "Inspired by the storied English Porter, the American Porter tends to make its own rules. With plenty of innovation and originality brewers in the US have taken this style to a new level, whether it's highly hopping the brew or adding coffee or chocolate to complement the highly roasted and burnt flavor associated with this type of beer. Some are even barrel aged in bourbon or whiskey barrels. The color could be medium brown to inky black and the range of hop bitterness is also quite wide, but most are balanced. And quite a few easy drinking session Porters can be found as well.",
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4, 7],
    ibuRange: [20, 40],
  },
  {
    name: 'Baltic Porter',
    description:
      "Porters of the late 1700's were quite strong compared to today's standards, easily surpassing 7 percent alcohol by volume. Some English brewers made a stronger, more robust version, to be shipped across the North Sea that they dubbed a Baltic Porter. In general, the style's dark brown color covered up cloudiness and the smoky, roasted brown malts and bitter tastes masked brewing imperfections. Historically, the addition of stale ale also lent a pleasant acidic flavor to the style, which made it quite popular. These issues were quite important given that most breweries at the time were getting away from pub brewing and opening up production facilities that could ship beer across the world.",
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [7, 10],
    ibuRange: [25, 45],
  },
  {
    name: 'English Porter',
    description:
      'Porter is said to have been popular with transportation workers of Central London, hence the name. Most traditional British brewing documentation from the 1700s states that Porter was a blend of three different styles: an old ale (stale or soured), a new ale (brown or pale ale) and a weak one (mild ale), with various combinations of blending and staleness. The end result was also commonly known as "Entire Butt" or "Three Threads" and had a pleasing taste of neither new nor old. It was the first truly engineered beer, catering to the public\'s taste, playing a critical role in quenching the thirst of the UK\'s Industrial Revolution and contributing to the rise of today\'s mega-breweries. Porter saw a comeback in the US during the homebrewing and micro-brewery revolution of the late 1970s and early 80s and modern-day Porters are typically brewed using a pale malt base with the addition of black malt, crystal, chocolate, or smoked brown malt. While uncommon, roasted malt is occasionally added too. Some brewers will also age their beers after inoculation with live bacteria to create an authentic taste of the past. Hop bitterness is moderate on the whole and the color ranges from brown to black. Overall, English Porters remain very complex and interesting beers.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4.5, 7],
    ibuRange: [20, 30],
  },
  {
    name: 'Imperial Porter',
    description:
      'Definitively American, the imperial porter should have no roasted barley flavors or strong burnt/black malt character. Medium caramel and cocoa-like sweetness is present, with complementing hop character and malt-derived sweetness.',
    glassware: 'Goblet (or Chalice)',
    abvRange: [7, 12],
    ibuRange: [35, 50],
  },
  {
    name: 'Robust Porter',
    description:
      'The Robust Porter features more bitter and roasted malt flavor than a brown porter, but not quite as much as a stout. Robust porters have a roast malt flavor, often reminiscent of cocoa, but no roast barley flavor. Their caramel and malty sweetness is in harmony with the sharp bitterness of black malt. Hop bitterness is evident. With US craft brewers doing so much experimentation in beer styles and ingredients, the lines between certain stouts and porters are often blurred. Yet many deliberate examples of these styles do exist. Diacetyl is acceptable at very low levels.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [5.1, 6.6],
    ibuRange: [25, 40],
  },
  {
    name: 'Smoked Porter',
    description:
      'Typically the base for the Smoke Porter beer style is a Robust Porter that is given smoky depth thanks to wood-smoked malt. Traditionally, brewers will cite the specific wood used to smoke the malt, and different woods will lend different flavors to the finished product. Smoke flavors dissipate over time.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [5.1, 8.9],
    ibuRange: [20, 40],
  },
  {
    name: 'Chile Beer',
    description:
      'Beers with the addition of hot pepper juice, oils, or actual peppers, most commonly jalapeño chiles. Hotness can range from a subtle spiciness to palate scorching. Most often, chiles are added to pale ales and light lagers, but the base beer style can vary.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4.5, 6],
    ibuRange: [0, 0],
  },
  {
    name: 'Fruit and Field Beer',
    description:
      'Fruit beer is made with fruit, or fruit extracts that are added during any portion of the brewing process, providing obvious yet harmonious fruit qualities. This idea is expanded to “field beers” that utilize vegetables and herbs.',
    glassware: 'Tulip',
    abvRange: [2.5, 13.3],
    ibuRange: [5, 45],
  },
  {
    name: 'Gruit / Ancient Herbed Ale',
    description:
      'A historical style brewed in the same way beer was most likely made during the Middle Ages in Continental Europe, Gruit is bittered with herbs and spices rather than hops, most often sweet gale (Myrica gale), yarrow (Achillea millefolium), and wild rosemary (Ledum palustre). Other herbs, spices, and berries might be used to create interesting and pleasant aromas and flavors of green and herbal teas. Other ancient ales were made with ingredients like heather, seaweed, pine, spruce, etc.',
    glassware: 'Tulip',
    abvRange: [4, 6],
    ibuRange: [0, 0],
  },
  {
    name: 'Happoshu',
    description:
      'Happoshu is a sparkling low-malt beverage produced by Japanese beer companies. To be classified as Happoshu, the malt ratio must be less than 67 percent, or include an ingredient other than malt, hops, rice, corn, sorghum, potato, starch, or sugar. In Japan, the tax for Happoshu is much less than the tax for beer due to its lower malt content, making it cheaper than beer.',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [4, 7],
    ibuRange: [0, 0],
  },
  {
    name: 'Herb and Spice Beer',
    description:
      'An herb and spice beer is a lager or ale that contains flavors derived from flowers, roots, seeds or certain fruits or vegetables. Typically the hop character is low, allowing the added ingredient to shine through. The appearance, mouthfeel and aromas vary depending on the herb or spice used. This beer style encompasses innovative examples as well as traditional holiday and winter ales.',
    glassware: 'Tulip',
    abvRange: [2.5, 12],
    ibuRange: [5, 40],
  },
  {
    name: 'Japanese Rice Lager',
    description:
      'Pale yellow in color with a soft hop nose, Japanese Rice Lagers often have a rounded, firm malty character with moderate bitterness and a trademark dry finish. Similar to American Adjunct Lagers, the beer\'s grist bill is cut by using large portions of rice, but not enough to be classified as Happoshu, a "sparkling beverage" with a malt content of less than two-thirds.',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [3.6, 6.5],
    ibuRange: [6, 18],
  },
  {
    name: 'Kvass',
    description:
      "Kvass, Russian for \"leaven,\" is a 16th century beer-like beverage made with grains including wheat, rye, and barley or by using dark rye bread, and often has additions of sugars, birch sap, berries, and fruits fermented with a simple baker's yeast. It's low in alcohol and often flavored with herbs or fruits to knock the bitter edge out. A national drink for Russia, it's also found throughout Eastern Europe.",
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [0.5, 2.5],
    ibuRange: [0, 0],
  },
  {
    name: 'Low-Alcohol Beer',
    description:
      'Low-Alcohol Beer is also commonly known as Non-Alcohol (NA) beer, despite containing small amounts of alcohol. Low-Alcohol Beers are generally subjected to one of two things: a controlled brewing process that results in a low alcohol content, or the alcohol is removed using a reverse-osmosis method which passes alcohol through a permeable membrane. They tend to be very light on aroma, body, and flavor.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [0.1, 1],
    ibuRange: [10, 20],
  },
  {
    name: 'Pumpkin Beer',
    description:
      'Nothing says fall quite like pumpkins and beer, and American craft breweries have done a superb job of combining the two. It’s tough to find anything that hasn’t been “pumpkin spiced,” and beers are no different. Pumpkin flavored beers have caught the attention of craft beer and pumpkin lovers everywhere, partially because the flavors can be implemented in several beer styles. Whether you’re interested in trying pumpkin amber ales, IPAs or pumpkin stouts, there are plenty of options from American craft brewers for you to explore.',
    glassware: 'Tulip',
    abvRange: [2.3, 12],
    ibuRange: [5, 70],
  },
  {
    name: 'Rye Beer',
    description:
      'In darker versions, malt flavor can optionally include low roasted malt characters (evident as cocoa/chocolate or caramel) and/or aromatic toffee-like, caramel, or biscuit-like characters. Low-level roasted malt astringency is acceptable when balanced with low to medium malt sweetness. Hop flavor is low to medium-high. Hop bitterness is low to medium. These beers can be made using either ale or lager yeast. The addition of rye to a beer can add a spicy or pumpernickel character to the flavor and finish. Color can also be enhanced and may become more red from the use of rye. The ingredient has come into vogue in recent years in everything from Stouts to lagers, but is especially popular with craft brewers in India Pale Ales. To be considered an example of the style, the grain bill should include sufficient rye such that rye character is evident in the beer.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4, 7],
    ibuRange: [10, 80],
  },
  {
    name: 'Sahti',
    description:
      "A farmhouse ale with roots in Finland, Sahti was first brewed by peasants in the 1500s. Turbid with a tremendous body, a low-flocculating Finnish baker's yeast creates a cloudy unfiltered beer with an abundance of sediment. Its color usually falls somewhere between pale yellow and deep brown. Traditionally unhopped, juniper twigs used during the brewing process create balance, imparting an unusual resiny character and serving as a preservative. Meanwhile, exposure to wild yeast and bacteria gives Sahti its signature tartness.",
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [6, 11],
    ibuRange: [0, 0],
  },
  {
    name: 'Smoked Beer',
    description:
      'When malt is kilned over an open flame, the smoke flavor becomes infused into the beer, leaving a taste that can vary from dense campfire, to slight wisps of smoke. Any style of beer can be smoked; the goal is to reach a balance between the style’s character and the smoky properties. Originating in Germany as Rauchbier, this style is open to interpretation by U.S. craft brewers. Classic base styles include German-style Marzen/Oktoberfest, German-style Bock, German-style Dunkel, Vienna-style Lager and more. Smoke flavors dissipate over time.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4.5, 7],
    ibuRange: [20, 30],
  },
  {
    name: 'American Imperial Stout',
    description:
      'The American-style Imperial Stout is the strongest in alcohol and body of the Stouts. Black in color, these beers typically have an extremely rich malty flavor and aroma with full, sweet malt character. Bitterness can come from roasted malts or hop additions.',
    glassware: 'Snifter',
    abvRange: [7, 12],
    ibuRange: [50, 80],
  },
  {
    name: 'American Stout',
    description:
      'Strikingly bold and undeniably beautiful, the American Stout beer style blends generous amounts of dark malts with American hops to offer an adventurous experience that is unmatched by other styles of beer. Are you afraid of the dark? When it comes to American Stout, don’t be. Allow your senses to run wild with this deceivingly sophisticated take on a European staple. Like many other beer styles that have become prized by American brewers and beer lovers alike, American Stout is a distinct variant of a European Stout beer counterpart. True to style, American stouts showcase generous quantities of the American hops fans have come to expect, and much like other Stout beer types, American stout can be enjoyed year-round but is commonly considered a beer for the fall or winter months.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [5.7, 8.9],
    ibuRange: [35, 60],
  },
  {
    name: 'English Stout',
    description:
      'Stouts are typically dark brown to pitch black in color. A common profile among Stouts, but not in all cases, is the use of roasted barley (unmalted barley that is kilned to the point of being charred) which lends a dry character to the beer as well as a huge roasted flavor that can range from burnt to coffee to chocolate. Traditional English Stout recipes rely on bitterness from the roasted grain to provide a dry finish and consequently tend to show very little hop character.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4, 7],
    ibuRange: [20, 40],
  },
  {
    name: 'Foreign / Export Stout',
    description:
      'A special style of Stout that is brewed bigger than normal for a long journey, the more traditional Foreign / Export Stouts will be found in the tropical regions of the world. Higher in alcohol with a very pronounced roasted character. Expect moderate to high roasted grain and malt flavor with a coffee, chocolate, or slightly burnt grain character, although without a sharp bite. Moderately dry with low to medium esters and medium to high bitterness. Moderate to no hop flavor, can be earthy, herbal, or floral.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [5.5, 8],
    ibuRange: [30, 70],
  },
  {
    name: 'Irish Dry Stout',
    description:
      'Irish Dry Stout is black beer with a dry-roasted character thanks to the use of roasted barley. The emphasis on coffee-like roasted barley and a moderate degree of roasted malt aromas define much of the character. Hop bitterness is medium to medium high. This beer is often dispensed via nitrogen gas taps that lend a smooth, creamy body to the palate.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [4.2, 5.3],
    ibuRange: [30, 40],
  },
  {
    name: 'Oatmeal Stout',
    description:
      'The addition of oatmeal adds a smooth, rich body to the Oatmeal Stout. This beer style is dark brown to black in color. Roasted malt character is caramel-like and chocolate-like, and should be smooth and not bitter. Coffee-like roasted barley and malt aromas are prominent. This low- to medium-alcohol style is packed with darker malt flavors and a rich and oily body from oatmeal.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [3.8, 6.1],
    ibuRange: [20, 40],
  },
  {
    name: 'Russian Imperial Stout',
    description:
      'Russian Imperial Stout, first brewed in England for Emperor Peter the Great of Russia, are higher in alcohol than traditional English Stouts. The best examples are full bodied, rich, and complex, and will often have flavors and aromas of dried fruit, coffee, and dark chocolate. Often dry, flavors of higher alcohol are quite evident. Hop character can vary from none, to balanced or aggressive.',
    glassware: 'Snifter',
    abvRange: [8, 12],
    ibuRange: [50, 90],
  },
  {
    name: 'Sweet / Milk Stout',
    description:
      'Sweet Stout, also referred to as Cream Stout or Milk Stout, is black in color. Malt sweetness, chocolate, and caramel should dominate the flavor profile and contribute to the aroma. It also should have a low to medium-low roasted malt/barley-derived bitterness. Milk sugar (lactose) lends the style more body. This beer does use lactose sugar, so people with an intolerance should probably avoid this style.',
    glassware: 'Pint Glass (or Becker, Nonic, Tumbler)',
    abvRange: [3.2, 6.3],
    ibuRange: [15, 25],
  },
  {
    name: 'American Barleywine',
    description:
      "Despite its name, a Barleywine (or Barley Wine) is very much a beer, albeit a strong and often intense beer. In fact, it's one of the strongest styles. Lively and fruity, sometimes sweet, sometimes bittersweet, but always alcoholic. A brew of this strength and complexity can be a challenge to the palate. Expect anything from an amber to a dark brown color, with aromas ranging from rich fruits to bold hops. The body is typically thick, alcohol will definitely be perceived, and flavors range from dominant dark fruits to palate smacking, resiny hops. English varieties are quite different from American efforts, which are often heavily hopped with high alpha oil American hops to create a more bitter brew. English versions tend to be more rounded and balanced with a slightly lower alcohol content, though this is not always the case. Most Barleywines can be cellared for years and will age much like wine.",
    glassware: 'Snifter',
    abvRange: [8.5, 15],
    ibuRange: [60, 100],
  },
  {
    name: 'American Strong Ale',
    description:
      'A catch-all style category for beers from 7 percent alcohol by volume and above. Some may even be as high as 20 percent',
    glassware: 'Snifter',
    abvRange: [7, 20],
    ibuRange: [40, 100],
  },
  {
    name: 'Belgian Dark Strong Ale',
    description:
      'On the same path as Belgian Dark Ale but obviously higher in alcohol with more character all around. The alcohol can be deceivingly hidden or very bold and in your face. Look for lots of complexity within a surprisingly delicate palate. Hop and malt character can vary, but most Strong Dark Ales are full of fruity and strong dark malt flavors. Phenols will range from minimal to high and most examples will be light on the hops. All in all, most of these beers are spicy and alcoholic.',
    glassware: 'Goblet (or Chalice)',
    abvRange: [7, 12],
    ibuRange: [25, 50],
  },
  {
    name: 'Belgian Pale Strong Ale',
    description:
      "Like a Belgian Pale Ale, the strong versions will also be pale straw to deep golden in color. What sets them apart is a much higher alcohol content that can range from deliciously hidden to devastatingly present. Expect a complex and powerful ale, yet delicate with rounded flavors and a big, billowy, rocky, white head. Hop and malt character can vary, although most are fruity and quite hoppy. In general, hop flavor and aroma will be within the low range and artfully balanced. Duvel is the hallmark of this style, and many other breweries have tried to imitate Duvel Moortgat's quintessential example with similar references to the devil.",
    glassware: 'Goblet (or Chalice)',
    abvRange: [7, 12],
    ibuRange: [20, 40],
  },
  {
    name: 'English Barleywine',
    description:
      'The name "British-style Barleywine" [more commonly referred to as "English"] represents a group of strong ales that rival the strength and complexity of some of the world’s most celebrated beverages. This brawny, malt-forward beer style is often one of the strongest beer styles on any given beer menu, and showcases a complex melange of toffee and fruit flavors counterbalanced by warming alcohol and sturdy hop bitterness. The Barleywine beer style is a sipper, enjoyed responsibly, stylishly—preferably in front of a fire in a comfy chair amongst a plethora of leather-bound books.',
    glassware: 'Snifter',
    abvRange: [8.5, 12.2],
    ibuRange: [40, 60],
  },
  {
    name: 'English Strong Ale',
    description:
      'Bigger than a Pale Ale yet smaller than a Barleywine, the English Strong Ale is a rich and complex beer. Many examples are unfiltered and bottle conditioned. The color tends to land somewhere between amber and reddish copper. English Strong Ales usually end up as a bold mix of fruity, estery, and malty. Hop character can vary from mildly bitter to a full blown with a bold hop flavor and aroma. Similarly, the alcohol level varies and can be quite noticeable, with a hint of solvent possible.',
    glassware: 'Snifter',
    abvRange: [5.5, 11],
    ibuRange: [40, 60],
  },
  {
    name: 'Imperial Red Ale',
    description:
      'The use of American hops in the American imperial red ale lends to the perception of medium hop bitterness, flavor and aroma. Coupled with a solid malt profile, this should be a beer with balance between hop bitterness and malt sweetness. Some breweries will choose to bottle-condition this style, leading to possible fruity esters and some haze in their appearance. This is another example of modern American brewers taking an established style and boosting the flavor. California brewers are credited with creating this innovative style.',
    glassware: 'Tulip',
    abvRange: [8, 10.6],
    ibuRange: [55, 85],
  },
  {
    name: 'Old Ale',
    description:
      'Old Ales, also referred to in the past as Stock Ales, are low attenuated beers with high levels of dextrins, creating a full malt body with plenty of character. Old Ales from centuries past were often transferred into vats to mature, hence the name. Commonly a rich, dark amber to a deep brown color, some examples are nearly black. Tamed aromatics. Although bittering levels can greatly vary, expect fruity, vinous, intense malt flavors and sharp alcohol characteristics. The often racy but mellow attitude of the beer may also include acidic notes, raisins, and black currants. Vintage varieties may have a low level of oxidation while stronger versions sometimes exhibit similarities to port wine. Brewers may also inoculate a portion of the batch with Brettanomyces lambicus and age it for an extended period of time to achieve an old-school acidic character.',
    glassware: 'Snifter',
    abvRange: [6, 12],
    ibuRange: [30, 65],
  },
  {
    name: 'Quadrupel (Quad)',
    description:
      'Inspired by the Trappist breweries of Belgium, a Quadrupel is a Belgian-style ale of great strength with even bolder flavor compared to its sister styles Dubbel and Tripel. Typically a dark creation that plays within the deep red and ruby brown end of the spectrum with garnet hues, it is a full bodied beer with a rich, malty palate and spicy phenols that are usually kept to a moderate level. Sweet on the palate with a low bitterness yet well perceived alcohol, Quads are well suited to cellaring.',
    glassware: 'Goblet (or Chalice)',
    abvRange: [9, 14],
    ibuRange: [25, 50],
  },
  {
    name: 'Scotch Ale / Wee Heavy',
    description:
      'The Scotch Ale is overwhelmingly malty, with a rich and dominant sweet malt flavor and aroma. A caramel character is often part of the profile. Some examples feature a light smoked peat flavor. This style could be considered the Scottish version of an English-Style Barleywine. Overly smoked versions would be considered specialty examples.',
    glassware: 'Tulip',
    abvRange: [6.6, 8.5],
    ibuRange: [25, 35],
  },
  {
    name: 'Tripel',
    description:
      'The name "Tripel" actually stems from part of the brewing process, in which brewers use up to three times the amount of malt found in a standard Trappist table beer. Traditionally, Tripels are bright yellow to deep gold in color, a shade or two darker than the average Pilsener. The head should be big, dense, and creamy. Expect a complex aroma and flavor: spicy phenols, powdery yeast, and fruity esters with a sweet finish. Sweetness comes from both the pale malts and the higher alcohol. Bitterness is up there for a strong beer with such a light body, but it can be hard to perceive in well balanced versions. The lighter body comes from the use of Belgian candi sugar (up to 25 percent sucrose), which not only lightens the body, but also adds various alcoholic aromas and flavors. Small amounts of spices are sometimes added as well. Tripels are notoriously alcoholic, yet the best examples hide this quality quite deceivingly, making them beers for sipping.',
    glassware: 'Goblet (or Chalice)',
    abvRange: [8, 12],
    ibuRange: [20, 40],
  },
  {
    name: 'Wheatwine',
    description:
      'Part of the “strong ale” category, the American-Style Wheat Wine Ale is not derived from grapes as its name might suggest. Made with at least 50 percent wheat malt, this full-bodied beer features bready and candy flavors, and finishes with a great deal of malty sweetness. These beers may be oak-aged and sometimes have small amounts of darker malts added.',
    glassware: 'Snifter',
    abvRange: [8.5, 12.2],
    ibuRange: [45, 85],
  },
  {
    name: 'American Dark Wheat Beer',
    description:
      "An Americanized version of a Dunkelweizen, these beers can range in color from garnet or deep amber to ruby brown. Often cloudy with long-lasting heads, this style tends to be light- to medium-bodied with a high level of carbonation. Hop character might be low or moderately high with some fruitiness from ale fermentation, though most examples use a fairly neutral ale yeast, resulting in a clean fermentation with little to no diacetyl. Flavors of caramel and toasted malts might be present too, just don't expect German Weizen flavors and aromas of banana esters and clove-like phenols.",
    glassware: 'Weizen Glass',
    abvRange: [4, 8],
    ibuRange: [10, 35],
  },
  {
    name: 'American Pale Wheat Beer',
    description:
      "An Americanized version of a Hefeweizen, these beers typically fall between pale straw and deep gold in color. Pale Wheat Ales are reminiscent of a Hefeweizen in appearance, unless filtered. Higher carbonation is proper as is a long-lasting head and a light to medium body. German Weizen flavors and aromas of banana esters and clove-like phenols won't be found. Most use a substantial percentage of wheat malt. Hop character could be low or fairly high, but most examples are moderate in bitterness. There may be some fruitiness from ale fermentation though most examples use a fairly neutral ale yeast, resulting in a clean fermentation with little to no diacetyl. Often served with a lemon wedge to either cut the wheat or yeast edge, many people either find this to be a flavorful snap or an insult that damages the beer's taste and head retention.",
    glassware: 'Weizen Glass',
    abvRange: [4, 7],
    ibuRange: [10, 35],
  },
  {
    name: 'Dunkelweizen',
    description:
      'Similar to a Hefeweizen, these southern German wheat beers are brewed as darker versions (Dunkel means "dark") with deliciously complex malts and a low balancing bitterness. Creamy and full-bodied, most Dunkelweizen are medium amber to amber-brown and appear slightly murky from the weizen yeast. Phenolic (clove) and fruity (banana, bubble gum) character will usually be present in the nose, and some examples may even taste like banana bread.',
    glassware: 'Weizen Glass',
    abvRange: [4, 7],
    ibuRange: [10, 15],
  },
  {
    name: 'Grodziskie',
    description: '(In progress.)',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [2.5, 5],
    ibuRange: [20, 35],
  },
  {
    name: 'Hefeweizen',
    description:
      'A south German style of wheat beer (weissbier) typically made with a ratio of 50 percent barley to 50 percent wheat. Sometimes the percentage of wheat is even higher. "Hefe" means "with yeast," hence the beer\'s unfiltered and cloudy appearance. The particular ale yeast used produces unique esters and phenols of banana and cloves with an often dry and tart edge, some spiciness, and notes of bubblegum or apples. Hefeweizens are typified by little hop bitterness, and a moderate level of alcohol. Often served with a lemon wedge (popularized by Americans), to cut the wheat or yeasty edge, some may find this to be either a flavorful snap or an insult that can damage the beer\'s taste and head retention.',
    glassware: 'Weizen Glass',
    abvRange: [4, 7],
    ibuRange: [10, 15],
  },
  {
    name: 'Kristallweizen',
    description:
      'A filtered version of a Hefeweizen, showcasing a bright and clear body that ranges from pale straw to light amber in color. The overall character will be cleaner and softer on the palate, and the typical banana and phenols will be more subtle.',
    glassware: 'Weizen Glass',
    abvRange: [4, 7],
    ibuRange: [10, 15],
  },
  {
    name: 'Witbier',
    description:
      'Belgian in origin, this unfiltered style of ale is pale and cloudy in appearance due to the high level of wheat, and sometimes oats, used in the mash. Always spiced, generally with coriander, orange peel, and occasionally other spices or herbs in the background. The crispness and slight tang comes from the wheat and the lively level of carbonation. This is one style that many US brewers have taken a liking to, and have done a very good job of staying to style. Sometimes served with a lemon, order one without a garnish if you truly want to enjoy the untainted subtleties of this style. Often referred to as "white beer" (witbieren) due to the cloudiness created by yeast in suspension.',
    glassware: 'Tulip',
    abvRange: [4, 7],
    ibuRange: [10, 20],
  },
  {
    name: 'Berliner Weisse',
    description:
      'Low in alcohol, refreshingly tart, and often served with a flavored syrup like Woodruff or raspberry, the Berliner-style Weisse presents a harmony between yeast and lactic acid. These beers are very pale in color, and may be cloudy as they are often unfiltered. Hops are not a feature of this style, but these beers often do showcase esters. Traditional versions often showcase Brettanomyces yeast. Growing in popularity in the U.S., where many brewers are now adding traditional and exotic fruits to the recipe, resulting in flavorful finishes with striking, colorful hues. These beers are incredible when pairing. Bitterness, alcohol and residual sugar are very low, allowing the beer’s acidity, white bread and graham cracker malt flavors to shine. Carbonation is very high, adding to the refreshment factor this style delivers. Many examples of this style contain no hops and thus no bitterness at all.',
    glassware: 'Goblet (or Chalice)',
    abvRange: [2.8, 3.4],
    ibuRange: [3, 6],
  },
  {
    name: 'Brett Beer',
    description:
      'These unique beers vary in color and can take on the hues of added fruits or other ingredients. Horsey, goaty, leathery, phenolic, and some fruity acidic character derived from Brettanomyces organisms may be evident, but in balance with other components of an American Brett beer. Brett beer and sour beer are not synonymous.',
    glassware: 'Tulip',
    abvRange: [6, 9],
    ibuRange: [0, 0],
  },
  {
    name: 'Faro',
    description:
      'Traditionally brewed in Belgium, Faro is a blended Lambic with the addition of candi sugar, resulting in a lighter, quite sweet, and more palatable beer. Widely available throughout the Senne Valley up until the early 20th century, Faro was often made from second and third runnings—which led to a beer with a lower alcohol content. It was commonly spiced with pepper, orange peel, and coriander, with spontaneous fermentation by the microbes found in the air. The end result was a light-bodied and gently flavored acidic beer that sometimes had hints of spice. Faro was usually sweetened before packaging or on-premise. Sometimes faro was a blend of aged lambic beer with freshly made low-alcohol Lambic or even a low-alcohol non-Lambic ale. Modern faro is usually stronger in alcohol compared with historical examples.',
    glassware: 'Tulip',
    abvRange: [2, 5],
    ibuRange: [0, 10],
  },
  {
    name: 'Flanders Oud Bruin',
    description:
      'Oud Bruins, not restricted to, but concentrated in Flanders, are light to medium-bodied and deep copper to brown in color. They are extremely varied, characterized by a slight vinegar or lactic sourness and spiciness to smooth and sweet. A fruity-estery character is apparent with no hop flavor or aroma. Low to medium bitterness. Very small quantities of diacetyl are acceptable. Roasted malt character in aroma and flavor is acceptable, at low levels. Oak-like or woody characteristics may be pleasantly integrated into the overall palate. Typically, old and new Brown Ales are blended, like Lambics.',
    glassware: 'Tulip',
    abvRange: [4, 8],
    ibuRange: [20, 25],
  },
  {
    name: 'Flanders Red Ale',
    description:
      'A sour, fruity, red wine-like Belgian-style ale with supportive malt flavors and fruit complexity with a dry finish and tannin characteristics. Typically light-bodied with reddish-brown colors, they are known for their distinct sharp, fruity, sour, and tart flavors which are created by special yeast strains. Very complex beers, they are produced under the age-old tradition of long-term cask aging in oak, and the blending of young and old beers.',
    glassware: 'Tulip',
    abvRange: [4.6, 6.5],
    ibuRange: [10, 25],
  },
  {
    name: 'Fruit Lambic',
    description:
      'Often known as Cassis, Framboise, Kriek, or Peche, a fruit Lambic takes on the color and flavor of the fruit it is brewed with. It can be dry or sweet, clear or cloudy, depending on the ingredients. Notes of Brettanomyces yeast are often present at varied levels. Sourness is an important part of the flavor profile, though sweetness may compromise the intensity. These flavored lambic beers may be very dry or mildly sweet.',
    glassware: 'Tulip',
    abvRange: [5, 8.9],
    ibuRange: [15, 21],
  },
  {
    name: 'Fruited Kettle Sour',
    description:
      'A wildly popular and modern American beer style, Fruited Kettle Sours are brewed using the "kettle sour" process, wherein lactobacillus is pitched directly into the kettle to sour the wort. Once the desired PH level ("sourness") is achieved, the wort is boiled to stop the process (kill off the bacteria) and then hopped and fermented as normal. Fruit (juice, purée, whole, zest, etc.) is then added after primary fermentation or maturation, but some brewers may add fruit during fermentation or barrel-aging too. Color, aroma, flavor, and sourness will differ greatly based on the brewer\'s intent, fruits being used, and other ingredients, but many examples share a tart, fruity, crisp, and refreshing experience.',
    glassware: 'Tulip',
    abvRange: [3, 10],
    ibuRange: [5, 30],
  },
  {
    name: 'Gose',
    description:
      'Straw to medium amber, the contemporary Gose is cloudy from suspended yeast. A wide variety of herbal, spice, floral or fruity aromas other than found in traditional Leipzig-Style Gose are present, in harmony with other aromas. Salt (table salt) character is traditional in low amounts, but may vary from absent to present. Body is low to medium-low. Low to medium lactic acid character is evident in all examples as sharp, refreshing sourness.',
    glassware: 'Pilsener Glass (or Pokal)',
    abvRange: [4.4, 5.4],
    ibuRange: [10, 15],
  },
  {
    name: 'Gueuze',
    description:
      'A traditional Belgian blend of young and old Lambics, which are bottled after blending, then aged for two to three years to produce a dryer, fruitier, and more intense style of Lambic. There is no hop character, some are filtered and force carbonated if not pasteurized as well. More complex and carbonated than a lambic, the sourness isn’t necessarily higher, but it tends to have more of a well-developed wild character.',
    glassware: 'Tulip',
    abvRange: [5, 8],
    ibuRange: [0, 10],
  },
  {
    name: 'Lambic',
    description:
      "A spontaneously fermented and unblended ale that is indigenous to the Senne Valley of Belgium. A large portion of wheat results in crispness, although the flavor is dominated with a unique tartness from the wild yeast and bacteria that inoculate the brew by traveling through the air and through tainted barrels used during fermentation. Pale yellow to deep golden in color, the color tends to darken with age. Younger versions are often cloudy, while older ones are generally clear. The white-colored head generally has poor retention. Light bodied with little hop flavor or bitterness, Lambic's tartness resembles hard cider or white wine. Aging before consumption ensures that the tartness has mellowed.",
    glassware: 'Tulip',
    abvRange: [5, 6.5],
    ibuRange: [0, 10],
  },
  {
    name: 'Wild Ale',
    description:
      'Sometimes Belgian influenced, American Wild Ales are beers that are introduced to "wild" yeast or bacteria, such as Brettanomyces (Brettanomyces Bruxellensis, Brettanomyces Lambicus or Brettanomyces Anomalus), Pediococcus, or Lactobacillus. This introduction may occur from oak barrels that have been previously inoculated, pitching into the beer, or gained from various "sour mash" techniques. Regardless of the method, these yeast and/or bacteria leave a mark that should be noticeable to strong, and often contribute a sour and/or funky, wild note. Mixed-fermentation examples will display a range of aromatics, rather than a single dominant character.',
    glassware: 'Tulip',
    abvRange: [6, 10],
    ibuRange: [5, 30],
  },
];

export default beerStyles;
