# Write Unit Tests

## Overview

Guidelines for writing comprehensive unit tests for React components, React hooks, services, utilities and so on.

## Test Categories

### React component testing

-   [ ] Test all component states
-   [ ] Test user interactions
-   [ ] Test prop variations
-   [ ] Test side effects
-   [ ] Test accessibility considering `axe` helper from `core-dev-testing` library
-   [ ] Use `testing-library` best practices
-   [ ] Consider using snapshot testing to prevent unexpected changes to the HTML output of a given component. They should only be used when other testing methods (such as asserting elements with `testing-library`) do not cover the required use case.

### Coverage

-   [ ] Critical paths are tested
-   [ ] Edge cases are covered
-   [ ] Error scenarios are tested
-   [ ] Mock external dependencies, dependency injections and timers
-   [ ] Consider advanced assertions from the preinstalled `jest-extended` library

### Quality

-   [ ] Design it to be short, dead-simple, flat, and delightful to work with. One should look at a test and get the intent instantly
-   [ ] Tests are readable and maintainable
-   [ ] Test names describe what they test
-   [ ] Follows project's testing patterns from `testing/patterns/general-unit-testing/README.md`
-   [ ] No flaky tests

## Best practices

-   [ ] Don’t test your mock
-   [ ] Don’t test external libraries
-   [ ] Avoid non-deterministic specs like `Date`, `Math.random` and so on
-   [ ] Consider using simple factory for reusing mocks
-   [ ] Consider placing mocks in the file \*.mock.ts with the same name as the testing modules
-   [ ] Tests are independent from each other
