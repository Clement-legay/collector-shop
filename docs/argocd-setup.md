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

# Patch the repo-server to prevent CrashLoopBackOff on container restart
kubectl patch deployment argocd-repo-server -n argocd --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/initContainers/0/args/0", "value": "/bin/cp --update=none /usr/local/bin/argocd /var/run/argocd/argocd && /bin/ln -sf /var/run/argocd/argocd /var/run/argocd/argocd-cmp-server"}]'
```

Wait for all pods to be ready:
```bash
kubectl wait -n argocd --for=condition=ready pod --all --timeout=300s
```

## 2. Access ArgoCD UI
Ensure your `minikube tunnel` is running in a separate terminal:
```bash
minikube tunnel
```

Add the Minikube IP to your `/etc/hosts` file:
```bash
sudo echo "$(minikube ip) argocd.local" >> /etc/hosts
```

Access at [http://argocd.local](http://argocd.local)

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
