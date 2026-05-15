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
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

type StatusType = 'success' | 'warning' | 'error' | '';

const SYNC_COLOR: Record<string, StatusType> = {
  Synced: 'success',
  OutOfSync: 'warning',
  Unknown: '',
};

const HEALTH_COLOR: Record<string, StatusType> = {
  Healthy: 'success',
  Degraded: 'error',
  Progressing: '',
  Suspended: '',
  Missing: 'warning',
  Unknown: '',
};

interface AppStatusBadgeProps {
  sync?: string;
  health?: string;
}

/** Compound badge rendering sync + health state using Headlamp's StatusLabel. */
export function AppStatusBadge({ sync = 'Unknown', health = 'Unknown' }: AppStatusBadgeProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <StatusLabel status={SYNC_COLOR[sync] ?? ''}>{sync}</StatusLabel>
      <StatusLabel status={HEALTH_COLOR[health] ?? ''}>{health}</StatusLabel>
    </Box>
  );
}

/** Single sync-state chip. */
export function SyncStatusChip({ status }: { status?: string }) {
  const s = status ?? 'Unknown';
  return <StatusLabel status={SYNC_COLOR[s] ?? ''}>{s}</StatusLabel>;
}

/** Single health-state chip with tooltip. */
export function HealthStatusChip({ status }: { status?: string }) {
  const s = status ?? 'Unknown';
  return (
    <Tooltip title={s}>
      <StatusLabel status={HEALTH_COLOR[s] ?? ''}>{s}</StatusLabel>
    </Tooltip>
  );
}
