# Varbase Events Base

An event content type and an events listing for [Varbase](https://www.drupal.org/project/varbase) 11,
built on the [Events](https://www.drupal.org/project/events) recipe and wired up the way Varbase
renders content.

Works on Varbase Starter and on the Educare site template. Like
[Varbase Blog Base](https://www.drupal.org/project/varbase_blog_base), it targets the base theme
(Vartheme BS5); a site template that ships its own theme repoints the Canvas components with config
actions, the same way it already repoints the Blog view.

## What it gives you

- The **Event** content type from the Events recipe, with a smart date (When).
- **Type** and **Industry** taxonomy fields, so the listing can be filtered. Type comes from an Event
  Categories vocabulary; Industry reuses the shared Tags vocabulary, exactly as Blog exposes Type and
  Industry on its own listing.
- A **Location** field, and the **Description** and **Featured image** fields Blog also carries, so an
  event is built the way a blog post is.
- An **events listing**: two columns of cards, twelve to a page, a full pager, a result summary, and
  exposed filters for keyword, Type and Industry.
- A **Related events** display: the same Industry as the event being read, that event excluded.
- **Drupal Canvas templates**: a content template for the event page (title, date and location, body,
  related events) and a card template for the listings, plus a VMI card view display.

## Install

```bash
composer require drupal/varbase_events_base
drush recipe recipes/varbase_events_base
```

Or list it in a site template recipe:

```yaml
recipes:
  - varbase_events_base
```

## Overriding it in a site template

The recipe renders through the base theme's components. A site template with its own theme repoints
them with config actions — for example, Educare renders the event card with its own dated card:

```yaml
config:
  actions:
    views.view.events:
      simpleConfigUpdate:
        display.default.display_options.style.options.component_id: 'my_theme:views-view-grid'
    canvas.content_template.node.event.text_card_medium:
      simpleConfigUpdate:
        component_tree: { ... }
```

## Maintainers

Sponsored and developed by [Vardot](https://www.drupal.org/vardot).
