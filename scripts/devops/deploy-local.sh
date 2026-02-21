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
kubectl apply -R -f infrastructure/kubernetes/ingress/
kubectl apply -R -f infrastructure/kubernetes/argocd/ 2>/dev/null || true

echo "Restarting deployments to pick up new local images..."
kubectl rollout restart deployment -n collector

echo "Waiting for pods..."
kubectl wait --for=condition=ready pod \
  -l 'app in (article-service,user-service,payment-service,fraud-detection-service,frontend)' \
  -n collector --timeout=300s

echo "Deployment complete. Add to /etc/hosts:"
echo "$(minikube ip) collector.local"
