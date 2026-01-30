Feature: NotFound API
  As a client of the API
  I want consistent 404 responses
  So that consumers can handle missing routes

  Scenario: GET error 404 returns NotFound message
    Given the API is running
    When I GET "/error/404"
    Then the response status code should be 404
    And the response JSON should have "message" equal "Route not found."
