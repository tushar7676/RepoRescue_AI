import { AnalyzeResponse, ImpactResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function analyzeRepository(repoUrl: string): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repo_url: repoUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to analyze repository' }));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

export async function analyzeImpact(repoUrl: string, changeRequest: string): Promise<ImpactResponse> {
  const response = await fetch(`${API_BASE_URL}/api/impact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo_url: repoUrl,
      change_request: changeRequest,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to analyze change impact' }));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return response.json();
}
