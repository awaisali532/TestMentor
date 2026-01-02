import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // URL wahi rakha hai jo aapne kaha
  const API_URL = import.meta.env.VITE_API_URL;

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const checkUserLoggedIn = () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;
      }
      setAuthLoading(false);
    };

    checkUserLoggedIn();

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          if (
            error.response.data.message !==
            "Email not verified. Check your inbox for OTP."
          ) {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // --- 2. REGISTER (With Debug Logs) ---
  const register = async (name, email, password) => {
    // 👇 LOG 1: Check karein kya data aa rha hai
    console.log("🚀 Register Function Called");
    console.log("📤 Sending Data:", { name, email, password });
    console.log("🔗 Target URL:", `${API_URL}/auth/register`);

    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });

      // 👇 LOG 2: Agar success hua to ye dikhega
      console.log("✅ Registration Success Response:", data);
      return data;
    } catch (error) {
      // 👇 LOG 3: Agar error aya to ye detail dikhegi
      console.error("❌ Registration Request Failed!");

      if (error.response) {
        // Server ne response diya (e.g., 400, 500)
        console.error("🔴 Status Code:", error.response.status);
        console.error("🔴 Error Data (Backend Message):", error.response.data);
      } else if (error.request) {
        // Request gayi lekin response nahi aya
        console.error("⚠️ No Response Received:", error.request);
      } else {
        // Request set karne me masla
        console.error("⚠️ Request Setup Error:", error.message);
      }

      throw error.response?.data || { message: "Registration failed!" };
    }
  };

  // --- 3. LOGIN (With Debug Logs) ---
  const login = async (email, password) => {
    console.log("🚀 Login Function Called for:", email);

    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      console.log("✅ Login Success:", data);

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      return data;
    } catch (error) {
      console.error("❌ Login Failed:", error.response?.data || error.message);
      throw error.response ? error.response.data : { message: "Network Error" };
    }
  };

  // --- 4. LOGIN AFTER VERIFICATION ---
  const loginAfterVerification = (userData, token) => {
    console.log("🔓 Logging in after Verification");
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  // --- 5. LOGOUT ---
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
        register,
        login,
        logout,
        authLoading,
        loginAfterVerification,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
