# Title: Use SQLite over PostgreSQL for MVP

## Type
decision

## Context
HuskyADAPT OS needs persistent storage. Team has no dedicated server infra.

## Choice
SQLite via better-sqlite3 + Prisma adapter

## Why
Zero-config, file-based, sufficient for <50 concurrent users on a student team

## Tradeoff
No concurrent writes; must migrate if multi-server deployment needed

## Date
2026-04-24
