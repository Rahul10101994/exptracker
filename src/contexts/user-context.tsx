
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = {
    name: string;
    email: string;
    password?: string;
};

interface UserContextType {
    user: User | null;
    signUp: (details: Required<User>) => void;
    login: (credentials: Omit<Required<User>, 'name'>) => boolean;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const signUp = (details: Required<User>) => {
        setUser(details);
    };

    const login = (credentials: Omit<Required<User>, 'name'>) => {
        if (user && user.email === credentials.email && user.password === credentials.password) {
            return true;
        }
        return false;
    };
    
    const logout = () => {
        setUser(null);
    }

    return (
        <UserContext.Provider value={{ user, signUp, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
