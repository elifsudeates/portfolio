# Portfolyo — Astro + K3s

Markdown ile blog yazıp GitHub repolarını otomatik gösteren statik portfolyo.
Kod blokları Shiki ile renklendirilir. Açık/koyu tema desteği var.

## Hızlı başlangıç

```bash
npm install
npm run dev      # http://localhost:4321
```

## Yeni blog yazısı ekleme

`src/content/blog/` altına yeni bir `.md` dosyası oluştur (dosya adı = URL slug):

```markdown
---
title: "Başlık"
description: "Kısa açıklama"
pubDate: 2026-06-16
tags: ["kubernetes", "devops"]
---

İçerik buraya. Kod blokları otomatik renklenir:

​```python
print("merhaba")
​```
```

Görsel kullanacaksan `public/blog/` altına koy, yazı içinde kökten mutlak
path ile referans ver: `![açıklama](/blog/dosya-adi.png)`.

Kaydet, `git push` et — gerisi otomatik: CI image'ı build edip GHCR'a atar,
Keel cluster'daki Deployment'ı ~1 dakika içinde günceller.

## Projeler

`/projects` sayfası GitHub repolarını **build sırasında** API'den çeker.
`src/lib/github.ts` içindeki `USERNAME` değişkenini kendi kullanıcı adınla
değiştir. Her repo için otomatik detay sayfası (README dahil) üretilir.

## Yapı

```text
src/
  content/blog/      → Markdown yazılar (sen buraya yazıyorsun)
  pages/
    index.astro      → ana sayfa
    blog/            → blog liste + [slug] detay
    projects/        → proje liste + [name] detay
  layouts/Base.astro → ortak şablon (header, tema toggle, footer)
  components/        → kart bileşenleri
  lib/github.ts      → GitHub API'den repo çekme
  styles/global.css  → tüm tasarım
```

## Deployment (K3s + Keel — ArgoCD yok)

Akış: `git push` → GitHub Actions image'ı build edip GHCR'a atar → cluster
içinde çalışan **Keel**, GHCR'ı periyodik kontrol edip yeni digest'i görünce
Deployment'ı otomatik günceller. Sunucuya internetten ulaşan hiçbir şey yok
(SSH yok, k8s API dışarı açık değil) — Keel sadece dışa doğru GHCR'a istek
atıyor.

### Tek seferlik kurulum (uzak k3s sunucusunda)

1. **GHCR pull secret'ı oluştur** (repo private ise gerekli):

   ```bash
   kubectl create namespace portfolio
   kubectl create secret docker-registry ghcr-secret \
     --namespace portfolio \
     --docker-server=ghcr.io \
     --docker-username=cagatayuresin \
     --docker-password=<GITHUB_PAT>
   ```

   Bu komutu sadece sunucuda elle çalıştır — `<GITHUB_PAT>` hiçbir zaman
   git'e veya GitHub Actions secrets'a girmiyor, sadece cluster'da bir
   Secret objesi olarak duruyor.

2. **Keel'i kur** (registry'yi izleyip Deployment'ı güncelleyen operator):

   ```bash
   helm repo add keel https://charts.keel.sh
   helm repo update
   helm upgrade --install keel keel/keel --namespace keel --create-namespace \
     --set helmProvider.enabled=false
   ```

3. **`k8s/ingress.yaml`'i kendi cert-manager `ClusterIssuer` adınla
   güncelle** (`<cluster-issuer-adın>` placeholder'ını değiştir, örn.
   `letsencrypt-prod`). Domain `cagatayuresin.com` olarak ayarlı; farklıysa
   `host` ve `tls.hosts` alanlarını güncelle.

4. **Uygulamayı uygula**:

   ```bash
   kubectl apply -k k8s/
   ```

   Bu, `portfolio` namespace'i içine Deployment + Service + Ingress'i
   oluşturur. `k8s/deployment.yaml` içindeki `keel.sh/*` annotation'ları
   Keel'e bu Deployment'ı izlemesini söylüyor; private registry için
   pod'un kendi `imagePullSecrets`'ı (yukarıda oluşturduğun `ghcr-secret`)
   Keel tarafından otomatik kullanılır, ek bir kimlik bilgisi vermen
   gerekmez. Ingress, k3s'in varsayılan **Traefik** controller'ı üzerinden
   domain'e bağlanıp cert-manager ile otomatik TLS sertifikası alır.

Bundan sonra her `git push` otomatik olarak siteye yansır — sunucuda elle
yapman gereken hiçbir şey kalmıyor.

### Şifreler/secrets nerede duruyor?

- **GHCR'a image push** için kullanılan token: `secrets.GITHUB_TOKEN` —
  GitHub Actions'ın otomatik ürettiği, repoya hiç yazılmayan, her run'da
  yenilenen geçici bir token (`.github/workflows/build.yaml`).
- **README/repo çekme** için aynı `GITHUB_TOKEN`, build-arg olarak image'a
  geçiyor; bu da Actions secrets store'unda kalıyor, repoya yazılmıyor.
- **`ghcr-secret`** (cluster'ın private image'ı çekebilmesi için): sadece
  sunucuda `kubectl create secret` ile oluşturuluyor, hiçbir manifest'te
  düz metin olarak yer almıyor, git'e hiç girmiyor.
- Bu kurulumda GitHub'a **kubeconfig, SSH key veya k8s API token'ı**
  eklemen gerekmiyor — Keel cluster içinde çalıştığı için GitHub'ın
  sunucuna erişmesine hiç ihtiyaç yok.

### Lokalde Docker testi

```bash
docker build -t portfolio:test .
docker run -p 8080:80 portfolio:test   # http://localhost:8080
```
