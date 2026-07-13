// Applies everything needed to make a full-viewport `position: fixed`
// game page behave on mobile once the on-screen keyboard opens.
export function useFixMobileViewport(
  varName = "--cg-viewport-height",
) {
  // The site otherwise has no viewport meta tag at all. Without one,
  // mobile browsers fall back to scrolling/panning the page to bring a
  // focused input above the on-screen keyboard, which is exactly the
  // "scrolls to dead space" bug this fixes -- `interactive-widget=resizes-
  // content` instead shrinks the visual viewport around the keyboard,
  // which the height tracking below already reacts to correctly.
  useHead({
    meta: [
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
      },
    ],
  });

  // Opening the on-screen keyboard on mobile shrinks the *visual*
  // viewport but typically leaves the *layout* viewport untouched, so
  // elements sized with `position: fixed; inset: 0` (or `height: 100vh`)
  // don't shrink and end up partly hidden behind the keyboard. Track the
  // visual viewport's height on a CSS custom property so callers can
  // size against it instead.
  function syncHeight() {
    const height =
      window.visualViewport?.height ?? window.innerHeight;
    document.documentElement.style.setProperty(
      varName,
      `${height}px`,
    );
  }

  // Mobile browsers also scroll the document to bring a focused input
  // into view, which on these full-viewport `position: fixed` game pages
  // just reveals dead space below the fixed layout (there's nothing to
  // actually scroll to). `overflow: hidden` alone doesn't stop this on
  // iOS Safari -- it still scrolls the layout viewport on focus
  // regardless. Pinning the body itself with `position: fixed` removes
  // any scrollable surface for it to scroll to, which is the technique
  // that actually works there.
  let previousOverflow = "";
  let previousPosition = "";
  let previousWidth = "";

  onMounted(() => {
    syncHeight();
    window.visualViewport?.addEventListener("resize", syncHeight);
    window.addEventListener("resize", syncHeight);

    previousOverflow = document.body.style.overflow;
    previousPosition = document.body.style.position;
    previousWidth = document.body.style.width;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
  });

  onUnmounted(() => {
    window.visualViewport?.removeEventListener("resize", syncHeight);
    window.removeEventListener("resize", syncHeight);
    document.documentElement.style.removeProperty(varName);

    document.body.style.overflow = previousOverflow;
    document.body.style.position = previousPosition;
    document.body.style.width = previousWidth;
  });
}
