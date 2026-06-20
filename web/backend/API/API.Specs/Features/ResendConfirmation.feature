Feature: Resend Confirmation Email
As a user who did not receive the confirmation email
I want to request a resend of the confirmation email
So that I can obtain a working confirmation link while preventing abuse

Scenario: Legitimate resend for an unconfirmed user
    Given the API is running
    And I have registered a new account
    And I have a valid access token for my account
    When I submit a resend confirmation request for my account
    Then the response has HTTP status 200
    And the response JSON should have "message" containing "confirmation email has been resent"

Scenario: Resend is a no-op for an already confirmed user
    Given the API is running
    And I have registered a new account
    And I have a valid confirmation token for my account
    And I have a valid access token for my account
    And I have confirmed my account
    When I submit a resend confirmation request for my account
    Then the response has HTTP status 200
    And the response JSON should have "message" containing "confirmation email has been resent"

Scenario: Resend is a no-op for a non-existent user
    Given the API is running
    And I have registered a new account
    And I have a valid access token for my account
    When I submit a resend confirmation request for a non-existent user
    Then the response has HTTP status 200
    And the response JSON should have "message" containing "confirmation email has been resent"

Scenario: Resend requires authentication
    Given the API is running
    And I have registered a new account
    When I submit a resend confirmation request without an access token
    Then the response has HTTP status 401