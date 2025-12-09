import type { AuthProvider } from "@refinedev/core";

const API_URL = "https://ford-api-ford-api.ppm09i.easypanel.host";

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const response = await fetch(`${API_URL}/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.message) {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: data.message,
          },
        };
      }

      localStorage.setItem("username", data.username);
      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid username or password",
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem("username");
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const username = localStorage.getItem("username");
    return {
      authenticated: !!username,
      redirectTo: username ? undefined : "/login",
    };
  },

  getPermissions: async () => null,

  getIdentity: async () => {
    const username = localStorage.getItem("username");
    if (username) {
      return {
        id: 1,
        name: username,
        avatar: "",
      };
    }
    return null;
  },

  onError: async (error) => {
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return {
        logout: true,
      };
    }
    return { error };
  },
};
