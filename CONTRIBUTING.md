# Contributing

## Development

```bash
npm install
npm run build
npm test
```

Run the daemon locally with:

```bash
npm run dev
```

## Pull requests

- Keep changes focused and small.
- Add or update tests for parser, rules, incident deduplication, or notifier behavior when relevant.
- Do not commit secrets, `.env`, build output, or `node_modules`.
- Run `npm test` before opening a pull request.
