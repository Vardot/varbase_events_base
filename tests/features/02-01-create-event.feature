Feature: Events Base - Authoring an event
      As a Content editor
      I want to create an event with all of its fields
      So that the event page presents the schedule, place and details to visitors.

  # Creates an event through the real add form - filling the Title, the smart
  # date When, the Location, the Description and the Type (the fields this recipe
  # adds) - then asserts the event's full page renders the title, the formatted
  # date and the location. Self-contained: it deletes the event it created.
  #
  # The core Body field is intentionally not authored here: its CKEditor 5 editor
  # loads the Varbase Plugin Pack / Premium Features plugins from
  # cdn.ckeditor.com, which a network-isolated CI runner cannot reach, so the
  # rich-text editor cannot initialise. Body is a core field, not one this recipe
  # provides, so leaving it out keeps the scenario scoped to Events Base fields.
  @check @local @development @staging @production
  Scenario: A Content editor creates an event and its page shows the details
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/event"
      And wait
      And I fill in "Title" with "Varbase Example Authoring Event 73501"
      And I set the event "When" date to "2027-03-18" and time "10:00:00"
      And I fill in "Location" with "Authoring Hall, 5 Editor Road"
      And I fill in "Description" with "Short summary for the authoring test event 73501."
      And I fill in "Type" with "Workshop"
      And I save the event
     Then I should see "Varbase Example Authoring Event 73501"
      And I should see "Mar 18, 2027"
      And I should see "Authoring Hall, 5 Editor Road"
     When I delete the event I am viewing
     Then I should see "has been deleted"
