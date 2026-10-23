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
