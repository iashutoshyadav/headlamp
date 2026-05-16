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

import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import React from 'react';
import { ClusterQueueList } from './components/ClusterQueueList';
import { LocalQueueList } from './components/LocalQueueList';
import { ResourceFlavorList } from './components/ResourceFlavorList';
import { WorkloadList } from './components/WorkloadList';

// Top-level "Kueue" sidebar section
registerSidebarEntry({
  name: 'kueue',
  label: 'Kueue',
  icon: 'mdi:layers-triple',
  url: '/kueue/clusterqueues',
  useClusterURL: true,
});

// Child entries under the Kueue section
const SIDEBAR_ENTRIES = [
  {
    name: 'kueue-cluster-queues',
    label: 'Cluster Queues',
    url: '/kueue/clusterqueues',
    icon: 'mdi:server-network',
  },
  {
    name: 'kueue-local-queues',
    label: 'Local Queues',
    url: '/kueue/localqueues',
    icon: 'mdi:format-list-bulleted',
  },
  {
    name: 'kueue-workloads',
    label: 'Workloads',
    url: '/kueue/workloads',
    icon: 'mdi:briefcase-outline',
  },
  {
    name: 'kueue-resource-flavors',
    label: 'Resource Flavors',
    url: '/kueue/resourceflavors',
    icon: 'mdi:tag-multiple',
  },
];

SIDEBAR_ENTRIES.forEach(entry =>
  registerSidebarEntry({
    parent: 'kueue',
    useClusterURL: true,
    ...entry,
  })
);

// Routes — one per CRD
registerRoute({
  path: '/kueue/clusterqueues',
  sidebar: 'kueue-cluster-queues',
  name: 'kueue-cluster-queues-list',
  exact: true,
  useClusterURL: true,
  component: () => <ClusterQueueList />,
});

registerRoute({
  path: '/kueue/localqueues',
  sidebar: 'kueue-local-queues',
  name: 'kueue-local-queues-list',
  exact: true,
  useClusterURL: true,
  component: () => <LocalQueueList />,
});

registerRoute({
  path: '/kueue/workloads',
  sidebar: 'kueue-workloads',
  name: 'kueue-workloads-list',
  exact: true,
  useClusterURL: true,
  component: () => <WorkloadList />,
});

registerRoute({
  path: '/kueue/resourceflavors',
  sidebar: 'kueue-resource-flavors',
  name: 'kueue-resource-flavors-list',
  exact: true,
  useClusterURL: true,
  component: () => <ResourceFlavorList />,
});
