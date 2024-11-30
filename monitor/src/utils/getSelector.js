const getSelectors = (path) => {
  return path.reverse().filter(el => el !== window.document && el !== window).map(el => {
    let selector = '';
    if (el.id) {
      return `${el.tagName.toLowerCase()}#${el.id}`;
    } else if (el.className && typeof el.className === 'string') {
      return `${el.tagName.toLowerCase()}.${el.className.split(' ').join('.')}`;
    } else {
      selector = el.tagName.toLowerCase();
    }

    return selector;
  }).join(' ');
};
const getSelector = (event) => {
  if (!event) return '';
  const path = event.composedPath?.() || event.path;
  if (Array.isArray(path)) {
    return getSelectors(path);
  };
};

export default getSelector;