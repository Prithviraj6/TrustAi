import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

interface User {
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    profileImage: string | null;
}

interface UserContextType {
    user: User;
    updateUser: (updates: Partial<User>) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const defaultUser: User = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    bio: 'Senior Analyst specializing in contract verification and risk assessment.',
    profileImage: null
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('userProfile');
            return saved ? JSON.parse(saved) : defaultUser;
        }
        return defaultUser;
    });

    const navigate = useNavigate();

    const refreshUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const userData = await authService.getCurrentUser();
            const nameParts = userData.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';

            setUser(prev => ({
                ...prev,
                firstName,
                lastName,
                email: userData.email,
                bio: userData.bio || prev.bio,
                profileImage: userData.profile_image || null
            }));
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    useEffect(() => {
        localStorage.setItem('userProfile', JSON.stringify(user));
    }, [user]);

    // Initial fetch on mount
    useEffect(() => {
        refreshUser();
    }, []);

    const updateUser = async (updates: Partial<User>) => {
        // Optimistic update
        setUser(prev => ({ ...prev, ...updates }));

        // Prepare data for backend
        const backendUpdates: any = {};

        if (updates.firstName || updates.lastName) {
            // If updating name, we need to construct the full name
            // We use the *new* value if present, otherwise fall back to current state
            const fName = updates.firstName ?? user.firstName;
            const lName = updates.lastName ?? user.lastName;
            backendUpdates.name = `${fName} ${lName}`.trim();
        }

        if (updates.bio !== undefined) backendUpdates.bio = updates.bio;
        if (updates.profileImage !== undefined) backendUpdates.profile_image = updates.profileImage;

        if (Object.keys(backendUpdates).length > 0) {
            try {
                await authService.updateProfile(backendUpdates);
            } catch (error) {
                console.error('Failed to save profile updates to backend:', error);
                // Optionally revert state here if needed, but for now we just log
            }
        }
    };

    const logout = () => {
        authService.logout(); // Clear token from localStorage
        localStorage.removeItem('userProfile');
        localStorage.removeItem('profileImage');
        setUser(defaultUser);
        navigate('/');
    };

    return (
        <UserContext.Provider value={{ user, updateUser, logout, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
