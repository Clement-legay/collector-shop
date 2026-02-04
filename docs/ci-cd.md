# CI/CD Pipeline

The project uses GitHub Actions for Continuous Integration and Deployment.

## Workflow File
Located at `.github/workflows/ci-cd.yaml`.

## Stages

### 1. Tests & Quality
- Runs on every Pull Request and Push to Main.
- Installs dependencies for all services.
- Runs **ESLint** for code quality.
- Runs **Unit Tests** (Jest).
- Runs **Trivy** config scan for security best practices.

### 2. Build & Push
- Runs only if Tests pass.
- Builds Docker images for all 5 services (frontend + 4 backend).
- Tags images with `latest` and git SHA.
- Scans images with **Trivy** for vulnerabilities.
- Pushes images to **GitHub Container Registry (GHCR)**.

### 3. Deploy (Update Manifests)
- Runs only on `main` branch.
- Updates the Kubernetes manifests in `infrastructure/kubernetes/services/` with the new image tags.
- Commits changes back to the repository.
- This triggers **ArgoCD** (if configured) to sync the new state to the cluster.

## Setup Requirements
To make the pipeline work, you need:
1. **GitHub Secrets**:
   - `SONAR_TOKEN` (if SonarQube enabled).
2. **GHCR Permissions**: Ensure the workflow has write permissions to packages (configured in yaml).
