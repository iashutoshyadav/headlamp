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

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React from 'react';

/**
 * Parses a Kubernetes quantity string into a plain number.
 * Handles: "8", "500m", "4Gi", "2G", "100Mi", "1k".
 */
export function parseQuantity(q: string | undefined): number {
  if (!q) return 0;
  const suffixes: Record<string, number> = {
    Ki: 1024,
    Mi: 1024 ** 2,
    Gi: 1024 ** 3,
    Ti: 1024 ** 4,
    k: 1000,
    M: 1000 ** 2,
    G: 1000 ** 3,
    T: 1000 ** 4,
    m: 0.001,
  };
  for (const [suffix, multiplier] of Object.entries(suffixes)) {
    if (q.endsWith(suffix)) {
      return parseFloat(q.slice(0, -suffix.length)) * multiplier;
    }
  }
  return parseFloat(q) || 0;
}

interface ResourceBarProps {
  /** Kubernetes quantity string for currently used amount (e.g. "3", "2Gi"). */
  used: string | undefined;
  /** Kubernetes quantity string for the limit (nominalQuota). */
  limit: string;
  /** Resource name shown as label (e.g. "cpu", "memory", "nvidia.com/gpu"). */
  resource: string;
}

export function ResourceBar({ used, limit, resource }: ResourceBarProps) {
  const usedN = parseQuantity(used);
  const limitN = parseQuantity(limit);
  const pct = limitN > 0 ? Math.min(usedN / limitN, 1) * 100 : 0;
  const color = pct > 90 ? 'error' : pct > 70 ? 'warning' : 'success';

  const label = `${used ?? '0'} / ${limit}`;

  return (
    <Tooltip title={`${resource}: ${label} (${Math.round(pct)}%)`}>
      <Box sx={{ minWidth: 120 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
          <Typography variant="caption" color="text.secondary">
            {resource}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={pct}
          color={color}
          sx={{ borderRadius: 1, height: 6 }}
        />
      </Box>
    </Tooltip>
  );
}

/** Renders quota bars for all resources in a flavor. */
export function FlavorQuotaBars({
  flavorName,
  nominalResources,
  usedResources,
}: {
  flavorName: string;
  nominalResources: Array<{ name: string; nominalQuota: string }>;
  usedResources?: Array<{ name: string; total?: string }>;
}) {
  const usedMap = new Map(usedResources?.map(r => [r.name, r.total]) ?? []);

  return (
    <Box sx={{ mb: 1 }}>
      <Typography
        variant="caption"
        fontWeight={600}
        color="text.secondary"
        sx={{ mb: 0.5, display: 'block' }}
      >
        {flavorName}
      </Typography>
      {nominalResources.map(r => (
        <Box key={r.name} sx={{ mb: 0.75 }}>
          <ResourceBar resource={r.name} limit={r.nominalQuota} used={usedMap.get(r.name)} />
        </Box>
      ))}
    </Box>
  );
}
