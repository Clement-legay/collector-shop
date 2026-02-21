#!/bin/bash
# Déploie l'application depuis le dépôt GitHub officiel via ArgoCD

echo "🚀 Début du déploiement via GitHub et ArgoCD..."

# 1. Vérification et installation d'ArgoCD si nécessaire
echo "Vérification de l'installation d'ArgoCD..."
kubectl create namespace argocd 2>/dev/null || true
kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "🔧 Configuration d'ArgoCD pour autoriser les connexions HTTP (insecure)..."
kubectl patch configmap argocd-cmd-params-cm -n argocd --type merge -p '{"data":{"server.insecure":"true"}}'
kubectl rollout restart deployment argocd-server -n argocd

echo "⏳ Attente qu'ArgoCD soit prêt..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# 2. Re-application de la configuration de l'application ArgoCD au cas où elle aurait été supprimée
echo "Configuration de l'accès et de l'application collector dans ArgoCD..."
kubectl apply -f infrastructure/argocd/argocd-ingress.yaml
kubectl apply -f infrastructure/argocd/collector-app.yaml

# 3. Forcer la synchronisation
echo "🔄 Déclenchement de la synchronisation ArgoCD avec la branche main..."
kubectl patch application collector -n argocd --type merge -p '{"operation": {"sync": {"revision": "HEAD", "syncStrategy": {"hook": {}}}}}'

echo "✅ Commande de synchronisation envoyée."
echo "Pour suivre le statut, exécutez :"
echo "kubectl get application collector -n argocd -w"
