import api from "./api.js";
import API_CONFIG from "../config/api-config.js";

class AuthRepository {
  constructor() {
    this._authStorageKey = "auth_token";
    this._userDataKey = "user_data";
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password (min 8 characters)
   * @returns {Promise<Object>} Registration response
   */
  async register({ name, email, password }) {
    return api.post(
      API_CONFIG.ENDPOINTS.REGISTER,
      { name, email, password },
      false
    );
  }

  /**
   * Login user and store auth token
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Login response with user data and token
   */
  async login({ email, password }) {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.LOGIN,
      { email, password },
      false
    );

    if (response.loginResult) {
      this._saveAuthData(response.loginResult);
    }

    return response;
  }

  /**
   * Logout user and clear auth data
   */
  logout() {
    localStorage.removeItem(this._authStorageKey);
    localStorage.removeItem(this._userDataKey);

    window.dispatchEvent(new Event("user-logged-out"));
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated, false otherwise
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Get authentication token
   * @returns {string|null} Auth token or null if not authenticated
   */
  getToken() {
    return localStorage.getItem(this._authStorageKey);
  }

  /**
   * Get authenticated user data
   * @returns {Object|null} User data or null if not authenticated
   */
  getUserData() {
    const userData = localStorage.getItem(this._userDataKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Save authentication data to local storage
   * @param {Object} loginResult - Login result from API
   * @param {string} loginResult.token - Auth token
   * @param {string} loginResult.userId - User ID
   * @param {string} loginResult.name - User's name
   * @private
   */
  _saveAuthData(loginResult) {
    const { token, userId, name } = loginResult;

    localStorage.setItem(this._authStorageKey, token);
    localStorage.setItem(this._userDataKey, JSON.stringify({ userId, name }));

    window.dispatchEvent(new Event("user-logged-in"));
  }
}

const authRepository = new AuthRepository();
export default authRepository;
