let lastEvent;
['click', 'touchstart', 'mousedown', 'keydown', 'mouseover'].forEach(eventName => {
  document.addEventListener(eventName, (event) => {
    lastEvent = event;
  }, { capture: true, passive: true });
});

export default () => lastEvent;

