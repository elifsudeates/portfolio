// Build-time'da GitHub REST API'den public repoları çeker.
// Token gerekmez ama rate limit (60/saat) düşük olduğu için CI'da
// GITHUB_TOKEN env varsa onu kullanırız (5000/saat).

const USERNAME = "elifsudeates";

export interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  pushed_at: string;
}

export async function getRepos(): Promise<Repo[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  // CI'da token varsa rate limit'i yükseltir
  const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`,
    { headers }
  );

  if (!res.ok) {
    console.warn(`GitHub API hatası: ${res.status} — boş liste dönülüyor`);
    return [];
  }

  const repos: Repo[] = await res.json();

  // Fork'ları ele, açıklaması olanları öne al, push tarihine göre sırala
  return repos
    .filter((r: any) => !r.fork && !r.archived)
    .sort(
      (a, b) =>
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    );
}
