# ArgoCD Setup Guide

## Prerequisites
- Minikube running
- kubectl configured
- GitHub repository created and pushed

## 1. Install ArgoCD
Execute the following commands to install ArgoCD in the `argocd` namespace:

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Wait for all pods to be ready:
```bash
kubectl wait -n argocd --for=condition=ready pod --all --timeout=300s
```

## 2. Access ArgoCD UI
Port-forward the ArgoCD server:
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```
Access at [https://localhost:8080](https://localhost:8080)

**Username**: `admin`
**Password**: Get it via CLI:
```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

## 3. Deploy Collector Application
Apply the Application manifest:

```bash
kubectl apply -f infrastructure/argocd/collector-app.yaml
```

Ensure you update the `repoURL` in `infrastructure/argocd/collector-app.yaml` to point to your actual GitHub repository URL before applying.

## 4. Sync
ArgoCD will automatically sync the application based on the `infrastructure/kubernetes` directory in your Git repository. You can verify the status in the UI or via CLI.
