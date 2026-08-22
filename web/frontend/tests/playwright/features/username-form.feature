Feature: Username validation
   As a user updating my account settings
   I want the username form to enforce the same rules as the backend
   So that I get instant feedback before submitting

   Background:
      Given I open the "forms-usernameform--empty" story

   Scenario: Username is too short
      When I fill in the "New Username" field with "ab"
      And I click the "Update Username" button
      Then I should see the error "at least 3 characters"

   Scenario: Username contains invalid characters
      When I fill in the "New Username" field with "bad user!"
      And I click the "Update Username" button
      Then I should see the error "letters, numbers, dots, underscores"

   Scenario: Username is valid
      When I fill in the "New Username" field with "valid.user-99"
      And I click the "Update Username" button
      Then the submitted result should contain "valid.user-99"
