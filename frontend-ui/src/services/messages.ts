import api from './api';

export const messagesService = {
    getMessages: async (projectId: string) => {
        const response = await api.get(`/projects/${projectId}/messages/`);
        return response.data;
    },
    sendMessage: async (projectId: string, messageData: any) => {
        const response = await api.post(`/projects/${projectId}/messages/`, messageData);
        return response.data;
    }
};
