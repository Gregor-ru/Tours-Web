// Мини-клиент GitHub API для админки: прочитать файл, загрузить картинку, сделать один коммит.
// Токен — GITHUB_TOKEN (fine-grained, только этот репозиторий, Contents: Read and write).
import 'server-only';

const API = 'https://api.github.com';

function cfg() {
  return {
    token: process.env.GITHUB_TOKEN!.trim(),
    repo: process.env.GITHUB_REPO!.trim(), // «владелец/репозиторий», например Gregor-ru/Tours-Web
    branch: process.env.GITHUB_BRANCH?.trim() || 'main',
  };
}

async function gh<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = cfg();
  const res = await fetch(API + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    // Токен в лог не попадает: только путь запроса и ответ GitHub
    throw new Error(`GitHub ${res.status} ${path.split('?')[0]}: ${info?.message ?? ''}`);
  }
  return res.json() as Promise<T>;
}

// Текст файла из ветки (свежий, а не из текущей сборки сайта).
export async function readRepoFile(path: string): Promise<string> {
  const { repo, branch } = cfg();
  const r = await gh<{ content: string }>(`/repos/${repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(branch)}`);
  return Buffer.from(r.content, 'base64').toString('utf8');
}

// Загружает содержимое как blob (ещё не коммит — сайт не пересобирается). Возвращает sha.
export async function uploadBlob(data: Buffer): Promise<string> {
  const { repo } = cfg();
  const r = await gh<{ sha: string }>(`/repos/${repo}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({ content: data.toString('base64'), encoding: 'base64' }),
  });
  return r.sha;
}

// Один коммит со всеми изменениями: файлы по sha загруженных blob-ов или текстом.
export async function commitFiles(files: { path: string; sha?: string; content?: string }[], message: string): Promise<string> {
  const { repo, branch } = cfg();
  const ref = await gh<{ object: { sha: string } }>(`/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  const head = ref.object.sha;
  const commit = await gh<{ tree: { sha: string } }>(`/repos/${repo}/git/commits/${head}`);
  const tree = await gh<{ sha: string }>(`/repos/${repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: commit.tree.sha,
      tree: files.map((f) => ({ path: f.path, mode: '100644', type: 'blob', ...(f.sha ? { sha: f.sha } : { content: f.content }) })),
    }),
  });
  const created = await gh<{ sha: string }>(`/repos/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [head] }),
  });
  await gh(`/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: created.sha }),
  });
  return created.sha;
}
