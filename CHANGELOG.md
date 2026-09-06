# Changelog

All notable changes to the Varbase Events Base recipe are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-09-06
### Changed
- First stable release of the Varbase Events Base recipe.
- Pin the five sibling dependencies to their stable released constraints:
  `varbase_components` `~4.0.0`, `varbase_content_base` `~1.0.0`,
  `varbase_media_base` `~1.0.0`, `varbase_seo_base` `~1.0.0`,
  `varbase_workflow_base` `~1.0.0`.
- Update the version badge to `1.0.0` in `README.md`.

## [1.0.0-beta1] - 2026-09-02
### Changed
- Update `@vardot/varbase-e2e` to the latest 2.x.
- Pin the five sibling recipe dependencies to their released constraints:
  `varbase_components` `~4.0.0`, `varbase_content_base` `~1.0.0`,
  `varbase_media_base` `~1.0.0`, `varbase_seo_base` `~1.0.0`,
  `varbase_workflow_base` `~1.0.0`.
- Update the version badge to `1.0.0-beta1` in `README.md`.
### Fixed
- Correct the CI comment that described the removed `drupal-libraries` yarn sync.

## [1.0.0-alpha2] - 2026-08-13
### Added
- An **Upcoming events** block display on the Events view: the three nearest upcoming events in the
  `text_card_medium` view mode, no pager, in a single column. The view mode is already bound to
  `field_when`, so each card carries its date. Component ids are the base theme's
  (`vartheme_bs5:`), so any consumer can place the block as shipped, and a site template with its
  own theme repoints them with `setViewsComponentStyleTheme`. A site template no longer has to
  define this display itself.
### Changed
- Switch the Varbase functional testing suite to Varbase E2E.
- Update the version badge to `1.0.0-alpha2` in `README.md`.

## [1.0.0-alpha1] - 2026-08-09
### Added
- Initial release of the Varbase Events Base recipe: an Event content type with a smart date (When),
  Type and Industry taxonomy fields, a Location field, an events listing with two columns of cards,
  a full pager, exposed filters for keyword/Type/Industry, a Related events display, and Drupal
  Canvas templates for the event page and card.
### Changed
- Pin the `drupal/varbase_components`, `drupal/varbase_content_base`, `drupal/varbase_media_base`,
  `drupal/varbase_seo_base`, and `drupal/varbase_workflow_base` dependencies to real released
  constraints (`~4.0.0` / `~1.0.0`).
- Update the version badge to `1.0.0-alpha1` in `README.md`.

[Unreleased]: https://git.drupalcode.org/project/varbase_events_base/-/compare/1.0.0...1.0.x
[1.0.0]: https://git.drupalcode.org/project/varbase_events_base/-/compare/1.0.0-beta1...1.0.0
[1.0.0-beta1]: https://git.drupalcode.org/project/varbase_events_base/-/compare/1.0.0-alpha2...1.0.0-beta1
[1.0.0-alpha2]: https://git.drupalcode.org/project/varbase_events_base/-/compare/1.0.0-alpha1...1.0.0-alpha2
[1.0.0-alpha1]: https://git.drupalcode.org/project/varbase_events_base/-/tags/1.0.0-alpha1
