Feature: Protected Endpoint Access Token Validation
   As a backend developer
   I want protected endpoints to validate access tokens
   So that unauthorized requests are rejected

   Scenario: Protected endpoint accepts valid access token
      Given the API is running
      And I have an existing account
      And I am logged in
      When I submit a request to a protected endpoint with a valid access token
      Then the response has HTTP status 200

   Scenario: Protected endpoint rejects missing access token
      Given the API is running
      When I submit a request to a protected endpoint without an access token
      Then the response has HTTP status 401

   Scenario: Protected endpoint rejects invalid access token
      Given the API is running
      When I submit a request to a protected endpoint with an invalid access token
      Then the response has HTTP status 401
      And the response JSON should have "message" containing "Unauthorized"

   Scenario: Protected endpoint rejects expired access token
      Given the API is running
      And I have an existing account
      And I am logged in with an immediately-expiring access token
      When I submit a request to a protected endpoint with the expired token
      Then the response has HTTP status 401
      And the response JSON should have "message" containing "Unauthorized"

   Scenario: Protected endpoint rejects token signed with wrong secret
      Given the API is running
      And I have an access token signed with the wrong secret
      When I submit a request to a protected endpoint with the tampered token
      Then the response has HTTP status 401
      And the response JSON should have "message" containing "Unauthorized"

   Scenario: Protected endpoint rejects refresh token as access token
      Given the API is running
      And I have an existing account
      And I am logged in
      When I submit a request to a protected endpoint with my refresh token instead of access token
      Then the response has HTTP status 401

   Scenario: Protected endpoint rejects confirmation token as access token
      Given the API is running
      And I have registered a new account
      And I have a valid confirmation token
      When I submit a request to a protected endpoint with my confirmation token instead of access token
      Then the response has HTTP status 401
