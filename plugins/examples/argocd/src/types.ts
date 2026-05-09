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

export type ArgoCDSyncStatus = 'Synced' | 'OutOfSync' | 'Unknown';
export type ArgoCDHealthStatus = 'Healthy' | 'Degraded' | 'Progressing' | 'Missing' | 'Unknown';

export interface ArgoCDApplication {
  apiVersion: string;
  kind: 'Application';
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  spec: {
    project: string;
    source: {
      repoURL: string;
      targetRevision: string;
      path?: string;
      chart?: string;
    };
    destination: {
      server: string;
      namespace: string;
      name?: string;
    };
    syncPolicy?: {
      automated?: {
        prune?: boolean;
        selfHeal?: boolean;
      };
    };
  };
  status?: {
    sync?: {
      status: ArgoCDSyncStatus;
      revision?: string;
      comparedTo?: {
        source: {
          repoURL: string;
          targetRevision: string;
        };
      };
    };
    health?: {
      status: ArgoCDHealthStatus;
      message?: string;
    };
    operationState?: {
      phase?: string;
      message?: string;
      startedAt?: string;
      finishedAt?: string;
    };
    summary?: {
      images?: string[];
    };
    reconciledAt?: string;
    observedAt?: string;
  };
}

export interface ArgoCDApplicationList {
  apiVersion: string;
  kind: 'ApplicationList';
  items: ArgoCDApplication[];
}
