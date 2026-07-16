'use strict';

const { Given, When } = require('@cucumber/cucumber');

// Reuse webship-js's own helpers so these custom steps behave like the core
// ones: `smartSettle` (the smart "wait for a quiet edge" used by every
// navigation step) and `friendly` (tester-friendly error formatting).
const { smartSettle, friendly } = require('webship-js/tests/step-definitions/webship');

/**
 * Authenticate a Varbase user defined in cucumber.js worldParameters.users.
 *
 * Example #1: Given I am a logged in user with the "webmaster" user
 * Example #2: Given I am a logged in user with the "Content editor" user
 * Example #3: Given I am a logged in user with the username "editor"
 * Example #4: Given I am a logged in user with "Content admin"
 * Example #5: And I am a logged in user with the "Content admin" user
 */
Given(/^I am a logged in user with( the)*( username)* "([^"]*)?"( user)*$/, async function (theCase, usernameCase, username, userCase) {
  const users = this.parameters.users;

  if (!(username in users)) {
    throw friendly(
      `User "${username}" is not configured.`,
      `Add it to worldParameters.users in cucumber.js. Known users: ${Object.keys(users).join(', ')}.`
    );
  }

  const loginName = users[username].username || username;
  const password = users[username].password;
  if (password == null) return;

  await this.page.goto(this.launchUrl + '/user/login', { waitUntil: 'domcontentloaded' });
  // Fill the login form and submit by triggering the button's native in-page
  // click. A Playwright click can hit a 30s actionability timeout when the
  // floating AI chatbot widget overlaps the button; an in-page submit cannot.
  await this.page.waitForSelector('#edit-name', { state: 'visible', timeout: 15000 });
  await this.page.fill('#edit-name', loginName);
  await this.page.fill('#edit-pass', password);
  await Promise.all([
    this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
    this.page.evaluate(() => {
      const submit = document.querySelector('#edit-submit');
      if (submit) { submit.click(); return; }
      const form = document.querySelector('#user-login-form') || document.forms[0];
      if (form) form.submit();
    }),
  ]);
  await smartSettle(this.page, (this.minWaitTime && this.minWaitTime.page) || 8000);
});

/**
 * Smart wait for the current page to reach a quiet edge — the same
 * `smartSettle` used by webship-js navigation steps (DOM ready + network idle
 * + no pending AJAX/timers). Replaces a bare "And wait" after a navigation or
 * action.
 *
 * Example #1: And wait
 * Example #2: When wait
 * Example #3: Then wait
 * Example #4: Given wait
 * Example #5: But wait
 */
When(/^wait$/, async function () {
  await smartSettle(this.page, (this.minWaitTime && this.minWaitTime.page) || 8000);
});
