Feature: Events Base - Event featured image
      As a Content editor
      I want to add a featured image to an event from the media library
      So that the event has a visual on its page and listing card.

  # Exercises the Featured image media_library widget end to end: opens the
  # media library, selects an existing media item, inserts it, and saves. The
  # media-library step asserts the widget shows the selected item, so a broken
  # widget fails loudly. Self-contained: it deletes the event it created.
  @check @local @development @staging @production
  Scenario: A Content editor adds a featured image to an event from the media library
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/event"
      And wait
      And I fill in "Title" with "Varbase Example Image Event 73503"
      And I set the event "When" date to "2027-05-06" and time "11:00:00"
      And I fill in "Location" with "Image Hall, 7 Editor Road"
      And I add the first available featured image from the media library
      And I save the event
     Then I should see "Varbase Example Image Event 73503"
     When I delete the event I am viewing
     Then I should see "has been deleted"
