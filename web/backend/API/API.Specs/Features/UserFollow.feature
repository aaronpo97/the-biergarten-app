Feature: User Follow
As a signed-in user
I want to follow and unfollow other users
So that I can build a network of people I follow

Background:
    Given the API is running
    And a registered user "alice"
    And a registered user "bob"

Scenario: A user follows another user
    When "alice" follows "bob"
    Then the response has HTTP status 204
    And "alice" should be following "bob"

Scenario: Following the same user twice records a single follow
    Given "alice" follows "bob"
    When "alice" follows "bob"
    Then the response has HTTP status 204
    And there should be 1 follow from "alice" to "bob"

Scenario: A user cannot follow themselves
    When "alice" follows "alice"
    Then the response has HTTP status 400
    And "alice" should not be following "alice"

Scenario: Following a user that does not exist is not found
    When "alice" follows a user that does not exist
    Then the response has HTTP status 404

Scenario: Following requires authentication
    When an anonymous visitor follows "bob"
    Then the response has HTTP status 401

Scenario: A user unfollows someone they follow
    Given "alice" follows "bob"
    When "alice" unfollows "bob"
    Then the response has HTTP status 204
    And "alice" should not be following "bob"

Scenario: Unfollowing someone who is not followed succeeds
    When "alice" unfollows "bob"
    Then the response has HTTP status 204

Scenario: Unfollowing requires authentication
    When an anonymous visitor unfollows "bob"
    Then the response has HTTP status 401

Scenario: Deleting an account removes the follows it made and received
    Given "alice" follows "bob"
    And "bob" follows "alice"
    When "alice" deletes their account
    Then the response has HTTP status 200
    And "bob" should not be following "alice"
    And "alice" should not be following "bob"

Scenario: A profile shows accurate follower and following counts
    Given a registered user "carol"
    And "alice" follows "bob"
    And "carol" follows "bob"
    And "bob" follows "alice"
    When an anonymous visitor views the profile of "bob"
    Then the response has HTTP status 200
    And the profile should show 2 followers and 1 following

Scenario: The follower count goes down after an unfollow
    Given "alice" follows "bob"
    And "alice" unfollows "bob"
    When an anonymous visitor views the profile of "bob"
    Then the profile should show 0 followers and 0 following

Scenario: The viewer sees that they follow a user
    Given "alice" follows "bob"
    When "alice" checks whether they follow "bob"
    Then the response has HTTP status 200
    And the follow status should be true

Scenario: The viewer sees that they do not follow a user
    When "alice" checks whether they follow "bob"
    Then the response has HTTP status 200
    And the follow status should be false

Scenario: Follow status is not visible to anonymous visitors
    When an anonymous visitor checks whether they follow "bob"
    Then the response has HTTP status 401

Scenario: The following list shows the people a user follows
    Given "alice" follows "bob"
    When an anonymous visitor lists who "alice" is following
    Then the response has HTTP status 200
    And the following list should contain "bob"

Scenario: The following list is empty when a user follows nobody
    When an anonymous visitor lists who "alice" is following
    Then the response has HTTP status 200
    And the following list should have 0 entries

Scenario: The following list drops a user after an unfollow
    Given "alice" follows "bob"
    And "alice" unfollows "bob"
    When an anonymous visitor lists who "alice" is following
    Then the following list should have 0 entries

Scenario: The following list for an unknown user is not found
    When an anonymous visitor lists who a user that does not exist is following
    Then the response has HTTP status 404
