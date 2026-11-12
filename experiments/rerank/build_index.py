"""Embed every film in tmdb_movies_data.csv with a bi-encoder and cache the vectors.

Document recipe (mirrors backend/utils/rag_tools.py::load_movies_from_csv):
  The app builds a LlamaIndex Document per CSV row with text=overview and an
  18-field metadata dict, and does not exclude any metadata keys from
  embedding. LlamaIndex (0.12.x) therefore embeds
      node.get_content(MetadataMode.EMBED)
  which renders as
      "{key}: {value}" lines joined by "\n", then "\n\n", then the overview,
  with the whole string .strip()-ed. We reproduce exactly that string here
  (same field order, same int/float conversions) without importing LlamaIndex.

  Difference from the app: the app passes Documents through
  SentenceSplitter(chunk_size=512, chunk_overlap=20); a very long overview
  could become more than one chunk there. Here every film is exactly one text.

Outputs (git-ignored, under experiments/rerank/cache/):
  doc_embeddings.npy  float32 [n_films, dim], L2-normalised
  docs.json           [{"row": i, "id": ..., "title": ..., "text": ...}, ...]
  index_meta.json     model name, revision, timings, truncation stats

Usage:  python experiments/rerank/build_index.py
"""
import argparse
import csv
import json
import os
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parents[1]
# Keep Hugging Face downloads inside the experiment folder (git-ignored).
os.environ.setdefault("HF_HOME", str(HERE / ".hf_cache"))

import numpy as np  # noqa: E402
import torch  # noqa: E402
from sentence_transformers import SentenceTransformer  # noqa: E402

BI_ENCODER = "BAAI/bge-small-en-v1.5"
CACHE_DIR = HERE / "cache"


def build_metadata(row: dict) -> dict:
    """Same keys, order and conversions as rag_tools.load_movies_from_csv."""
    return {
        "imdb_id": row.get("imdb_id"),
        "popularity": float(row.get("popularity") or 0),
        "budget": int(row.get("budget") or 0),
        "revenue": int(row.get("revenue") or 0),
        "original_title": row.get("original_title"),
        "stars": row.get("cast"),
        "homepage": row.get("homepage"),
        "director": row.get("director"),
        "tagline": row.get("tagline"),
        "keywords": row.get("keywords"),
        "overview": row.get("overview"),
        "runtime": int(row.get("runtime") or 0),
        "genres": row.get("genres"),
        "release_date": row.get("release_date"),
        "vote_count": int(row.get("vote_count") or 0),
        "vote_average": float(row.get("vote_average") or 0),
        "release_year": int(row.get("release_year") or 0),
        "character_tropes": (row.get("character_tropes") or ""),
    }


def document_text(row: dict) -> str:
    """LlamaIndex default: metadata_template "{key}: {value}", separator "\n",
    text_template "{metadata_str}\n\n{content}"; TextNode.get_content strips
    metadata_str first and strips the final result."""
    content = (row.get("overview") or "").strip()
    metadata_str = "\n".join(f"{k}: {v}" for k, v in build_metadata(row).items()).strip()
    if not metadata_str:
        return content
    return f"{metadata_str}\n\n{content}".strip()


def load_docs(csv_path: Path) -> list[dict]:
    docs = []
    with open(csv_path, encoding="utf-8") as f:
        for i, row in enumerate(csv.DictReader(f)):
            docs.append({"row": i, "id": int(row["id"]), "title": row.get("original_title"),
                         "text": document_text(row)})
    return docs


def hf_revision(model_id: str) -> str | None:
    ref = Path(os.environ["HF_HOME"]) / "hub" / ("models--" + model_id.replace("/", "--")) / "refs" / "main"
    return ref.read_text().strip() if ref.exists() else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default=str(REPO_ROOT / "tmdb_movies_data.csv"))
    ap.add_argument("--batch-size", type=int, default=32)
    args = ap.parse_args()

    torch.manual_seed(0)
    CACHE_DIR.mkdir(exist_ok=True)
    docs = load_docs(Path(args.csv))
    print(f"loaded {len(docs)} documents", flush=True)

    model = SentenceTransformer(BI_ENCODER, device="cpu")
    model.max_seq_length = 512
    texts = [d["text"] for d in docs]

    tok = model.tokenizer
    n_tokens = [len(tok(t, add_special_tokens=True)["input_ids"]) for t in texts]
    n_trunc = sum(n > model.max_seq_length for n in n_tokens)
    print(f"token length median={int(np.median(n_tokens))} max={max(n_tokens)} "
          f"truncated(>{model.max_seq_length})={n_trunc}", flush=True)

    t0 = time.perf_counter()
    emb = model.encode(texts, batch_size=args.batch_size, normalize_embeddings=True,
                       convert_to_numpy=True, show_progress_bar=True)
    elapsed = time.perf_counter() - t0
    emb = emb.astype(np.float32)
    # Explicit L2 normalisation (idempotent) so dot product == cosine similarity.
    emb /= np.linalg.norm(emb, axis=1, keepdims=True)

    np.save(CACHE_DIR / "doc_embeddings.npy", emb)
    with open(CACHE_DIR / "docs.json", "w", encoding="utf-8") as f:
        json.dump(docs, f, ensure_ascii=False)
    meta = {
        "bi_encoder": BI_ENCODER,
        "bi_encoder_revision": hf_revision(BI_ENCODER),
        "n_docs": len(docs),
        "dim": int(emb.shape[1]),
        "max_seq_length": model.max_seq_length,
        "token_length_median": int(np.median(n_tokens)),
        "token_length_max": int(max(n_tokens)),
        "n_docs_truncated": int(n_trunc),
        "encode_seconds": round(elapsed, 1),
        "torch_threads": torch.get_num_threads(),
    }
    with open(CACHE_DIR / "index_meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print(json.dumps(meta, indent=2), flush=True)


if __name__ == "__main__":
    main()
