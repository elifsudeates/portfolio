---
title: "Automated Deployments on K3s with ArgoCD Image Updater"
description: "How to set up automatic deploys whenever a new image is pushed in a GitOps flow."
pubDate: 2026-06-10
tags: ["kubernetes", "argocd", "gitops"]
cover:
  src: "/blog/covers/argocd-image-updater-cover.jpg"
  alt: "Abstract GitOps deployment pipeline from container registry to Kubernetes cluster"
---

ArgoCD Image Updater triggers a deployment by automatically updating the manifest in your Git repo whenever a new image is pushed to the registry. This post covers the annotation-based configuration.

## Annotation configuration

Add the following annotations to your Application resource:

```yaml
metadata:
  annotations:
    argocd-image-updater.argoproj.io/image-list: app=ghcr.io/user/app
    argocd-image-updater.argoproj.io/write-back-method: git
    argocd-image-updater.argoproj.io/app.update-strategy: newest-build
```

With `write-back-method: git`, the new image tag gets committed straight back to the repo, preserving ArgoCD's single-source-of-truth principle.

## Write-back with Kustomize

If you're using Kustomize, the `images` block in `kustomization.yaml` gets updated automatically:

```bash
kubectl -n argocd logs deploy/argocd-image-updater -f
```

Once you see `Successfully updated image` in the logs, the flow is working.

> Tip: don't forget to set up a pull secret for private registries, or Image Updater won't be able to list tags.

That's it. From now on, every `git push` triggers CI to build the image and push it to GHCR, and Image Updater pulls it down to the cluster.
