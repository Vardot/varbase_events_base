Feature: Events Base - Related events
      As a site visitor reading an event
      I want to see other related events
      So that I can discover more events like the one I am reading.

  # The recipe's Related events display lists other upcoming events that share a
  # tag with the current event, excluding the current event itself. The seeded
  # markers all share one tag, so the first marker's page lists the other
  # markers and never links back to itself. The related cards render client-side,
  # so an "eventually" assertion waits for them.
  @check @local @development @staging @production
  Scenario: The Related events block lists other events and excludes the current one
    Given I am an anonymous user
     When I go to "/events/varbase-example-event-01"
      And wait
     Then I should see "Events you may also like"
      And eventually I should see "Varbase Example Event 02" within 10 seconds
      And "a[href='/events/varbase-example-event-01']" should have a count of 0
