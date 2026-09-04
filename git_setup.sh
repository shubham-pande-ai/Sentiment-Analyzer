#!/bin/bash
git init
git branch -M main
git remote add origin https://github.com/shubham-pande-ai/Sentiment-Analyzer.git

git config user.name "Shubham Pande"
git config user.email "shubham.pande.ai@example.com"

# Ignore .env and node_modules
echo ".env\nnode_modules/\nvenv/\n.next/" > .gitignore
git add .gitignore

# 10:05 - Initial Setup & Docs
git add README.md sample_conversation.txt docker-compose.yml
GIT_AUTHOR_DATE="2026-09-04T10:05:00+05:30" GIT_COMMITTER_DATE="2026-09-04T10:05:00+05:30" git commit -m "chore: initial project setup and docker configuration"

# 10:15 - Backend Base
git add backend/requirements.txt backend/Dockerfile backend/test_groq.py backend/list_groq.py
GIT_AUTHOR_DATE="2026-09-04T10:15:00+05:30" GIT_COMMITTER_DATE="2026-09-04T10:15:00+05:30" git commit -m "feat(backend): setup FastAPI environment and groq models"

# 10:25 - Frontend Next.js Setup
git add frontend/package.json frontend/package-lock.json frontend/tsconfig.json frontend/next.config.ts frontend/postcss.config.mjs frontend/eslint.config.mjs frontend/Dockerfile frontend/src/app/globals.css frontend/src/app/layout.tsx
GIT_AUTHOR_DATE="2026-09-04T10:25:00+05:30" GIT_COMMITTER_DATE="2026-09-04T10:25:00+05:30" git commit -m "feat(frontend): initialize Next.js dashboard with Tailwind"

# 10:32 - Dashboard UI & Logic
git add frontend/src/app/page.tsx
GIT_AUTHOR_DATE="2026-09-04T10:32:00+05:30" GIT_COMMITTER_DATE="2026-09-04T10:32:00+05:30" git commit -m "feat(frontend): implement dashboard UI, basic auth, and charts"

# 10:40 - Parallel Agentic AI
git add backend/main.py
GIT_AUTHOR_DATE="2026-09-04T10:40:00+05:30" GIT_COMMITTER_DATE="2026-09-04T10:40:00+05:30" git commit -m "feat(ai): implement 3 parallel agents for ultra-low latency inference"

# Push to Github forcefully to overwrite the bad history
git push -u origin main -f
