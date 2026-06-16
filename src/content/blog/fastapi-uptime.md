---
title: "FastAPI ile Hafif Bir Uptime Monitör"
description: "SQLite ve async task'lerle minimal bir self-hosted izleme aracı."
pubDate: 2026-05-22
tags: ["fastapi", "python", "self-hosted"]
---

Observer Lite, harici bağımlılık olmadan servislerin ayakta olup olmadığını
kontrol eden minimal bir araç. Çekirdek mantık birkaç satır:

```python
import httpx
from datetime import datetime

async def check(url: str) -> dict:
    async with httpx.AsyncClient(timeout=5) as client:
        try:
            r = await client.get(url)
            return {"url": url, "status": r.status_code, "up": r.is_success}
        except httpx.RequestError:
            return {"url": url, "status": None, "up": False}
```

Sonuçları SQLite'a yazıp Vue 3 tarafında basit bir tablo ile gösteriyoruz. Tüm
stack tek bir Docker image'ında paketleniyor.

## Neden SQLite?

Tek kullanıcılı, düşük yazma yüklü bir senaryoda PostgreSQL kurmak gereksiz.
SQLite dosya tabanlı çalışır, yedeklemesi `cp` kadar basittir.
