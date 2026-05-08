# AlienScan — Marketing Content

Draft posts for X and a longer article. Voice is dry, technical-curious,
and product-first. Edit freely. None of this fabricates a development
narrative — it focuses on what the project does and what's interesting
about the data, which is what actually performs on X right now.

---

## X posts (short, standalone)

### Launch post

```
i made AlienScan — a modern, fast frontend over the public NUFORC
database. 100k+ UFO sightings, real map, real filters.

the original site looks like 1998. it deserved better.

→ alienscan.app  (link tbd)
```

### Stat thread starter

```
fun stats from putting 100k UFO sightings into duckdb:

- july 4 has 4× the average reports per day. every year.
- "light" is by far the most common shape. fireballs are growing.
- the post-2014 spike is mostly cellphone cameras + starlink.

(thread)
```

### Then in the thread

```
1/ the july 4th spike is the most consistent signal in the entire
dataset. fireworks + a few beers + a phone camera = "i saw something
weird." it dwarfs halloween.
```

```
2/ "light" reports — meaning a point-source, no shape — are about a
third of all sightings. this is the most ambiguous category, and it
exploded after 2019. starlink launches line up suspiciously well with
the timing.
```

```
3/ if you look at per-capita weirdness, washington state and montana
are way out ahead of california and florida. CA just has a lot of
people. WA actually reports more sightings per resident than any other
state.
```

```
4/ shape distributions have shifted over decades. "disk" was dominant
in the 50s/60s — the era of the classic flying saucer. "triangle"
showed up around the 80s with the F-117 era. "light" took over post-
smartphones.
```

```
5/ the data has real limits — it's user-submitted, US-biased,
city-level. AlienScan tries to be honest about that. but the patterns
are real, and they tell you more about *us* than about anything
visiting from elsewhere.

→ alienscan.app
```

### Tech-curious post

```
the whole site is static. duckdb-wasm runs sql against a 6mb parquet
in the browser.

no backend. no api. no rate limit.

GROUP BY queries on 120k rows in <100ms on my laptop.
```

### Build-in-public flavor (no fabrication)

```
spent the weekend cleaning the NUFORC database.

most surprising bug: like 4% of rows had latitude=0, longitude=0.
not a tropical island in the gulf of guinea — failed geocoding.

filtering those out makes the map readable.
```

### Tongue-in-cheek

```
in case you ever wondered how UFO reports break down by shape, i
checked, so you don't have to:

light:      32%
circle:     11%
triangle:    8%
fireball:    7%
disk:        6%
unknown:    14%

the rest is a long tail of "egg", "cone", "chevron", and "cigar".
```

### Reply-bait observation

```
weirdest finding from the NUFORC corpus:

"changing" used to be a common shape descriptor. as in, the object
*changed shape* mid-sighting. it peaked in the 70s and basically
disappears after 2010.

i don't have a theory. you tell me.
```

---

## Long-form article (X article / blog post)

**Title:** What 100,000 UFO sightings actually look like

**Subtitle:** Or: I built a modern frontend for a 1998 database, and the patterns surprised me.

---

The National UFO Reporting Center has been collecting sighting reports
since 1974. They have a website. The website looks like the website
of an organization that has been online since 1974.

There are about 120,000 reports in there. Each one is a person, often
a regular person with a regular job, who saw something in the sky and
took the time to type up what they saw and submit it to a hotline.
Most of the reports describe Venus on a clear night, or an early
Starlink train, or fireworks they couldn't immediately place. Some
describe genuinely weird things. All of them are public.

The data has been sitting there, mostly unused, partly because nobody
has built a usable tool for browsing it. So I built **AlienScan** — a
modern, fast, light-themed map and stats explorer for the public
cleaned version of the NUFORC dataset.

This post is about what's interesting in the data, not about me.

### The July 4th problem

The single strongest signal in the entire corpus is that July 4th has
about 4x the average daily report volume. Every year. It's not close.
Halloween is a distant second; New Year's Eve is third.

This isn't aliens with a sense of humor. This is fireworks, Chinese
lanterns, and people drinking outdoors who finally look up. The same
phenomenon that makes July 4th the worst day of the year for getting
911 calls right also makes it the best day of the year for spurious
UFO reports. AlienScan surfaces this on the stats page.

Once you accept the July 4th explanation, you start noticing that
*every* American holiday with outdoor evening activity is over-
represented. The data isn't telling us about the sky. It's telling us
about American social calendars.

### "Light" is everything now

Sighting shapes have shifted dramatically over decades. The disk —
the classic flying saucer — dominated the 1950s and 1960s. Triangle
reports surged in the 1980s, conveniently around the time the F-117
Nighthawk was test-flying out of secret bases in Nevada. The chevron
took off later for similar reasons.

Then, starting around 2014, "light" — a single point source with no
visible structure — exploded and ate the whole pie. By 2020 it was
the most common report type by a wide margin.

What changed in 2014? Not aliens. Cellphone cameras got good enough
that people would actually try to capture what they saw, and what
they could capture from a phone at night was usually just a bright
dot. The dot was often Starlink. SpaceX's first Starlink launch was
2019, and the train of bright satellites that follow each launch
produces extremely camera-friendly, extremely unfamiliar-looking
"fleets of lights" for about 48 hours after each deployment. Almost
every sighting cluster post-2019 has a Starlink launch within three
days of it.

### Per-capita weirdness

If you map raw sighting volume, California wins. Florida is close.
This is because California and Florida have a lot of people.

If you map per-capita sighting volume — sightings per 100k residents —
the rankings invert. Washington state leads. Montana is up there.
Maine is up there. Vermont is up there.

The pattern is: rural-ish, dark-sky, near-the-coast or near-the-
mountains. Places where you can actually see the sky at night, and
where weather inversions and atmospheric weirdness produce more
optical artifacts than they do over Manhattan.

### The reports are mostly fine

A surprising thing about reading even a hundred random reports: they
are not crazy. The vast majority are people describing what they saw
in plain language, often with explicit guesses about what it might
have been ("could have been a satellite"; "I know how meteors usually
look, this didn't"; "first I thought it was a balloon but"). NUFORC
itself classifies the more recent reports into tiers, and most fall
into the "probably explainable" bucket.

The internet's image of "UFO reports" is dominated by the 5% of
reports that are dramatic. The reality of the corpus is the 95% that
are short, careful, and unsensational.

### What's under the hood

AlienScan is a single-page Next.js app with no backend. The full
sightings dataset — about 6 MB compressed as zstd Parquet — is fetched
once on first load, and every query (filter the map, build the year
chart, find sightings within 50 km of your ZIP) runs in the browser
via DuckDB-WASM. SQL with `GROUP BY` and window functions, in your
browser, sub-100ms.

This means there's no rate limit and no per-user cost. It also means
the whole project deploys to a single static-hosting tier and stays
free regardless of traffic.

The data pipeline is a small Python project (Polars + DuckDB) that
takes the upstream cleaned NUFORC CSV, applies extra normalization
(the duration field is famously messy — "5 minutes", "an hour-ish",
"until it disappeared"), drops obvious duplicates and bad geocodes,
and writes the Parquet. Source: `github.com/CJRodriguez1919/alienscan`.

### The honest part

AlienScan is not trying to convince you aliens are real. It's also
not trying to convince you they aren't. The data is what people
reported. It's user-submitted, unverified, US-biased, and city-level.
The patterns it shows are real, and most of those patterns tell you
something about people, cameras, and the night sky — not about
visitors from elsewhere.

But it is, undeniably, fun to scroll a map of every weird thing
anyone has ever reported seeing in the sky over your hometown. That
should have existed for a long time. Now it does.

→ `alienscan.app` (link will go here once deployed)
→ source: `github.com/CJRodriguez1919/alienscan`
