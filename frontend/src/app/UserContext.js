'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stashbackend.onrender.com';
const UserContext = createContext();

export function UserProvider({ children }) {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem('stash_user_email');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `Error ${res.status}`);
    }
    const data = await res.json();
    localStorage.setItem('stash_user_email', data.email);
    setUserEmail(data.email);
  };

  const signup = async (email, password) => {
    const res = await fetch(`${API_URL}/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `Error ${res.status}`);
    }
    const data = await res.json();
    // Log them in immediately after signup
    localStorage.setItem('stash_user_email', data.email);
    setUserEmail(data.email);
  };

  const logout = () => {
    localStorage.removeItem('stash_user_email');
    setUserEmail(null);
  };

  return (
    <UserContext.Provider value={{ userEmail, login, signup, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);