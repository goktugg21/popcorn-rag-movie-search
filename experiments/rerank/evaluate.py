"""Compare plain vector search against vector search + cross-encoder reranking.

For every query in queries.jsonl:
  baseline : embed query with the bi-encoder, exact cosine search over all
             films (numpy dot product on L2-normalised vectors), rank.
  rerank   : take the baseline top-30, score each (query, film text) pair
             with the cross-encoder, re-sort those 30 by that score.

Metrics: top-1/2/5 accuracy, MRR@30 (reciprocal rank, 0 if target not in
top 30), baseline recall@30 (upper bound for reranking), top-1 win/loss
counts with an exact McNemar test, a paired bootstrap 95% CI for the top-1
difference, and mean per-query latency per stage on this CPU.

Requires build_index.py to have been run first.
Usage:  python experiments/rerank/evaluate.py
"""
import json
import math
import os
import platform
import random
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
os.environ.setdefault("HF_HOME", str(HERE / ".hf_cache"))

import numpy as np  # noqa: E402
import torch  # noqa: E402
import sentence_transformers  # noqa: E402
from sentence_transformers import CrossEncoder, SentenceTransformer  # noqa: E402

from build_index import BI_ENCODER, CACHE_DIR, hf_revision  # noqa: E402

CROSS_ENCODER = "cross-encoder/ms-marco-MiniLM-L-6-v2"
# Query instruction recommended by the BGE authors for short query -> passage retrieval.
QUERY_INSTRUCTION = "Represent this sentence for searching relevant passages: "
RERANK_DEPTH = 30
KS = (1, 2, 5)
BOOTSTRAP_SAMPLES = 10_000
SEED = 0


def exact_mcnemar_p(b: int, c: int) -> float:
    """Two-sided exact McNemar test = exact binomial test on discordant pairs."""
    n = b + c
    if n == 0:
        return 1.0
    k = min(b, c)
    tail = sum(math.comb(n, i) for i in range(k + 1)) / 2 ** n
    return min(1.0, 2 * tail)


def summarise(ranks: list) -> dict:
    """ranks: 1-based rank of the target, or None if outside the top RERANK_DEPTH."""
    n = len(ranks)
    out = {f"top{k}": sum(r is not None and r <= k for r in ranks) / n for k in KS}
    out[f"mrr@{RERANK_DEPTH}"] = sum(1 / r for r in ranks if r is not None and r <= RERANK_DEPTH) / n
    return out


def main():
    # Titles contain non-ASCII characters; Windows consoles default to a legacy code page.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    random.seed(SEED)
    np.random.seed(SEED)
    torch.manual_seed(SEED)

    emb = np.load(CACHE_DIR / "doc_embeddings.npy")
    with open(CACHE_DIR / "docs.json", encoding="utf-8") as f:
        docs = json.load(f)
    with open(CACHE_DIR / "index_meta.json", encoding="utf-8") as f:
        index_meta = json.load(f)
    assert index_meta["bi_encoder"] == BI_ENCODER and len(docs) == emb.shape[0]
    with open(HERE / "queries.jsonl", encoding="utf-8") as f:
        queries = [json.loads(line) for line in f if line.strip()]

    id_to_rows = {}
    for d in docs:
        id_to_rows.setdefault(d["id"], []).append(d["row"])
    for q in queries:
        assert len(id_to_rows[q["target_id"]]) == 1, "target ids must be unique in the CSV"

    bi = SentenceTransformer(BI_ENCODER, device="cpu")
    bi.max_seq_length = 512
    ce = CrossEncoder(CROSS_ENCODER, max_length=512, device="cpu")

    def embed_and_search(text):
        qv = bi.encode([QUERY_INSTRUCTION + text], normalize_embeddings=True, convert_to_numpy=True)[0]
        scores = emb @ qv.astype(np.float32)
        order = np.argsort(-scores, kind="stable")
        return order, scores

    def rerank(text, cand_rows):
        ce_scores = ce.predict([(text, docs[r]["text"]) for r in cand_rows], batch_size=RERANK_DEPTH,
                               show_progress_bar=False)
        ce_scores = np.asarray(ce_scores, dtype=np.float64)
        order = np.argsort(-ce_scores, kind="stable")
        return [cand_rows[i] for i in order], ce_scores[order]

    # Warm-up (not timed / not scored) so one-off initialisation does not hit query 1.
    o, _ = embed_and_search("a warm-up query about a film")
    rerank("a warm-up query about a film", [int(r) for r in o[:RERANK_DEPTH]])

    per_query, lat_embed_search, lat_rerank = [], [], []
    for q in queries:
        target_row = id_to_rows[q["target_id"]][0]

        t0 = time.perf_counter()
        order, _ = embed_and_search(q["query"])
        t1 = time.perf_counter()
        top = [int(r) for r in order[:RERANK_DEPTH]]
        reranked, _ = rerank(q["query"], top)
        t2 = time.perf_counter()
        lat_embed_search.append(t1 - t0)
        lat_rerank.append(t2 - t1)

        base_rank_full = int(np.where(order == target_row)[0][0]) + 1
        base_rank = base_rank_full if base_rank_full <= RERANK_DEPTH else None
        rr_rank = reranked.index(target_row) + 1 if target_row in reranked else None
        per_query.append({
            "target_id": q["target_id"],
            "title": q["title"],
            "query": q["query"],
            "baseline_rank": base_rank_full,  # rank in the full corpus
            "rerank_rank": rr_rank,           # rank within reranked top-30 (None = not retrieved)
            "baseline_top1": docs[top[0]]["title"],
            "rerank_top1": docs[reranked[0]]["title"],
        })
        per_query[-1]["_b"] = base_rank
        print(f"{q['target_id']:>7} base={base_rank_full:>5} rerank={rr_rank}  {q['title']}", flush=True)

    base_ranks = [p.pop("_b") for p in per_query]
    rr_ranks = [p["rerank_rank"] for p in per_query]
    n = len(queries)

    base = summarise(base_ranks)
    base[f"recall@{RERANK_DEPTH}"] = sum(r is not None for r in base_ranks) / n
    rr = summarise(rr_ranks)
    rr[f"recall@{RERANK_DEPTH}"] = base[f"recall@{RERANK_DEPTH}"]  # reranking cannot change the candidate set

    b_hit = [r == 1 for r in base_ranks]
    r_hit = [r == 1 for r in rr_ranks]
    improved = sum((not b) and r for b, r in zip(b_hit, r_hit))
    worsened = sum(b and (not r) for b, r in zip(b_hit, r_hit))
    both_right = sum(b and r for b, r in zip(b_hit, r_hit))
    both_wrong = sum((not b) and (not r) for b, r in zip(b_hit, r_hit))

    # Rank-level comparison among queries whose target is in the top 30.
    in_pool = [(b, r) for b, r in zip(base_ranks, rr_ranks) if b is not None]
    rank_better = sum(r < b for b, r in in_pool)
    rank_worse = sum(r > b for b, r in in_pool)
    rank_same = sum(r == b for b, r in in_pool)

    # Paired bootstrap CI on top-1 accuracy difference (rerank - baseline).
    rng = random.Random(SEED)
    diffs = []
    for _ in range(BOOTSTRAP_SAMPLES):
        idx = [rng.randrange(n) for _ in range(n)]
        diffs.append(sum(r_hit[i] - b_hit[i] for i in idx) / n)
    diffs.sort()
    ci = (diffs[int(0.025 * BOOTSTRAP_SAMPLES)], diffs[int(0.975 * BOOTSTRAP_SAMPLES) - 1])

    results = {
        "n_queries": n,
        "n_documents": len(docs),
        "rerank_depth": RERANK_DEPTH,
        "models": {
            "bi_encoder": BI_ENCODER,
            "bi_encoder_revision": hf_revision(BI_ENCODER),
            "query_instruction": QUERY_INSTRUCTION,
            "cross_encoder": CROSS_ENCODER,
            "cross_encoder_revision": hf_revision(CROSS_ENCODER),
            "max_seq_length": 512,
        },
        "baseline": base,
        "rerank": rr,
        "top1_comparison": {
            "improved": improved, "worsened": worsened,
            "unchanged_both_correct": both_right, "unchanged_both_wrong": both_wrong,
            "exact_mcnemar_p_two_sided": exact_mcnemar_p(improved, worsened),
            "accuracy_difference": (sum(r_hit) - sum(b_hit)) / n,
            "bootstrap_95ci_difference": list(ci),
            "bootstrap_samples": BOOTSTRAP_SAMPLES,
        },
        "rank_comparison_within_top30": {
            "n_targets_in_top30": len(in_pool),
            "rank_better": rank_better, "rank_worse": rank_worse, "rank_same": rank_same,
            "sign_test_p_two_sided": exact_mcnemar_p(rank_better, rank_worse),
        },
        "latency_ms_mean": {
            "query_embed_plus_exact_search": 1000 * float(np.mean(lat_embed_search)),
            "cross_encoder_rerank_30": 1000 * float(np.mean(lat_rerank)),
            "total_with_rerank": 1000 * float(np.mean(np.add(lat_embed_search, lat_rerank))),
        },
        "latency_ms_median": {
            "query_embed_plus_exact_search": 1000 * float(np.median(lat_embed_search)),
            "cross_encoder_rerank_30": 1000 * float(np.median(lat_rerank)),
        },
        "environment": {
            "python": platform.python_version(),
            "platform": platform.platform(),
            "processor": platform.processor(),
            "cpu_count": os.cpu_count(),
            "torch": torch.__version__,
            "torch_threads": torch.get_num_threads(),
            "sentence_transformers": sentence_transformers.__version__,
            "numpy": np.__version__,
        },
        "index": index_meta,
        "per_query": per_query,
    }
    with open(HERE / "results.json", "w", encoding="utf-8", newline="\n") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    with open(HERE / "results.md", "w", encoding="utf-8", newline="\n") as f:
        f.write(render_markdown(results))
    print(render_markdown(results))


def render_markdown(res: dict) -> str:
    b, r, c = res["baseline"], res["rerank"], res["top1_comparison"]
    lat, rc = res["latency_ms_mean"], res["rank_comparison_within_top30"]
    d = res["rerank_depth"]
    lines = [
        "# Rerank experiment: results",
        "",
        f"{res['n_queries']} queries over {res['n_documents']} films. "
        f"Bi-encoder `{res['models']['bi_encoder']}`, cross-encoder `{res['models']['cross_encoder']}`, "
        f"rerank depth {d}. Single deterministic run on CPU.",
        "",
        "| Metric | Baseline (cosine) | Rerank (top-30 + cross-encoder) |",
        "|---|---|---|",
    ]
    for k in KS:
        lines.append(f"| Top-{k} accuracy | {b[f'top{k}']:.2f} ({round(b[f'top{k}'] * res['n_queries'])}/{res['n_queries']}) "
                     f"| {r[f'top{k}']:.2f} ({round(r[f'top{k}'] * res['n_queries'])}/{res['n_queries']}) |")
    lines += [
        f"| MRR@{d} | {b[f'mrr@{d}']:.3f} | {r[f'mrr@{d}']:.3f} |",
        f"| Recall@{d} (candidate pool) | {b[f'recall@{d}']:.2f} | same pool |",
        f"| Mean latency per query | {lat['query_embed_plus_exact_search']:.1f} ms (embed + search) "
        f"| +{lat['cross_encoder_rerank_30']:.1f} ms rerank = {lat['total_with_rerank']:.1f} ms total |",
        "",
        "## Top-1 changes (paired, per query)",
        "",
        f"- Improved (baseline wrong, rerank right): {c['improved']}",
        f"- Worsened (baseline right, rerank wrong): {c['worsened']}",
        f"- Unchanged, both right: {c['unchanged_both_correct']}",
        f"- Unchanged, both wrong: {c['unchanged_both_wrong']}",
        f"- Exact McNemar test, two-sided p = {c['exact_mcnemar_p_two_sided']:.2g}",
        f"- Top-1 difference (rerank - baseline) = {c['accuracy_difference']:+.2f}, "
        f"paired bootstrap 95% CI [{c['bootstrap_95ci_difference'][0]:+.2f}, {c['bootstrap_95ci_difference'][1]:+.2f}]",
        "",
        f"Rank movement for the {rc['n_targets_in_top30']} queries whose target was in the top {d}: "
        f"better {rc['rank_better']}, worse {rc['rank_worse']}, same {rc['rank_same']} "
        f"(sign test p = {rc['sign_test_p_two_sided']:.2g}).",
        "",
        "## Per query",
        "",
        "| Target film | Baseline rank | Rerank rank | Baseline top-1 | Rerank top-1 |",
        "|---|---|---|---|---|",
    ]
    for p in res["per_query"]:
        rr_rank = p["rerank_rank"] if p["rerank_rank"] is not None else f">{d}"
        lines.append(f"| {p['title']} | {p['baseline_rank']} | {rr_rank} | {p['baseline_top1']} | {p['rerank_top1']} |")
    env = res["environment"]
    lines += ["", f"Environment: Python {env['python']}, torch {env['torch']} ({env['torch_threads']} threads), "
              f"sentence-transformers {env['sentence_transformers']}, {env['platform']}, {env['processor']}.", ""]
    return "\n".join(lines)


if __name__ == "__main__":
    main()
