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
    And the response JSON should not contain "email"
    And the response JSON should not contain "dateOfBirth"

Scenario: Public profile for a non-existent account returns not found
    Given I have registered a new account
    And I have a valid access token for my account
    When I retrieve the public profile by a non-existent ID
    Then the response has HTTP status 404

Scenario: Fetching the public profile without authentication is rejected
    Given I have registered a new account
    When I retrieve the public profile by ID without authentication
    Then the response has HTTP status 401

Scenario: Fetching a user account by ID without authentication is rejected
    When I retrieve the user account by a non-existent ID without authentication
    Then the response has HTTP status 401

Scenario: Listing user accounts without authentication is rejected
    When I list user accounts without authentication
    Then the response has HTTP status 401

Scenario: The owner can fetch their own account by ID
    Given I have registered a new account
    And I have a valid access token for my account
    When I retrieve the registered account by ID
    Then the response has HTTP status 200
    And the public profile response should match the registered account

Scenario: A different user cannot fetch someone else's account by ID
    Given I have registered a new account
    And I am logged in as a different user
    When I retrieve the registered account by ID
    Then the response has HTTP status 403
