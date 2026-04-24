# Title: Attendance API expects array, not object

## Type
bug

## What happened
POST /api/meetings/:id/attendance returned 400 "Expected an array"

## Why
API is designed for bulk upsert; single-object POST not supported

## Fix
Wrap payload: `[{ memberId, status }]` not `{ memberId, status }`

## Result
Returns 200 with upserted record

## Date
2026-04-24
