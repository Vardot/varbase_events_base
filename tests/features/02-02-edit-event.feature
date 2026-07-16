Feature: Events Base - Editing an event
      As a Content editor
      I want to edit an event I created
      So that I can correct its details after publishing.

  # Creates a minimal event, reopens it on its edit form, changes the title,
  # saves, and asserts the event page shows the new title (and not the old
  # one). Self-contained: it deletes the event it created.
  @check @local @development @staging @production
  Scenario: A Content editor edits an event's title
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/event"
      And wait
      And I fill in "Title" with "Varbase Example Edit Event 73502 before"
      And I set the event "When" date to "2027-04-02" and time "09:00:00"
      And I fill in "Location" with "Edit Hall, 6 Editor Road"
      And I save the event
     Then I should see "Varbase Example Edit Event 73502 before"
     When I open the edit form for the event I am viewing
      And I fill in "Title" with "Varbase Example Edit Event 73502 after"
      And I save the event
     Then I should see "Varbase Example Edit Event 73502 after"
      And I should not see "Varbase Example Edit Event 73502 before"
     When I delete the event I am viewing
     Then I should see "has been deleted"
