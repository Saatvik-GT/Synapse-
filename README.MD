# OpenIssue

OpenIssue is a repo-first GitHub issue triage assistant for maintainers.

It ingests issues from a repository, runs explainable triage analysis, and surfaces:
- predicted issue type
- suggested labels
- likely duplicate candidates
- priority score + priority band
- missing-information hints (what reporters should add)

This branch includes a real integrated frontend + backend flow for issue analysis, **plus a GitHub Actions bot that auto-triages new issues directly inside GitHub**. The UI still has some legacy `Synapse` naming, but the product behavior is OpenIssue triage.

## What is integrated right now

- Frontend (Next.js) repository viewer with issue selection and an in-page `AnalyzePanel`
- Backend (FastAPI) triage endpoints:
  - `GET /api/issues`
  - `POST /api/similar-issues`
  - `POST /api/classification`
  - `POST /api/analyze`
  - `POST /api/vectors/index`
  - `POST /api/vectors/query`
- Local, open-source embedding + vector setup:
  - `sentence-transformers/all-MiniLM-L6-v2`
  - SQLite-backed local vector store
- **GitHub Actions triage bot** (`bot/triage_bot.py` + `.github/workflows/triage.yml`):
  - Triggers automatically on `issues: [opened]`
  - Posts a structured markdown triage report as a comment on the new issue
  - Auto-applies suggested labels via the GitHub REST API
  - Runs in **API mode** when `SYNAPSE_API_URL` is set (calls `POST /api/analyze`)
  - Falls back to **keyword mock mode** (no backend required) when the secret is absent or the request fails
  - Zero external dependencies in mock mode — runs entirely inside the GitHub Actions runner

## GitHub Actions Bot

### How it works

When a new issue is opened on any repository where this workflow is installed, the bot:

1. Reads the issue title, body, labels, and state from the GitHub event payload
2. If `SYNAPSE_API_URL` is configured, calls `POST {SYNAPSE_API_URL}/api/analyze` with a `NormalizedIssueInput`-shaped payload
3. If the API is unavailable or the secret is absent, falls back to local keyword-based mock triage
4. Posts a structured markdown comment with the triage report on the issue
5. Applies the suggested labels to the issue via the GitHub REST API (non-fatal if labels do not exist in the repo yet)

### Bot modes

| Mode | When active | Dependencies |
|---|---|---|
| **API mode** | `SYNAPSE_API_URL` secret is set and backend is reachable | Deployed OpenIssue backend |
| **Keyword mock mode** | Secret absent or API request fails | None — pure Python stdlib |

### Triage report structure

The bot posts a markdown comment with the following sections:

- **Classification** — predicted issue type, confidence percentage, duplicate likelihood
- **Priority reasoning** — plain-language explanation of the priority score
- **Suggested Labels** — labels applied directly to the issue
- **Possible Duplicates** — similar issues by number and similarity percentage (API mode only)
- **Missing Information** — checklist of what the reporter should add (e.g. reproduction steps, environment info)
- **Summary** — one-line explanation of the overall triage result

### Bot setup

#### 1. Add the workflow secret (optional but recommended)

In your repository go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `SYNAPSE_API_URL` | Your deployed backend URL, e.g. `https://your-api.example.com` |

If you skip this step the bot still runs in keyword mock mode.

#### 2. The workflow file

The workflow is already present at `.github/workflows/triage.yml` and triggers on every new issue automatically. No further configuration is required beyond the optional secret above.

#### 3. Required permissions

The workflow requests `issues: write` permission, which allows it to post comments and apply labels. This is declared in the workflow file and requires no manual configuration.

### Request body sent to `/api/analyze`

```json
{
  "owner": "<repo owner>",
  "repo": "<repo name>",
  "token": "<GITHUB_TOKEN passed through>",
  "k": 5,
  "state": "all",
  "include_pull_requests": false,
  "target_issue": {
    "number": 42,
    "title": "Issue title",
    "body": "Issue body",
    "labels": [],
    "state": "open"
  }
}
```

### Expected response shape (`TriageResult`)

The bot normalises both the canonical nested `AnalyzeResponse` and a legacy flat triage payload. Required fields:

```json
{
  "predicted_type": "bug",
  "type_confidence": 0.91,
  "priority_score": 7,
  "priority_band": "high",
  "priority_reasons": ["..."],
  "duplicate_confidence": 0.0,
  "similar_issues": [],
  "suggested_labels": ["bug", "needs-repro"],
  "missing_information": ["Steps to reproduce", "Version / environment info"],
  "summary": "...",
  "analysis_version": "w4-analyze-v1"
}
```

### Bot file locations

| File | Purpose |
|---|---|
| `bot/triage_bot.py` | Main bot script — GitHub API calls, mock triage, markdown rendering |
| `.github/workflows/triage.yml` | GitHub Actions workflow definition |

---

## Architecture (current repo state)

### Frontend (`frontend/`)
- Next.js app (JavaScript + Tailwind)
- Main page: `frontend/pages/index.js`
- Analysis UI is integrated into the existing homepage shell via `frontend/components/AnalyzePanel.js`

### Backend (`services/api/`)
- FastAPI service with route wiring in `services/api/app/api/router.py`
- GitHub ingestion client in `services/api/app/github/client.py`
- Analysis orchestration in `services/api/app/services/analyze.py`
- Similarity reranking in `services/api/app/services/similar_issues.py`
- Classification + label heuristics in `services/api/app/services/classification.py`

### Bot (`bot/`)
- Standalone Python script with no third-party dependencies
- Communicates with the GitHub REST API using only the Python stdlib (`urllib.request`)
- Communicates with the OpenIssue backend over HTTP when `SYNAPSE_API_URL` is set
- Normalises both canonical `AnalyzeResponse` (nested sections) and legacy flat triage payloads

### Data/control flow
1. Frontend fetches repo metadata, owner, commits, and PRs directly from GitHub.
2. Frontend fetches normalized issues from backend `GET /api/issues`.
3. User selects an issue in `IssuesCard`.
4. Frontend calls backend `POST /api/analyze` with repo + `issue_number`.
5. Backend analyze service composes:
   - semantic retrieval + reranking (`similar_issues`)
   - lexical-first classification + label suggestions (`classification`)
   - deterministic priority + missing-info synthesis (`analyze` service)
6. Frontend maps the canonical analyze payload and renders sections in `AnalyzePanel`.
7. *(Bot flow)* GitHub Actions triggers on new issue → bot calls the same `POST /api/analyze` endpoint → posts triage comment + applies labels directly on GitHub.

## Triage pipeline details

### 1) Ingestion and normalization
- GitHub issues are fetched via REST API.
- Pull requests are excluded by default unless explicitly requested.
- Issues are normalized into stable fields and canonical text (`title + body`).

### 2) Retrieval and reranking
- MiniLM embeddings are used to index/query local vectors.
- Top candidates are retrieved semantically, then reranked using explainable signals:
  - title/body token overlap
  - error/exception token overlap
  - file/module/version overlap
  - label overlap
  - state/recency adjustments

### 3) Classification and labels
- Lexical-first heuristics predict issue type:
  - `bug`, `feature_request`, `documentation`, `support_question`, `spam_or_noise`
- Neighbor evidence can influence label hints, while type remains lexical-first for stability.

### 4) Priority and missing information
- Priority score is derived from explicit signals (severity/failure/duplicate density/type cues).
- Missing-info detection checks for gaps like reproduction steps, expected vs actual behavior, logs, and environment/version details.

### 5) Explainable output
- `POST /api/analyze` returns a canonical nested response with reasons in each section.
- Frontend displays these reasons directly instead of only showing opaque scores.
- The bot renders the same reasons as plain markdown in the GitHub issue comment.

## Honest product notes

- The analytics/suggestions experience is integrated into the existing homepage (not a separate app/page).
- Repo metadata, commits, and PRs still come directly from GitHub in the frontend.
- Issues + analyze flow are backend-driven.
- If backend issue fetch fails, frontend falls back to direct GitHub issue fetch.
- GitHub token is currently stored in browser `localStorage` for demo convenience.
- The bot uses the `GITHUB_TOKEN` automatically provided by GitHub Actions — no extra token setup is needed for posting comments and applying labels.

## Prerequisites

- Node.js 18+
- npm 9+
- Python 3.10+

## Setup

### 1) Backend setup (`services/api`)

```bash
cd services/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend health check:

```bash
curl http://127.0.0.1:8000/api/health
```

### 2) Frontend setup (`frontend`)

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Then run:

```bash
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

### 3) Bot setup

No local setup required. The bot runs entirely inside GitHub Actions. See the **GitHub Actions Bot** section above for configuration details.

## Environment variables

### Backend (`services/api/.env`)

Use `services/api/.env.example` as the base.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `OPENISSUE_API_NAME` | no | `OpenIssue API` | FastAPI title |
| `OPENISSUE_API_VERSION` | no | `0.1.0` | API version |
| `OPENISSUE_API_ENV` | no | `development` | Environment label |
| `OPENISSUE_API_HOST` | no | `0.0.0.0` | Uvicorn host |
| `OPENISSUE_API_PORT` | no | `8000` | Uvicorn port |
| `OPENISSUE_API_LOG_LEVEL` | no | `info` | Log level |
| `OPENISSUE_API_PREFIX` | no | `/api` | API route prefix |
| `OPENISSUE_GITHUB_API_BASE_URL` | no | `https://api.github.com` | GitHub API base URL |
| `OPENISSUE_GITHUB_TIMEOUT_SECONDS` | no | `20.0` | GitHub request timeout |
| `OPENISSUE_GITHUB_TOKEN` | no | _empty_ | Optional GitHub token |
| `OPENISSUE_EMBEDDING_PROVIDER` | no | `minilm-local` | Embedding provider selector |
| `OPENISSUE_EMBEDDING_MODEL_NAME` | no | `sentence-transformers/all-MiniLM-L6-v2` | Embedding model |
| `OPENISSUE_EMBEDDING_VECTOR_DIM` | no | `256` | Vector dimension for hashing provider / signature |
| `OPENISSUE_VECTOR_STORE_PROVIDER` | no | `sqlite-local` | Vector store provider |
| `OPENISSUE_VECTOR_STORE_PATH` | no | `.openissue/openissue_vectors.db` | SQLite vector DB path |
| `OPENISSUE_CORS_ALLOWED_ORIGINS` | no | JSON list of localhost origins | CORS allowlist |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | recommended | _empty_ | Backend base URL; when empty, frontend calls same-origin `/api/*` |

### GitHub Actions bot (repository secrets)

| Secret | Required | Purpose |
|---|---|---|
| `SYNAPSE_API_URL` | no | Deployed backend URL; when absent the bot runs in keyword mock mode |

## Demo path (for judges/reviewers)

### Web app

1. Start backend and frontend using the setup steps above.
2. Open the app and press `Ctrl+K`.
3. Search a repo like `vercel/next.js` or `facebook/react`.
4. (Optional) Paste a GitHub token in the left sidebar to reduce rate-limit failures.
5. Wait for cards to load; open/closed issues appear in `IssuesCard`.
6. Click any issue to trigger analysis.
7. Review the integrated `AnalyzePanel` sections:
   - predicted type
   - suggested labels
   - priority
   - duplicate candidates
   - missing information
   - explanation

### GitHub Actions bot

1. Open any issue in this repository (or a fork with the workflow installed).
2. Within seconds, the `github-actions` bot posts a **Synapse Triage Report** comment.
3. Suggested labels are automatically applied to the issue.
4. If `SYNAPSE_API_URL` is configured, the report includes live duplicate candidates from the backend.

## Useful validation commands

From `frontend/`:

```bash
npm run test:contract
npm run lint
npm run build
```

From `services/api/`:

```bash
python3 -m compileall app
```
