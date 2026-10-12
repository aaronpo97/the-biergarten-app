## Summary

<!--
State WHAT is changing and WHY, in two to five sentences.
A reader should understand the change without opening the diff.
Describe the problem first, then the outcome.
-->

## Type of change

<!-- Tick the one option that best describes this PR. -->

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor (no change in behaviour)
- [ ] Performance improvement
- [ ] Documentation
- [ ] Tests only
- [ ] Build, CI or dependency update
- [ ] Other (please specify):

## Related issues

<!--
Link the issue(s) this PR relates to. Use one keyword per issue so that each is closed on merge:

  Fixes #123
  Fixes #124, fixes #125
  Fixes owner/other-repo#456

Closing keywords only take effect when the PR targets the repository's default branch.
Use "Related to #123" if the PR should not close the issue.
If there is no issue, write "N/A" and explain the motivation in the Summary.
-->

## Approach and context

<!--
Explain how the change works and why this approach was chosen.
Include, where relevant:
  - The decisions you made that are not obvious from the code.
  - Alternatives you considered and why you rejected them.
  - Known limitations or shortcomings, and any planned follow-up work.
  - Background such as benchmark results or design documents.

Summarise the key points of any external link. Links may be inaccessible to future readers.
-->

## How this was tested

<!--
Describe what you ran and what you observed. Be specific, and state only what you actually did.
For example: the automated tests added or changed, manual steps and their outcome,
environments or platforms covered, and anything you were unable to test.
For a bug fix, note the test that fails without the fix.
-->

## Compatibility and risk

- [ ] This change is backwards compatible.
- [ ] This change is **breaking** (complete the details below).
- [ ] This change deprecates existing behaviour (complete the details below).

<!--
If breaking or deprecating, describe: what changes, who is affected,
and the migration path or recommended alternative.
Also note any deployment, configuration, data migration or rollback considerations.
-->

## User-facing change

<!--
Does this PR change behaviour that users, operators or API consumers will notice?
If not, write "None".
If so, write one or two sentences suitable for release notes, in plain language and from the
user's point of view. If users must take action when upgrading, state clearly that action is required.
-->

```release-note

```

## Notes for reviewers

<!--
Help reviewers focus. For example:
  - Where to start, or a suggested order in which to read the files.
  - Areas where you would particularly value scrutiny, or where you are uncertain.
  - How any mechanical, generated or bulk changes were produced (for example a search-and-replace
    or a code generator), so that reviewers can reproduce the steps.
  - Screenshots or recordings for visual changes (include before and after where useful).
-->

## Checklist
- [ ] The PR has a single, focused purpose and contains no unrelated changes.
- [ ] The title is a clear, imperative summary of the change (for example, "Add retry to payment client").
- [ ] I have added or updated tests that cover this change.
- [ ] The build succeeds and the tests pass locally.
- [ ] The code follows the existing patterns and style of this repository.
- [ ] I have updated documentation, changelogs or API references where required.
- [ ] I have reviewed my own diff, and this description reflects the final state of the change.
