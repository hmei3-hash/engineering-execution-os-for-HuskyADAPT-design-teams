#!/usr/bin/env python3
"""RAG query CLI for HuskyADAPT knowledge base."""
import sys
from pathlib import Path
import chromadb
from openai import OpenAI

DB_PATH = Path(__file__).parent / ".chroma"
THRESHOLD = 0.75
TOP_K = 5

SYSTEM = """\
You are an engineering assistant for the HuskyADAPT robotics team.
Answer ONLY based on the provided context. If the answer is not in the context, say exactly: "I don't know."
Always include an Evidence section listing the source files you used.\
"""

client = OpenAI()
chroma = chromadb.PersistentClient(path=str(DB_PATH))


def embed(text: str) -> list[float]:
    return client.embeddings.create(input=text, model="text-embedding-3-small").data[0].embedding


def query(question: str) -> None:
    try:
        col = chroma.get_collection("huskyadapt-kb")
    except Exception:
        print("No knowledge base found. Run ingest.py first.")
        return

    results = col.query(query_embeddings=[embed(question)], n_results=TOP_K, include=["documents", "metadatas", "distances"])
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    dists = results["distances"][0]

    # similarity = 1 - cosine_distance
    relevant = [(doc, meta, 1 - dist) for doc, meta, dist in zip(docs, metas, dists) if 1 - dist >= THRESHOLD]

    if not relevant:
        print("I don't know.")
        print(f"(Best match similarity: {1 - dists[0]:.2f} — below threshold {THRESHOLD})")
        return

    context = "\n\n---\n\n".join(
        f"[Source: {m['source']}]\n{d}" for d, m, _ in relevant
    )
    sources = [m["source"] for _, m, _ in relevant]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
        ],
        temperature=0,
    )
    print("\nAnswer:")
    print(response.choices[0].message.content)
    print("\nEvidence:")
    for s in sources:
        print(f"  - {s}")


def main():
    if len(sys.argv) > 1:
        query(" ".join(sys.argv[1:]))
    else:
        print("HuskyADAPT RAG — type your question (Ctrl+C to exit)\n")
        while True:
            try:
                q = input("> ").strip()
                if q:
                    query(q)
                    print()
            except (KeyboardInterrupt, EOFError):
                break


if __name__ == "__main__":
    main()
