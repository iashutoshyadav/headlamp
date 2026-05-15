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
import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React from 'react';
import { ArgoApplication } from '../api/argoApplication';
import { useArgoCDApps } from '../hooks/useArgoCDApps';
import { getShortRepoName } from '../utils/applicationSource';
import { HealthStatusChip, SyncStatusChip } from './ArgoStatusChip';

type App = InstanceType<typeof ArgoApplication>;

function NotInstalledState() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        gap: 2,
        color: 'text.secondary',
      }}
    >
      <Icon icon="simple-icons:argo" width={56} />
      <Typography variant="h6">Argo CD is not installed</Typography>
      <Typography variant="body2" align="center" sx={{ maxWidth: 400 }}>
        Argo CD manages GitOps deployments using Kubernetes Custom Resources. Install it to see
        Applications here.
      </Typography>
      <Link
        href="https://argo-cd.readthedocs.io/en/stable/getting_started/"
        target="_blank"
        rel="noopener"
      >
        Installation guide →
      </Link>
    </Box>
  );
}

function SummaryStrip({ apps }: { apps: App[] }) {
  const outOfSync = apps.filter(a => a.status?.sync?.status === 'OutOfSync').length;
  const degraded = apps.filter(a => a.status?.health?.status === 'Degraded').length;
  const synced = apps.filter(a => a.status?.sync?.status === 'Synced').length;
  const healthy = apps.filter(a => a.status?.health?.status === 'Healthy').length;

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon icon="mdi:apps" width={16} />
        <Typography variant="body2">
          <strong>{apps.length}</strong> total
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon icon="mdi:check-circle-outline" width={16} color="green" />
        <Typography variant="body2">
          <strong>{synced}</strong> synced
        </Typography>
      </Box>
      {outOfSync > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Icon icon="mdi:sync-alert" width={16} color="orange" />
          <Typography variant="body2" color="warning.main">
            <strong>{outOfSync}</strong> out of sync
          </Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon icon="mdi:heart" width={16} color="green" />
        <Typography variant="body2">
          <strong>{healthy}</strong> healthy
        </Typography>
      </Box>
      {degraded > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Icon icon="mdi:heart-broken" width={16} color="red" />
          <Typography variant="body2" color="error.main">
            <strong>{degraded}</strong> degraded
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

const COLUMNS = [
  {
    label: 'Name',
    getValue: (app: App) => app.metadata.name,
    render: (app: App) => (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Icon icon="simple-icons:argo" width={14} />
          <Typography variant="body2" fontWeight={500}>
            {app.metadata.name}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          ns: {app.metadata.namespace}
        </Typography>
      </Box>
    ),
  },
  {
    label: 'Project',
    getValue: (app: App) => app.spec.project,
  },
  {
    label: 'Sync',
    getValue: (app: App) => app.status?.sync?.status ?? 'Unknown',
    render: (app: App) => <SyncStatusChip status={app.status?.sync?.status} />,
  },
  {
    label: 'Health',
    getValue: (app: App) => app.status?.health?.status ?? 'Unknown',
    render: (app: App) => <HealthStatusChip status={app.status?.health?.status} />,
  },
  {
    label: 'Revision',
    getValue: (app: App) => app.status?.sync?.revision ?? '',
    render: (app: App) => {
      const rev = app.status?.sync?.revision;
      if (!rev) return <Typography color="text.disabled">—</Typography>;
      return (
        <Tooltip title={rev}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {rev.slice(0, 7)}
          </Typography>
        </Tooltip>
      );
    },
  },
  {
    label: 'Repository',
    getValue: (app: App) => app.primarySource?.repoURL ?? '',
    render: (app: App) => {
      const source = app.primarySource;
      if (!source) return <Typography color="text.disabled">No source</Typography>;
      return (
        <Box>
          <Link href={source.repoURL} target="_blank" rel="noopener" sx={{ fontSize: '0.82rem' }}>
            {getShortRepoName(source.repoURL)}
          </Link>
          <Typography variant="caption" color="text.secondary" display="block">
            {source.targetRevision}
            {source.path ? ` · ${source.path}` : ''}
          </Typography>
        </Box>
      );
    },
  },
  {
    label: 'Target Namespace',
    getValue: (app: App) => app.spec.destination.namespace,
  },
];

export function ArgoAppList() {
  const { apps, loading, error, notInstalled } = useArgoCDApps();

  if (notInstalled) return <NotInstalledState />;

  return (
    <Box sx={{ p: 1 }}>
      {!loading && apps.length > 0 && <SummaryStrip apps={apps} />}
      <ResourceListView
        title="Argo CD Applications"
        data={loading ? null : apps}
        errorMessage={error}
        columns={COLUMNS}
      />
    </Box>
  );
}
