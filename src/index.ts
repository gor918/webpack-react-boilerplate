// Use the window load event to keep the page load performance
window.addEventListener('load', () => {
    import(/* webpackChunkName: "application" */ './App').then(({ default: loadApp }) => {
        loadApp();
    });
});
