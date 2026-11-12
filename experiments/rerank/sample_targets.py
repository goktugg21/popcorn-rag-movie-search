"""Pick the 50 target films for the query set (step 1 of the experiment).

Selection rule (fixed before any retrieval was run):
  * overview has at least MIN_OVERVIEW_WORDS words
  * vote_count is strictly above the median vote_count of the whole CSV
  * the TMDb id appears only once in the CSV (id 42194 is duplicated in the
    file, so it is excluded to keep "the correct answer" unambiguous)
  * candidates are sorted by integer id, then random.Random(SEED).sample(..., N)

This script only prints the sampled films (id, title, overview) so that a
plot description can be written for each one. It does not touch embeddings.

Usage:  python experiments/rerank/sample_targets.py [--csv tmdb_movies_data.csv]
"""
import argparse
import collections
import csv
import json
import random
import statistics
from pathlib import Path

SEED = 42
N = 50
MIN_OVERVIEW_WORDS = 30

REPO_ROOT = Path(__file__).resolve().parents[2]


def sample_targets(csv_path: Path):
    with open(csv_path, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    id_counts = collections.Counter(r["id"] for r in rows)
    median_votes = statistics.median(int(r["vote_count"] or 0) for r in rows)
    candidates = [
        r for r in rows
        if id_counts[r["id"]] == 1
        and len((r["overview"] or "").split()) >= MIN_OVERVIEW_WORDS
        and int(r["vote_count"] or 0) > median_votes
    ]
    candidates.sort(key=lambda r: int(r["id"]))
    picked = random.Random(SEED).sample(candidates, N)
    return picked, median_votes, len(candidates), len(rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default=str(REPO_ROOT / "tmdb_movies_data.csv"))
    args = ap.parse_args()
    picked, median_votes, n_cand, n_rows = sample_targets(Path(args.csv))
    print(f"rows={n_rows} median_vote_count={median_votes} candidates={n_cand} sampled={len(picked)}")
    for r in picked:
        print(json.dumps({"id": int(r["id"]), "title": r["original_title"],
                          "overview": r["overview"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
