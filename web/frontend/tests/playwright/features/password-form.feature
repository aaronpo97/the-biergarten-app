Feature: Password validation
   As a user changing my password
   I want the password form to enforce strength and consistency rules
   So that I can't submit a weak or mismatched password

   Background:
      Given I open the "forms-passwordform--empty" story

   Scenario: New password is too short
      When I fill in the "Current Password" field with "OldPassword1!"
      And I fill in the "New Password" field with "short"
      And I fill in the "Confirm New Password" field with "short"
      And I click the "Change Password" button
      Then I should see the error "at least 8 characters"

   Scenario: Confirmation does not match the new password
      When I fill in the "Current Password" field with "OldPassword1!"
      And I fill in the "New Password" field with "NewPassword2!"
      And I fill in the "Confirm New Password" field with "NewPassword3!"
      And I click the "Change Password" button
      Then I should see the error "Passwords must match"

   Scenario: New password matches the current password
      When I fill in the "Current Password" field with "SamePassword1!"
      And I fill in the "New Password" field with "SamePassword1!"
      And I fill in the "Confirm New Password" field with "SamePassword1!"
      And I click the "Change Password" button
      Then I should see the error "different from the current password"

   Scenario: Password change is valid
      When I fill in the "Current Password" field with "OldPassword1!"
      And I fill in the "New Password" field with "NewPassword2!"
      And I fill in the "Confirm New Password" field with "NewPassword2!"
      And I click the "Change Password" button
      Then the form should submit successfully
