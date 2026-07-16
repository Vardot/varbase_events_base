# Varbase Events Base — automated functional tests

Behaviour-Driven functional tests for the **Varbase Events Base** recipe, written
with [webship-js](https://webship.co/docs/webship-js/2.0.x) (Playwright +
Cucumber-js). They drive a running Varbase site through a real browser and assert
the behaviour the recipe actually provides — the Event content type and its
fields, authoring, the events listing with its filters and pager, the Related
events block, and the event permissions.

## Layout

```
tests/
├── features/
│   ├── 01-event-content-type/   # the Event add form exposes the recipe's fields
│   ├── 02-event-authoring/      # create / edit / featured-image an event, assert the page
│   ├── 03-events-listing/       # /events cards, result summary, Search by + Type filters, pager
│   ├── 04-events-related/       # the Related events block (other events, excludes current)
│   └── 05-events-permissions/   # who can reach the add form; the editor create→edit→delete flow
├── step-definitions/
│   ├── varbase.steps.js         # login as a per-role test user; the "wait" step
│   └── events.steps.js          # smartdate When, CKEditor Body, media-library featured image,
│                                #   save / edit / delete an event, the Type filter + result summary
└── fixtures/
    └── seed-events.php          # 15 deterministic "Varbase Example Event NN" events the read-only
                                 #   listing / pager / filter / related scenarios assert against
```

One folder = one parallel CI job (matrix over `SUITE`).

## Prerequisites

- A running Varbase site with this recipe applied (Event content type, `/events`
  listing, Canvas templates).
- The six per-role testing users from `cucumber.js` (`Content editor`,
  `Content admin`, `SEO admin`, `Site admin`, `Normal user`, `webmaster`).
- The event fixture seeded (the listing / pager / filter / related scenarios use
  it for deterministic result counts):

  ```bash
  drush php:script tests/fixtures/seed-events.php
  ```

  The seed is idempotent and creates 15 events titled `Varbase Example Event NN`
  (8 Workshop, 7 Conference), all sharing the `Varbase Example Tag`, all published
  with a future date — the scenarios isolate them with the "Search by" keyword,
  so their counts do not depend on any other content on the site. Remove them
  with:

  ```bash
  drush php:eval 'foreach(\Drupal::entityTypeManager()->getStorage("node")->loadByProperties(["type"=>"event"]) as $n){ if(strpos($n->label(),"Varbase Example Event")===0){$n->delete();} }'
  ```

## Running

```bash
npm install                 # webship-js brings Cucumber-js, Playwright, tsx
npx playwright install chromium

# Point at your running site and run the whole suite:
LAUNCH_URL=https://your-site.ddev.site npm run test:chromium

# A single feature file:
FEATURES="tests/features/03-01-events-listing.feature" \
  LAUNCH_URL=https://your-site.ddev.site npm run test:chromium
```

Feature files live flat in `tests/features/` (one recipe — no per-feature
subfolders); the `NN-NN-` prefix keeps them ordered. CI installs a Varbase site
that applies this recipe, seeds the users + fixture, and runs the whole suite —
see `.gitlab-ci.yml`.
