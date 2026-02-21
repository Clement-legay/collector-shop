#!/bin/bash
minikube start --cpus=4 --memory=4096 --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server
echo "Minikube started. Run: kubectl apply -k infrastructure/kubernetes"
