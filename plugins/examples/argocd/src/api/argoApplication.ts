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

import { makeKubeObject } from '@kinvolk/headlamp-plugin/lib';
import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/lib/k8s/KubeObject';

export interface KubeArgoApplication extends KubeObjectInterface {
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
      automated?: { prune?: boolean; selfHeal?: boolean };
    };
    // Argo CD v2.6+ multi-source Applications
    sources?: Array<{
      repoURL: string;
      targetRevision: string;
      path?: string;
      chart?: string;
    }>;
  };
  status?: {
    sync?: { status: string; revision?: string };
    health?: { status: string; message?: string };
    operationState?: { phase?: string; message?: string; startedAt?: string; finishedAt?: string };
    summary?: { images?: string[] };
    reconciledAt?: string;
    observedAt?: string;
  };
}

const ArgoApplicationBase = makeKubeObject<KubeArgoApplication>();

export class ArgoApplication extends ArgoApplicationBase {
  static kind = 'Application';
  static apiName = 'applications';
  static apiVersion = ['argoproj.io/v1alpha1'];
  static isNamespaced = true;

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status;
  }
}
