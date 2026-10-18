// ShapeGrid‑style background (plain JS & CSS)
// Generates a grid of squares that gently drift upward.
(() => {
  const container = document.createElement('div');
  container.id = 'shape-grid';
  document.body.prepend(container);

  const squareSize = 40; // px
  const speed = 0.15; // seconds per full cycle per row
  const borderColor = '#1b2827';
  const hoverFill = '#222222';

  const cols = Math.ceil(window.innerWidth / squareSize);
  const rows = Math.ceil(window.innerHeight / squareSize) + 2; // extra rows for looping

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const square = document.createElement('div');
      square.className = 'grid-square';
      // Stagger animation start for a flowing effect
      const delay = (c + r * cols) * 0.02;
      square.style.animationDelay = `${delay}s`;
      container.appendChild(square);
    }
  }
})();
