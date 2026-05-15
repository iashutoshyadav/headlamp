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

import React, { createContext, useContext } from 'react';
import { useArgoCDAppsForProject, UseArgoCDAppsResult } from '../hooks/useArgoCDApps';

interface ProjectShape {
  namespaces: string[];
  clusters: string[];
}

const ArgoProjectContext = createContext<UseArgoCDAppsResult | null>(null);

/**
 * Fetches Argo CD Applications for a Headlamp Project and makes them available
 * to any descendant via useArgoProjectContext.
 *
 * ArgoProjectTab and ArgoOverviewCard each wrap themselves in this provider.
 * The two provider instances are independent React subtrees, but Headlamp's
 * underlying KubeObject store deduplicates the network request — so only one
 * API call is made per (resource type, cluster) pair regardless of how many
 * components subscribe.
 */
export function ArgoProjectProvider({
  project,
  children,
}: {
  project: ProjectShape;
  children: React.ReactNode;
}) {
  const value = useArgoCDAppsForProject(project.namespaces, project.clusters[0]);
  return <ArgoProjectContext.Provider value={value}>{children}</ArgoProjectContext.Provider>;
}

export function useArgoProjectContext(): UseArgoCDAppsResult {
  const ctx = useContext(ArgoProjectContext);
  if (!ctx) throw new Error('useArgoProjectContext must be used inside ArgoProjectProvider');
  return ctx;
}
