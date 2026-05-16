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

import { KubeObject, KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';
import { KubeCondition, WorkloadPhase } from '../types';

export interface PodSetResourceRequests {
  [resource: string]: string;
}

export interface PodSet {
  name: string;
  count: number;
  template?: {
    spec?: {
      containers?: Array<{
        name: string;
        resources?: {
          requests?: PodSetResourceRequests;
          limits?: PodSetResourceRequests;
        };
      }>;
    };
  };
}

export interface PodSetAssignment {
  name: string;
  flavors?: { [resource: string]: string };
  resourceUsage?: { [resource: string]: string };
  count?: number;
}

export interface WorkloadAdmission {
  clusterQueue: string;
  podSetAssignments: PodSetAssignment[];
}

export interface KubeWorkload extends KubeObjectInterface {
  spec: {
    queueName: string;
    active?: boolean;
    podSets: PodSet[];
    priority?: number;
    priorityClassName?: string;
    maximumExecutionTimeSeconds?: number;
  };
  status?: {
    admission?: WorkloadAdmission;
    conditions?: KubeCondition[];
    reclaimablePods?: Array<{ name: string; count: number }>;
    requeueState?: { count: number; requeueAt?: string };
  };
}

export class Workload extends KubeObject<KubeWorkload> {
  static kind = 'Workload';
  static apiName = 'workloads';
  static apiVersion = ['kueue.x-k8s.io/v1beta1'];
  static isNamespaced = true;

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status;
  }

  get queueName(): string {
    return this.jsonData.spec.queueName;
  }

  get isActive(): boolean {
    return this.jsonData.spec.active !== false;
  }

  get admittedClusterQueue(): string | undefined {
    return this.jsonData.status?.admission?.clusterQueue;
  }

  /** Derives the workload lifecycle phase from status.conditions[]. */
  get phase(): WorkloadPhase {
    const conditions = this.jsonData.status?.conditions ?? [];
    const is = (type: string) => conditions.some(c => c.type === type && c.status === 'True');
    if (is('Finished')) return 'Finished';
    if (is('Evicted')) return 'Evicted';
    if (is('Admitted')) return 'Admitted';
    return 'Pending';
  }

  /** Returns the condition that explains why the workload is blocked, if any. */
  get blockingCondition(): KubeCondition | undefined {
    return this.jsonData.status?.conditions?.find(
      c => c.type === 'QuotaReserved' && c.status === 'False'
    );
  }

  async setActive(active: boolean): Promise<void> {
    await this.patch({ spec: { active } });
  }
}
