// script.js - Cypress-compatible drag-to-scroll
const slider = document.querySelector('.items');
let isDown = false;
let startX = 0;
let startScrollLeft = 0;

// Helper to read X from different event shapes (Cypress may use pageX)
function readPageX(e) {
  // e might be a native MouseEvent (clientX), or a jQuery-synthesized event (pageX),
  // or even a Cypress-triggered event which sets pageX. Prefer pageX if present.
  if (e && typeof e.pageX === 'number') return e.pageX;
  if (e && typeof e.clientX === 'number') return e.clientX;
  // Fallback to 0
  return 0;
}

// Convert global page/client X into coordinate relative to the slider's left edge.
function xRelativeToSlider(e) {
  const pageX = readPageX(e);
  const rect = slider.getBoundingClientRect();
  // rect.left is clientX origin; to convert pageX to clientX-like
  // we need pageX - (window.pageXOffset) to get clientX (but pageX - window.scrollX == clientX)
  // However reading pageX and rect.left together can be mismatched when page is scrolled.
  // Safer approach: compute clientX if possible.
  let clientX;
  if (typeof e.clientX === 'number') {
    clientX = e.clientX;
  } else {
    // convert pageX -> clientX by subtracting page scroll offset
    clientX = pageX - (window.pageXOffset || window.scrollX || 0);
  }
  return clientX - rect.left;
}

function onMouseDown(e) {
  // Only left button
  if (typeof e.which === 'number' && e.which !== 1) return;

  isDown = true;
  slider.classList.add('active');

  startX = xRelativeToSlider(e);
  startScrollLeft = slider.scrollLeft;
}

function onMouseMove(e) {
  if (!isDown) return;

  e.preventDefault();

  const currentX = xRelativeToSlider(e);
  const delta = currentX - startX; // positive when pointer moved right
  // We want dragging left to increase scrollLeft, so subtract delta:
  slider.scrollLeft = startScrollLeft - delta;
}

function onMouseUpOrLeave() {
  isDown = false;
  slider.classList.remove('active');
}

// Attach listeners to the slider element. Cypress triggers events on the element,
// so these handlers will be called when Cypress does `.trigger('mousedown', {...})`.
slider.addEventListener('mousedown', onMouseDown);
slider.addEventListener('mousemove', onMouseMove);
slider.addEventListener('mouseup', onMouseUpOrLeave);
slider.addEventListener('mouseleave', onMouseUpOrLeave);

// Also support pointer events if environment uses them (optional robustness)
// This block doesn't break anything; it improves compatibility with some browsers.
if (window.PointerEvent) {
  slider.addEventListener('pointerdown', (e) => {
    // synthesize a MouseEvent-like shape for our handlers
    onMouseDown(e);
  });
  slider.addEventListener('pointermove', (e) => {
    onMouseMove(e);
  });
  slider.addEventListener('pointerup', onMouseUpOrLeave);
  slider.addEventListener('pointercancel', onMouseUpOrLeave);
}
.trigger('mousedown', { which: 1, pageX: 493, pageY: 391 })
.trigger('mousemove', { pageX: 271, pageY: 391 })
.trigger('mouseup', { force: true });
