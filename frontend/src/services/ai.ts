import api from './api';

// Base URL for direct API calls (no auth interceptor)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface GuestAnalysisResult {
    score: number;
    verdict: string;
    citations: string[];
    analysis_markdown: string;
    remaining_credits: number;
}

export const aiService = {
    analyzeText: async (text: string, projectId?: string) => {
        const response = await api.post('/ai/analyze', { text, project_id: projectId });
        return response.data;
    },

    // Guest endpoints (no auth required)
    analyzeTextGuest: async (text: string): Promise<GuestAnalysisResult> => {
        const response = await fetch(`${API_BASE}/ai/analyze-guest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail?.message || error.detail || 'Analysis failed');
        }

        return response.json();
    },

    getGuestCredits: async (): Promise<{ remaining_credits: number; daily_limit: number }> => {
        const response = await fetch(`${API_BASE}/ai/guest-credits`);
        return response.json();
    }
};

