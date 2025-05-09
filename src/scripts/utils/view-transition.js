/**
 * Apply view transition between page changes
 * @param {Function} updateCallback - Callback function to update the DOM
 * @returns {Promise} Promise that resolves when the transition is complete
 */
const applyViewTransition = async (updateCallback) => {
  if (!document.startViewTransition) {
    await updateCallback();
    return;
  }

  const transition = document.startViewTransition(async () => {
    await updateCallback();
  });

  return transition.finished;
};

/**
 * Apply custom animation to an element during view transition
 * @param {string} elementSelector - CSS selector for the element
 * @param {Object} options - Animation options
 * @param {string} options.name - Animation name
 * @param {number} options.duration - Animation duration in milliseconds
 * @param {string} options.easing - Animation easing function
 * @returns {void}
 */
const applyCustomAnimation = (
  elementSelector,
  { name = "fade", duration = 300, easing = "ease" } = {}
) => {
  const element = document.querySelector(elementSelector);
  if (!element) return;

  element.style.viewTransitionName = name;

  const style = document.createElement("style");
  style.textContent = `
      @keyframes ${name}-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
  
      @keyframes ${name}-out {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
      }
  
      ::view-transition-old(${name}) {
        animation: ${duration}ms ${easing} both ${name}-out;
      }
  
      ::view-transition-new(${name}) {
        animation: ${duration}ms ${easing} both ${name}-in;
      }
    `;

  document.head.appendChild(style);

  setTimeout(() => {
    document.head.removeChild(style);
  }, duration + 100);
};

export { applyViewTransition, applyCustomAnimation };
