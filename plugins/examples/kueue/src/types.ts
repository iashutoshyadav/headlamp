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

/** Phase derived from status.conditions[] — Kueue has no explicit phase field. */
export type WorkloadPhase = 'Pending' | 'Admitted' | 'Finished' | 'Evicted' | 'Unknown';

export type ClusterQueueState = 'Active' | 'Inactive' | 'Unknown';

export interface KubeCondition {
  type: string;
  status: 'True' | 'False' | 'Unknown';
  reason?: string;
  message?: string;
  lastTransitionTime?: string;
}

export interface FlavorResource {
  name: string;
  total?: string;
}

export interface FlavorUsage {
  name: string;
  resources: FlavorResource[];
}
