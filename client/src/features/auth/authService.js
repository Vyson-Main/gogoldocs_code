// ── Auth Service ──────────────────────────────────────────────────────────────
import { apiClient } from '../../services/apiClient.js';
import { authStore }  from '../../utils/store.js';
import { config }     from '../../config/index.js';
import { API_ROUTES } from '../../../../shared/constants/index.js';

export const authService = {
  /**
   * @param {{ email: string, password: string }} payload
   */
  async login({ email, password }) {
    authStore.setState({ loading: true, error: null });
    try {
      const data = await apiClient.post(API_ROUTES.AUTH_LOGIN, { email, password });
      localStorage.setItem(config.TOKEN_KEY, data.token);
      authStore.setState({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      authStore.setState({ loading: false, error: err.message });
      throw err;
    }
  },

  /**
   * @param {{ email: string, password: string }} payload
   */
  async register({ email, password }) {
    authStore.setState({ loading: true, error: null });
    try {
      const data = await apiClient.post(API_ROUTES.AUTH_REGISTER, { email, password });
      localStorage.setItem(config.TOKEN_KEY, data.token);
      authStore.setState({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      authStore.setState({ loading: false, error: err.message });
      throw err;
    }
  },

  async me() {
    authStore.setState({ loading: true });
    try {
      const user = await apiClient.get(API_ROUTES.AUTH_ME);
      authStore.setState({ user, loading: false });
      return user;
    } catch {
      authStore.setState({ user: null, token: null, loading: false });
      localStorage.removeItem(config.TOKEN_KEY);
    }
  },

  logout() {
    authStore.setState({ user: null, token: null });
    localStorage.removeItem(config.TOKEN_KEY);
  },
};
