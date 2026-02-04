#!/bin/bash
# Déploie tout dans Minikube
kubectl apply -R -f infrastructure/kubernetes

echo "Waiting for pods..."
kubectl wait --for=condition=ready pod --all -n collector --timeout=300s

echo "Deployment complete. Add to /etc/hosts:"
echo "$(minikube ip) collector.local"
