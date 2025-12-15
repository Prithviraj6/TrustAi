import api from './api';

export const filesService = {
    uploadFile: async (projectId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/files/projects/${projectId}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    getFileUrl: (fileId: string) => {
        return `http://localhost:8000/files/${fileId}`;
    },
    getProjectFiles: async (projectId: string) => {
        const response = await api.get(`/files/project/${projectId}`);
        return response.data;
    },
    deleteFile: async (fileId: string) => {
        await api.delete(`/files/${fileId}`);
    }
};
