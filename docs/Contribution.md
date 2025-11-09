```markdown
# Contributing to Team-TaskFlow

Thanks for your interest in contributing! This guide explains how to set up a local development environment, the preferred workflow for making changes, and what we expect from contributors.

Team lead and repository access
- Team lead: Ayush (AyushKatiyar972194)
- Core collaborators with repository access: Ayush, Devesh, Anurag, Chitra, Harsh, Dewansh

How to contribute
1. Fork the repository (if you don't have direct push access).
2. Create a feature branch:
   git checkout -b feat/your-short-descriptive-name
3. Commit your changes with clear, atomic commits:
   git commit -m "feat(tasks): add due date to task model"
4. Push to your fork:
   git push origin feat/your-short-descriptive-name
5. Open a pull request against this repository's main branch and request reviewers (team lead: Ayush).

Development setup
- Backend:
  cd server
  cp .env.example .env
  npm install
  npm run dev
- Frontend:
  cd client
  cp .env.example .env
  npm install
  npm start

Branching and PR conventions
- Branch names: type/short-description (e.g., feat/login, fix/task-delete)
- PR title: type(scope): brief summary
  - type: feat, fix, docs, chore, refactor, test
  - scope: optional area affected (e.g., auth, tasks)
- Link related issue(s) in the PR body
- Include screenshots or GIFs for UI changes
- Ensure all tests pass and linting is clean

Code style
- Follow existing project lint rules (ESLint / Prettier). Run linters and formatters before committing:
  npm run lint
  npm run format

Tests
- Add unit tests for new features and bug fixes
- Run all tests locally before submitting a PR
- When adding or changing APIs, include or update API tests

Reviews & merges
- At least one approving review is required before merging
- Prefer squash-and-merge for small, focused PRs
- Team lead (Ayush) should be requested for final sign-off on architecture/DB changes

Commit message format (recommended)
- Use conventional commits style:
  feat(auth): add Oauth login
  fix(tasks): correct status transition bug
  docs(readme): update setup instructions

Reporting bugs & feature requests
- Open an issue with:
  - Reproduction steps
  - Expected behavior
  - Actual behavior
  - Environment (OS, Node/npm versions)
  - Relevant logs or screenshots

Code of conduct
- Be respectful and inclusive. Treat others as you'd like to be treated.

Thank you for contributing — your work makes Team-TaskFlow better for everyone!
```