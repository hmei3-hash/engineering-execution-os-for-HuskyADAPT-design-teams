#!/usr/bin/env python3
import sys, os, re
from datetime import date
from pathlib import Path

KB = Path(__file__).parent / "knowledge-base"
TYPES = {"bug": "bugs", "decision": "decisions", "system": "system"}

def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:40]

def next_id(folder: Path) -> str:
    existing = sorted(folder.glob("*.md"))
    return f"{len(existing) + 1:03d}"

def prompt(label: str, required=True) -> str:
    while True:
        val = input(f"{label}: ").strip()
        if val or not required:
            return val
        print("  required")

def main():
    print("\n── HuskyADAPT Knowledge Logger ──")
    kind = ""
    while kind not in TYPES:
        kind = prompt("Type (bug / decision / system)").lower()

    title = prompt("Title")
    folder = KB / TYPES[kind]
    folder.mkdir(parents=True, exist_ok=True)
    nid = next_id(folder)
    fname = folder / f"{nid}-{slug(title)}.md"

    if kind == "bug":
        happened = prompt("What happened")
        why      = prompt("Why (best guess)")
        fix      = prompt("Fix applied")
        result   = prompt("Result")
        body = f"""# Title: {title}

## Type
bug

## What happened
{happened}

## Why (guess)
{why}

## Fix
{fix}

## Result
{result}

## Date
{date.today()}
"""
    elif kind == "decision":
        context  = prompt("Context")
        choice   = prompt("Choice made")
        why      = prompt("Why")
        tradeoff = prompt("Tradeoff", required=False) or "None noted"
        body = f"""# Title: {title}

## Type
decision

## Context
{context}

## Choice
{choice}

## Why
{why}

## Tradeoff
{tradeoff}

## Date
{date.today()}
"""
    else:
        content = prompt("Describe the system knowledge")
        body = f"""# Title: {title}

## Type
system

## Content
{content}

## Date
{date.today()}
"""

    fname.write_text(body)
    print(f"\n✓ Saved → {fname.relative_to(Path.cwd())}")

if __name__ == "__main__":
    main()
