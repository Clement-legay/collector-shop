#!/bin/bash
# Déploie tout dans Minikube

# Switch back to local images for development
sed -i '' 's|ghcr.io/clement-legay/collector-shop/frontend:.*|collector/frontend:local|g' infrastructure/kubernetes/services/frontend.yaml
sed -i '' 's|ghcr.io/clement-legay/collector-shop/payment-service:.*|collector/payment-service:local|g' infrastructure/kubernetes/services/payment-service.yaml
sed -i '' 's|ghcr.io/clement-legay/collector-shop/fraud-detection-service:.*|collector/fraud-detection-service:local|g' infrastructure/kubernetes/services/fraud-detection-service.yaml
sed -i '' 's|ghcr.io/clement-legay/collector-shop/article-service:.*|collector/article-service:local|g' infrastructure/kubernetes/services/article-service.yaml
sed -i '' 's|ghcr.io/clement-legay/collector-shop/user-service:.*|collector/user-service:local|g' infrastructure/kubernetes/services/user-service.yaml

# 1. Namespace en premier (doit exister avant tout le reste)
kubectl apply -f infrastructure/kubernetes/namespaces/

# 2. Le reste dans l'ordre
kubectl apply -R -f infrastructure/kubernetes/databases/
kubectl apply -R -f infrastructure/kubernetes/observability/
kubectl apply -R -f infrastructure/kubernetes/services/
# 4. Ingress Rules
kubectl apply -R -f infrastructure/kubernetes/ingress/

# 5. Installer ArgoCD
echo "Installation and configuration of ArgoCD..."
kubectl create namespace argocd 2>/dev/null || true
kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "Patching ArgoCD repo-server to prevent CrashLoopBackOff..."
kubectl patch deployment argocd-repo-server -n argocd --type='json' -p='[{"op": "replace", "path": "/spec/template/spec/initContainers/0/args/0", "value": "/bin/cp --update=none /usr/local/bin/argocd /var/run/argocd/argocd && /bin/ln -sf /var/run/argocd/argocd /var/run/argocd/argocd-cmp-server"}]'
echo "Waiting for ArgoCD to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# 6. Apply ArgoCD Apps
# Disable ArgoCD auto-sync for the collector app during local development so it doesn't overwrite local images with GitHub ones
kubectl patch application collector -n argocd --type merge -p '{"spec":{"syncPolicy":{"automated":null}}}' 2>/dev/null || true

echo "Restarting deployments to pick up new local images..."
kubectl rollout restart deployment -n collector

echo "Waiting for pods..."
kubectl wait --for=condition=ready pod \
  -l 'app in (article-service,user-service,payment-service,fraud-detection-service,frontend)' \
  -n collector --timeout=300s

echo "Deployment complete. Add to /etc/hosts:"
echo "$(minikube ip) collector.local"
