'use strict';

const { When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

const { smartSettle, friendly } = require('webship-js/tests/step-definitions/webship');

// -----------------------------------------------------------------------------
// Custom steps for the Varbase Events Base recipe.
//
// The Event content type ships widgets the generic webship-js steps cannot
// drive on their own: the "When" smartdate (date + time inputs), the Body
// CKEditor 5 editor (its content lives in the editor model, not the textarea),
// and the "Featured image" media_library widget (an AJAX modal media picker).
// These steps drive those widgets, plus a save step and UI edit/delete steps so
// every authoring scenario stays independent and removes what it creates.
//
// SAFETY: state-changing steps click ONLY specific, verified elements (never a
// "first form submit" fallback) and fail fast if the page is not the expected
// Event node form, so a mis-navigated run can never submit an unrelated form.
// -----------------------------------------------------------------------------

const budgetOf = (world) => (world.minWaitTime && world.minWaitTime.page) || 8000;

/**
 * Assert the browser is on an Event node add/edit form before a write.
 */
async function assertOnEventForm(page) {
  const url = page.url();
  const onForm = /\/node\/add\/event/.test(url) || /\/node\/\d+\/edit/.test(url);
  const hasTitle = (await page.locator('#edit-title-0-value').count()) > 0;
  if (!onForm || !hasTitle) {
    throw friendly(
      `Expected to be on the Event add/edit form, but the current page is "${url}".`,
      'Navigate to /node/add/event (or /node/<id>/edit) before this step.'
    );
  }
}

/**
 * Resolve the node id of the Event canonical page currently shown. Reads it
 * from the Edit local-task link (/node/<id>/edit — reliably present for an
 * author), falling back to the shortlink and node body class.
 */
async function currentEventNid(page) {
  return page.evaluate(() => {
    const editHref = [...document.querySelectorAll('a[href*="/node/"]')]
      .map((a) => a.getAttribute('href'))
      .find((h) => /\/node\/\d+\/(edit|delete)/.test(h));
    if (editHref) return editHref.match(/\/node\/(\d+)\//)[1];
    const sl = document.querySelector('link[rel="shortlink"]');
    if (sl) {
      const m = sl.getAttribute('href').match(/node\/(\d+)/);
      if (m) return m[1];
    }
    const body = document.querySelector('body[class*="page-node-"]');
    if (body) {
      const m = body.className.match(/page-node-(\d+)/);
      if (m) return m[1];
    }
    const el = document.querySelector('[data-history-node-id]');
    if (el) return el.getAttribute('data-history-node-id');
    return null;
  });
}

/**
 * Set the Event "When" smartdate start date and time.
 *
 * Example #1: When I set the event "When" date to "2026-12-24" and time "10:00:00"
 * Example #2: And I set the event "When" date to "2026-09-15" and time "09:30:00"
 * Example #3: When we set the event "When" date to "2026-12-24" and time "10:00:00"
 * Example #4: And we set the event "When" date to "2027-01-05" and time "14:00:00"
 * Example #5: Given I set the event "When" date to "2026-12-24" and time "10:00:00"
 */
When(/^(?:I |we )*set the event "When" date to "([^"]*)" and time "([^"]*)"$/, async function (date, time) {
  await assertOnEventForm(this.page);
  const dateInput = this.page.locator('[name="field_when[0][time_wrapper][value][date]"]').first();
  const timeInput = this.page.locator('[name="field_when[0][time_wrapper][value][time]"]').first();
  if ((await dateInput.count()) === 0) {
    throw friendly(
      'No "When" smartdate date input was found on the Event form.',
      'This step only works on the Event add/edit form (field_when smartdate widget).'
    );
  }
  await dateInput.fill(date);
  await timeInput.fill(time);
  await smartSettle(this.page, budgetOf(this));
});

/**
 * Set the Event Body via the CKEditor 5 editor instance.
 *
 * The Body renders in a CKEditor 5 editor whose content lives in the editor
 * model; writing to the underlying textarea (or the editable's innerHTML) is
 * discarded on submit. This calls `editor.setData()` on the instance bound to
 * the body textarea, which CKEditor serialises back to the textarea on save.
 *
 * Example #1: When I fill in the event Body with "<p>Hello world</p>"
 * Example #2: And I fill in the event Body with "<p>Details paragraph.</p>"
 * Example #3: When we fill in the event Body with "<p>Body text</p>"
 * Example #4: And we fill in the event Body with "<p>More text</p>"
 * Example #5: Given I fill in the event Body with "<p>Body</p>"
 */
When(/^(?:I |we )*fill in the event Body with "([^"]*)"$/, async function (html) {
  await assertOnEventForm(this.page);
  const budget = budgetOf(this);

  // The CKEditor 5 rich-text editor pulls the Varbase Plugin Pack / Premium
  // Features plugins from cdn.ckeditor.com, which a network-isolated CI runner
  // cannot reach (plugincollection-plugin-not-found), leaving a broken editor
  // that serialises an EMPTY body over the textarea on submit. So tear down any
  // CKEditor 5 bound to the Body, then write straight into the textarea — Drupal
  // submits its value as-is. This still proves the Body field saves and renders
  // (the rich-text editor itself is core/Varbase, not this recipe). Switch to
  // "Plain text" first when the format select exists.
  const formatSelect = this.page.locator('select[name="body[0][format]"]');
  if ((await formatSelect.count()) > 0
      && (await formatSelect.locator('option[value="plain_text"]').count()) > 0) {
    await formatSelect.selectOption('plain_text').catch(() => {});
    await smartSettle(this.page, budget);
  }

  const set = await this.page.evaluate((value) => {
    // Destroy any CKEditor 5 instance on the Body so it cannot overwrite the
    // textarea value when the form is submitted.
    if (window.Drupal && window.Drupal.CKEditor5Instances) {
      for (const [key, editor] of window.Drupal.CKEditor5Instances) {
        if (editor.sourceElement && editor.sourceElement.id === 'edit-body-0-value') {
          try { editor.destroy(); } catch (e) { /* broken editor — ignore */ }
          window.Drupal.CKEditor5Instances.delete(key);
        }
      }
    }
    const ta = document.getElementById('edit-body-0-value');
    if (!ta) return false;
    ta.removeAttribute('data-editor-active');
    ta.style.display = '';
    ta.value = value;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, html);
  if (!set) throw friendly('Could not set the event Body — no #edit-body-0-value field on the form.');
  await smartSettle(this.page, budget);
});

/**
 * Save the current Event node form (clicks ONLY #edit-submit).
 *
 * Guarded: asserts the page is the Event form first, and afterwards asserts the
 * browser left the form (a validation error keeps you on the form and fails the
 * step) so a rejected save never passes silently.
 *
 * Example #1: When I save the event
 * Example #2: And I save the event
 * Example #3: When we save the event
 * Example #4: And we save the event
 * Example #5: Given I save the event
 */
When(/^(?:I |we )*save the event$/, async function () {
  await assertOnEventForm(this.page);
  await this.page.evaluate(() => {
    const el = document.getElementById('edit-submit');
    if (el) el.click();
  });
  await smartSettle(this.page, budgetOf(this));
  const url = this.page.url();
  if (/\/node\/add\/event/.test(url) || /\/node\/\d+\/edit/.test(url)) {
    const errors = await this.page.evaluate(() =>
      [...document.querySelectorAll('.messages--error, [data-drupal-messages] .messages--error')]
        .map((e) => e.textContent.replace(/\s+/g, ' ').trim()).join(' | '));
    throw friendly(
      'Saving the event did not leave the form — the save was rejected.',
      errors ? `Form errors: ${errors}` : 'Check the required Event fields.'
    );
  }
});

/**
 * Add a featured image to the Event from the existing media library.
 *
 * Drives the Featured image media_library widget's real modal: a Playwright
 * click on "Add media" (a synthetic in-page click does not fire Drupal's AJAX),
 * waits for the media library view, selects the first media item and inserts
 * it, then asserts the widget shows the selected item.
 *
 * Example #1: When I add the first available featured image from the media library
 * Example #2: And I add the first available featured image from the media library
 * Example #3: When we add the first available featured image from the media library
 * Example #4: And we add the first available featured image from the media library
 * Example #5: Given I add the first available featured image from the media library
 */
When(/^(?:I |we )*add the first available featured image from the media library$/, async function () {
  await assertOnEventForm(this.page);
  const budget = budgetOf(this);

  // A real Playwright click fires the Drupal AJAX that opens the modal.
  const openButton = this.page.locator(
    '#edit-field-featured-image-open-button, [data-drupal-selector="edit-field-featured-image-open-button"], .field--name-field-featured-image .media-library-open-button'
  ).first();
  await openButton.waitFor({ state: 'visible', timeout: 20000 });
  await openButton.click();

  // Wait for the media library modal dialog, then its first selectable item.
  await this.page.locator('.media-library-widget-modal, .ui-dialog .media-library-view, [role="dialog"] .media-library-view')
    .first().waitFor({ state: 'visible', timeout: 30000 });
  const firstItem = this.page
    .locator('.media-library-view .js-media-library-item input[type="checkbox"], .media-library-view .media-library-item input[type="checkbox"], .media-library-widget-modal .media-library-item input[type="checkbox"]')
    .first();
  await firstItem.waitFor({ state: 'attached', timeout: 30000 }).catch(() => {
    throw friendly(
      'The media library opened but shows no selectable image to add.',
      'Ensure the site has at least one image media item the author can use.'
    );
  });
  await firstItem.check({ force: true });
  await smartSettle(this.page, budget);

  // Click "Insert selected" in the modal button pane (real click for AJAX).
  const insert = this.page.locator('.ui-dialog-buttonpane button:has-text("Insert selected"), .media-library-widget-modal button:has-text("Insert selected"), [role="dialog"] button:has-text("Insert selected")').first();
  await insert.waitFor({ state: 'visible', timeout: 20000 });
  await insert.click();
  await smartSettle(this.page, budget);

  // The widget should now show the selected media item.
  const selected = this.page.locator('.field--name-field-featured-image .media-library-item, [data-drupal-selector="edit-field-featured-image-selection"] .media-library-item, .media-library-selection .media-library-item').first();
  await selected.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {
    throw friendly('The Featured image widget shows no selected media after inserting.');
  });
});

/**
 * Open the edit form of the Event node currently being viewed.
 *
 * Example #1: When I open the edit form for the event I am viewing
 * Example #2: And I open the edit form for the event I am viewing
 * Example #3: When we open the edit form for the event I am viewing
 * Example #4: And we open the edit form for the event I am viewing
 * Example #5: Given I open the edit form for the event I am viewing
 */
When(/^(?:I |we )*open the edit form for the event I am viewing$/, async function () {
  const nid = await currentEventNid(this.page);
  if (!nid) {
    throw friendly('Could not determine the node id of the event being viewed.', 'Open the event full page before editing it.');
  }
  await this.page.goto(`${this.launchUrl.replace(/\/$/, '')}/node/${nid}/edit`, { waitUntil: 'domcontentloaded' });
  await smartSettle(this.page, budgetOf(this));
  await assertOnEventForm(this.page);
});

/**
 * Delete the Event node currently being viewed, through the core delete confirm
 * form (clicks ONLY that form's #edit-submit). Keeps authoring scenarios
 * independent by removing what they create.
 *
 * Example #1: When I delete the event I am viewing
 * Example #2: And I delete the event I am viewing
 * Example #3: When we delete the event I am viewing
 * Example #4: And we delete the event I am viewing
 * Example #5: Given I delete the event I am viewing
 */
When(/^(?:I |we )*delete the event I am viewing$/, async function () {
  const nid = await currentEventNid(this.page);
  if (!nid) {
    throw friendly('Could not determine the node id of the event being viewed.', 'Open the event full page before deleting it.');
  }
  await this.page.goto(`${this.launchUrl.replace(/\/$/, '')}/node/${nid}/delete`, { waitUntil: 'domcontentloaded' });
  const onDelete = /\/node\/\d+\/delete/.test(this.page.url()) && (await this.page.locator('#edit-submit').count()) > 0;
  if (!onDelete) {
    throw friendly(`Expected the node delete confirm form, but got "${this.page.url()}".`);
  }
  await this.page.evaluate(() => {
    const el = document.getElementById('edit-submit');
    if (el) el.click();
  });
  await smartSettle(this.page, budgetOf(this));
});

/**
 * Choose an option in the events listing "Type" exposed filter select.
 *
 * The exposed form may render more than one control labelled "Type", so this
 * targets the filter's select by name (`event_categories`) rather than by
 * label. Follow it with `I press "Apply Filter"` to run the filter.
 *
 * Example #1: When I choose "Workshop" in the events Type filter
 * Example #2: And I choose "Conference" in the events Type filter
 * Example #3: When we choose "Workshop" in the events Type filter
 * Example #4: And we choose "Open Day" in the events Type filter
 * Example #5: Given I choose "Workshop" in the events Type filter
 */
When(/^(?:I |we )*choose "([^"]*)" in the events Type filter$/, async function (label) {
  await this.page.selectOption('select[name="event_categories"]', { label });
  await smartSettle(this.page, budgetOf(this));
});

/**
 * Assert the events listing result summary reports a given "of N" total.
 *
 * Example #1: Then the events result summary should show a total of 15
 * Example #2: And the events result summary should show a total of 1
 * Example #3: Then the events result summary should show a total of 8
 * Example #4: And the events result summary should show a total of 12
 * Example #5: Then the events result summary should show a total of 3
 */
Then(/^the events result summary should show a total of (\d+)$/, async function (total) {
  const text = (await this.page.locator('body').textContent()) || '';
  const normalized = text.replace(/\s+/g, ' ');
  const re = new RegExp(`of\\s+${total}\\b`);
  assert.ok(
    re.test(normalized),
    friendly(`Expected the events result summary to report "of ${total}", but it did not.`, 'Check the view result summary (e.g. "Showing 1-12 of 15").')
  );
});
