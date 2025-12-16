import api from './api';

export const projectsService = {
    createProject: async (projectData: any) => {
        const response = await api.post('/projects/', projectData);
        return response.data;
    },
    getAllProjects: async () => {
        const response = await api.get('/projects/');
        return response.data;
    },
    getProject: async (id: string) => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },
    deleteProject: async (id: string) => {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    },
    addNote: async (projectId: string, noteContent: string) => {
        const response = await api.post(`/projects/${projectId}/notes`, { content: noteContent });
        return response.data;
    },
    deleteNote: async (projectId: string, noteId: string) => {
        const response = await api.delete(`/projects/${projectId}/notes/${noteId}`);
        return response.data;
    }
};
