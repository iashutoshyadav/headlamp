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

export interface KubeLocalQueue extends KubeObjectInterface {
  spec: {
    clusterQueue: string;
    stopPolicy?: string;
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

export class LocalQueue extends KubeObject<KubeLocalQueue> {
  static kind = 'LocalQueue';
  static apiName = 'localqueues';
  static apiVersion = ['kueue.x-k8s.io/v1beta1'];
  static isNamespaced = true;

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status;
  }

  get clusterQueue(): string {
    return this.jsonData.spec.clusterQueue;
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
}
