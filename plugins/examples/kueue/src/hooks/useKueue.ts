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

import { ClusterQueue } from '../api/clusterQueue';
import { LocalQueue } from '../api/localQueue';
import { ResourceFlavor } from '../api/resourceFlavor';
import { Workload } from '../api/workload';

function isNotInstalled(err: any): boolean {
  return !!(err && (err.status === 404 || err.message?.includes('404')));
}

function isRbacDenied(err: any): boolean {
  return !!(err && (err.status === 403 || err.message?.includes('403')));
}

function resolveError(err: any, resource: string): string | null {
  if (!err || isNotInstalled(err)) return null;
  if (isRbacDenied(err))
    return `Insufficient permissions to list ${resource}. Grant get/list on kueue.x-k8s.io resources.`;
  return err.message ?? 'Unknown error';
}

// ---------------------------------------------------------------------------
// ClusterQueue
// ---------------------------------------------------------------------------

export interface UseClusterQueuesResult {
  queues: InstanceType<typeof ClusterQueue>[];
  loading: boolean;
  notInstalled: boolean;
  error: string | null;
}

export function useClusterQueues(cluster?: string): UseClusterQueuesResult {
  const [list, err] = ClusterQueue.useList({ cluster });
  return {
    queues: list ?? [],
    loading: list === null && !err,
    notInstalled: isNotInstalled(err),
    error: resolveError(err, 'ClusterQueues'),
  };
}

// ---------------------------------------------------------------------------
// LocalQueue
// ---------------------------------------------------------------------------

export interface UseLocalQueuesResult {
  localQueues: InstanceType<typeof LocalQueue>[];
  loading: boolean;
  notInstalled: boolean;
  error: string | null;
}

export function useLocalQueues(cluster?: string): UseLocalQueuesResult {
  const [list, err] = LocalQueue.useList({ cluster });
  return {
    localQueues: list ?? [],
    loading: list === null && !err,
    notInstalled: isNotInstalled(err),
    error: resolveError(err, 'LocalQueues'),
  };
}

/** Returns only LocalQueues that target a specific ClusterQueue. */
export function useLocalQueuesForClusterQueue(
  clusterQueueName: string,
  cluster?: string
): UseLocalQueuesResult {
  const result = useLocalQueues(cluster);
  return {
    ...result,
    localQueues: result.localQueues.filter(lq => lq.clusterQueue === clusterQueueName),
  };
}

// ---------------------------------------------------------------------------
// Workload
// ---------------------------------------------------------------------------

export interface UseWorkloadsResult {
  workloads: InstanceType<typeof Workload>[];
  loading: boolean;
  notInstalled: boolean;
  error: string | null;
}

export function useWorkloads(cluster?: string): UseWorkloadsResult {
  const [list, err] = Workload.useList({ cluster });
  return {
    workloads: list ?? [],
    loading: list === null && !err,
    notInstalled: isNotInstalled(err),
    error: resolveError(err, 'Workloads'),
  };
}

/** Returns only Workloads in a specific LocalQueue (by queue name). */
export function useWorkloadsForLocalQueue(
  localQueueName: string,
  cluster?: string
): UseWorkloadsResult {
  const result = useWorkloads(cluster);
  return {
    ...result,
    workloads: result.workloads.filter(w => w.queueName === localQueueName),
  };
}

/** Returns only Workloads admitted to a specific ClusterQueue. */
export function useWorkloadsForClusterQueue(
  clusterQueueName: string,
  cluster?: string
): UseWorkloadsResult {
  const result = useWorkloads(cluster);
  return {
    ...result,
    workloads: result.workloads.filter(w => w.admittedClusterQueue === clusterQueueName),
  };
}

// ---------------------------------------------------------------------------
// ResourceFlavor
// ---------------------------------------------------------------------------

export interface UseResourceFlavorsResult {
  flavors: InstanceType<typeof ResourceFlavor>[];
  loading: boolean;
  notInstalled: boolean;
  error: string | null;
}

export function useResourceFlavors(cluster?: string): UseResourceFlavorsResult {
  const [list, err] = ResourceFlavor.useList({ cluster });
  return {
    flavors: list ?? [],
    loading: list === null && !err,
    notInstalled: isNotInstalled(err),
    error: resolveError(err, 'ResourceFlavors'),
  };
}
