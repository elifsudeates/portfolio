---
title: "K3s Üzerinde ArgoCD Image Updater ile Otomatik Deployment"
description: "GitOps akışında yeni image push edildiğinde otomatik deploy nasıl kurulur."
pubDate: 2026-06-10
tags: ["kubernetes", "argocd", "gitops"]
---

ArgoCD Image Updater, registry'ye yeni bir image push edildiğinde Git
deposundaki manifest'i otomatik güncelleyerek deployment'ı tetikler. Bu yazıda
annotation tabanlı yapılandırmayı anlatıyorum.

## Annotation Yapılandırması

Application kaynağına aşağıdaki annotation'ları ekliyoruz:

```yaml
metadata:
  annotations:
    argocd-image-updater.argoproj.io/image-list: app=ghcr.io/user/app
    argocd-image-updater.argoproj.io/write-back-method: git
    argocd-image-updater.argoproj.io/app.update-strategy: newest-build
```

`write-back-method: git` sayesinde güncel image tag'i doğrudan repoya commit
edilir; böylece ArgoCD'nin tek doğruluk kaynağı (single source of truth)
prensibi korunur.

## Kustomize ile Write-Back

Kustomize kullanıyorsan `kustomization.yaml` içindeki `images` bloğu otomatik
güncellenir:

```bash
kubectl -n argocd logs deploy/argocd-image-updater -f
```

Log'larda `Successfully updated image` satırını gördüğünde akış çalışıyordur.

> İpucu: Private registry için bir pull secret tanımlamayı unutma, aksi halde
> Image Updater tag'leri listeleyemez.

Bu kadar. Artık her `git push` sonrası CI image'ı build edip GHCR'a atıyor,
Image Updater de onu cluster'a indiriyor.
