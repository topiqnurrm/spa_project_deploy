import api from "./api.js";
import API_CONFIG from "../config/api-config.js";

class StoryRepository {
  /**
   * Get all stories with optional pagination and location filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (optional)
   * @param {number} options.size - Page size (optional)
   * @param {number} options.location - Include location (1) or not (0) (optional)
   * @returns {Promise<Object>} Stories response
   */
  async getStories({ page, size, location } = {}) {
    return api.get(API_CONFIG.ENDPOINTS.STORIES, { page, size, location });
  }

  /**
   * Get a single story by ID
   * @param {string} id - Story ID
   * @returns {Promise<Object>} Story response
   */
  async getStoryById(id) {
    if (!id) {
      throw new Error("Story ID is required");
    }

    return api.get(`${API_CONFIG.ENDPOINTS.STORIES}/${id}`);
  }

  /**
   * Add a new story with or without authentication
   * @param {Object} storyData - Story data
   * @param {string} storyData.description - Story description
   * @param {File} storyData.photo - Photo file
   * @param {number} storyData.lat - Latitude (optional)
   * @param {number} storyData.lon - Longitude (optional)
   * @param {boolean} useAuth - Whether to use authentication
   * @returns {Promise<Object>} Add story response
   */
  async addStory({ description, photo, lat, lon }, useAuth = true) {
    if (!description || !photo) {
      throw new Error("Description and photo are required");
    }

    const endpoint = useAuth
      ? API_CONFIG.ENDPOINTS.STORIES
      : API_CONFIG.ENDPOINTS.GUEST_STORY;

    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);

    if (lat !== undefined && lon !== undefined) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    return api.postForm(endpoint, formData, useAuth);
  }

  /**
   * Subscribe to web push notifications
   * @param {Object} subscription - Push subscription details
   * @returns {Promise<Object>} Subscription response
   */
  async subscribeToPushNotifications(subscription) {
    return api.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS_SUBSCRIBE, subscription);
  }

  /**
   * Unsubscribe from web push notifications
   * @param {string} endpoint - Subscription endpoint
   * @returns {Promise<Object>} Unsubscription response
   */
  async unsubscribeFromPushNotifications(endpoint) {
    return api.delete(API_CONFIG.ENDPOINTS.NOTIFICATIONS_SUBSCRIBE, {
      endpoint,
    });
  }
}

// Create and export a singleton instance
const storyRepository = new StoryRepository();
export default storyRepository;
