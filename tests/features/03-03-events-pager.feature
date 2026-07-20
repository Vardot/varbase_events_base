Feature: Events Base - Events listing pager
      As a site visitor
      I want the events listing to paginate
      So that I can browse beyond the first page of events.

  # The recipe sets items_per_page to 12 with a full pager. The seeded fixture
  # (15 marker events) exceeds one page, so filtering to the fixture shows 12
  # cards and a pager on page 1, and the remaining 3 on page 2.
  @check @local @development @staging @production
  Scenario: The events listing paginates when there are more than 12 events
    Given I am an anonymous user
     When I go to "/events"
      And wait
      And I fill in "Search by keyword" with "Varbase Example Event"
      And I press "Apply Filter"
      And wait
     Then the events result summary should show a total of 15
      And I should see text matching "Showing 1-12 of 15"
      And ".pager__items" should be visible
     When I go to "/events?search=Varbase+Example+Event&page=1"
      And wait
     Then I should see text matching "Showing 13-15 of 15"
