(() => {
  const canvas = document.querySelector(".heart-sky");
  const context = canvas && canvas.getContext("2d");

  if (!canvas || !context) return;

  const phrases = ["love you", "Love You", "LOVE YOU"];
  const hues = [196, 207, 218, 229];
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let particles = [];
  let stars = [];
  let frame = 0;
  let width = 0;
  let height = 0;
  let scale = 0;
  let centerX = 0;
  let centerY = 0;
  let startedAt = 0;

  function makeHeartPolygon() {
    const points = [];

    for (let step = 0; step <= 240; step += 1) {
      const angle = (step / 240) * Math.PI * 2;
      const x = (16 * Math.sin(angle) ** 3) / 17;
      const y =
        -(
          13 * Math.cos(angle) -
          5 * Math.cos(2 * angle) -
          2 * Math.cos(3 * angle) -
          Math.cos(4 * angle)
        ) / 17;

      points.push([x, y]);
    }

    return points;
  }

  const heart = makeHeartPolygon();

  function pointInsideHeart(x, y) {
    let inside = false;

    for (
      let current = 0, previous = heart.length - 1;
      current < heart.length;
      previous = current++
    ) {
      const [currentX, currentY] = heart[current];
      const [previousX, previousY] = heart[previous];
      const crosses = currentY > y !== previousY > y;

      if (
        crosses &&
        x <
          ((previousX - currentX) * (y - currentY)) /
            (previousY - currentY) +
            currentX
      ) {
        inside = !inside;
      }
    }

    return inside;
  }

  function createScene() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const heartWidth = Math.min(width * 0.8, height * 0.75, 770);
    scale = heartWidth / 2;
    centerX = width / 2;
    centerY = height * 0.51;

    const count = Math.max(
      210,
      Math.min(420, Math.round((width * height) / 2600)),
    );

    particles = [];

    while (particles.length < count) {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;

      if (!pointInsideHeart(x, y)) continue;

      particles.push({
        x,
        y,
        phrase: phrases[Math.floor(Math.random() * phrases.length)],
        size: 8 + Math.random() * 4.5,
        hue: hues[Math.floor(Math.random() * hues.length)],
        phase: Math.random() * Math.PI * 2,
        revealDelay: Math.random() * 2.8,
      });
    }

    const starCount = Math.max(65, Math.round((width * height) / 9500));
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.35 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(timestamp) {
    context.clearRect(0, 0, width, height);

    const seconds = reducedMotion ? 4 : (timestamp - startedAt) / 1000;

    for (const star of stars) {
      const twinkle = reducedMotion
        ? 0.28
        : 0.12 + (Math.sin(seconds * 0.65 + star.phase) + 1) * 0.16;

      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(166, 202, 255, ${twinkle})`;
      context.fill();
    }

    const haze = context.createRadialGradient(
      centerX,
      centerY,
      scale * 0.04,
      centerX,
      centerY,
      scale * 1.18,
    );
    haze.addColorStop(0, "rgba(22, 91, 187, 0.13)");
    haze.addColorStop(0.5, "rgba(18, 65, 151, 0.075)");
    haze.addColorStop(1, "rgba(4, 15, 39, 0)");
    context.fillStyle = haze;
    context.fillRect(
      centerX - scale * 1.2,
      centerY - scale * 1.2,
      scale * 2.4,
      scale * 2.4,
    );

    context.textAlign = "center";
    context.textBaseline = "middle";

    for (const particle of particles) {
      const reveal = reducedMotion
        ? 1
        : Math.max(
            0,
            Math.min(1, (seconds - particle.revealDelay) / 1.2),
          );

      if (reveal === 0) continue;

      const shimmer = reducedMotion
        ? 0.72
        : 0.52 + (Math.sin(seconds * 1.55 + particle.phase) + 1) * 0.24;
      const opacity = reveal * shimmer;
      const x = centerX + particle.x * scale;
      const y = centerY + (particle.y + 0.05) * scale * 0.98;

      context.font = `${particle.size}px Georgia, "Times New Roman", serif`;
      context.shadowBlur = 8 + shimmer * 8;
      context.shadowColor = `hsla(${particle.hue}, 100%, 70%, ${opacity * 0.9})`;
      context.fillStyle = `hsla(${particle.hue}, 93%, ${72 + shimmer * 14}%, ${opacity})`;
      context.fillText(particle.phrase, x, y);
    }

    context.shadowBlur = 0;

    if (!reducedMotion) {
      frame = window.requestAnimationFrame(draw);
    }
  }

  function resize() {
    if (frame) window.cancelAnimationFrame(frame);
    createScene();
    startedAt = performance.now();

    if (reducedMotion) {
      draw(startedAt);
    } else {
      frame = window.requestAnimationFrame(draw);
    }
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
})();
