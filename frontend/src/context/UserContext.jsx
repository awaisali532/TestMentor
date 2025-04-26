import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Register function
  const register = async (name, email, password, role) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          name,
          email,
          password,
          role,
        }
      );
      return data; // return data to caller
    } catch (error) {
      throw error.response?.data?.message || "Registration failed!";
    }
  };
  const login = async (email, password) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      {
        email,
        password,
      }
    );
    return response.data;
  };
  return (
    <UserContext.Provider value={{ user, setUser, register, login }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to easily use context
export const useUser = () => useContext(UserContext);
