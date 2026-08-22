Feature: Registration validation
   As a new user
   I want the registration form to enforce all account rules
   So that I can't submit invalid or inconsistent account details

   Background:
      Given I open the "forms-registerform--empty" story

   Scenario: Empty submission is rejected
      When I click the "Create Account" button
      Then I should see the error "Username must be at least 3 characters"
      And I should see the error "First name is required"

   Scenario: Invalid email address is rejected
      When I fill in the "Username" field with "jane_doe"
      And I fill in the "First Name" field with "Jane"
      And I fill in the "Last Name" field with "Doe"
      And I fill in the "Email" field with "jane@example"
      And I fill in the "Date of Birth" field with "2000-01-15"
      And I fill in the "Password" field with "StrongPass1!"
      And I fill in the "Confirm Password" field with "StrongPass1!"
      And I click the "Create Account" button
      Then I should see the error "Invalid email address"

   Scenario: Weak password is rejected
      When I fill in the "Username" field with "jane_doe"
      And I fill in the "First Name" field with "Jane"
      And I fill in the "Last Name" field with "Doe"
      And I fill in the "Email" field with "jane@example.com"
      And I fill in the "Date of Birth" field with "2000-01-15"
      And I fill in the "Password" field with "weakpassword"
      And I fill in the "Confirm Password" field with "weakpassword"
      And I click the "Create Account" button
      Then I should see the error "uppercase letter"

   Scenario: Mismatched password confirmation is rejected
      When I fill in the "Username" field with "jane_doe"
      And I fill in the "First Name" field with "Jane"
      And I fill in the "Last Name" field with "Doe"
      And I fill in the "Email" field with "jane@example.com"
      And I fill in the "Date of Birth" field with "2000-01-15"
      And I fill in the "Password" field with "StrongPass1!"
      And I fill in the "Confirm Password" field with "Different1!"
      And I click the "Create Account" button
      Then I should see the error "Passwords must match"

   Scenario: Valid registration is accepted
      When I fill in the "Username" field with "jane_doe"
      And I fill in the "First Name" field with "Jane"
      And I fill in the "Last Name" field with "Doe"
      And I fill in the "Email" field with "jane@example.com"
      And I fill in the "Date of Birth" field with "2000-01-15"
      And I fill in the "Password" field with "StrongPass1!"
      And I fill in the "Confirm Password" field with "StrongPass1!"
      And I click the "Create Account" button
      Then the submitted result should contain "jane_doe"
