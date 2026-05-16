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
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Workload } from '../api/workload';
import { useWorkloads } from '../hooks/useKueue';
import { WorkloadPhase } from '../types';
import { NotInstalledState } from './NotInstalledState';
import { WorkloadStatusChip } from './WorkloadStatusChip';

type W = InstanceType<typeof Workload>;

function SummaryStrip({ workloads }: { workloads: W[] }) {
  const byPhase = (phase: WorkloadPhase) => workloads.filter(w => w.phase === phase).length;
  const admitted = byPhase('Admitted');
  const pending = byPhase('Pending');
  const finished = byPhase('Finished');
  const evicted = byPhase('Evicted');

  return (
    <Stack direction="row" spacing={3} sx={{ mb: 2 }} flexWrap="wrap">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon icon="mdi:briefcase-outline" width={16} />
        <Typography variant="body2">
          <strong>{workloads.length}</strong> workload{workloads.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      {admitted > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Icon icon="mdi:check-circle-outline" width={16} color="green" />
          <Typography variant="body2" color="success.main">
            <strong>{admitted}</strong> admitted
          </Typography>
        </Box>
      )}
      {pending > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Icon icon="mdi:clock-outline" width={16} color="orange" />
          <Typography variant="body2" color="warning.main">
            <strong>{pending}</strong> pending
          </Typography>
        </Box>
      )}
      {evicted > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Icon icon="mdi:alert-circle-outline" width={16} color="red" />
          <Typography variant="body2" color="error.main">
            <strong>{evicted}</strong> evicted
          </Typography>
        </Box>
      )}
      {finished > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Icon icon="mdi:flag-checkered" width={16} />
          <Typography variant="body2">
            <strong>{finished}</strong> finished
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

/** Formats a pod set's resource requests as a compact string, e.g. "2 × cpu:1 memory:2Gi". */
function podSetsLabel(workload: W): string {
  return (workload.spec.podSets ?? [])
    .map(ps => {
      const containers = ps.template?.spec?.containers ?? [];
      const requests = containers[0]?.resources?.requests ?? {};
      const res = Object.entries(requests)
        .map(([k, v]) => `${k}:${v}`)
        .join(' ');
      return `${ps.count}×${ps.name}${res ? ` (${res})` : ''}`;
    })
    .join(', ');
}

const COLUMNS = [
  {
    label: 'Name',
    getValue: (w: W) => w.metadata.name,
    render: (w: W) => (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Icon icon="mdi:briefcase-outline" width={14} />
          <Typography variant="body2" fontWeight={500}>
            {w.metadata.name}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          ns: {w.metadata.namespace}
        </Typography>
      </Box>
    ),
  },
  {
    label: 'Status',
    getValue: (w: W) => w.phase,
    render: (w: W) => <WorkloadStatusChip workload={w} />,
  },
  {
    label: 'Local Queue',
    getValue: (w: W) => w.queueName,
    render: (w: W) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon icon="mdi:format-list-bulleted" width={12} />
        <Typography variant="body2">{w.queueName}</Typography>
      </Box>
    ),
  },
  {
    label: 'Cluster Queue',
    getValue: (w: W) => w.admittedClusterQueue ?? '—',
    render: (w: W) =>
      w.admittedClusterQueue ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Icon icon="mdi:server-network" width={12} />
          <Typography variant="body2">{w.admittedClusterQueue}</Typography>
        </Box>
      ) : (
        <Typography color="text.disabled">—</Typography>
      ),
  },
  {
    label: 'Priority',
    getValue: (w: W) => w.spec.priority ?? 0,
    render: (w: W) => <Typography variant="body2">{w.spec.priority ?? 0}</Typography>,
  },
  {
    label: 'Pod Sets',
    getValue: (w: W) => podSetsLabel(w),
    render: (w: W) => {
      const label = podSetsLabel(w);
      return (
        <Tooltip title={label}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label || '—'}
          </Typography>
        </Tooltip>
      );
    },
  },
  {
    label: 'Active',
    getValue: (w: W) => (w.isActive ? 'Yes' : 'Paused'),
    render: (w: W) =>
      w.isActive ? (
        <Typography variant="body2" color="success.main">
          Running
        </Typography>
      ) : (
        <Typography variant="body2" color="warning.main">
          Paused
        </Typography>
      ),
  },
];

export function WorkloadList() {
  const { workloads, loading, error, notInstalled } = useWorkloads();

  if (notInstalled) return <NotInstalledState />;

  return (
    <Box sx={{ p: 1 }}>
      {!loading && workloads.length > 0 && <SummaryStrip workloads={workloads} />}
      <ResourceListView
        title="Workloads"
        data={loading ? null : workloads}
        errorMessage={error}
        columns={COLUMNS}
      />
    </Box>
  );
}
