import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { Project } from '../types';
import { projectsService } from '../services/projects';
import { useToast } from './ToastContext';

interface ProjectContextType {
    projects: Project[];
    isLoading: boolean;
    addProject: (project: Omit<Project, 'id' | 'lastUpdated' | 'created' | 'files' | 'trustScore' | 'status' | 'type' | 'date' | 'history' | 'documents' | 'notes' | 'activityLog' | 'tags'>) => Promise<void>;
    updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    getProject: (id: string) => Project | undefined;
    refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    const hasFetched = useRef(false);  // Track if we've already fetched

    const fetchProjects = async (force = false) => {
        // Skip if already fetched and not forced
        if (hasFetched.current && !force && projects.length > 0) {
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const data = await projectsService.getAllProjects();
            // Ensure dates are Date objects
            const formattedProjects = data.map((p: any) => ({
                ...p,
                id: p._id || p.id, // Handle both _id and id
                lastUpdated: new Date(p.lastUpdated),
                created: new Date(p.created),
                // Ensure arrays exist and map dates
                history: (p.history || []).map((h: any) => ({
                    ...h,
                    timestamp: new Date(h.timestamp)
                })),
                documents: (p.documents || []).map((d: any) => ({
                    ...d,
                    addedAt: d.addedAt ? new Date(d.addedAt) : new Date()
                })),
                notes: (p.notes || []).map((n: any) => ({
                    ...n,
                    createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
                    updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date()
                })),
                activityLog: p.activityLog || [],
                tags: p.tags || []
            }));
            setProjects(formattedProjects);
            hasFetched.current = true;  // Mark as fetched
        } catch (error: any) {
            console.error('Failed to fetch projects:', error);
            // Only show toast if not a network/connection issue (user might just be offline briefly)
            if (error?.response?.status && error.response.status !== 401) {
                showToast('error', 'Failed to load projects. Please refresh.');
            }
            // Don't mark as fetched so it can retry
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const addProject = async (projectData: any) => {
        try {
            const newProject = await projectsService.createProject(projectData);
            // Format the new project to match state structure
            const formattedProject = {
                ...newProject,
                id: newProject._id || newProject.id,
                lastUpdated: new Date(newProject.lastUpdated),
                created: new Date(newProject.created),
                history: [],
                documents: [],
                notes: [],
                activityLog: [],
                tags: []
            };
            setProjects(prev => [formattedProject, ...prev]);
        } catch (error) {
            console.error('Failed to create project:', error);
            throw error;
        }
    };

    const updateProject = async (id: string, updates: Partial<Project>) => {
        try {
            // Optimistic update
            setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

            // API call (assuming update endpoint exists, if not we might need to implement it or just rely on local state for now if backend is partial)
            // For now, we'll assume the backend update is implemented or we just update local state if it's a simple property
            // If backend update is needed: await projectsService.updateProject(id, updates);
        } catch (error) {
            console.error('Failed to update project:', error);
            showToast('error', 'Failed to update project');
            fetchProjects(); // Revert on error
        }
    };

    const deleteProject = async (id: string) => {
        try {
            await projectsService.deleteProject(id);
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete project:', error);
            showToast('error', 'Failed to delete project');
            throw error;
        }
    };

    const getProject = (id: string) => {
        return projects.find(p => p.id === id);
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            isLoading,
            addProject,
            updateProject,
            deleteProject,
            getProject,
            refreshProjects: () => fetchProjects(true)  // Force refresh when explicitly called
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
}
