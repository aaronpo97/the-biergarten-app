Feature: Login validation
   As a returning user
   I want the login form to enforce required fields
   So that I can't submit an incomplete login attempt

   Background:
      Given I open the "forms-loginform--empty" story

   Scenario: Username and password are required
      When I click the "Sign In" button
      Then I should see the error "Username is required"
      And I should see the error "Password is required"

   Scenario: Valid credentials are accepted
      When I fill in the "Username" field with "hans"
      And I fill in the "Password" field with "correct-horse-battery"
      And I click the "Sign In" button
      Then the submitted result should contain "hans"
