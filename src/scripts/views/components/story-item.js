class StoryItem extends HTMLElement {
  /**
   * Set the story data to display
   * @param {Object} story - Story data object
   */
  set story(story) {
    this._story = story;
    this.render();
  }

  /**
   * Format date to localized string
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  _formatDate(dateString) {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  _truncateText(text, maxLength = 150) {
    if (!text || text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength) + "...";
  }

  render() {
    if (!this._story) {
      this.innerHTML =
        '<div class="story-item__error">No story data available</div>';
      return;
    }

    const { id, name, description, photoUrl, createdAt, lat, lon } =
      this._story;
    const hasLocation = lat && lon && !isNaN(lat) && !isNaN(lon);

    this.innerHTML = `
        <article class="story-item">
          <div class="story-item__image-container">
            <img 
              src="${photoUrl}" 
              alt="Story by ${name}"
              class="story-item__image"
              loading="lazy"
            />
          </div>
          
          <div class="story-item__content">
            <div class="story-item__meta">
              <span class="story-item__author">
                <i class="fas fa-user"></i>
                ${name}
              </span>
              <span class="story-item__date">
                <i class="fas fa-calendar-alt"></i>
                ${this._formatDate(createdAt)}
              </span>
              ${
                hasLocation
                  ? `
                <span class="story-item__location">
                  <i class="fas fa-map-marker-alt"></i>
                  Location Available
                </span>
              `
                  : ""
              }
            </div>
            
            <h3 class="story-item__title">
              <a href="#/detail/${id}" class="story-item__link">
                Story by ${name}
              </a>
            </h3>
            
            <p class="story-item__description">
              ${this._truncateText(description)}
            </p>
            
            <div class="story-item__actions">
              <a href="#/detail/${id}" class="story-item__button">
                Read More
                <i class="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </article>
      `;
  }
}

customElements.define("story-item", StoryItem);

export default StoryItem;
