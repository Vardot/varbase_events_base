Feature: Events Base - Event content type
      As a Content editor
      I want an Event content type with the fields the recipe defines
      So that I can capture an event's title, schedule, place, summary and media.

  # The Varbase Events Base recipe adds the "event" bundle. The add form must
  # expose the exact fields the recipe ships: Title, the smart date When,
  # Location, Description, the Type (Event categories) reference, a Featured
  # image and a Body. Asserting the field labels proves the content type and
  # its field configuration are present, not just that a page loads.
  @check @local @development @staging @production
  Scenario: The Event add form exposes the Event fields to a Content editor
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/event"
      And wait
     Then I should see "Create Event"
      And I should see "Title"
      And I should see "When"
      And I should see "Location"
      And I should see "Description"
      And I should see "Type"
      And I should see "Featured image"
      And I should see "Body"
      And "#edit-field-location-0-value" should be visible within 10 seconds
      And "#edit-field-event-categories-target-id" should be visible within 10 seconds
