#!/usr/bin/env python3
"""Load knowledge-base markdown files into ChromaDB."""
import os, hashlib
from pathlib import Path
import chromadb
from openai import OpenAI

KB = Path(__file__).parent.parent / "knowledge-base"
DB_PATH = Path(__file__).parent / ".chroma"

client = OpenAI()
chroma = chromadb.PersistentClient(path=str(DB_PATH))
col = chroma.get_or_create_collection("huskyadapt-kb")


def embed(text: str) -> list[float]:
    return client.embeddings.create(input=text, model="text-embedding-3-small").data[0].embedding


def doc_id(path: Path) -> str:
    return hashlib.md5(str(path).encode()).hexdigest()


def ingest():
    files = sorted(KB.rglob("*.md"))
    if not files:
        print("No markdown files found in knowledge-base/")
        return
    for f in files:
        text = f.read_text()
        did = doc_id(f)
        col.upsert(
            ids=[did],
            documents=[text],
            embeddings=[embed(text)],
            metadatas=[{"source": str(f.relative_to(KB)), "type": f.parent.name}],
        )
        print(f"  ingested {f.relative_to(KB.parent)}")
    print(f"\n{len(files)} documents in collection.")


if __name__ == "__main__":
    ingest()
