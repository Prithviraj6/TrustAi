export interface Note {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
}

export interface ProjectDocument {
    id: string;
    name: string;
    type: 'PDF' | 'Image' | 'Text';
    url?: string; // For preview
    size?: string;
    addedAt: Date;
    trustScore?: number;
}

export interface ActivityLog {
    id: string;
    action: string;
    timestamp: Date;
    details?: string;
}

export interface AnalysisResult {
    id: string;
    content: string; // The user input or file content
    aiResponse: string;
    trustScore: number;
    status: 'Trustworthy' | 'Neutral' | 'Risky';
    timestamp: Date;
    type: 'Text' | 'PDF' | 'Image' | 'Mixed';
    fileName?: string; // If a file was uploaded
}

export interface Project {
    id: string;
    name: string;
    description: string;
    files: number; // Count of analyses/files
    priority: string;
    date: string; // Created date string (e.g., "2 days ago")
    trustScore: number; // Average or latest score
    status: 'Trustworthy' | 'Neutral' | 'Risky';
    type: 'PDF' | 'Image' | 'Text' | 'Mixed';
    lastUpdated: Date;
    created: Date;
    category: string;
    tags: string[];
    history: AnalysisResult[];
    documents: ProjectDocument[];
    notes: Note[];
    activityLog: ActivityLog[];
}
