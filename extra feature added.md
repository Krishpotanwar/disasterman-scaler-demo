# Extra Feature Added

## What was added
- Leaflet-based Bengaluru live disaster map
- SSE streaming endpoint for live simulation thinking flow
- 4-stage pipeline visualization (PyTorch -> Triage -> Planner -> Action)
- Recruiter-facing Copilot Q&A panel
- Zustand real-time stream store

## Deployment targets
- Isolated GitHub repo: https://github.com/Krishpotanwar/disasterman-scaler-demo
- Isolated Hugging Face Space: https://krishpotanwar-disasterman-scaler-demo.hf.space
- Isolated Vercel app: https://disasterman-scaler-demo.vercel.app

## Notes
This log was created on request to track extra features added in this session.

## Detailed Session Log

### 2026-04-01 05:10:37 IST — Milestone 1: Backend Bengaluru live demo pipeline
- Backend changes:
  - Added `demo_models.py` with separate demo-only contracts (`DemoScenarioSummary`, `DemoScenarioDetail`, `DemoRunResult`, `DemoStep`, `DemoMapState`, `DemoResourceMovement`, `DemoMapOverlay`).
  - Added `demo_scenarios.py` with exactly three curated Bengaluru scenarios: `bellandur_flood_response`, `peenya_industrial_fire`, and `whitefield_building_collapse`.
  - Added `demo_runner.py` with a dedicated `DemoDisasterEnv`, backend-authored map state, resource positions, route movement payloads, and deterministic 4-stage fallback reasoning for `ai_4stage` when API keys are missing.
  - Added separate demo endpoints in `main.py`: `GET /demo/scenarios`, `POST /demo/run/{scenario_id}`, `GET /demo/stream/{scenario_id}`, plus `/api/demo/*` aliases.
- Frontend changes: none in this milestone.
- Deploy changes: none in this milestone.
- Verification performed:
  - Local smoke test: `run_demo_scenario('bellandur_flood_response', 'greedy')`
  - FastAPI TestClient checks for `/demo/scenarios` and `/demo/run/bellandur_flood_response`
- Current live URLs/status:
  - Isolated GitHub repo: https://github.com/Krishpotanwar/disasterman-scaler-demo — local implementation completed in workspace, not pushed in this session.
  - Isolated Hugging Face Space: https://krishpotanwar-disasterman-scaler-demo.hf.space — target backend URL identified, deployment not updated in this session.
  - Isolated Vercel app: https://disasterman-scaler-demo.vercel.app — target frontend URL identified, deployment not updated in this session.
- Known issues/open follow-ups:
  - If `GROQ_API_KEY` or `OPENAI_API_KEY` is absent, demo `ai_4stage` intentionally runs deterministic fallback reasoning instead of live LLM calls so the reviewer demo still works.

### 2026-04-01 05:10:37 IST — Milestone 2: Leaflet reviewer-facing frontend
- Backend changes:
  - No new backend routes added in this milestone; frontend consumed the previously added `/demo/*` APIs.
- Frontend changes:
  - Added a new top-level `Live Demo` tab in `frontend/src/App.tsx`.
  - Added `frontend/src/components/LiveDemoTab.tsx` with scenario cards, agent selector, run controls, step scrubber, replay controls, live stage timeline support, and automatic SSE-to-HTTP replay fallback.
  - Added `frontend/src/components/LeafletDemoMap.tsx` using real Leaflet tiles for Bengaluru, curated route polylines, scenario overlays, active target highlighting, resource markers, and animated movement markers.
  - Expanded `frontend/src/types.ts` with demo interfaces and expanded `frontend/src/api/client.ts` with demo catalog/run/stream helpers.
  - Restored Leaflet CSS in `frontend/src/index.css`.
- Deploy changes: none in this milestone.
- Verification performed:
  - `npm run lint`
  - `npm run build`
- Current live URLs/status:
  - Isolated GitHub repo: https://github.com/Krishpotanwar/disasterman-scaler-demo — code prepared locally, not pushed in this session.
  - Isolated Hugging Face Space: https://krishpotanwar-disasterman-scaler-demo.hf.space — expected backend target for the new frontend wiring.
  - Isolated Vercel app: https://disasterman-scaler-demo.vercel.app — expected frontend target once pushed/deployed.
- Known issues/open follow-ups:
  - Production build emits a large-chunk warning from Vite because the map/demo code adds bundle weight, but the build still succeeds.

### 2026-04-01 05:10:37 IST — Milestone 3: Isolated deployment wiring
- Backend changes: none in this milestone.
- Frontend changes:
  - Updated `frontend/vercel.json` so `/api/*` now proxies to `https://krishpotanwar-disasterman-scaler-demo.hf.space/*` instead of the main HF backend.
  - Updated app header links to point at the isolated repo and isolated HF docs.
- Deploy changes:
  - Deployment targets were rewired in config only.
  - No push, merge, or deployment command was run in this session.
- Verification performed:
  - Confirmed the new Vercel rewrite target locally in `frontend/vercel.json`.
- Current live URLs/status:
  - Isolated GitHub repo: https://github.com/Krishpotanwar/disasterman-scaler-demo — config-ready, no push in this session.
  - Isolated Hugging Face Space: https://krishpotanwar-disasterman-scaler-demo.hf.space — configured as proxy destination.
  - Isolated Vercel app: https://disasterman-scaler-demo.vercel.app — configured as intended deployment surface.
- Known issues/open follow-ups:
  - Live URLs will not reflect these changes until the isolated remotes are pushed and deployed.

### 2026-04-01 05:10:37 IST — Milestone 4: Verification sweep
- Backend changes:
  - Added live demo regression checks to `test_env.py` covering scenario registry shape, `/demo/scenarios`, `/demo/run`, stream event ordering via `iter_demo_events`, and schema stability across `ai_4stage`, `greedy`, and `random`.
- Frontend changes: none beyond those already listed above.
- Deploy changes: none.
- Verification performed:
  - `python3 test_env.py` → `124/124 passed`
  - `npm run lint` → passed
  - `npm run build` → passed
  - FastAPI SSE smoke test for `/demo/stream/peenya_industrial_fire?agent=greedy` → event order observed as `meta`, `stage`, `stage`, `stage`, `stage`, `step`, ... `done`
- Current live URLs/status:
  - Isolated GitHub repo: https://github.com/Krishpotanwar/disasterman-scaler-demo — verified locally only.
  - Isolated Hugging Face Space: https://krishpotanwar-disasterman-scaler-demo.hf.space — not redeployed from this session.
  - Isolated Vercel app: https://disasterman-scaler-demo.vercel.app — not redeployed from this session.
- Known issues/open follow-ups:
  - No deployment/push was performed in this session because isolated-first implementation was completed locally and awaits your explicit go-ahead for publishing.
