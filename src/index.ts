// Use the window load event to keep the page load performance
window.addEventListener('load', () => {
    import(/* webpackChunkName: "application" */ './App').then(({ default: loadApp }) => {
        loadApp();
    });
});

if (process.env.NODE_ENV === 'production') {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(
                (registration) => {
                    console.log(`Service Worker registered! Scope: ${registration.scope}`);
                },
                (error) => {
                    console.error(`Service Worker registration failed: ${error}`);
                },
            );
        });
    }
}
