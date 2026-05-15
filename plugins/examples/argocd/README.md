# Headlamp Argo CD Plugin

Surfaces Argo CD GitOps state directly inside Headlamp's Projects view. No separate Argo CD UI tab required.

## What it shows

- **Projects detail tab** — all Argo CD Applications targeting the Project's namespaces, with sync status, health, revision, and source repository
- **Projects overview card** — aggregate sync/health summary on the Project overview page
- **Argo CD Apps sidebar entry** — cluster-wide Application list with search under Workloads

## Prerequisites

- Headlamp v0.26+
- Argo CD v2 or v3 installed in the cluster (`argoproj.io/v1alpha1` Application CRDs present)
- Kubernetes RBAC: `get` and `list` on `applications.argoproj.io`

## Minimum RBAC

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: headlamp-argocd-read
rules:
  - apiGroups: ['argoproj.io']
    resources: ['applications']
    verbs: ['get', 'list', 'watch']
```

## Install (development)

```bash
cd plugins/examples/argocd
npm install
npm run build
```

Copy the `dist/` folder to your Headlamp plugins directory.

## Known limitations

- Multi-cluster Projects: only the first cluster in `project.clusters` is queried in this version
- Write actions (sync trigger, rollback) are not implemented — read-only
- Multi-source Applications (`spec.sources[]`) are normalized to a primary source; individual sources are not rendered separately yet
