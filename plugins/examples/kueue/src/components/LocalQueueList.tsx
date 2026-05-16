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
import Typography from '@mui/material/Typography';
import React from 'react';
import { LocalQueue } from '../api/localQueue';
import { useLocalQueues } from '../hooks/useKueue';
import { NotInstalledState } from './NotInstalledState';
import { ActiveStatusChip } from './WorkloadStatusChip';

type LQ = InstanceType<typeof LocalQueue>;

function SummaryStrip({ localQueues }: { localQueues: LQ[] }) {
  const totalPending = localQueues.reduce((s, q) => s + q.pendingWorkloads, 0);
  const totalAdmitted = localQueues.reduce((s, q) => s + q.admittedWorkloads, 0);

  return (
    <Stack direction="row" spacing={3} sx={{ mb: 2 }} flexWrap="wrap">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon icon="mdi:format-list-bulleted" width={16} />
        <Typography variant="body2">
          <strong>{localQueues.length}</strong> local queue{localQueues.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon icon="mdi:check-circle-outline" width={16} color="green" />
        <Typography variant="body2">
          <strong>{totalAdmitted}</strong> admitted workloads
        </Typography>
      </Box>
      {totalPending > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Icon icon="mdi:clock-outline" width={16} color="orange" />
          <Typography variant="body2" color="warning.main">
            <strong>{totalPending}</strong> pending
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

const COLUMNS = [
  {
    label: 'Name',
    getValue: (q: LQ) => q.metadata.name,
    render: (q: LQ) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon icon="mdi:format-list-bulleted" width={14} />
        <Typography variant="body2" fontWeight={500}>
          {q.metadata.name}
        </Typography>
      </Box>
    ),
  },
  {
    label: 'Namespace',
    getValue: (q: LQ) => q.metadata.namespace ?? '',
  },
  {
    label: 'Cluster Queue',
    getValue: (q: LQ) => q.clusterQueue,
    render: (q: LQ) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon icon="mdi:server-network" width={12} color="text.secondary" />
        <Typography variant="body2">{q.clusterQueue}</Typography>
      </Box>
    ),
  },
  {
    label: 'Status',
    getValue: (q: LQ) => (q.isActive ? 'Active' : 'Inactive'),
    render: (q: LQ) => <ActiveStatusChip isActive={q.isActive} />,
  },
  {
    label: 'Pending',
    getValue: (q: LQ) => q.pendingWorkloads,
    render: (q: LQ) => (
      <Typography variant="body2" color={q.pendingWorkloads > 0 ? 'warning.main' : 'text.primary'}>
        {q.pendingWorkloads}
      </Typography>
    ),
  },
  {
    label: 'Admitted',
    getValue: (q: LQ) => q.admittedWorkloads,
    render: (q: LQ) => (
      <Typography variant="body2" color={q.admittedWorkloads > 0 ? 'success.main' : 'text.primary'}>
        {q.admittedWorkloads}
      </Typography>
    ),
  },
];

export function LocalQueueList() {
  const { localQueues, loading, error, notInstalled } = useLocalQueues();

  if (notInstalled) return <NotInstalledState />;

  return (
    <Box sx={{ p: 1 }}>
      {!loading && localQueues.length > 0 && <SummaryStrip localQueues={localQueues} />}
      <ResourceListView
        title="Local Queues"
        data={loading ? null : localQueues}
        errorMessage={error}
        columns={COLUMNS}
      />
    </Box>
  );
}
