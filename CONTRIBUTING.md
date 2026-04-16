# Contributing
Thanks for helping improve WhatDoTheyMake.
## Development setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment template:
   ```bash
   cp .env.example .env
   ```
3. Fill required variables in `.env`.
4. Start local dev server:
   ```bash
   npm run dev
   ```
## Pull request process
1. Create a branch from `main`.
2. Keep changes focused and small when possible.
3. Run checks before opening a PR:
   ```bash
   npm run ci
   ```
4. Update docs if behavior or configuration changed.
5. Use clear PR titles and include testing notes.
## Code style expectations
- Do not add `console.*` logging in committed code.
- Prefer small, readable functions and explicit naming.
- Keep privacy and anonymization guarantees intact.
## Reporting security issues
Please do not open public issues for vulnerabilities.
Follow [SECURITY.md](SECURITY.md) for private disclosure.
