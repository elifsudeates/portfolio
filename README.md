# Portfolyo — Astro + K3s

Astro ile oluşturulmuş statik portfolyo ve blog sitesi. Markdown blog
yazıları, kapak görselleri, GitHub repolarından otomatik proje sayfaları,
CV/yetenek grid'i, açık/koyu tema ve Shiki kod renklendirme desteği içerir.

## Özellikler

- `src/content/blog/` altında Markdown/MDX blog içerikleri
- Blog kartları ve yazı detaylarında kapak görselleri
- GitHub repolarını build sırasında çekip `/projects` altında listeleme
- Logo + isim gösteren CV yetenek grid'i
- Açık/koyu tema toggle'ı
- Docker + Nginx ile statik servis
- GitHub Actions ile GHCR image build/push
- K3s üzerinde Traefik, cert-manager ve Keel ile otomatik yayın

## Hızlı başlangıç

```bash
npm install
npm run dev      # http://localhost:4321
npm run build
```

## Blog yazısı ekleme

`src/content/blog/` altına yeni bir `.md` veya `.mdx` dosyası oluştur. Dosya
adı URL slug olur.

```markdown
---
title: "Başlık"
description: "Kısa açıklama"
pubDate: 2026-06-16
tags: ["kubernetes", "devops"]
cover:
  src: "/blog/covers/yazi-kapagi.jpg"
  alt: "Yazı kapağını açıklayan erişilebilir metin"
---

İçerik buraya. Kod blokları otomatik renklenir:

​```python
print("merhaba")
​```
```

Kapak görsellerini `public/blog/covers/` altına koy. Yazı içi görseller için
`public/blog/` altında dosya tutup Markdown içinde kökten mutlak path kullan:

```markdown
![açıklama](/blog/dosya-adi.png)
```

`draft: true` eklenen yazılar build'e ve liste sayfalarına girmez.

## CV yetenekleri

Yetenekler [src/pages/cv.astro](src/pages/cv.astro) içinde `skillCategories`
listesinden yönetilir. Her yetenek logo/mark kutusu ve altında isim olarak
gösterilir.

```ts
skill("Kubernetes", skillIcon("kubernetes"))
skill("Helm", simpleIcon("helm"))
skill("Certificate Automation")
```

`skillIcon()` `skillicons.dev`, `simpleIcon()` ise `simpleicons.org` CDN'ini
kullanır. Logo bulunamazsa veya ikon servisi cevap vermezse kart otomatik
olarak yetenek adından üretilen monogram rozete düşer.

## Projeler

`/projects` sayfası GitHub repolarını build sırasında API'den çeker.
[src/lib/github.ts](src/lib/github.ts) içindeki `USERNAME` değeri hedef GitHub
kullanıcısını belirler. Her repo için README içeriğiyle birlikte otomatik detay
sayfası üretilir.

CI build'lerinde `GITHUB_TOKEN` Docker build arg olarak geçilir; böylece GitHub
API rate limit'i daha rahat aşılır. Ayrıca workflow her gün 06:00 UTC'de tekrar
çalışır, bu sayede yeni GitHub repoları kod değişmeden de siteye yansır.

## Yapı

```text
public/
  blog/
    covers/       -> blog kapak görselleri
src/
  content/blog/   -> Markdown/MDX blog yazıları
  pages/
    index.astro   -> ana sayfa
    blog/         -> blog liste + [slug] detay
    projects/     -> proje liste + [name] detay
    cv.astro      -> CV ve yetenekler
  layouts/        -> ortak sayfa şablonu
  components/     -> kart bileşenleri
  lib/github.ts   -> GitHub API entegrasyonu
  styles/         -> global tasarım
k8s/              -> K3s Deployment, Service, Ingress manifestleri
```

## Deployment

Akış:

```text
git push
  -> GitHub Actions Docker image build eder
  -> image GHCR'a latest ve commit SHA tag'leriyle push edilir
  -> Keel GHCR'daki latest digest değişimini poll eder
  -> K3s Deployment otomatik güncellenir
```

Sunucuya GitHub tarafından inbound erişim gerekmez. SSH key, kubeconfig veya
k8s API token'ı GitHub'a eklenmez; Keel cluster içinde çalışır ve dışa doğru
GHCR'ı kontrol eder.

### Tek seferlik K3s kurulumu

Private GHCR image'ı çekmek için secret oluştur:

```bash
kubectl create namespace portfolio
kubectl create secret docker-registry ghcr-secret \
  --namespace portfolio \
  --docker-server=ghcr.io \
  --docker-username=cagatayuresin \
  --docker-password=<GITHUB_PAT>
```

Keel'i kur:

```bash
helm repo add keel https://charts.keel.sh
helm repo update
helm upgrade --install keel keel/keel --namespace keel --create-namespace \
  --set helmProvider.enabled=false
```

Manifestleri uygula:

```bash
kubectl apply -k k8s/
```

Ingress `cagatayuresin.com` ve `www.cagatayuresin.com` için Traefik üzerinden
yayın yapar; TLS sertifikası `letsencrypt-prod` ClusterIssuer ile cert-manager
tarafından alınır. Farklı domain veya issuer kullanacaksan
[k8s/ingress.yaml](k8s/ingress.yaml) dosyasını güncelle.

## Lokalde Docker testi

```bash
docker build -t portfolio:test .
docker run -p 8080:80 portfolio:test
```

Site: `http://localhost:8080`
