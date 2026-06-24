import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ 1. Auth Loading Default TRUE rahega
  const [authLoading, setAuthLoading] = useState(true);

  // ✅ URL Configuration
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // --- 1. INITIAL LOAD (Load Fresh Data from Backend) ---
  useEffect(() => {
    const loadUserFromBackend = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        // 1. Token Header mein set karein
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${storedToken}`;

        try {
          // 2. Server se Data mangwayein (Profile Route)
          const { data } = await axios.get(`${API_URL}/auth/profile`);

          // 3. Fresh Data State mein set karein
          setUser(data);
        } catch (error) {
          console.error("⚠️ Token Expired or Invalid:", error.message);
          logout(); // Token kharab hai to logout kar do
        }
      }

      // ✅ 2. Jab Check Complete ho jaye (Chahe User mile ya na mile), Loading False kar do
      setAuthLoading(false);
    };

    loadUserFromBackend();

    // Axios Interceptor (401 Handling)
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Verify OTP wale errors ko ignore karein
          if (
            error.response.data.message !==
            "Email not verified. Check your inbox for OTP."
          ) {
            logout();
          }
        }
        return Promise.reject(error);
      },
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // --- 2. REFRESH USER (Manual Sync) ---
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_URL}/auth/profile`);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (error) {
      console.error("❌ Failed to refresh user data");
    }
  };

  // ============================================================
  // 🔥 3. REGISTER
  // ============================================================
  const register = async (name, email, password, gender) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        gender,
      });
      return data;
    } catch (error) {
      throw error.response?.data || { message: "Registration failed!" };
    }
  };

  // --- 4. LOGIN ---
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      return data;
    } catch (error) {
      throw error.response ? error.response.data : { message: "Network Error" };
    }
  };

  // --- 5. LOGIN AFTER VERIFICATION ---
  const loginAfterVerification = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  // --- 6. LOGOUT ---
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];

    localStorage.removeItem("pending_reg_otp");
    localStorage.removeItem("otp_persist_reg");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        authLoading, // ✅ Export authLoading
        register,
        login,
        logout,
        loginAfterVerification,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
