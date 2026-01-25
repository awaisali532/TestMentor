import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ✅ URL Configuration
  const API_URL = import.meta.env.VITE_API_URL;

  // --- 1. INITIAL LOAD (Load Fresh Data from Backend) ---
  useEffect(() => {
    const loadUserFromBackend = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        // 1. Token Header mein set karein
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${storedToken}`;

        try {
          console.log("🔄 Fetching Fresh User Profile...");

          // 2. LocalStorage ki bajaye Server se Data mangwayein
          // Note: Humne pichle step mein /auth/profile route banaya tha
          const { data } = await axios.get(`${API_URL}/auth/profile`);

          // 3. Fresh Data State mein set karein
          setUser(data);
          console.log(
            "✅ User Loaded from Backend:",
            data.email,
            "| Plan:",
            data.planType,
          );
        } catch (error) {
          console.error("⚠️ Token Invalid or Session Expired:", error.message);
          logout(); // Token kharab hai to logout kar do
        }
      }
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

  // --- 2. REFRESH USER (New Feature) ---
  // Isay hum Dashboard se call karenge agar plan sync na ho
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      console.log("🔄 Manually Refreshing User Data...");
      const { data } = await axios.get(`${API_URL}/auth/profile`);
      setUser(data);
      // Optional: LocalStorage backup update karein
      localStorage.setItem("user", JSON.stringify(data));
      console.log("✅ User Refreshed Successfully.");
    } catch (error) {
      console.error("❌ Failed to refresh user data");
    }
  };

  // --- 3. REGISTER ---
  const register = async (name, email, password) => {
    console.log("🚀 Register Called:", { name, email });
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });
      console.log("✅ Register Success:", data);
      return data;
    } catch (error) {
      console.error("❌ Register Failed:", error.response?.data);
      throw error.response?.data || { message: "Registration failed!" };
    }
  };

  // --- 4. LOGIN ---
  const login = async (email, password) => {
    console.log("🚀 Login Called for:", email);
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      console.log("✅ Login Success:", data);

      // State Update
      setUser(data.user);

      // Storage Update
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      // Axios Header Update
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      return data;
    } catch (error) {
      console.error("❌ Login Failed:", error.response?.data);
      throw error.response ? error.response.data : { message: "Network Error" };
    }
  };

  // --- 5. LOGIN AFTER VERIFICATION ---
  const loginAfterVerification = (userData, token) => {
    console.log("🔓 Logging in after Verification");
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  // --- 6. LOGOUT ---
  const logout = () => {
    console.log("👋 Logging Out");
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];

    localStorage.removeItem("pending_reg_otp");
    localStorage.removeItem("pending_login_otp");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        authLoading,
        register,
        login,
        logout,
        loginAfterVerification,
        refreshUser, // ✅ New Function Exported
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
