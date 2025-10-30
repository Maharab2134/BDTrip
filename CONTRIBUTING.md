# Contributing to BDTrip

Thanks for your interest in contributing! This document explains the recommended workflow and guidelines to make contributions smooth and reviewable.

## How to contribute

1. Fork the repository and create a branch for your change:

```bash
git checkout -b feature/my-feature
```

2. Keep changes small and focused. One feature / fix per PR.

3. Write clear commit messages. We recommend using Conventional Commits:

- feat: add a new feature
- fix: fix a bug
- docs: documentation only changes
- chore: build process or auxiliary tools
- refactor: code change that neither fixes a bug nor adds a feature

Example commit message:
```
feat(auth): add token refresh for admin sessions
```

4. Run the app locally and test your change.

5. Open a pull request describing the change, why it’s needed, and any setup steps to test.

## Local development

Quick commands (from project root):

- Start the backend Express server:

```bash
cd server
npm install
npm start
```

- Start the frontend static server:

```bash
cd /home/dev/Downloads/BDTrip
npm run start:frontend
```

- Start both (Linux):

```bash
npm run start:all
```

## Coding style

- JavaScript: follow existing project style.
- Keep indentation consistent.
- Add comments for non-obvious logic.

## Tests

- Add unit tests for new features where applicable.
- Keep tests deterministic and fast.

## Reporting issues

- Open an issue with a clear title and steps to reproduce.
- Include browser console errors, server logs, and system info when possible.

## License and CLA

By contributing you agree that your contributions will be licensed under the project license (see `LICENSE`). If your employer requires a contributor license agreement (CLA), let the maintainers know.

Thanks — maintainers ❤️ contributions!