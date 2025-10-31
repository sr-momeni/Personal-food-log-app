export const TOKEN_KEY = "foodlog_token";
export const USER_KEY = "foodlog_user";

export const saveSession = ({ token, email, provider }) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (email || provider) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        email: email || null,
        provider: provider || "password",
      })
    );
  }
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("foodlog_test_user");
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Unable to parse stored user", error);
    return null;
  }
};

export const isAuthenticated = () => Boolean(getToken());
