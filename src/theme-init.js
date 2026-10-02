try {
  const preference = localStorage.getItem('localVert.theme');
  if (preference === 'light' || preference === 'dark') {
    document.documentElement.dataset.theme = preference;
  }
} catch {
  // Private browsing or restricted storage: the CSS follows the browser theme.
}
