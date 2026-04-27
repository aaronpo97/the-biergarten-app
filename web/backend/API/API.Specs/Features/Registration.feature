Feature: User Registration
  As a new user
  I want to register an account
  So that I can log in and access authenticated routes

  Scenario: Successful registration with valid details
    Given the API is running
    When I submit a registration request with values:
      | Username | FirstName | LastName | Email               | DateOfBirth | Password   |
      | newuser  | New       | User     | newuser@example.com | 1990-01-01  | Password1! |
    Then the response has HTTP status 201
    And the response JSON should have "message" equal "User registered successfully."
    And the response JSON should have an access token

  Scenario: Registration fails with existing username
    Given the API is running
    When I submit a registration request with values:
      | Username  | FirstName | LastName | Email               | DateOfBirth | Password   |
      | test.user | Test      | User     | example@example.com | 2001-11-11  | Password1! |
    Then the response has HTTP status 409

  Scenario: Registration fails with existing email
    Given the API is running
    When I submit a registration request with values:
      | Username | FirstName | LastName | Email                       | DateOfBirth | Password   |
      | newuser  | New       | User     | test.user@thebiergarten.app | 1990-01-01  | Password1! |
    Then the response has HTTP status 409

  Scenario: Registration fails with missing required fields
    Given the API is running
    When I submit a registration request with values:
      | Username | FirstName | LastName | Email | DateOfBirth | Password   |
      |          | New       | User     |       |             | Password1! |
    Then the response has HTTP status 400

  Scenario: Registration fails with invalid email format
    Given the API is running
    When I submit a registration request with values:
      | Username | FirstName | LastName | Email        | DateOfBirth | Password   |
      | newuser  | New       | User     | invalidemail | 1990-01-01  | Password1! |
    Then the response has HTTP status 400

  Scenario: Registration fails with weak password
    Given the API is running
    When I submit a registration request with values:
      | Username | FirstName | LastName | Email               | DateOfBirth | Password |
      | newuser  | New       | User     | newuser@example.com | 1990-01-01  | weakpass |
    Then the response has HTTP status 400

  Scenario: Cannot register a user younger than 19 years of age (regulatory requirement)
    Given the API is running
    When I submit a registration request with values:
      | Username  | FirstName | LastName | Email                 | DateOfBirth     | Password   |
      | younguser | Young     | User     | younguser@example.com | {underage_date} | Password1! |
    Then the response has HTTP status 400

  Scenario: Registration endpoint only accepts POST requests
    Given the API is running
    When I submit a registration request using a GET request
    Then the response has HTTP status 404
