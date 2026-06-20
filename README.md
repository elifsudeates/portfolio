# Elif Sude Ateş Portfolio

<p align="center">
  <a href="https://elifsudeates.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="public/logo-readme-dark.png" />
      <img src="public/logo.png" alt="Elif Sude Ateş portfolio logo" width="96" />
    </picture>
  </a>
</p>

<p align="center">
  <a href="https://elifsudeates.com">
    <img alt="Website" src="https://img.shields.io/badge/website-elifsudeates.com-088395?style=flat-square" />
  </a>
  <a href="https://github.com/elifsudeates/portfolio/actions/workflows/build.yaml">
    <img alt="Build and Push" src="https://github.com/elifsudeates/portfolio/actions/workflows/build.yaml/badge.svg" />
  </a>
  <a href="https://github.com/users/elifsudeates/packages/container/package/portfolio">
    <img alt="GHCR image" src="https://img.shields.io/badge/container-GHCR-088395?style=flat-square&logo=docker&logoColor=white" />
  </a>
  <img alt="Astro" src="https://img.shields.io/badge/Astro-static_site-BC52EE?style=flat-square&logo=astro&logoColor=white" />
  <img alt="Kubernetes" src="https://img.shields.io/badge/deploy-K3s_%2B_Keel-326CE5?style=flat-square&logo=kubernetes&logoColor=white" />
</p>

Static portfolio and technical blog built with Astro, packaged as a Docker
image, and deployed to K3s with automated image updates through Keel.

- Live site: [elifsudeates.com](https://elifsudeates.com)
- Container package: [ghcr.io/elifsudeates/portfolio](https://github.com/users/elifsudeates/packages/container/package/portfolio)
- Container image: `ghcr.io/elifsudeates/portfolio:latest`

## What It Includes

- Markdown blog powered by Astro Content Collections
- SEO-ready article pages with canonical URLs, Open Graph, Twitter cards,
  image alt text, article metadata, JSON-LD, sitemap, and `robots.txt`
- Blog cover images shown on the home page, blog listing, and article pages
- Project pages generated from GitHub repositories and README content
- Copy buttons for code blocks in blog posts and project README pages
- CV page with local Tabler SVG skill icons and readable skill labels
- Local Inter Variable font via `@fontsource-variable/inter`
- Light/dark theme support with Shiki dual-theme code highlighting
- Docker/Nginx static serving
- GitHub Actions image build and push to GHCR
- K3s deployment with Traefik Ingress, cert-manager TLS, and Keel polling

## Stack

```text
Astro 6
Astro Content Collections
Marked for GitHub README rendering
Shiki syntax highlighting
Tabler Icons from local package files
Inter Variable from local package files
Docker + Nginx
GitHub Actions + GHCR
K3s + Traefik + cert-manager + Keel
```

## Local Development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build
npm run preview
```

The project expects Node.js `>=22.12.0`.

## Blog Posts

Add a new `.md` or `.mdx` file under `src/content/blog/`. The file name becomes
the URL slug.

~~~markdown
---
title: "SEO-friendly post title"
description: "A clear search and social summary under roughly 155 characters."
pubDate: 2026-06-18
tags: ["kubernetes", "devops"]
cover:
  src: "/blog/covers/example-cover.jpg"
  alt: "Accessible description of the cover image"
---

Post content goes here.

```bash
echo "Code blocks get copy buttons automatically"
```
~~~

Cover images live in `public/blog/covers/`. Use `draft: true` for unpublished
posts. Future content, SEO, and cover-image standards are documented in
[META.md](META.md).

## Projects

The `/projects` route fetches GitHub repositories during build time. The target
GitHub user is configured in [src/lib/github.ts](src/lib/github.ts).

Each project detail page is generated from repository metadata and README
content. Code blocks inside rendered README content receive the same copy-button
treatment as blog posts.

CI passes `GITHUB_TOKEN` as a Docker build argument so GitHub API rate limits are
less restrictive during production builds. The workflow also runs daily at
06:00 UTC, which lets newly published repositories appear without changing the
site code.

## CV Skills and Icons

CV skills are managed in [src/pages/cv.astro](src/pages/cv.astro). Each skill
uses a local Tabler SVG icon and still renders the skill name under the icon for
readability.

```ts
skill("Kubernetes", "triangle-square-circle")
skill("Docker", "brand-docker")
skill("Certificate Automation", "certificate")
```

Available icon names come from the `icons` map in
[src/components/Icon.astro](src/components/Icon.astro). Add new icons by
importing SVG files from the local `@tabler/icons` package.

## Project Structure

```text
public/
  blog/
    covers/       -> blog cover images
src/
  content/blog/   -> Markdown and MDX blog posts
  pages/
    index.astro   -> home page
    blog/         -> blog listing and article pages
    projects/     -> GitHub project listing and README pages
    cv.astro      -> CV and skills page
  layouts/        -> shared page shell and SEO metadata
  components/     -> cards and local icon component
  lib/github.ts   -> GitHub API integration
  styles/         -> global design system
k8s/              -> K3s Deployment, Service, and Ingress manifests
```

## Container

Build and test the container locally:

```bash
docker build -t portfolio:test .
docker run -p 8080:80 portfolio:test
```

Open `http://localhost:8080`.

Production images are published by GitHub Actions:

```text
ghcr.io/elifsudeates/portfolio:latest
ghcr.io/elifsudeates/portfolio:<commit-sha>
```

Package page:
[github.com/users/elifsudeates/packages/container/package/portfolio](https://github.com/users/elifsudeates/packages/container/package/portfolio)

## Deployment

The production flow is intentionally simple:

```text
git push
  -> GitHub Actions builds the Docker image
  -> The image is pushed to GHCR as latest and commit SHA tags
  -> Keel polls GHCR from inside the cluster
  -> When the latest digest changes, Keel updates the K3s Deployment
```

GitHub does not need inbound access to the server. The workflow does not require
SSH keys, kubeconfig, or Kubernetes API tokens. Keel runs inside the cluster and
checks GHCR outbound.

### One-Time K3s Setup

Create the namespace and image pull secret:

```bash
kubectl create namespace portfolio
kubectl create secret docker-registry ghcr-secret \
  --namespace portfolio \
  --docker-server=ghcr.io \
  --docker-username=elifsudeates \
  --docker-password=<GITHUB_PAT>
```

Install Keel:

```bash
helm repo add keel https://charts.keel.sh
helm repo update
helm upgrade --install keel keel/keel --namespace keel --create-namespace \
  --set helmProvider.enabled=false
```

Apply the manifests:

```bash
kubectl apply -k k8s/
```

Ingress serves `elifsudeates.com` and `www.elifsudeates.com` through Traefik.
TLS certificates are issued by cert-manager with the `letsencrypt-prod`
ClusterIssuer. For another domain or issuer, update [k8s/ingress.yaml](k8s/ingress.yaml).
