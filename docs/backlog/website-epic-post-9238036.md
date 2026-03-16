# Epic: Modernize the Biergarten Website Experience

Scope: Work representing the changes delivered after commit `9238036042006c3bc92045f785d53c71a8b8421d`.

## Epic User Story

**As a** Biergarten visitor, registered user, and frontend developer
**I want** a modern website experience with account flows, themed UI, reusable components, Storybook coverage, and reliable frontend tooling
**So that** the product is easier to use, easier to extend, and safer to ship

## Epic Outcomes

- Establish the current `src/Website` application as the active frontend workspace
- Deliver a working authentication demo flow with home, login, register, dashboard, logout, and confirmation states
- Expand the Biergarten visual system with multiple branded themes and a theme guide
- Document key UI components in Storybook with automated browser checks
- Add theme-aware toast feedback for auth and status messaging
- Improve formatting and ignore rules so developer tooling targets source files cleanly

---

# Ticket 1: Establish the active website workspace

## User Story

**As a** frontend developer
**I want** the active website app to live in a clearly named `src/Website` workspace with the right config and assets
**So that** I can work in one canonical frontend without confusion

## Acceptance Criteria (BDD)

### Scenario 1: Active frontend workspace exists

Given the repository contains multiple frontend codebases
When I inspect the active application workspace
Then the current website app is available under `src/Website`
And the project contains its runtime config, public assets, and package scripts

### Scenario 2: Frontend scripts support local development

Given I am onboarding to the website app
When I open the workspace package manifest
Then I can find commands for development, build, start, lint, format, typecheck, and Storybook

### Scenario 3: Supporting config files are aligned

Given the website workspace is the active frontend
When I review project configuration
Then the app includes React Router, Vite, Tailwind, PostCSS, ESLint, and Prettier configuration needed to run the app consistently

## Subtasks

- [ ] Move or rename the active frontend into `src/Website`
- [ ] Align package scripts and config files with the active workspace
- [ ] Confirm assets and public metadata move with the app

---

# Ticket 2: Deliver the authentication demo flow

## User Story

**As a** visitor or returning user
**I want** to register, log in, confirm account state, and access a dashboard
**So that** I can validate the account journey end to end

## Acceptance Criteria (BDD)

### Scenario 1: Guests can reach auth entry points

Given I am not authenticated
When I visit the home page
Then I can navigate to login and registration
And the page clearly presents the website as an authentication demo

### Scenario 2: Guests can submit login and registration forms

Given I am on the login or register page
When I enter valid information and submit
Then the app validates the request
And it creates an authenticated session on success
And it shows clear validation or failure feedback on error

### Scenario 3: Authenticated users are redirected appropriately

Given I already have an authenticated session
When I visit guest-only auth pages
Then I am redirected away from those pages
And I can access dashboard and logout flows from the authenticated experience

## Subtasks

- [ ] Add routes for home, login, register, logout, dashboard, and confirm
- [ ] Implement schema validation and auth session handling
- [ ] Build shared form components for the auth flow

---

# Ticket 3: Introduce the Biergarten theme system

## User Story

**As a** Biergarten user
**I want** to switch between distinct Biergarten themes without losing usability
**So that** I can choose a visual mood while the interface stays consistent and readable

## Acceptance Criteria (BDD)

### Scenario 1: Multiple Biergarten themes are available

Given I open the website
When I use the theme system
Then I can choose among Biergarten Lager, Biergarten Stout, Biergarten Cassis, and Biergarten Weizen

### Scenario 2: Theme choice persists

Given I select a theme
When I navigate or refresh the browser
Then the chosen theme remains active
And the app uses the stored preference when possible

### Scenario 3: Theme guide demonstrates token usage

Given I visit the theme guide page
When I inspect the examples
Then I can review brand colors, status colors, and component previews
And semantic token pairings remain readable in every theme

## Subtasks

- [ ] Define shared theme metadata and storage behavior
- [ ] Add or refine DaisyUI theme tokens in the website stylesheet
- [ ] Create a theme guide route with a live switcher and previews

---

# Ticket 4: Add Storybook coverage for shared UI and themes

## User Story

**As a** frontend developer and designer
**I want** component and theme stories with automated checks
**So that** I can review shared UI in isolation and catch regressions before release

## Acceptance Criteria (BDD)

### Scenario 1: Shared components have story coverage

Given I open Storybook
When I browse the component library
Then I can review stories for the shared submit button, form field, navbar, toast feedback, and theme gallery

### Scenario 2: Storybook matches the app environment

Given I preview a story
When I inspect typography, routing context, and themes
Then the stories use the website fonts, router-safe rendering, and theme switching consistent with the app

### Scenario 3: Story interactions are testable

Given Storybook stories include interaction coverage
When the Storybook test suite runs
Then the key stories verify their expected states and interactions successfully

## Subtasks

- [ ] Configure Storybook for the website workspace
- [ ] Add stories and docs for shared components and theme previews
- [ ] Add browser-based Storybook tests for story interactions

---

# Ticket 5: Add toast-based user feedback

## User Story

**As a** website user
**I want** lightweight toast notifications for important auth outcomes
**So that** I receive immediate feedback without losing page context

## Acceptance Criteria (BDD)

### Scenario 1: Toast provider is available globally

Given I navigate through the website
When a feature triggers a toast notification
Then a consistent toast container is already mounted in the app shell

### Scenario 2: Auth flows show helpful status feedback

Given I submit login, registration, or confirmation flows
When the app receives a success or error outcome
Then it shows a toast with the correct semantic styling and message

### Scenario 3: Toast visuals adapt to the active theme

Given I switch between Biergarten themes
When toast notifications appear
Then their surface, icon, and text colors remain legible and on-brand

## Subtasks

- [ ] Add a global toast provider and helper utilities
- [ ] Trigger toasts from auth-related routes
- [ ] Document the toast behavior in Storybook
