Feature: Events Base - Events listing
      As a site visitor
      I want an events listing at /events with cards, a summary and filters
      So that I can browse and narrow down upcoming events.

  # The listing renders each event as a card in a grid, 12 per page, above a
  # result summary. Filtering to the 15-event fixture makes the counts
  # deterministic: the summary range "Showing 1-12 of 15" asserts the 12-per-page
  # paging in a theme-agnostic way, and a marker event's card link + title prove
  # the cards render.
  @check @local @development @staging @production
  Scenario: The events listing shows event cards and a result summary
    Given I am an anonymous user
     When I go to "/events?search=Varbase+Example+Event"
      And wait
     Then I should see text matching "Showing 1-12 of 15"
      And I should see "Varbase Example Event 01"
      And "a[href='/events/varbase-example-event-01']" should have a count of 1

  # The recipe deliberately exposes ONLY the keyword ("Search by") and "Type"
  # filters. The "Industry" filter was removed - assert it is absent so a
  # regression that re-adds it is caught.
  @check @local @development @staging @production
  Scenario: The events listing exposes only the Search by and Type filters
    Given I am an anonymous user
     When I go to "/events"
      And wait
     Then I should see "Search by"
      And I should see "Type"
      And I should not see "Industry"
