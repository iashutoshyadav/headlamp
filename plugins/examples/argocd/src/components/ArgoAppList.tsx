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
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useMemo, useState } from 'react';
import { useArgoCDApps } from '../hooks/useArgoCDApps';
import { ArgoCDApplication } from '../types';
import { HealthStatusChip, SyncStatusChip } from './ArgoStatusChip';

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

function SummaryStrip({ apps }: { apps: ArgoCDApplication[] }) {
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

export function ArgoAppList() {
  const { apps, loading, error, notInstalled } = useArgoCDApps();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return apps;
    return apps.filter(
      a =>
        a.metadata.name.toLowerCase().includes(q) ||
        a.spec.destination.namespace.toLowerCase().includes(q) ||
        a.spec.source.repoURL.toLowerCase().includes(q) ||
        a.spec.project.toLowerCase().includes(q)
    );
  }, [apps, search]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, px: 3 }}>
        <CircularProgress size={24} />
        <Typography color="text.secondary">Fetching Argo CD Applications…</Typography>
      </Box>
    );
  }

  if (notInstalled) return <NotInstalledState />;

  if (error) {
    return (
      <Box sx={{ py: 4, px: 3 }}>
        <Typography color="error">Error loading applications: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Icon icon="simple-icons:argo" width={24} />
        <Typography variant="h5">Argo CD Applications</Typography>
      </Stack>

      {apps.length > 0 && <SummaryStrip apps={apps} />}

      <TextField
        size="small"
        placeholder="Search by name, namespace, repo, or project…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2, width: 380 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Icon icon="mdi:magnify" width={18} />
            </InputAdornment>
          ),
        }}
      />

      {filtered.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4 }}>
          {apps.length === 0
            ? 'No Argo CD Applications found in this cluster.'
            : 'No applications match your search.'}
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Argo Project</TableCell>
                <TableCell>Sync</TableCell>
                <TableCell>Health</TableCell>
                <TableCell>Revision</TableCell>
                <TableCell>Repository</TableCell>
                <TableCell>Target Namespace</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(app => {
                const shortRepo = app.spec.source.repoURL.replace(
                  /^https?:\/\/(github\.com\/|gitlab\.com\/)/,
                  ''
                );
                return (
                  <TableRow key={app.metadata.uid} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Icon icon="simple-icons:argo" width={14} />
                        <Typography variant="body2" fontWeight={500}>
                          {app.metadata.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        ns: {app.metadata.namespace}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{app.spec.project}</Typography>
                    </TableCell>
                    <TableCell>
                      <SyncStatusChip status={app.status?.sync?.status} />
                    </TableCell>
                    <TableCell>
                      <HealthStatusChip status={app.status?.health?.status} />
                    </TableCell>
                    <TableCell>
                      {app.status?.sync?.revision ? (
                        <Tooltip title={app.status.sync.revision}>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: 'monospace', fontSize: '0.8rem', cursor: 'default' }}
                          >
                            {app.status.sync.revision.slice(0, 7)}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={app.spec.source.repoURL}
                        target="_blank"
                        rel="noopener"
                        sx={{ fontSize: '0.82rem' }}
                      >
                        {shortRepo}
                      </Link>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {app.spec.source.targetRevision}
                        {app.spec.source.path ? ` · ${app.spec.source.path}` : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{app.spec.destination.namespace}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
