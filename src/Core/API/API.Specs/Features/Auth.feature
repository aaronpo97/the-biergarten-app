Feature: User Login
    As a registered user
    I want to log in to my account
    So that I receive an authentication token to access authenticated routes
    Scenario: Successful login with valid credentials
        Given the API is running
        And I have an existing account
        And I submit a login request with a valid username and password 
        Then the system successfully authenticates the user
        And returns a valid access token
        And the response has HTTP status 200