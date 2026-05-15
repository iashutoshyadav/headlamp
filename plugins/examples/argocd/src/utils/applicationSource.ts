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

/**
 * Returns a short human-readable repo label for any Git host.
 *
 * Known hosts (GitHub, GitLab, Bitbucket) → "org/repo"
 * Other HTTPS hosts                        → "hostname/org/repo"
 * SCP-style SSH URLs (git@host:org/repo)   → "host/org/repo"
 */
export function getShortRepoName(repoURL: string): string {
  try {
    const url = new URL(repoURL);
    const path = url.pathname.replace(/^\//, '').replace(/\.git$/, '');
    const knownHosts = ['github.com', 'gitlab.com', 'bitbucket.org'];
    return knownHosts.includes(url.hostname) ? path : `${url.hostname}/${path}`;
  } catch {
    // SCP-style: git@github.com:org/repo.git
    return repoURL.replace(/^git@([^:]+):/, '$1/').replace(/\.git$/, '');
  }
}
