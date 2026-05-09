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

import { Icon } from '@iconify/react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useArgoCDAppsForProject } from '../hooks/useArgoCDApps';
import { ArgoCDApplication } from '../types';
import { HealthStatusChip, SyncStatusChip } from './ArgoStatusChip';

interface ProjectProp {
  namespaces: string[];
  clusters: string[];
  id: string;
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.25 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box>{value}</Box>
    </Box>
  );
}

function aggregateStatus(apps: ArgoCDApplication[]) {
  const total = apps.length;
  const synced = apps.filter(a => a.status?.sync?.status === 'Synced').length;
  const outOfSync = apps.filter(a => a.status?.sync?.status === 'OutOfSync').length;
  const healthy = apps.filter(a => a.status?.health?.status === 'Healthy').length;
  const degraded = apps.filter(a => a.status?.health?.status === 'Degraded').length;
  const progressing = apps.filter(a => a.status?.health?.status === 'Progressing').length;

  const overallSync: 'Synced' | 'OutOfSync' | 'Unknown' =
    outOfSync > 0 ? 'OutOfSync' : synced === total ? 'Synced' : 'Unknown';

  const overallHealth: 'Healthy' | 'Degraded' | 'Progressing' | 'Unknown' =
    degraded > 0
      ? 'Degraded'
      : progressing > 0
      ? 'Progressing'
      : healthy === total
      ? 'Healthy'
      : 'Unknown';

  return { total, synced, outOfSync, healthy, degraded, progressing, overallSync, overallHealth };
}

export function ArgoOverviewCard({ project }: { project: ProjectProp }) {
  const { apps, loading, notInstalled } = useArgoCDAppsForProject(
    project.namespaces,
    project.clusters[0]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={14} />
        <Typography variant="body2" color="text.secondary">
          Loading GitOps status…
        </Typography>
      </Box>
    );
  }

  // Don't render the card at all if Argo CD isn't installed
  if (notInstalled || apps.length === 0) {
    return null;
  }

  const stats = aggregateStatus(apps);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Icon icon="simple-icons:argo" width={18} />
        <Typography variant="h6">GitOps (Argo CD)</Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <SyncStatusChip status={stats.overallSync} />
        <HealthStatusChip status={stats.overallHealth} />
      </Stack>

      <Divider sx={{ my: 1 }} />

      <StatRow
        label="Applications"
        value={
          <Typography variant="body2" fontWeight={500}>
            {stats.total}
          </Typography>
        }
      />
      {stats.outOfSync > 0 && (
        <StatRow
          label="Out of Sync"
          value={
            <Typography variant="body2" color="warning.main" fontWeight={500}>
              {stats.outOfSync}
            </Typography>
          }
        />
      )}
      {stats.degraded > 0 && (
        <StatRow
          label="Degraded"
          value={
            <Typography variant="body2" color="error.main" fontWeight={500}>
              {stats.degraded}
            </Typography>
          }
        />
      )}
      {stats.progressing > 0 && (
        <StatRow
          label="Progressing"
          value={
            <Typography variant="body2" color="info.main" fontWeight={500}>
              {stats.progressing}
            </Typography>
          }
        />
      )}
      <StatRow
        label="Healthy"
        value={
          <Typography variant="body2" color="success.main" fontWeight={500}>
            {stats.healthy}
          </Typography>
        }
      />
    </Box>
  );
}
