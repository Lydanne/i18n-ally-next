---
name: git-pr-workflow
description: Deliver changes to this repository through a tested Git branch and GitHub pull request. Use for repository change tasks and requests involving Git, commits, branches, pushing, or PR delivery.
---

# Git and PR workflow

For repository change tasks, deliver a reviewable pull request by default. Honor the user's more specific instructions, such as a commit-only request, a requested branch, draft PR, or explicit merge. A read-only investigation with no changes does not require an empty PR.

1. Inspect repository guidance, `git status`, branch, worktrees, remotes and default branch before changing anything. Preserve unrelated user work; use an isolated branch or worktree if needed. This repository may have both `origin` and `upstream`: establish the intended destination and pass `--repo OWNER/REPO` to GitHub CLI commands. Fetch the intended base and inspect divergence; do not overwrite user work, force-push or rewrite shared history.
2. Work on a task-specific non-default branch, normally prefixed `codex/`. Reuse a branch or existing PR only when it belongs to the same task and its contents are appropriate. Keep the change focused, follow the repository's contribution rules, and do not bump release versions as part of a PR.
3. Review the complete diff, including added dependencies, install scripts, CI and security-sensitive code. Run checks proportionate to the change and record failures or limitations. Check for secrets and unrelated changes before staging; stage only task files and use a clear conventional commit message.
4. Push the task branch and create or update a PR against the intended base. Give reviewers the problem, resulting behavior, relevant risk and validation, including failed or pending checks. Link related issues where appropriate. Use a draft when the user requests one or work is not ready for normal review; do not claim a failed check passed.
5. Verify the PR URL, current head, base and CI status. Report the PR link and meaningful test results. PR delivery does not itself authorize merging; merge when the user has requested it for the task, following repository policy and checking the reviewed head and required checks. If access, conflicts, CI or another constraint prevents delivery, do what can be done safely and report the exact blocker.
