Feature: NotFound Responses
As a client of the API
I want consistent 404 responses
So that consumers can gracefully handle missing routes

    Scenario: GET request to an invalid route returns 404
        Given the API is running
        When I send an HTTP request "GET" to "/invalid-route"
        Then the response has HTTP status 404
        And the response JSON should have "message" equal "Route not found."