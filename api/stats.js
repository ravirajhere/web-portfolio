export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Cache 10 minutes on Vercel edge
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const username = 'ravirajhere';
  const repo = 'web-portfolio';

  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'ravirajhere-portfolio',
  };

  // Optional: GitHub token for higher rate limit (not required for public data)
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // Fetch user + repo + last commit in parallel
    const [userRes, repoRes, commitsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/repos/${username}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${username}/${repo}/commits?per_page=1`, { headers }),
    ]);

    if (!userRes.ok || !repoRes.ok || !commitsRes.ok) {
      throw new Error('GitHub API error');
    }

    const user = await userRes.json();
    const repoData = await repoRes.json();
    const commits = await commitsRes.json();

    const lastCommit = Array.isArray(commits) && commits[0] ? commits[0] : null;

    // Calculate days since last commit
    let daysSinceCommit = null;
    let lastCommitDate = null;
    let lastCommitMessage = null;

    if (lastCommit && lastCommit.commit && lastCommit.commit.author) {
      lastCommitDate = lastCommit.commit.author.date;
      lastCommitMessage = lastCommit.commit.message.split('\n')[0];

      const commitTime = new Date(lastCommitDate).getTime();
      const now = Date.now();
      daysSinceCommit = Math.floor((now - commitTime) / (1000 * 60 * 60 * 24));
    }

    return res.status(200).json({
      user: {
        publicRepos: user.public_repos || 0,
        followers: user.followers || 0,
        following: user.following || 0,
        createdAt: user.created_at,
      },
      repo: {
        name: repoData.name,
        size: repoData.size,
        pushedAt: repoData.pushed_at,
        updatedAt: repoData.updated_at,
      },
      lastCommit: lastCommit ? {
        message: lastCommitMessage,
        date: lastCommitDate,
        daysAgo: daysSinceCommit,
        url: lastCommit.html_url,
      } : null,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[stats] Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch GitHub stats',
      details: error.message,
    });
  }
}
