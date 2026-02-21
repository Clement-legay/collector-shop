#!/bin/bash
# Build toutes les images localement et les charge dans Minikube
eval $(minikube docker-env)

for service in article-service user-service payment-service fraud-detection-service; do
  echo "Building $service..."
  docker build -t collector/$service:local ./services/$service
  # Also tag as ghcr.io for the k8s manifests to pick it up if they use that by default, 
  # OR user maps local tags. 
  # Note: The manifests use ghcr.io/<USER>/service:latest. 
  # For local dev without pushing, we might want to tag them so:
  # docker tag collector/$service:local ghcr.io/<GITHUB_USERNAME>/$service:latest
done

echo "Building frontend..."
docker build -t collector/frontend:local ./frontend

echo "Images built in Minikube Docker daemon."
