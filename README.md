This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

The MVP is built and running at **http://localhost:3001**. Here's what was delivered:

---

**HuskyADAPT Engineering OS** — [`husky-adapt-os/`](husky-adapt-os/)

**Stack**: Next.js 16 · Prisma 7 + SQLite · TailwindCSS v4 · shadcn/ui

**6 modules, all wired together:**

| Module | What it does |
|---|---|
| **Meetings** | CRUD with decisions, action items, attendance sheet |
| **Design Specs** | Problem / constraints / success metrics with status tracking |
| **Tasks** | Kanban board (Backlog → Done), "→ Task" button promotes action items |
| **Orders** | Procurement with design justification links and cost tracking |
| **Attendance** | Matrix view — attendance rate per member across all meetings |
| **Trace** | Enter any task/order/spec ID → walks the chain back to the originating meeting |

**Traceability in action** (verified):
`Order NEMA 17 steppers` ← `Spec: Wheelchair Joystick Controller v1` ← `Action Item` ← `Meeting: Week 3 Design Review`

**Key commands:**

```bash
cd husky-adapt-os
npm run dev          # start server
npm run db:seed      # re-seed sample data
npx prisma studio    # visual DB browser
```