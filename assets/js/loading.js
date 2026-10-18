// Returning-visitor check — runs in <head>, before first paint.
// If the visitor has seen the intro before, <html> gets .intro-skip and the
// CSS hides the loader and shows the hero instantly.
const INTRO_KEY = 'portfolioIntroSeen';
(function () {
    let seen = false;
    try { seen = localStorage.getItem(INTRO_KEY) === '1'; } catch (e) { /* storage blocked */ }
    if (seen) document.documentElement.classList.add('intro-skip');
})();

// Hide loading screen after the page fully loads (2s pause for effect)
function hideLoader() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    // No slide animation for users who prefer reduced motion
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
        loadingScreen.remove();
        return;
    }

    loadingScreen.classList.add('slide-up');
    loadingScreen.addEventListener('transitionend', () => {
        loadingScreen.remove();
    });
}

window.addEventListener('load', () => {
    // Returning visitor: drop the loader immediately
    if (document.documentElement.classList.contains('intro-skip')) {
        const ls = document.getElementById('loading-screen');
        if (ls) ls.remove();
        return;
    }
    // First visit: play the intro, then remember it
    try { localStorage.setItem(INTRO_KEY, '1'); } catch (e) { /* storage blocked */ }
    setTimeout(hideLoader, 2000);
});
