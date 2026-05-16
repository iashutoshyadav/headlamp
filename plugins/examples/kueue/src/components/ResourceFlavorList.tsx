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
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';
import { ResourceFlavor } from '../api/resourceFlavor';
import { useResourceFlavors } from '../hooks/useKueue';
import { NotInstalledState } from './NotInstalledState';
import { ReadyStatusChip } from './WorkloadStatusChip';

type RF = InstanceType<typeof ResourceFlavor>;

/** Renders node labels as compact Chip elements. */
function NodeLabelChips({ labels }: { labels: { [k: string]: string } }) {
  const entries = Object.entries(labels);
  if (entries.length === 0) return <Typography color="text.disabled">—</Typography>;
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {entries.map(([k, v]) => (
        <Chip
          key={k}
          size="small"
          label={`${k}=${v}`}
          variant="outlined"
          sx={{ fontSize: '0.7rem' }}
        />
      ))}
    </Stack>
  );
}

const COLUMNS = [
  {
    label: 'Name',
    getValue: (f: RF) => f.metadata.name,
    render: (f: RF) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon icon="mdi:tag-multiple" width={14} />
        <Typography variant="body2" fontWeight={500}>
          {f.metadata.name}
        </Typography>
      </Box>
    ),
  },
  {
    label: 'Status',
    getValue: (f: RF) => (f.isReady ? 'Ready' : 'Not Ready'),
    render: (f: RF) => <ReadyStatusChip isReady={f.isReady} />,
  },
  {
    label: 'Node Labels',
    getValue: (f: RF) =>
      Object.entries(f.nodeLabels)
        .map(([k, v]) => `${k}=${v}`)
        .join(', '),
    render: (f: RF) => <NodeLabelChips labels={f.nodeLabels} />,
  },
  {
    label: 'Taints',
    getValue: (f: RF) => f.spec.nodeTaints?.length ?? 0,
    render: (f: RF) => {
      const taints = f.spec.nodeTaints ?? [];
      if (taints.length === 0) return <Typography color="text.disabled">—</Typography>;
      return (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {taints.map((t, i) => (
            <Chip
              key={i}
              size="small"
              label={`${t.key}:${t.effect}`}
              variant="outlined"
              color="warning"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
        </Stack>
      );
    },
  },
  {
    label: 'Topology',
    getValue: (f: RF) => f.spec.topologyName ?? '—',
    render: (f: RF) => (
      <Typography variant="body2" color={f.spec.topologyName ? 'text.primary' : 'text.disabled'}>
        {f.spec.topologyName ?? '—'}
      </Typography>
    ),
  },
];

export function ResourceFlavorList() {
  const { flavors, loading, error, notInstalled } = useResourceFlavors();

  if (notInstalled) return <NotInstalledState />;

  return (
    <Box sx={{ p: 1 }}>
      <ResourceListView
        title="Resource Flavors"
        data={loading ? null : flavors}
        errorMessage={error}
        columns={COLUMNS}
      />
    </Box>
  );
}
