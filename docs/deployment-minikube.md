# Deployment on Minikube

## Prerequisites
- Docker installed
- Minikube installed

## 1. Start Minikube
Run the start script to initialize the cluster with necessary resources:
```bash
./scripts/start-minikube.sh
```

## 2. Build Images
Build the Docker images directly inside Minikube's Docker daemon so they are available to the cluster:
```bash
./scripts/build-local.sh
```
*Note: Make sure to update the image names in your Kubernetes manifests if you are not using the GHCR registry tags, or retag them in the script.*

## 3. Deploy
Apply the Kubernetes manifests:
```bash
./scripts/deploy-local.sh
```

## 4. Run Tunnel & Access Application
The Kubernetes Ingress requires `minikube tunnel` to route traffic to your local machine. In a separate terminal, run:
```bash
minikube tunnel
```

Add the Minikube IP to your `/etc/hosts` file (if you haven't already):
```bash
sudo echo "$(minikube ip) collector.local argocd.local" >> /etc/hosts
```

Access the application at [http://collector.local](http://collector.local).
- Frontend: `/`
- Backend API: `/api/articles`, `/api/users`, etc.
- Observability: `/jaeger`, `/grafana`
