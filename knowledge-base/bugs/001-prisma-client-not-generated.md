# Title: Prisma client not found on fresh clone

## Type
bug

## What happened
`next build` fails with `Module not found: Can't resolve '@/generated/prisma/client'`

## Why
`npx prisma generate` must be run before build; generated files are gitignored

## Fix
Run `npx prisma generate && DATABASE_URL=file:./dev.db npx prisma db push` after `npm install`

## Result
Build succeeds

## Date
2026-04-24
