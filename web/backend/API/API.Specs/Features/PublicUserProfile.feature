Feature: Public User Profile
As a client of the API
I want to read a user's public-facing profile
So that a public profile page can render without exposing private account fields

Background:
    Given the API is running

Scenario: Public profile exposes only allowlisted fields
    Given I have registered a new account
    And I have a valid access token for my account
    When I retrieve the public profile by ID
    Then the response has HTTP status 200
    And the public profile response should match the registered account
    And the response JSON should have "biography" equal ""
    And the response JSON should have "avatarUrl" equal ""
    And the response JSON should not contain "email"
    And the response JSON should not contain "dateOfBirth"

Scenario: Public profile exposes the uploaded avatar
    Given I have registered a new account
    And I have a valid access token for my account
    And I have uploaded an avatar
    When I retrieve the public profile by ID
    Then the response has HTTP status 200
    And the public profile response should carry my current avatar

Scenario: Public profile exposes the current avatar after it is replaced
    Given I have registered a new account
    And I have a valid access token for my account
    And I have uploaded an avatar
    And I have uploaded a new avatar, replacing the previous one
    When I retrieve the public profile by ID
    Then the response has HTTP status 200
    And the public profile response should carry my current avatar
    And the public profile response should not carry my previous avatar

Scenario: Fetching the avatar without authentication succeeds
    Given I have registered a new account
    And I have a valid access token for my account
    And I have uploaded an avatar
    When I retrieve the public profile by ID without authentication
    Then the response has HTTP status 200
    And the public profile response should carry my current avatar

Scenario: A different user can read someone else's avatar
    Given I have registered a new account
    And I have a valid access token for my account
    And I have uploaded an avatar
    And I am logged in as a different user
    When I retrieve the public profile by ID
    Then the response has HTTP status 200
    And the public profile response should carry my current avatar

Scenario: Listing user accounts exposes each account's avatar
    Given I have registered a new account
    And I have a valid access token for my account
    And I have uploaded an avatar
    When I list user accounts
    Then the response has HTTP status 200
    And my listed account should carry my current avatar

Scenario: Public profile for a non-existent account returns not found
    Given I have registered a new account
    And I have a valid access token for my account
    When I retrieve the public profile by a non-existent ID
    Then the response has HTTP status 404

Scenario: Fetching the public profile without authentication succeeds
    Given I have registered a new account
    When I retrieve the public profile by ID without authentication
    Then the response has HTTP status 200
    And the response JSON should have "avatarUrl" equal ""
    And the response JSON should not contain "email"
    And the response JSON should not contain "dateOfBirth"

Scenario: A different user can read someone else's public profile
    Given I have registered a new account
    And I am logged in as a different user
    When I retrieve the public profile by ID
    Then the response has HTTP status 200
    And the response JSON should not contain "email"
    And the response JSON should not contain "dateOfBirth"

Scenario: Fetching my own account without authentication is rejected
    When I retrieve my own account without authentication
    Then the response has HTTP status 401

Scenario: Listing user accounts without authentication is rejected
    When I list user accounts without authentication
    Then the response has HTTP status 401

Scenario: Listing user accounts as an authenticated user excludes private fields
    Given I have registered a new account
    And I have a valid access token for my account
    When I list user accounts
    Then the response has HTTP status 200
    And the response JSON should contain "avatarUrl"
    And the response JSON should not contain "email"
    And the response JSON should not contain "dateOfBirth"

Scenario: The caller can fetch their own account
    Given I have registered a new account
    And I have a valid access token for my account
    When I retrieve my own account
    Then the response has HTTP status 200
    And the public profile response should match the registered account

Scenario: The account endpoint serves the caller named by the access token
    Given I have registered a new account
    And I am logged in as a different user
    When I retrieve my own account
    Then the response has HTTP status 200
    And the account response should be for a different account than the registered one
