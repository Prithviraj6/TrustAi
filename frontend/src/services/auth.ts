import api from './api';

export const authService = {
    signup: async (userData: any) => {
        const response = await api.post('/auth/signup', userData);
        return response.data;
    },
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    googleLogin: async (credential: string) => {
        const response = await api.post('/auth/google', { credential });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    updateProfile: async (data: { name?: string; bio?: string; profile_image?: string }) => {
        const response = await api.put('/auth/me', data);
        return response.data;
    },
    forgotPassword: async (email: string) => {
        await api.post('/auth/forgot-password', { email });
    },
    resetPassword: async (token: string, newPassword: string) => {
        await api.post('/auth/reset-password', { token, new_password: newPassword });
    }
};
