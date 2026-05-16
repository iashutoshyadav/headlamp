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

import { StatusLabel } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { Workload } from '../api/workload';
import { WorkloadPhase } from '../types';

type StatusType = 'success' | 'warning' | 'error' | '';

const PHASE_COLOR: Record<WorkloadPhase, StatusType> = {
  Admitted: 'success',
  Pending: '',
  Finished: 'success',
  Evicted: 'warning',
  Unknown: '',
};

/** Turns "QuotaReserved" → "Quota reserved", "InsufficientQuota" → "Insufficient quota". */
export function humanizeReason(reason?: string): string {
  if (!reason) return '';
  return reason
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .replace(/^./, c => c.toUpperCase());
}

export function WorkloadStatusChip({ workload }: { workload: InstanceType<typeof Workload> }) {
  const phase = workload.phase;
  const blocking = workload.blockingCondition;
  const tip = blocking
    ? `Blocked: ${humanizeReason(blocking.reason)}${
        blocking.message ? ` — ${blocking.message}` : ''
      }`
    : phase;

  return (
    <Tooltip title={tip}>
      <StatusLabel status={PHASE_COLOR[phase]}>{phase}</StatusLabel>
    </Tooltip>
  );
}

/** Simple chip for ClusterQueue / LocalQueue active state. */
export function ActiveStatusChip({ isActive }: { isActive: boolean }) {
  return (
    <StatusLabel status={isActive ? 'success' : 'warning'}>
      {isActive ? 'Active' : 'Inactive'}
    </StatusLabel>
  );
}

/** Simple chip for ResourceFlavor ready state. */
export function ReadyStatusChip({ isReady }: { isReady: boolean }) {
  return (
    <StatusLabel status={isReady ? 'success' : 'warning'}>
      {isReady ? 'Ready' : 'Not Ready'}
    </StatusLabel>
  );
}
