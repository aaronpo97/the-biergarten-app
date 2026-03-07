Feature: User Account Confirmation
   As a newly registered user
   I want to confirm my email address via a validation token
   So that my account is fully activated
   Scenario: Successful confirmation with valid token
      Given the API is running
      And I have registered a new account
      And I have a valid confirmation token for my account
      When I submit a confirmation request with the valid token
      Then the response has HTTP status 200
      And the response JSON should have "message" containing "is confirmed"

   Scenario: Confirmation fails with invalid token
      Given the API is running
      When I submit a confirmation request with an invalid token
      Then the response has HTTP status 401
      And the response JSON should have "message" containing "Invalid token"

   Scenario: Confirmation fails with expired token
      Given the API is running
      And I have registered a new account
      And I have an expired confirmation token for my account
      When I submit a confirmation request with the expired token
      Then the response has HTTP status 401
      And the response JSON should have "message" containing "Invalid token"

   Scenario: Confirmation fails with tampered token (wrong secret)
      Given the API is running
      And I have registered a new account
      And I have a confirmation token signed with the wrong secret
      When I submit a confirmation request with the tampered token
      Then the response has HTTP status 401
      And the response JSON should have "message" containing "Invalid token"

   Scenario: Confirmation fails when token is missing
      Given the API is running
      When I submit a confirmation request with a missing token
      Then the response has HTTP status 400

   Scenario: Confirmation endpoint only accepts POST requests
      Given the API is running
      And I have a valid confirmation token
      When I submit a confirmation request using an invalid HTTP method
      Then the response has HTTP status 404

   Scenario: Confirmation fails with malformed token
      Given the API is running
      When I submit a confirmation request with a malformed token
      Then the response has HTTP status 401
      And the response JSON should have "message" containing "Invalid token"
