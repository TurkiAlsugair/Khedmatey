import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("authToken");
        const savedRole = await AsyncStorage.getItem("userRole");
        const savedUserInfo = await AsyncStorage.getItem("userInfo");
        console.log(
          `Info Saved: \n token: ${savedToken} savedRole: ${savedRole} userInfo: ${savedUserInfo}`
        );

        if (savedToken) {
          setToken(savedToken);
          setUserRole(savedRole);
          setUserRole("");
          if (savedUserInfo) {
            setUserInfo(JSON.parse(savedUserInfo));
          }
        }
      } catch (error) {
        console.error("Failed to load user from AsyncStorage", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (token, userRole, user) => {
    setToken(token);
    setUserRole(userRole);
    setUserInfo(user);

    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("userRole", userRole);
    await AsyncStorage.setItem("userInfo", JSON.stringify(user));

    console.log(
      `loged in \n token: ${token} \n role: ${userRole} \n userData: ${JSON.stringify(
        user,
        null,
        2
      )}`
    );
  };

  const logout = async () => {
    setToken(null);
    setUserRole(null);
    setUserInfo(null);

    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userRole");
    await AsyncStorage.removeItem("userInfo");
  };

  const updateUserInfo = async (newUserInfo) => {
    try {
      setUserInfo(newUserInfo); // update state
      await AsyncStorage.setItem("userInfo", JSON.stringify(newUserInfo)); // persist
    } catch (error) {
      console.error("Failed to update user info", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userRole,
        token,
        userInfo,
        login,
        logout,
        loading,
        updateUserInfo, // use to persist changes
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
