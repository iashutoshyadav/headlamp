/*
 * Copyright 2025 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ArgoApplication } from '../api/argoApplication';

export interface UseArgoCDAppsResult {
  apps: InstanceType<typeof ArgoApplication>[];
  loading: boolean;
  error: string | null;
  /** true when the CRD is not installed at all */
  notInstalled: boolean;
}

/**
 * Fetch all Argo CD Applications from the cluster via makeKubeObject / useList.
 *
 * Pass `cluster` explicitly when called outside a cluster-URL context (e.g. the
 * Projects page at /project/:id has no /c/:cluster/ prefix, so the hook cannot
 * infer the cluster from the URL and returns 404 without it).
 */
export function useArgoCDApps(cluster?: string): UseArgoCDAppsResult {
  const [appList, err] = ArgoApplication.useList({ cluster });

  const notInstalled = !!(err && (err.status === 404 || err.message?.includes('404')));
  const rbacDenied = !!(err && (err.status === 403 || err.message?.includes('403')));

  return {
    apps: appList ?? [],
    loading: appList === null && !err,
    error:
      err && !notInstalled
        ? rbacDenied
          ? 'Insufficient permissions to list Argo CD Applications. Grant get/list on argoproj.io Application resources.'
          : err.message
        : null,
    notInstalled,
  };
}

/**
 * Returns only apps whose destination namespace matches one of the given namespaces.
 * Requires an explicit cluster name because this is called from the Projects page
 * which has no cluster in the URL.
 */
export function useArgoCDAppsForProject(
  namespaces: string[],
  cluster: string
): UseArgoCDAppsResult {
  const result = useArgoCDApps(cluster);
  const nsSet = new Set(namespaces);
  return {
    ...result,
    apps: result.apps.filter(app => nsSet.has(app.spec.destination.namespace)),
  };
}
