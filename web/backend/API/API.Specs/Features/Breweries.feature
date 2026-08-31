Feature: Brewery Management
As an authenticated user
I want to create, view, update and delete brewery posts
So that I can share information about breweries with the community

Background:
    Given the API is running

Scenario: Successful brewery creation
    Given I have an existing account
    And I am logged in
    And a city exists
    When I create a brewery with values:
        | BreweryName        | Description           | AddressLine1 | PostalCode |
        | Roundhouse Brewery  | A cozy local brewery | 123 Main St  | 90210      |
    Then the response has HTTP status 201
    And the response JSON should have "breweryName" equal "Roundhouse Brewery"

Scenario: Brewery creation fails without authentication
    Given a city exists
    When I create a brewery with values:
        | BreweryName | Description | AddressLine1 | PostalCode |
        | No Auth Brew | A brewery   | 1 Nowhere St | 00000      |
    Then the response has HTTP status 401

Scenario: Brewery creation fails with a non-existent city
    Given I have an existing account
    And I am logged in
    When I create a brewery with a non-existent city
    Then the response has HTTP status 404

Scenario: Retrieve an existing brewery by ID
    Given I have an existing account
    And I am logged in
    And a city exists
    And I have created a brewery
    When I retrieve the brewery by ID
    Then the response has HTTP status 200
    And the response JSON should have "breweryName" equal "Test Brewery"

Scenario: Retrieving a non-existent brewery returns not found
    When I retrieve a brewery by a non-existent ID
    Then the response has HTTP status 404

Scenario: Owner can update their brewery
    Given I have an existing account
    And I am logged in
    And a city exists
    And I have created a brewery
    When I update the brewery with values:
        | BreweryName      | Description          |
        | Renamed Brewery  | An updated description |
    Then the response has HTTP status 200
    And the response JSON should have "breweryName" equal "Renamed Brewery"

Scenario: A different user cannot update someone else's brewery
    Given I have an existing account
    And I am logged in
    And a city exists
    And I have created a brewery
    And I am logged in as a different user
    When I update the brewery with values:
        | BreweryName | Description |
        | Hijacked    | Nope        |
    Then the response has HTTP status 403

Scenario: Updating a non-existent brewery returns not found
    Given I have an existing account
    And I am logged in
    When I update a non-existent brewery
    Then the response has HTTP status 404

Scenario: Owner can delete their brewery
    Given I have an existing account
    And I am logged in
    And a city exists
    And I have created a brewery
    When I delete the brewery
    Then the response has HTTP status 200
    And retrieving the brewery by ID should now return HTTP status 404

Scenario: A different user cannot delete someone else's brewery
    Given I have an existing account
    And I am logged in
    And a city exists
    And I have created a brewery
    And I am logged in as a different user
    When I delete the brewery
    Then the response has HTTP status 403

Scenario: Deleting a non-existent brewery returns not found
    Given I have an existing account
    And I am logged in
    When I delete a non-existent brewery
    Then the response has HTTP status 404
