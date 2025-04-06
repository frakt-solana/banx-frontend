# 🏦 Banx Frontend

Banx is a DeFi application built on Solana that allows users to lend, borrow, and multiply yield against any token.

This is the **frontend** implementation using modern React and TypeScript with the [Next.js App Router](https://nextjs.org/docs/app).

---

## 🚀 Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: SCSS Modules
- **State Management**: Zustand
- **Async Logic**: React Query
- **Validation**: Zod
- **Solana SDK**: [fbonds-core](https://github.com/frakt-solana/fnd-core) , [banx-vaults-sdk](https://github.com/frakt-solana/banx-vaults)

---

## 📦 Getting Started

```bash
yarn install
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 Scripts

| Command          | Description               |
| ---------------- | ------------------------- |
| `yarn dev`       | Start dev server          |
| `yarn build`     | Production build          |
| `yarn start`     | Run the app in prod mode  |
| `yarn lint`      | Run ESLint                |
| `yarn lint:fix`  | Fix all lint issues       |
| `yarn build:log` | Build & write log to file |

---

## 🌐 Environment Variables

Add your `.env.local` with any custom values. Example:

```
RPC_LOCALHOST=

SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
SENTRY_DEPLOY_SOURCEMAPS=

IS_PRIVATE_MARKETS=

COMPRESS_QUERY_PERSISTER_ON_BUILD=
```

---

## 🧐 Author

Built by [@iamsphere](https://github.com/iamsphere) and [@sablevsky](https://github.com/sablevsky) with ❤️
