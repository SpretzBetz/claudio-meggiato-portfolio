// Rivela il ritratto solo mentre un puntatore preciso attraversa il nome.
(() => {
  const title = document.querySelector('#hero-title');
  const reveal = document.querySelector('#cursor-reveal');
  const image = reveal?.querySelector('img');
  const pointerQuery = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');

  if (!title || !reveal || !image) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const offset = { x: 28, y: 26 };
  const state = { x: -300, y: -300, targetX: -300, targetY: -300, rotation: 0, targetRotation: 0 };
  let frame = 0;
  let lastPointerX = null;

  function placeImage(event) {
    if (!pointerQuery.matches) return;
    const maxX = Math.max(12, window.innerWidth - reveal.offsetWidth - 12);
    const maxY = Math.max(12, window.innerHeight - reveal.offsetHeight - 12);
    state.targetX = Math.min(maxX, Math.max(12, event.clientX + offset.x));
    state.targetY = Math.min(maxY, Math.max(12, event.clientY + offset.y));

    if (lastPointerX !== null) {
      const direction = event.clientX - lastPointerX;
      state.targetRotation = Math.max(-2.5, Math.min(2.5, direction * 0.045));
    }
    lastPointerX = event.clientX;
    if (!frame) frame = requestAnimationFrame(animate);
  }

  function animate() {
    const easing = reduceMotion ? 1 : 0.16;
    state.x += (state.targetX - state.x) * easing;
    state.y += (state.targetY - state.y) * easing;
    state.rotation += (state.targetRotation - state.rotation) * easing;
    reveal.style.setProperty('--cursor-x', `${state.x.toFixed(1)}px`);
    reveal.style.setProperty('--cursor-y', `${state.y.toFixed(1)}px`);
    reveal.style.setProperty('--cursor-rotation', `${state.rotation.toFixed(2)}deg`);

    const settled = Math.abs(state.targetX - state.x) < 0.2
      && Math.abs(state.targetY - state.y) < 0.2
      && Math.abs(state.targetRotation - state.rotation) < 0.02;
    if (settled) {
      state.x = state.targetX;
      state.y = state.targetY;
      state.rotation = state.targetRotation;
      frame = 0;
      return;
    }
    frame = requestAnimationFrame(animate);
  }

  title.addEventListener('mouseenter', event => {
    placeImage(event);
    reveal.classList.add('is-visible');
  });
  title.addEventListener('mousemove', placeImage);
  title.addEventListener('mouseleave', () => {
    reveal.classList.remove('is-visible');
    lastPointerX = null;
    state.targetRotation = 0;
  });

  pointerQuery.addEventListener('change', event => {
    if (!event.matches) reveal.classList.remove('is-visible');
  });
})();
