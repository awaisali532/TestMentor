import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // ✅ 1. BUG FIX & OPTIMIZATION: Logout ko upar shift kiya
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("pending_reg_otp");
    localStorage.removeItem("otp_persist_reg");
  }, []);

  useEffect(() => {
    const loadUserFromBackend = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${storedToken}`;
        try {
          const { data } = await axios.get(`${API_URL}/auth/profile`);
          setUser(data);
        } catch (error) {
          console.error("⚠️ Token Expired or Invalid:", error.message);
          logout();
        }
      }
      setAuthLoading(false);
    };

    loadUserFromBackend();

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
      },
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [API_URL, logout]); // Safe dependency!

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_URL}/auth/profile`);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (error) {
      console.error("❌ Failed to refresh user data");
    }
  }, [API_URL]);

  const register = useCallback(
    async (name, email, password, gender) => {
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
    },
    [API_URL],
  );

  const login = useCallback(
    async (email, password) => {
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
        throw error.response
          ? error.response.data
          : { message: "Network Error" };
      }
    },
    [API_URL],
  );

  const loginAfterVerification = useCallback((userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  // ✅ 2. MEGA OPTIMIZATION: Context Providers ko cache kar liya
  const value = useMemo(
    () => ({
      user,
      setUser,
      authLoading,
      register,
      login,
      logout,
      loginAfterVerification,
      refreshUser,
    }),
    [
      user,
      authLoading,
      register,
      login,
      logout,
      loginAfterVerification,
      refreshUser,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
