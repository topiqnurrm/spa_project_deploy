import axios from "axios";
import API_CONFIG from "../config/api-config.js";

class Api {
  constructor() {
    this._client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: API_CONFIG.DEFAULT_HEADERS,
    });

    this._client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan pada server";
        return Promise.reject(new Error(message));
      }
    );
  }

  /**
   * Get auth token
   * @returns {string|null} Token
   */
  _getToken() {
    return localStorage.getItem("auth_token");
  }

  /**
   * Get auth header for authenticated requests
   * @returns {Object} Auth header
   */
  _getAuthHeader() {
    const token = this._getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Send GET request
   * @param {string} url - Endpoint
   * @param {Object} params - URL parameters
   * @param {boolean} auth - Require authentication
   * @returns {Promise} Response
   */
  async get(url, params = {}, auth = true) {
    const headers = auth ? this._getAuthHeader() : {};

    return this._client.get(url, {
      params,
      headers,
    });
  }

  /**
   * Send POST request with JSON data
   * @param {string} url - Endpoint
   * @param {Object} data - Request body
   * @param {boolean} auth - Require authentication
   * @returns {Promise} Response
   */
  async post(url, data = {}, auth = true) {
    const headers = auth ? this._getAuthHeader() : {};

    return this._client.post(url, data, { headers });
  }

  /**
   * Send POST request with multipart/form-data
   * @param {string} url - Endpoint
   * @param {FormData} formData - Form data
   * @param {boolean} auth - Require authentication
   * @returns {Promise} Response
   */
  async postForm(url, formData, auth = true) {
    const headers = auth ? this._getAuthHeader() : {};

    return this._client.post(url, formData, {
      headers: {
        ...headers,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * Send DELETE request
   * @param {string} url - Endpoint
   * @param {Object} data - Request body
   * @param {boolean} auth - Require authentication
   * @returns {Promise} Response
   */
  async delete(url, data = {}, auth = true) {
    const headers = auth ? this._getAuthHeader() : {};

    return this._client.delete(url, {
      headers,
      data,
    });
  }
}

const api = new Api();
export default api;
