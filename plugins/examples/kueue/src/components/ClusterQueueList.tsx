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
import { ClusterQueue } from '../api/clusterQueue';
import { useClusterQueues } from '../hooks/useKueue';
import { NotInstalledState } from './NotInstalledState';
import { FlavorQuotaBars } from './ResourceBar';
import { ActiveStatusChip } from './WorkloadStatusChip';

type CQ = InstanceType<typeof ClusterQueue>;

function SummaryStrip({ queues }: { queues: CQ[] }) {
  const totalPending = queues.reduce((s, q) => s + q.pendingWorkloads, 0);
  const totalAdmitted = queues.reduce((s, q) => s + q.admittedWorkloads, 0);
  const inactive = queues.filter(q => !q.isActive).length;

  return (
    <Stack direction="row" spacing={3} sx={{ mb: 2 }} flexWrap="wrap">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon icon="mdi:server-network" width={16} />
        <Typography variant="body2">
          <strong>{queues.length}</strong> cluster queue{queues.length !== 1 ? 's' : ''}
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
      {inactive > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Icon icon="mdi:alert-circle-outline" width={16} color="red" />
          <Typography variant="body2" color="error.main">
            <strong>{inactive}</strong> inactive
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

const COLUMNS = [
  {
    label: 'Name',
    getValue: (q: CQ) => q.metadata.name,
    render: (q: CQ) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon icon="mdi:server-network" width={14} />
        <Typography variant="body2" fontWeight={500}>
          {q.metadata.name}
        </Typography>
      </Box>
    ),
  },
  {
    label: 'Status',
    getValue: (q: CQ) => (q.isActive ? 'Active' : 'Inactive'),
    render: (q: CQ) => <ActiveStatusChip isActive={q.isActive} />,
  },
  {
    label: 'Pending',
    getValue: (q: CQ) => q.pendingWorkloads,
    render: (q: CQ) => (
      <Typography variant="body2" color={q.pendingWorkloads > 0 ? 'warning.main' : 'text.primary'}>
        {q.pendingWorkloads}
      </Typography>
    ),
  },
  {
    label: 'Admitted',
    getValue: (q: CQ) => q.admittedWorkloads,
    render: (q: CQ) => (
      <Typography variant="body2" color={q.admittedWorkloads > 0 ? 'success.main' : 'text.primary'}>
        {q.admittedWorkloads}
      </Typography>
    ),
  },
  {
    label: 'Strategy',
    getValue: (q: CQ) => q.spec.queueingStrategy ?? 'BestEffortFIFO',
  },
  {
    label: 'Cohort',
    getValue: (q: CQ) => q.spec.cohort ?? '—',
    render: (q: CQ) => (
      <Typography variant="body2" color={q.spec.cohort ? 'text.primary' : 'text.disabled'}>
        {q.spec.cohort ?? '—'}
      </Typography>
    ),
  },
  {
    label: 'Quota',
    getValue: (q: CQ) => q.metadata.name,
    render: (q: CQ) => {
      const groups = q.spec.resourceGroups ?? [];
      if (groups.length === 0) return <Typography color="text.disabled">—</Typography>;
      const usageMap = new Map((q.status?.flavorsUsage ?? []).map(f => [f.name, f.resources]));
      return (
        <Box sx={{ minWidth: 160 }}>
          {groups.flatMap(rg =>
            rg.flavors.map(f => (
              <FlavorQuotaBars
                key={f.name}
                flavorName={f.name}
                nominalResources={f.resources}
                usedResources={usageMap.get(f.name)}
              />
            ))
          )}
        </Box>
      );
    },
  },
];

export function ClusterQueueList() {
  const { queues, loading, error, notInstalled } = useClusterQueues();

  if (notInstalled) return <NotInstalledState />;

  return (
    <Box sx={{ p: 1 }}>
      {!loading && queues.length > 0 && <SummaryStrip queues={queues} />}
      <ResourceListView
        title="Cluster Queues"
        data={loading ? null : queues}
        errorMessage={error}
        columns={COLUMNS}
      />
    </Box>
  );
}
