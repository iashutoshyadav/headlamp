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
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React from 'react';

export function NotInstalledState() {
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
      <Icon icon="mdi:layers-triple-outline" width={56} />
      <Typography variant="h6">Kueue is not installed</Typography>
      <Typography variant="body2" align="center" sx={{ maxWidth: 440 }}>
        Kueue is a Kubernetes-native batch workload queueing system. Install it to manage
        ClusterQueues, LocalQueues, and Workloads from this UI.
      </Typography>
      <Link href="https://kueue.sigs.k8s.io/docs/installation/" target="_blank" rel="noopener">
        Kueue installation guide →
      </Link>
    </Box>
  );
}
