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
import { KubeCondition } from '../types';

export interface NodeTaint {
  key: string;
  value?: string;
  effect: string;
}

export interface Toleration {
  key?: string;
  operator?: string;
  value?: string;
  effect?: string;
}

export interface KubeResourceFlavor extends KubeObjectInterface {
  spec: {
    nodeLabels?: { [key: string]: string };
    nodeTaints?: NodeTaint[];
    tolerations?: Toleration[];
    topologyName?: string;
  };
  status?: {
    conditions?: KubeCondition[];
  };
}

export class ResourceFlavor extends KubeObject<KubeResourceFlavor> {
  static kind = 'ResourceFlavor';
  static apiName = 'resourceflavors';
  static apiVersion = ['kueue.x-k8s.io/v1beta1'];
  static isNamespaced = false;

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status;
  }

  get isReady(): boolean {
    const cond = this.jsonData.status?.conditions?.find(c => c.type === 'Ready');
    return cond?.status === 'True';
  }

  get nodeLabels(): { [key: string]: string } {
    return this.jsonData.spec.nodeLabels ?? {};
  }
}
