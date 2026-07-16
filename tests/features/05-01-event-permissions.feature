Feature: Events Base - Event permissions
      As a site administrator
      I want event authoring restricted to editorial roles
      So that only trusted users can create and manage events.

  # The recipe grants the event node permissions to the six Varbase roles the
  # way Varbase Blog Base does: anonymous and authenticated users cannot create
  # events; the editorial roles can.
  @check @local @development @staging @production
  Scenario: An anonymous user cannot reach the Event creation form
    Given I am an anonymous user
     When I go to "/node/add/event"
      And wait
     Then I should not see "Create Event"

  @check @local @development @staging @production
  Scenario: A Normal user cannot reach the Event creation form
    Given I am a logged in user with the "Normal user" user
     When I go to "/node/add/event"
      And wait
     Then I should not see "Create Event"

  @check @local @development @staging @production
  Scenario Outline: Editorial roles can reach the Event creation form
    Given I am a logged in user with the "<role>" user
     When I go to "/node/add/event"
      And wait
     Then I should see "Create Event"

    Examples:
      | role           |
      | Content editor |
      | Content admin  |
      | webmaster      |

  # Proves the full create -> edit -> delete flow works for a Content editor,
  # i.e. the create/edit/delete event permissions are all granted to the role.
  @check @local @development @staging @production
  Scenario: A Content editor can create, edit and delete an event
    Given I am a logged in user with the "Content editor" user
     When I go to "/node/add/event"
      And wait
      And I fill in "Title" with "Varbase Example Permission Event 73505"
      And I set the event "When" date to "2027-06-10" and time "08:30:00"
      And I fill in "Location" with "Permission Hall, 8 Editor Road"
      And I save the event
     Then I should see "Varbase Example Permission Event 73505"
     When I open the edit form for the event I am viewing
      And I fill in "Location" with "Permission Hall, 8 Editor Road (updated)"
      And I save the event
     Then I should see "Permission Hall, 8 Editor Road (updated)"
     When I delete the event I am viewing
     Then I should see "has been deleted"
