# WhatDoTheyMake

Anonymous salary sharing at [whatdotheymake.com](https://whatdotheymake.com).

No accounts, no paywalls, no ad-tech tracking. Submit salary data, browse what others make.

## Stack

Nuxt 3 on Cloudflare Workers with D1 for storage. Uses an Anthropic-compatible LLM proxy (we use [LiteLLM](https://github.com/BerriAI/litellm)) for content moderation and salary scoring.

## Local dev

```bash
npm install
cp .env.example .env
# fill in the three required vars (see .env.example)
npm run dev
```

Without Cloudflare bindings, data lives in memory.

## Environment variables

See `.env.example`. You need:

- `NUXT_LLM_BASE_URL` - your LLM proxy endpoint
- `NUXT_LLM_AUTOMOD_API_KEY` - for content moderation
- `NUXT_LLM_SALARY_API_KEY` - for salary scoring
- `NUXT_LLM_FAILOVER_API_KEY` - optional direct Anthropic fallback key if proxy requests fail

## Deploying

Create your local Wrangler config from the template, then create a D1 database and drop its ID into `wrangler.toml`:

```bash
cp wrangler.example.toml wrangler.toml
npx wrangler d1 create whatdotheymake-db
```

Run migrations, set secrets, deploy:

```bash
npm run db:migrate
npx wrangler secret put NUXT_LLM_BASE_URL
npx wrangler secret put NUXT_LLM_AUTOMOD_API_KEY
npx wrangler secret put NUXT_LLM_SALARY_API_KEY
npx wrangler secret put NUXT_LLM_FAILOVER_API_KEY
npm run deploy
```

## Privacy

No accounts, no sessions, no ad pixels, no analytics scripts. Infrastructure providers may still process technical request data for security/reliability, and text fields are moderated through an Anthropic-compatible API. Submitted salaries can optionally be fuzzed by +/-$1-2k before storage. Edit/delete works via a management code the submitter keeps.

## Product commitments

- We will never run ads.
- We will never put salary browsing or salary submission behind a paywall.

## Security & abuse controls

- Submission management codes are high-entropy random tokens.
- Tokens are stored hashed (SHA-256) at rest.
- Submission edits are audit logged and visible to the code holder.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Run `npm run ci` before opening a PR.

Security issues: [SECURITY.md](SECURITY.md)

## License

[MIT](LICENSE)
