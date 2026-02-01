Feature: User Login
As a registered user
I want to log in to my account
So that I receive an authentication token to access authenticated routes

    Scenario: Successful login with valid credentials
        Given the API is running
        And I have an existing account
        When I submit a login request with a username and password
        Then the response has HTTP status 200
        And the response JSON should have "message" equal "Logged in successfully."
        And the response JSON should have an access token

    Scenario: Login fails with invalid credentials
        Given the API is running
        And I do not have an existing account
        When I submit a login request with a username and password
        Then the response has HTTP status 401
        And the response JSON should have "message" equal "Invalid username or password."

    Scenario: Login fails when required missing username
        Given the API is running
        When I submit a login request with a missing username
        Then the response has HTTP status 400

    Scenario: Login fails when required missing password
        Given the API is running
        When I submit a login request with a missing password
        Then the response has HTTP status 400

    Scenario: Login fails when both username and password are missing
        Given the API is running
        When I submit a login request with both username and password missing
        Then the response has HTTP status 400

    Scenario: Login endpoint only accepts POST requests
        Given the API is running
        When I submit a login request using a GET request
        Then the response has HTTP status 404