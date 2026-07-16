Feature: Events Base - Events listing filters
      As a site visitor
      I want to filter the events listing by keyword and by Type
      So that I can find the events that interest me.

  # The seeded fixture provides 15 events titled "Varbase Example Event NN" (8 in the
  # Workshop category, 7 in Conference). Filtering by that keyword isolates the
  # fixture, so the result count is deterministic regardless of any other
  # content on the site.
  @check @local @development @staging @production
  Scenario: Filtering the events listing by keyword narrows the results
    Given I am an anonymous user
     When I go to "/events"
      And wait
      And I fill in "Search by" with "Varbase Example Event"
      And I press "Apply Filter"
      And wait
     Then the events result summary should show a total of 15
      And I should see "Varbase Example Event 01"

  # Combining the keyword with the Type filter narrows the fixture to its 8
  # Workshop events, proving the Type (Event categories) exposed filter works.
  @check @local @development @staging @production
  Scenario: Filtering the events listing by keyword and Type narrows the results
    Given I am an anonymous user
     When I go to "/events"
      And wait
      And I fill in "Search by" with "Varbase Example Event"
      And I choose "Workshop" in the events Type filter
      And I press "Apply Filter"
      And wait
     Then the events result summary should show a total of 8
