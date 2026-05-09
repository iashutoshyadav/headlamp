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
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
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

function NotInstalledBanner() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        gap: 2,
        color: 'text.secondary',
      }}
    >
      <Icon icon="simple-icons:argo" width={48} />
      <Typography variant="h6">Argo CD is not installed</Typography>
      <Typography variant="body2">
        Install Argo CD in your cluster to see GitOps deployment context here.
      </Typography>
      <Link
        href="https://argo-cd.readthedocs.io/en/stable/getting_started/"
        target="_blank"
        rel="noopener"
      >
        Getting started with Argo CD
      </Link>
    </Box>
  );
}

function NoAppsBanner({ projectId }: { projectId: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        gap: 1,
        color: 'text.secondary',
      }}
    >
      <Icon icon="mdi:source-branch" width={40} />
      <Typography variant="body1">
        No Argo CD Applications target this project's namespaces.
      </Typography>
      <Typography variant="body2" color="text.disabled">
        Applications targeting namespaces of project <strong>{projectId}</strong> will appear here.
      </Typography>
    </Box>
  );
}

function AutoSyncBadge({ automated }: { automated?: { prune?: boolean; selfHeal?: boolean } }) {
  if (!automated) {
    return <Chip size="small" label="Manual" variant="outlined" />;
  }
  return (
    <Tooltip
      title={`Prune: ${automated.prune ?? false} · Self-heal: ${automated.selfHeal ?? false}`}
    >
      <Chip size="small" label="Auto" color="info" icon={<Icon icon="mdi:sync" width={12} />} />
    </Tooltip>
  );
}

function RepoCell({ app }: { app: ArgoCDApplication }) {
  const { repoURL, targetRevision, path, chart } = app.spec.source;
  const shortRepo = repoURL.replace(/^https?:\/\/(github\.com\/|gitlab\.com\/)/, '');
  return (
    <Box>
      <Link
        href={repoURL}
        target="_blank"
        rel="noopener"
        sx={{ display: 'block', fontSize: '0.85rem' }}
      >
        {shortRepo}
      </Link>
      <Typography variant="caption" color="text.secondary">
        {targetRevision}
        {path ? ` · ${path}` : ''}
        {chart ? ` · chart: ${chart}` : ''}
      </Typography>
    </Box>
  );
}

function RevisionCell({ revision }: { revision?: string }) {
  if (!revision) return <Typography color="text.disabled">—</Typography>;
  return (
    <Tooltip title={revision}>
      <Typography
        variant="body2"
        sx={{ fontFamily: 'monospace', fontSize: '0.8rem', cursor: 'default' }}
      >
        {revision.slice(0, 7)}
      </Typography>
    </Tooltip>
  );
}

export function ArgoProjectTab({ project }: { project: ProjectProp }) {
  const { apps, loading, error, notInstalled } = useArgoCDAppsForProject(
    project.namespaces,
    project.clusters[0]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4, px: 2 }}>
        <CircularProgress size={20} />
        <Typography color="text.secondary">Loading Argo CD applications…</Typography>
      </Box>
    );
  }

  if (notInstalled) {
    return <NotInstalledBanner />;
  }

  if (error) {
    return (
      <Box sx={{ py: 4, px: 2 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (apps.length === 0) {
    return <NoAppsBanner projectId={project.id} />;
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, px: 0.5 }}>
        {apps.length} Application{apps.length !== 1 ? 's' : ''} targeting this project's namespaces
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Application</TableCell>
              <TableCell>Sync</TableCell>
              <TableCell>Health</TableCell>
              <TableCell>Revision</TableCell>
              <TableCell>Repository</TableCell>
              <TableCell>Target Namespace</TableCell>
              <TableCell>Sync Policy</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apps.map(app => (
              <TableRow key={app.metadata.uid} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Icon icon="simple-icons:argo" width={14} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {app.metadata.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {app.metadata.namespace}
                  </Typography>
                </TableCell>
                <TableCell>
                  <SyncStatusChip status={app.status?.sync?.status} />
                </TableCell>
                <TableCell>
                  <HealthStatusChip status={app.status?.health?.status} />
                </TableCell>
                <TableCell>
                  <RevisionCell revision={app.status?.sync?.revision} />
                </TableCell>
                <TableCell>
                  <RepoCell app={app} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{app.spec.destination.namespace}</Typography>
                </TableCell>
                <TableCell>
                  <AutoSyncBadge automated={app.spec.syncPolicy?.automated} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
