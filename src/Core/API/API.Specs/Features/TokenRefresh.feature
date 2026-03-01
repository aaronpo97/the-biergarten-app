Feature: Token Refresh
   As an authenticated user
   I want to refresh my access token using my refresh token
   So that I can maintain my session without logging in again

   @Ignore
   Scenario: Successful token refresh with valid refresh token
      Given the API is running
      And I have an existing account
      And I am logged in
      When I submit a refresh token request with a valid refresh token
      Then the response has HTTP status 200
      And the response JSON should have "message" equal "Token refreshed successfully."
      And the response JSON should have a new access token
      And the response JSON should have a new refresh token

   @Ignore
   Scenario: Token refresh fails with invalid refresh token
      Given the API is running
      When I submit a refresh token request with an invalid refresh token
      Then the response has HTTP status 401
      And the response JSON should have "message" containing "Invalid"

   Scenario: Token refresh fails with expired refresh token
      Given the API is running
      And I have an existing account
      And I am logged in with an immediately-expiring refresh token
      When I submit a refresh token request with the expired refresh token
      Then the response has HTTP status 401
      And the response JSON should have "message" containing "expired"

   Scenario: Token refresh fails when refresh token is missing
      Given the API is running
      When I submit a refresh token request with a missing refresh token
      Then the response has HTTP status 400

   Scenario: Token refresh endpoint only accepts POST requests
      Given the API is running
      And I have a valid refresh token
      When I submit a refresh token request using a GET request
      Then the response has HTTP status 404
