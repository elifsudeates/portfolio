---
title: "Observer Lite: Self-Host It, Watch Everything"
description: "An open-source, self-hosted uptime monitor in a single Docker image."
pubDate: 2026-05-06
tags: ["self-hosted", "fastapi", "python", "monitoring"]
---

While working as both a DevOps engineer and an SRE in production environments, I kept running into the same gap: most uptime monitoring tools on the market are either expensive, dependent on an external database, or far more complicated to set up than they need to be. To close that gap I built **Observer Lite** — a self-hosted uptime monitor.

![Observer Lite dashboard](/blog/observer-lite-dashboard.png)

**Observer Lite** runs from a single Docker image, is backed by SQLite, and is entirely self-hosted. It was designed to be production-ready out of the box: email and Telegram notifications, a real-time dashboard, SSL certificate tracking, API management, and a multi-user role system.

> It's still early in real-world testing, so unexpected bugs are likely. The current release is 0.2.0 — not yet mature. Once stability is confirmed, the focus will shift to security hardening.

#### What can you monitor?

| Monitor type | Use case |
|---|---|
| **HTTP GET / POST / HEAD** | Websites, APIs, webhooks |
| **Ping (ICMP)** | Servers, internal network components |
| **SSL certificate** | Certificate validity and expiry date |
| **Heartbeat (push-based)** | Cron jobs, workers, batch processes |

---

#### Highlights

**Status Code DSL** — Flexible status-code expressions: patterns like `2xx`, `!5xx`, `200|301`, `2xx|!503` let you write a rule for any scenario.

**Real-time dashboard** — A lightweight dashboard built on **Server-Sent Events (SSE)**, not WebSockets. No extra complexity.

**Incident state machine** — Once the configured retry count is hit, an incident opens; it auto-closes on recovery, sending both down and recovery notifications.

**Maintenance windows** — Suppress alerts during planned maintenance, with cron-based recurrence support.

**Security** — bcrypt password hashing, 15-minute JWT access tokens + 30-day refresh tokens, SHA-256-hashed API keys, SMTP/Telegram secrets encrypted with AES-128-CBC (Fernet), and login rate limiting.

**Single image, zero dependencies** — Backend, frontend build, scheduler, and migrations all ship in one Docker image. No external database server required.

---

#### Tech stack

**Backend:** Python 3.12 + FastAPI + SQLAlchemy 2.0 (async) + APScheduler + aiosmtplib

**Frontend:** Vue 3 + Vite + Tailwind CSS + Pinia + uPlot (a 40 KB lightweight charting library)

**Database:** SQLite (WAL mode, foreign key enforcement)

**CI/CD:** GitHub Actions → GHCR (lint → test → build → publish)

---

#### Up and running in 5 minutes

```bash
docker run -d \
  --name observer-lite \
  --restart unless-stopped \
  -p 3000:3000 \
  -v observer_data:/data \
  -e SECRET_KEY="$(openssl rand -hex 32)" \
  -e DATABASE_PATH="/data/observer.db" \
  -e DATABASE_URL="sqlite+aiosqlite:////data/observer.db" \
  ghcr.io/cagatayuresin/observer-lite:latest
```

Open `http://localhost:3000`, sign in with `admin` / `admin`, change your password — that's it.

---

#### What I learned

The hardest part of building this was correctly handling the **single-worker constraint** imposed by the process-local singleton design of APScheduler and the SSE broadcaster. That limit on horizontal scaling, combined with SQLite's single-file nature, meant accepting some real trade-offs in the system design — but for a lightweight, self-hosted use case, it's a perfectly reasonable choice.

Keeping test coverage above 80%, correctly setting up async tests with `pytest-asyncio`, and mocking APScheduler to isolate it from production were also a serious learning exercise.

---

#### Links

- 🔗 **GitHub:** [github.com/cagatayuresin/observer-lite](https://github.com/cagatayuresin/observer-lite)
- 🐳 **Docker image:** `ghcr.io/cagatayuresin/observer-lite:latest`
- 📖 **Docs:** [cagatayuresin.github.io/observer-lite](https://cagatayuresin.github.io/observer-lite)

---

> Observer Lite is released under the MIT license. Contributions, stars, and feedback are always welcome.
