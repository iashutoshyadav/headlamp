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

import {
  registerProjectDetailsTab,
  registerProjectOverviewSection,
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import React from 'react';
import { ArgoAppList } from './components/ArgoAppList';
import { ArgoOverviewCard } from './components/ArgoOverviewCard';
import { ArgoProjectTab } from './components/ArgoProjectTab';

// 1. "GitOps" tab on every Project detail page
//    Shows a table of Argo CD Applications whose destination namespace is in this project.
registerProjectDetailsTab({
  id: 'headlamp-argocd.tabs.gitops',
  label: 'GitOps',
  icon: 'simple-icons:argo',
  component: ArgoProjectTab,
});

// 2. Mini status card on the Project Overview tab
//    Returns null when Argo CD is not installed, so the card only shows when relevant.
registerProjectOverviewSection({
  id: 'headlamp-argocd.overview.gitops',
  component: ArgoOverviewCard,
});

// 3. Sidebar entry: Argo CD Applications global list page
registerSidebarEntry({
  parent: 'workloads',
  name: 'ArgoCD',
  label: 'Argo CD Apps',
  icon: 'simple-icons:argo',
  url: '/argocd/applications',
  useClusterURL: true,
});

registerRoute({
  path: '/argocd/applications',
  sidebar: 'ArgoCD',
  name: 'argocd-applications',
  exact: true,
  useClusterURL: true,
  component: () => <ArgoAppList />,
});
