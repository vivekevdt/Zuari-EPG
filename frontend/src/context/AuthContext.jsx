import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser as loginAPI } from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const data = await loginAPI(email, password);
            // data normally contains { _id, name, email, token }
            // We'll store it all in localStorage for now
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return data;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
