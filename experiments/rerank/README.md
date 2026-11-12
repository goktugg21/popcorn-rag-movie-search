Personal follow-up experiment by Göktuğ Yıldırım, run after the course project; not part of the team's graded submission.

# Does a cross-encoder reranking stage improve movie retrieval?

The Popcorn app finds films by embedding the user's description and doing a
vector search in pgvector. This experiment asks one narrow question: if we
take the top 30 vector-search results and re-sort them with a cross-encoder,
does the correct film end up nearer the top?

Nothing in `backend/` or `frontend/` is changed. Everything lives in
`experiments/rerank/` on the branch `goktug/rerank-experiment`.

## Setup

**Corpus.** All 10,862 rows of `tmdb_movies_data.csv` (one text per row; TMDb
id 42194 appears twice in the file and both rows are kept, as in the app).

**Document text (same recipe as the app).** `backend/utils/rag_tools.py`
creates a LlamaIndex `Document` per row with `text = overview` and an 18-field
metadata dict (imdb_id, popularity, budget, revenue, original_title, stars
(= cast), homepage, director, tagline, keywords, overview, runtime, genres,
release_date, vote_count, vote_average, release_year, character_tropes). No
metadata keys are excluded from embedding, so LlamaIndex embeds:

```
imdb_id: tt0369610
popularity: 32.985763
...
character_tropes: Outsider

<overview>
```

i.e. `"{key}: {value}"` lines joined by newlines, a blank line, then the
overview (so the overview appears twice). `build_index.py::document_text`
reproduces this string with the same field order and int/float conversions.
The same string is what the cross-encoder sees. One difference: the app runs
documents through `SentenceSplitter(chunk_size=512, chunk_overlap=20)`, which
could split an unusually long overview into several chunks; here each film is
exactly one text.

**Models (CPU only, official Hugging Face orgs, no `trust_remote_code`).**

- Bi-encoder: `BAAI/bge-small-en-v1.5` (384-d, max 512 tokens). Queries get
  the BGE retrieval instruction prefix
  `"Represent this sentence for searching relevant passages: "`; documents get
  no prefix. This is **not** the app's embedding model (`nomic-embed-text` via
  Ollama); Ollama was not available on the machine used, so absolute numbers
  will differ from what the app would get.
- Cross-encoder: `cross-encoder/ms-marco-MiniLM-L-6-v2` (max 512 tokens).

The exact model revisions (commit hashes) are recorded in `results.json`.

**Search.** Document vectors are L2-normalised and searched exhaustively with
a numpy dot product. On unit vectors that is cosine similarity, so the ranking
is the same as an exact (non-approximate, no HNSW/IVFFlat index) pgvector
cosine-distance search over the same vectors.

**Rerank.** Take the top 30 by cosine, score each (query, document text) pair
with the cross-encoder, sort by that score. Reranking can only reorder those
30, so baseline recall@30 is the ceiling for any reranked metric.

## Query set

`queries.jsonl` holds 50 title-free plot descriptions.

- Targets were chosen by `sample_targets.py`: films whose overview has at
  least 30 words and whose `vote_count` is strictly above the median of the
  CSV (38), excluding the one duplicated id; 4,109 candidates, sorted by id,
  then `random.Random(42).sample(candidates, 50)`.
- Each description was **written by an LLM assistant** (Claude, working on
  Göktuğ's behalf), as a 1–2 sentence paraphrase of the plot. Titles,
  character names, actor and director names were left out. A small script
  flagged any title word (4+ letters) and any 4-word sequence shared with the
  overview, and those queries were reworded before the file was saved. Some
  descriptions use general knowledge of the film beyond the overview (e.g.
  that it is a short or an animated sequel).
- The queries were written once, before any retrieval or model was run, and
  committed on their own (commit `c1a7522`, "freeze 50-query evaluation set
  before any retrieval") before the index was built. They were not edited
  afterwards. SHA-256 of `queries.jsonl` at that commit:
  `b5ee3904206bf50ece33b391dc00d3074e61c8aaad5398a2e8af9b810091a533`
  (computed on the LF-line-ending file as written).

## How to reproduce

From the repository root, on Windows with Git Bash (adjust the activate path
on macOS/Linux):

```bash
python -m venv .venv-rerank
printf '*\n' > .venv-rerank/.gitignore          # keep the venv out of git
.venv-rerank/Scripts/python -m pip install -r experiments/rerank/requirements.txt
.venv-rerank/Scripts/python experiments/rerank/sample_targets.py   # optional: shows the 50 sampled films
.venv-rerank/Scripts/python experiments/rerank/build_index.py      # embeds all films -> experiments/rerank/cache/
.venv-rerank/Scripts/python experiments/rerank/evaluate.py         # writes results.json and results.md
```

Models are downloaded into `experiments/rerank/.hf_cache/` (git-ignored); the
embedding cache goes to `experiments/rerank/cache/` (git-ignored).

## Results

Single deterministic run, 50 queries, 10,862 films (full per-query table in
`results.md`, raw numbers in `results.json`).

| Metric | Baseline (cosine) | Rerank (top-30 + cross-encoder) |
|---|---|---|
| Top-1 accuracy | 0.36 (18/50) | 0.80 (40/50) |
| Top-2 accuracy | 0.50 (25/50) | 0.82 (41/50) |
| Top-5 accuracy | 0.66 (33/50) | 0.86 (43/50) |
| MRR@30 | 0.484 | 0.822 |
| Recall@30 (candidate pool / ceiling) | 0.86 (43/50) | same pool |
| Mean latency per query (CPU) | 19 ms (query embed + exact search) | + 1,323 ms for reranking 30 docs = 1,343 ms |

Top-1, paired per query: 24 queries improved (baseline wrong, rerank right),
2 got worse, 16 were right both times, 8 were wrong both times. Exact
McNemar test (two-sided): p = 1.0e-05. Top-1 difference +0.44, paired
bootstrap 95% CI [+0.28, +0.60] (10,000 resamples, seed 0).

Among the 43 queries whose target was in the top 30, the target's rank got
better in 25, worse in 2, and stayed the same in 16.

What the numbers say, plainly:

- On this query set, reranking moved the correct film to first place much
  more often. Almost every target that was in the top 30 ended up at rank 1
  (40 of 43).
- The 7 misses are all cases where the bi-encoder did not put the film in the
  top 30 at all (e.g. ranks 36–338), so the reranker never saw them. Better
  first-stage recall is now the limiting factor.
- The 2 regressions: *Land of the Dead* (1 → 4, another zombie film went
  first) and *Stalingrad* (1993) (1 → 2, the 2013 Russian film about the same
  battle went first; its title is stored mis-encoded in the CSV). The query
  mentions the Volga, a detail that is in the 2013 film's overview but not
  the 1993 one, so this query is arguably ambiguous.
- The cost is latency: about 1.3 s per query on this laptop CPU for 30
  cross-encoder passes over ~260-token documents, versus ~20 ms for the vector
  search alone. That is a big jump for an interactive search box.
- The baseline is likely held back by the document recipe: the overview is a
  small part of a long text full of numbers, URLs and cast lists, which blurs
  a single embedding vector. A cross-encoder can attend to the plot sentences
  directly. Part of the gain may therefore be specific to this recipe; an
  overview-only embedding was not tested.

Notes on the run:

- Bi-encoder revision `5c38ec7c405ec4b44b94cc5a9bb96e735b38267a`,
  cross-encoder revision `233902d25c440f23af6f7d6e94d2946bac0bee0a`; torch
  2.14.1+cpu (12 threads), sentence-transformers 6.3.0, Python 3.10.11,
  Windows 11, Intel CPU (16 logical cores).
- Document token lengths (bge tokenizer): median 259, max 617. 128 of 10,862
  documents exceed 512 tokens and are truncated at the end, which cuts the
  trailing copy of the overview (the first copy, in the metadata block, is
  kept).
- `evaluate.py` was run three times. The first run wrote its results but then
  crashed while printing a non-ASCII title to the Windows console; after
  fixing the console encoding (and then the p-value display format), it was
  re-run. All three runs gave identical ranks and metrics; only latency
  varied by a few percent. Nothing about the models, queries or settings was
  changed between runs.
- Building the index (embedding all films) took 526 s on this CPU.

## Limitations

- **Small, synthetic query set.** 50 queries, all written by one LLM. Real
  users write shorter, vaguer, more error-prone descriptions; an LLM writing
  from the overview may also phrase things in ways that happen to suit
  embedding models. With 50 queries, one query is 2 percentage points and
  confidence intervals are wide.
- **Queries paraphrase the overview.** Each query was written from the same
  overview text that is inside the document. Even though shared wording was
  removed, the queries cover the same facts in the same order, which is
  exactly the fine-grained matching a cross-encoder is good at. Queries based
  on memory of the film (different details, wrong details) could narrow the
  gap.
- **Different embedder from production.** `bge-small-en-v1.5` instead of
  `nomic-embed-text`. A different first stage changes both the baseline and
  the pool the cross-encoder gets to reorder.
- **Exact search.** The app's pgvector table may use an approximate index;
  here search is exhaustive, so baseline recall may be slightly optimistic
  compared with an approximate index.
- **Cross-encoder domain.** `ms-marco-MiniLM-L-6-v2` was trained on web search
  passages, not on plot-description-to-film matching, and it reads the full
  metadata block (budget, homepage, imdb id, ...) which is mostly noise for
  this task. Feeding it only the overview, or a stronger reranker, could
  behave differently; that was not tested.
- **Single run, single configuration.** Rerank depth (30), models, and the
  document recipe were fixed up front and not tuned; no other settings were
  tried, so the result says nothing about what the best configuration is.
- **Latency** was measured on one Windows laptop CPU, one query at a time,
  after one warm-up query; it will differ on other hardware.
- Any older figure quoted for this idea elsewhere was not reproduced here and
  should not be compared against these numbers.
