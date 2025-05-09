import API_CONFIG from "../config/api-config.js";
import L from "leaflet";

class MapHelper {
  constructor() {
    this._map = null;
    this._markers = [];
    this._selectedLocation = null;
    this._mapOptions = {
      center: API_CONFIG.MAP.DEFAULT_CENTER,
      zoom: API_CONFIG.MAP.DEFAULT_ZOOM,
    };
    this._baseLayers = {};
  }

  /**
   * Initialize map in container element
   * @param {HTMLElement} containerElement - DOM element to render map
   * @param {Object} options - Map initialization options (optional)
   * @returns {Object} Leaflet map instance
   */
  initMap(containerElement, options = {}) {
    if (!containerElement) {
      throw new Error("Container element is required");
    }

    const mapOptions = { ...this._mapOptions, ...options };

    this._map = L.map(containerElement, {
      center: mapOptions.center,
      zoom: mapOptions.zoom,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    this._addDefaultTileLayer();

    if (options.addSecondaryTileLayer || mapOptions.addSecondaryTileLayer) {
      this._addSecondaryTileLayer(API_CONFIG.MAP.SECONDARY_TILE_LAYER);
    }

    if (Object.keys(this._baseLayers).length > 1) {
      L.control.layers(this._baseLayers).addTo(this._map);
    }

    return this._map;
  }

  /**
   * Add markers to the map for each story with location
   * @param {Array} stories - Array of story objects with lat and lon properties
   */
  addStoryMarkers(stories) {
    if (!this._map) {
      throw new Error("Map not initialized. Call initMap first.");
    }

    this.clearMarkers();

    const storiesWithLocation = stories.filter(
      (story) =>
        story.lat && story.lon && !isNaN(story.lat) && !isNaN(story.lon)
    );

    if (storiesWithLocation.length === 0) {
      console.warn("No stories with valid location data");
      return;
    }

    storiesWithLocation.forEach((story) => {
      const marker = L.marker([story.lat, story.lon]);

      marker.bindPopup(this._createPopupContent(story));

      marker.addTo(this._map);
      this._markers.push(marker);
    });

    if (this._markers.length > 1) {
      const group = L.featureGroup(this._markers);
      this._map.fitBounds(group.getBounds().pad(0.1));
    } else if (this._markers.length === 1) {
      this._map.setView(
        [storiesWithLocation[0].lat, storiesWithLocation[0].lon],
        15
      );
    }
  }

  /**
   * Setup map for location selection (click to set marker)
   * @param {Function} onLocationSelected - Callback when location is selected
   */
  setupLocationSelector(onLocationSelected) {
    if (!this._map) {
      throw new Error("Map not initialized. Call initMap first.");
    }

    this.clearMarkers();

    this._map.on("click", (event) => {
      const { lat, lng } = event.latlng;

      this.clearMarkers();

      const marker = L.marker([lat, lng]).addTo(this._map);
      this._markers.push(marker);

      this._selectedLocation = { lat, lon: lng };

      if (typeof onLocationSelected === "function") {
        onLocationSelected(this._selectedLocation);
      }
    });
  }

  /**
   * Get user's current location and center map
   * @returns {Promise<Object>} Location coordinates { lat, lon }
   */
  async getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };

          if (this._map) {
            this._map.setView([location.lat, location.lon], 15);

            this.clearMarkers();
            const marker = L.marker([location.lat, location.lon])
              .addTo(this._map)
              .bindPopup("Your location")
              .openPopup();

            this._markers.push(marker);
            this._selectedLocation = location;
          }

          resolve(location);
        },
        (error) => {
          reject(new Error(`Could not get your location: ${error.message}`));
        }
      );
    });
  }

  /**
   * Get currently selected location
   * @returns {Object|null} Selected location { lat, lon } or null
   */
  getSelectedLocation() {
    return this._selectedLocation;
  }

  /**
   * Clear all markers from the map
   */
  clearMarkers() {
    if (this._map) {
      this._markers.forEach((marker) => this._map.removeLayer(marker));
      this._markers = [];
    }
  }

  /**
   * Add default OSM tile layer to map
   * @private
   */
  _addDefaultTileLayer() {
    const osmLayer = L.tileLayer(API_CONFIG.MAP.TILE_LAYER, {
      attribution: API_CONFIG.MAP.ATTRIBUTION,
      maxZoom: 19,
    }).addTo(this._map);

    this._baseLayers["OpenStreetMap"] = osmLayer;
  }

  /**
   * Add secondary tile layer for layer control
   * @param {Object} layerConfig - Configuration for secondary layer
   * @private
   */
  _addSecondaryTileLayer(layerConfig) {
    if (!layerConfig || !layerConfig.url) {
      return;
    }

    const secondaryLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution || "",
      maxZoom: layerConfig.maxZoom || 19,
      subdomains: layerConfig.subdomains || [],
    });

    this._baseLayers[layerConfig.name || "Satellite"] = secondaryLayer;
  }

  /**
   * Create popup content for a story marker
   * @param {Object} story - Story data
   * @returns {HTMLElement} Popup content
   * @private
   */
  _createPopupContent(story) {
    const popupContent = document.createElement("div");
    popupContent.className = "map-popup";

    const thumbnail = document.createElement("img");
    thumbnail.src = story.photoUrl;
    thumbnail.alt = `Photo by ${story.name}`;
    thumbnail.className = "map-popup__thumbnail";
    popupContent.appendChild(thumbnail);

    const infoDiv = document.createElement("div");
    infoDiv.className = "map-popup__info";

    const name = document.createElement("h4");
    name.textContent = story.name;
    infoDiv.appendChild(name);

    const description = document.createElement("p");
    description.textContent = this._truncateText(story.description, 100);
    infoDiv.appendChild(description);

    const link = document.createElement("a");
    link.href = `#/detail/${story.id}`;
    link.textContent = "View details";
    link.className = "map-popup__link";
    infoDiv.appendChild(link);

    popupContent.appendChild(infoDiv);

    return popupContent;
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   * @private
   */
  _truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength) + "...";
  }
}

export default MapHelper;
