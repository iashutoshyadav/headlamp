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
import { FlavorUsage,KubeCondition } from '../types';

export interface QuotaResource {
  name: string;
  nominalQuota: string;
  borrowingLimit?: string;
  lendingLimit?: string;
}

export interface QuotaFlavor {
  name: string;
  resources: QuotaResource[];
}

export interface ResourceGroup {
  coveredResources: string[];
  flavors: QuotaFlavor[];
}

export interface KubeClusterQueue extends KubeObjectInterface {
  spec: {
    queueingStrategy?: string;
    cohort?: string;
    stopPolicy?: string;
    resourceGroups?: ResourceGroup[];
    namespaceSelector?: object;
    preemption?: {
      reclaimWithinCohort?: string;
      withinClusterQueue?: string;
    };
  };
  status?: {
    conditions?: KubeCondition[];
    pendingWorkloads?: number;
    reservingWorkloads?: number;
    admittedWorkloads?: number;
    flavorsReservation?: FlavorUsage[];
    flavorsUsage?: FlavorUsage[];
  };
}

export class ClusterQueue extends KubeObject<KubeClusterQueue> {
  static kind = 'ClusterQueue';
  static apiName = 'clusterqueues';
  static apiVersion = ['kueue.x-k8s.io/v1beta1'];
  static isNamespaced = false;

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status;
  }

  get pendingWorkloads(): number {
    return this.jsonData.status?.pendingWorkloads ?? 0;
  }

  get admittedWorkloads(): number {
    return this.jsonData.status?.admittedWorkloads ?? 0;
  }

  get isActive(): boolean {
    const cond = this.jsonData.status?.conditions?.find(c => c.type === 'Active');
    return cond?.status === 'True';
  }

  /** All resource flavors defined in spec.resourceGroups, flattened. */
  get flavors(): QuotaFlavor[] {
    return this.jsonData.spec.resourceGroups?.flatMap(rg => rg.flavors) ?? [];
  }
}
