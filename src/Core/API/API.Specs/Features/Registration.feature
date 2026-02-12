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

  @Ignore
  Scenario: Registration fails with existing username
    Given the API is running
    And I have an existing account with username "existinguser"
    When I submit a registration request with values:
      | Username     | FirstName | LastName | Email                | DateOfBirth | Password   |
      | existinguser | Existing  | User     | existing@example.com | 1990-01-01  | Password1! |
    Then the response has HTTP status 409
    And the response JSON should have "message" equal "Username already exists."

  @Ignore
  Scenario: Registration fails with existing email
    Given the API is running
    And I have an existing account with email "existing@example.com"
    When I submit a registration request with values:
      | Username | FirstName | LastName | Email                | DateOfBirth | Password   |
      | newuser  | New       | User     | existing@example.com | 1990-01-01  | Password1! |
    Then the response has HTTP status 409
    And the response JSON should have "message" equal "Email already in use."

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
