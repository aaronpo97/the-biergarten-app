---
title: Pipeline ethics, bias, and known issues
last-updated: 2026-08-31
tags:
  - pipeline
  - ethics
  - bias
  - known-issues
  - ai-generated
---

This document covers the ethical context of the Biergarten Pipeline's output,
the model's biases, and known issues including hallucinated brewing science and
low-resource language failures.

> All testing described below used `google_gemma-4-E4B-it-Q6_K.gguf`.

## Table of contents

- [What this dataset is](#what-this-dataset-is)
- [What this dataset is not](#what-this-dataset-is-not)
- [Model bias and language quality](#model-bias-and-language-quality)
- [Western and Eurocentric lens](#western-and-eurocentric-lens)
- [Wikipedia enrichment](#wikipedia-enrichment)
- [Names-by-country dataset](#names-by-country-dataset)
- [The "avoid AI phrases" prompt instruction](#the-avoid-ai-phrases-prompt-instruction)
- [Known issues](#known-issues)
  - [Hallucinated brewing techniques](#hallucinated-brewing-techniques)
  - [Low-resource language hallucination](#low-resource-language-hallucination)
  - [Synthetic coordinates](#synthetic-coordinates)

---

## What this dataset is

This is AI-generated fixture data for a proof-of-concept version of The
Biergarten App. Anyone who interacts with an application seeded from this
pipeline must be told upfront that the content is AI-generated.

---

## What this dataset is not

The pipeline is not intended to produce accurate brewing science, faithful
cultural representation, or reliable local-language text. Hallucinations such as
invented fermentation techniques, or incoherent local-language prose, are
expected, observed, and partially documented in [Known issues](#known-issues)
below.

Human control sits at the context layer (that is, prompt design, Wikipedia
enrichment). Statistical output shapes in future pipeline stages (check-in
distributions, rating skews, activity profiles) will be handled the same way.

**Treat this data as an exercise in prompt engineering and model behaviour, not
as a source of truth for brewing techniques or cultural representation.**

**Natural language processing is a powerful tool for data analysis and
generation, but its output should be treated with scrutiny. Human language is
not simply data points to be analyzed: it carries cultural and human meaning
that artificial intelligence cannot capture.**

---

## Model bias and language quality

The underlying model's training biases surface within this pipeline. Output
quality tracks with how well a language is represented in the training corpus:
standard French (`fr-FR`) produces coherent text; regional variants like `fr-CD`
and `fr-CI` are noticeably weaker; low-resource languages like Welsh, Māori, and
Sicilian produce output that is syntactically plausible but often semantically
broken.

This is a property of the training distribution, not something that can be
mitigated through prompt design. This is a well-documented characteristic of
large language models trained predominantly on English-language
material.[^llm-bias]

Mitigations are documented in
[Known issues: Low-resource language hallucination](#low-resource-language-hallucination).

### Western and Eurocentric lens

The model's training data skews heavily Western and North American. When
generating brewery descriptions for Kinshasa, Abidjan, or Osaka, for example, it
defaults to framing and cultural reference points drawn from that perspective
rather than from the lived context of those cities. Wikipedia enrichment grounds
some generation in city-specific material, but it does not eliminate the skew.

**Output should be read with an understanding of this bias.**

---

## Wikipedia enrichment

City and beer context is fetched from the Wikipedia API. Wikipedia text is
co-licensed under the **Creative Commons Attribution-ShareAlike 4.0
International License (CC BY-SA 4.0)**[^cc-sa] and the **GNU Free Documentation
License (GFDL)**.[^wp-license]

Wikipedia's own accuracy limitations and editorial biases can propagate into
generated descriptions.

---

## Names-by-country dataset

`tooling/pipeline/forenames-by-country.json` and `surnames-by-country.json`
(used to sample a `Name` per ISO 3166-1 country code for user generation) are
vendored verbatim, unmodified, from
[sigpwned/popular-names-by-country-dataset](https://github.com/sigpwned/popular-names-by-country-dataset)
(the `common-forenames-by-country.json` / `common-surnames-by-country.json`
release assets), released under **CC0** (public domain). That dataset's own
forename/surname lists are pulled from Wikipedia's "Lists of most common
surnames" and "List of most popular given names" as of the week of 2023-07-08;
see that project's README for full provenance. Names are not LLM-generated; this
is curated fixture data per ROADMAP.md §2. Per-forename gender from the source
data is preserved through to the sampled `Name` (rather than discarded during
loading) so it's available for gender-aware persona/bio generation later.

The full multinational dataset is kept as-is (106 countries for forenames, 75
for surnames) rather than trimmed to `locations.json`'s current country list, so
it doesn't need re-sourcing if more countries are added later. `SampleName()` (a
free helper in `generate_users.cc`) returns no result for a country present in
neither file; of the countries in `locations.json`, that's currently `KE`, `SE`,
`SG`, `TH`, `VN`, and `ZA`; `GenerateUsers` skips cities in those countries the
same way brewery generation skips cities whose enrichment lookup fails.

---

## The "avoid AI phrases" prompt instruction

The system prompt instructs the model to avoid common AI-generated phrasing
patterns. This is a prompt engineering experiment:

> How far can a model be pushed against its own stylistic defaults?

This is not an attempt to disguise the content as human-written. All downstream
consumers are informed of the AI-generated origin before engagement.

---

## Known issues

### Hallucinated brewing techniques

When forced by the system prompt to generate a "highly specialized technical
brewing detail," the model frequently hallucinates fermentation science and
brewing chemistry. While the resulting text sounds confident, it is nonsensical
to a reader with brewing or scientific expertise.

Small-parameter models such as Gemma 4 E4B cannot reliably satisfy prompts
calling for specialist brewing detail. This is consistent with the **CHOKE**
failure mode (Certain Hallucinations Overriding Known Evidence) [^llm-choke]
where a specific-sounding prompt causes a model to produce confident, coherent,
and factually wrong output.

#### Example — Osaka, produced using Gemma 4 E4B

```log
[2026-04-21 15:04:40.258] [info] 11. city="Osaka" country="Japan" state="Osaka" iso3166_2=JP-27 lat=34.6937 lon=135.5023
[2026-04-21 15:04:40.258] [info]    brewery_name_en="Kani-no-Kuni Brewing"
[2026-04-21 15:04:40.258] [info]    brewery_description_en="The humid scent of takoyaki and savory grilled squid always settles over the neighborhood early in the morning, mingling strangely with the metallic tang of spent grain outside our drying shed. We decided to build this place here because Osaka is a city that never pauses, a place built around the constant exchange of goods and tastes, and that is what we want our beer to reflect. Many people here are accustomed to the dependable, clean taste of the major pale lagers, but we are interested in exploring the deeper, more textured expressions of fermentation. Our base malts are specifically crafted by incorporating strains of local rice, like Yamada Nishiki, which we malt and use not for sake, but for its complex, buttery flavor profile during the mash. This combination, followed by a slow, anaerobic aging process, gives our beers a profound, satisfying depth that stands apart from the hurried mass-market style. The heavy, deep red brick of the original warehouse wall has absorbed decades of Kansai humidity and seasonal rains, creating a patina that tells the exact story of this district's tireless movement. We chose this structure not for its charm, but for its resilience and the sheer density of the local history held within its mortar. Our goal is simply to serve a drink worthy of this powerful trading city. If you are looking for a quiet spot away from the main thoroughfare, look for us just off the side street near Shinsekai."
[2026-04-21 15:04:40.258] [info]    brewery_name_local="カニの国ブルワリー"
[2026-04-21 15:04:40.258] [info]    brewery_description_local="早朝の、たこ焼きや香ばしいイカ焼きの湿った匂いは、いつも乾燥小屋の外にある使用済み麦芽の金属的な匂いと奇妙に混ざり合って近隣に漂います。私たちはこの場所に店を構えることを決めたのです。なぜなら、大阪は決して止まることのない都市であり、商品と味が絶え間なく交換されることで築かれた場所だからです。地元の多くの方々は、信頼できる大規模な淡麗ラガーの味が習慣になっていますが、私たちは発酵の、より深く、より複雑な表現を探求することに関心があります。私たちのベースモルトは、山田錦のような地元の米の品種を意図的に組み込んで作られています。この米を酒ではなく、麦芽として、仕込みの最中にその複雑でバターのような風味を引き出すために使用しています。この組み合わせを、ゆっくりとした嫌気的な熟成プロセスに続けることで、私たちのビールは、慌ただしい市場のスタイルとは一線を画す、深みのある、満足感のある複雑さを持っています。オリジナルの倉庫の重く深紅のレンガ壁は、関西特有の湿気と季節の雨を何十年も吸収し、この地区の絶え間ない動きの正確な物語を語るような古色を帯びています。私たちはこの構造物を、その魅力のためではなく、その回復力とモルタルに込められた地域の歴史の密度ゆえに選びました。私たちの目標は、ただこの力強い交易都市に値する飲み物を提供することだけです。もしメインの通りから離れた静かな場所をお探しなら、新世界近くの脇道にある私たちを探してください。"
```

A review of the following text for brewing techniques reveals three
inaccuracies. No comments are made on the local-language version, since its
reviewer does not read Japanese:

#### 1. "Buttery flavours" framed as a desirable malt-derived flavour

**Incorrect.**

Diacetyl is a fermentation byproduct of yeast metabolism, not a malt-derived
compound.[^diacetyl-source] Diacetyl produces a buttery or butterscotch
off-flavour and is carefully managed in many beer styles, in particular lighter
beers, through a process called a _diacetyl rest_. In this process, fermentation
temperature is briefly raised to allow yeast to reabsorb the compound before
packaging.[^diacetyl-rest]

The Oxford Companion to Beer claims that, while low levels are tolerable in some
ales and stouts, diacetyl is considered undesirable at any perceptible
concentration when it results from bacterial contamination or stressed
fermentation.[^oxford-beer]

#### 2. Yamada Nishiki sake rice described as a self-saccharifying base malt

**Incorrect.**

Yamada Nishiki (_山田錦_) is a short-grain Japanese rice bred specifically for
sake production.[^yn-wiki] Its value lies in its large starchy core
(_shinpaku_), low protein content, and amenability to _koji_ mold penetration
during saccharification.[^yn-sakestreet] Sake brewing does not use the grain's
own enzymatic activity for saccharification — it relies on _Aspergillus oryzae_
(koji mold) grown on a portion of the steamed rice to convert starches to
fermentable sugars.[^yn-sakeonline]

#### 3. "Anaerobic aging" presented as a differentiating technique

**Misleading**

Anaerobic conditions during packaging and aging are not a differentiating
technique. Anaerobic conditions are the standard baseline for all commercial
beer production. Breweries exclude oxygen as a top priority for packaging and
shelf stability; published research in _Microbiology Spectrum_ confirms that
packaged beer constitutes an anaerobic environment by definition.[^anaerobic]
Professional packaging lines use CO_2 purges and closed transfers specifically
to maintain this state.[^packaging] Framing anaerobic aging as a distinctive
practice is misleading and suggests hallucinated output.

### Low-resource language hallucination

The generation pipeline passes local language codes to the model to retrieve a
translated `description_local`. Output quality is reliable for high-resource
languages such as French, though it may struggle with regional variants and
idiomatic phrasing.

```json
[
  {
    "city": "Kinshasa",
    "state_province": "Kinshasa",
    "iso3166_2": "CD-KN",
    "country": "Democratic Republic of the Congo",
    "iso3166_1": "CD",
    "latitude": -4.4419,
    "longitude": 15.2663,
    "local_languages": ["fr-CD", "ln"]
  },
  {
    "city": "Paris",
    "state_province": "Île-de-France",
    "iso3166_2": "FR-IDF",
    "country": "France",
    "iso3166_1": "FR",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "local_languages": ["fr-FR"]
  },
  {
    "city": "Abidjan",
    "state_province": "Abidjan",
    "iso3166_2": "CI-AB",
    "country": "Ivory Coast",
    "iso3166_1": "CI",
    "latitude": 5.36,
    "longitude": -4.0083,
    "local_languages": ["fr-CI"]
  },
  {
    "city": "Montreal",
    "state_province": "Quebec",
    "iso3166_2": "CA-QC",
    "country": "Canada",
    "iso3166_1": "CA",
    "latitude": 45.5017,
    "longitude": -73.5673,
    "local_languages": ["fr-CA"]
  },
  {
    "city": "Brussels",
    "state_province": "Brussels-Capital Region",
    "iso3166_2": "BE-BRU",
    "country": "Belgium",
    "iso3166_1": "BE",
    "latitude": 50.8503,
    "longitude": 4.3517,
    "local_languages": ["fr-BE", "nl-BE"]
  }
]
```

When fed into the pipeline, this dataset often causes the model to reason that a
local variant of French is needed, but it often defaults to a standardized
dialect of French, without cultural or linguistic nuance.

For languages such as Welsh (Wales), Māori (Aotearoa/New Zealand), or Sicilian
(Sicily, Italy), the model can generate text that looks syntactically plausible
but is semantically incoherent. This comes from limited training-data coverage
rather than prompt engineering.

Output sample: [./french-cities.example](french-cities.example)

#### Proposed mitigations

- **Prevention via allowlist:** introduce a high-resource language allowlist. If
  a location's code is unlisted, skip `description_local` generation and fall
  back to English.
- **Upstream sanitization:** strip known low-resource language codes from the
  `locations.json` payload before generation.
- **Downstream flagging:** add a `description_local_confidence` column to the
  SQLite schema so downstream applications can filter or flag potentially
  hallucinated text by language tier.

### Synthetic coordinates

Each brewery and user address carries a longitude/latitude pair, sampled
uniformly at random within a 5 km disc centred on the city's curated
`latitude`/`longitude` from `locations.json`.

The coordinate pair itself is **plausible by construction**, always falling
within the city's vicinity, but does not correspond to a real business or
resident, and should not be treated as accurate geocoding data. This is
consistent with the rest of the dataset: fixture data for a proof-of-concept,
not a source of truth.

For brewery addresses specifically (not user addresses, which carry no street
address at all), `address_line1`/`postal_code` *are* looked up from a real
address registry — `NominatimAddressService` reverse-geocodes the synthetic
coordinate pair against the live OpenStreetMap/Nominatim database, so the
street address is a genuine nearby address, just not the address of an actual
brewery. This lookup only happens for non-`--mocked` runs; `--mocked` runs use
`MockAddressService`'s fixed placeholder address instead, which is not looked
up from any real registry.

---

## Footnotes

[^llm-choke]:
    CHOKE (Certain Hallucinations Overriding Known Evidence) is a hallucination
    failure mode defined by Simhi et al. (2025), in which a model that can
    consistently answer a question correctly produces a confident, wrong
    response when the prompt is trivially perturbed. Source: Trust Me, I'm
    Wrong: LLMs Hallucinate with Certainty Despite Knowing the Answer — Adi
    Simhi, Itay Itzhak, Fazl Barez, Gabriel Stanovsky, Yonatan Belinkov.

[^llm-bias]:
    For example, Blasi et al. (2022), "Systematic Inequalities in Language
    Technology Performance across the World's Languages," _ACL Anthology_. The
    pattern is consistent with models trained predominantly on English-language
    web corpora.

[^wp-license]:
    Source:
    [Wikipedia:FAQ/Copyright](https://en.wikipedia.org/wiki/Wikipedia:FAQ/Copyright).

[^cc-sa]:
    Creative Commons CC BY-SA 4.0 deed: "If you remix, transform, or build upon
    the material, you must distribute your contributions under the same license
    as the original." Source:
    [creativecommons.org/licenses/by-sa/4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en).

[^diacetyl-source]:
    White Labs confirms that diacetyl is a yeast-derived fermentation byproduct:
    specifically, a compound produced during amino acid metabolism that leaks
    out of the yeast cell and oxidises into its characteristic buttery
    off-flavour. It is generally considered undesirable at any perceived level
    in most styles, though low levels are tolerated in some English ales and
    European lagers. Source:
    [whitelabs.com — Compound Spotlight: Diacetyl](https://www.whitelabs.com/news-update-detail?id=54).

[^diacetyl-rest]:
    Brewing Science Institute: diacetyl "is produced during the fermentation
    process, primarily as a byproduct of yeast metabolism… generally considered
    a flaw in most beer styles." Source:
    [brewingscience.com — Diacetyl: Understanding Its Role as an Off-Flavor in Beer](https://brewingscience.com/diacetyl-understanding-its-role-as-an-off-flavor-in-beer/).

[^oxford-beer]:
    Oxford Companion to Beer via _Beer & Brewing_: "At low to moderate levels,
    diacetyl can be perceived as a positive flavor characteristic in some ales
    and stouts" but "particularly unwelcome in lager-style beers." Source:
    [beerandbrewing.com — diacetyl](https://www.beerandbrewing.com/dictionary/48TDqQibPi).

[^yn-wiki]:
    Wikipedia: "Yamada Nishiki (山田錦) is a short-grain Japanese rice famous
    for its use in high-quality sake." Source:
    [en.wikipedia.org/wiki/Yamada_Nishiki](https://en.wikipedia.org/wiki/Yamada_Nishiki).

[^yn-sakestreet]:
    Sake Street: Yamadanishiki's large _shinpaku_ allows koji mold to penetrate
    to the centre of the rice grain, making it "particularly suitable for
    producing good koji." Source:
    [sakestreet.com — What is Yamadanishiki?](https://sakestreet.com/en/media/what-is-yamadanishiki).

[^yn-sakeonline]:
    Sake Online: "Steamed rice is added to make koji (rice malt) and yeast
    starter, which promotes alcohol fermentation." Source:
    [sakeonline.com.au — Types of Sake Rice: Yamada Nishiki](https://sakeonline.com.au/blogs/news/types-of-sake-rice-yamada-nishiki-and-its-characteristics).

[^anaerobic]:
    Pai et al. (2022): "Breweries have recognized oxygen exclusion as a top
    priority for the proper packaging and aging of beer… packaged beer is an
    anaerobic environment." _Microbiology Spectrum._ Source:
    [journals.asm.org](https://journals.asm.org/doi/10.1128/spectrum.02656-22).

[^packaging]:
    Beer Production Processes (oboe.com): Professional packaging lines use
    double CO_2 pre-evacuation cycles and closed transfers "so the beer moves in
    a completely anaerobic environment." Source:
    [oboe.com — Flavor Quality Control](https://oboe.com/learn/beer-production-processes-308lmf/flavor-quality-control-4).
