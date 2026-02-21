#!/bin/bash
# ============================================================
# Collector.shop — Full Environment Reset
# Supprime Minikube, les volumes, les images Docker locales
# et remet le projet à zéro pour un fresh start.
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${RED}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║     🗑️  COLLECTOR.SHOP — FULL ENVIRONMENT RESET  ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Cette action va :${NC}"
echo "  1. Supprimer le namespace 'collector' et toutes ses ressources"
echo "  2. Supprimer les PersistentVolumes associés"
echo "  3. Arrêter et supprimer le cluster Minikube"
echo "  4. Supprimer les images Docker locales collector/*"
echo ""

read -p "⚠️  Confirmer la suppression totale ? (oui/non) : " confirm
if [[ "$confirm" != "oui" ]]; then
    echo -e "${GREEN}Annulé.${NC}"
    exit 0
fi

echo ""

# 1. Supprimer le namespace (et toutes ses ressources : pods, services, deployments, PVCs...)
echo -e "${YELLOW}[1/4] Suppression du namespace collector...${NC}"
if kubectl get namespace collector &>/dev/null; then
    kubectl delete namespace collector --timeout=60s 2>/dev/null || true
    echo -e "${GREEN}  ✅ Namespace supprimé${NC}"
else
    echo "  ⏭️  Namespace 'collector' n'existe pas, skip"
fi

# 2. Supprimer les PersistentVolumes orphelins
echo -e "${YELLOW}[2/4] Nettoyage des PersistentVolumes...${NC}"
pv_list=$(kubectl get pv -o name 2>/dev/null | grep -i collector || true)
if [[ -n "$pv_list" ]]; then
    echo "$pv_list" | xargs kubectl delete 2>/dev/null || true
    echo -e "${GREEN}  ✅ PVs supprimés${NC}"
else
    echo "  ⏭️  Aucun PV à supprimer"
fi

# 3. Arrêter et supprimer Minikube
echo -e "${YELLOW}[3/4] Suppression du cluster Minikube...${NC}"
if minikube status &>/dev/null; then
    minikube delete
    echo -e "${GREEN}  ✅ Cluster Minikube supprimé${NC}"
else
    echo "  ⏭️  Minikube n'est pas actif"
fi

# 4. Supprimer les images Docker locales
echo -e "${YELLOW}[4/4] Nettoyage des images Docker collector/*...${NC}"
images=$(docker images --filter "reference=collector/*" -q 2>/dev/null || true)
if [[ -n "$images" ]]; then
    docker rmi $images --force 2>/dev/null || true
    echo -e "${GREEN}  ✅ Images Docker supprimées${NC}"
else
    echo "  ⏭️  Aucune image collector/* trouvée"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅  Environnement complètement nettoyé       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo "Pour tout recréer :"
echo "  npm start         # Démarrer Minikube"
echo "  npm run dev        # Build + Deploy"
echo "  npm run seed       # Seeder la base"
echo ""
