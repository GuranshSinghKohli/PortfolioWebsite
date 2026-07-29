export function handleTilt(e) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  const rx = (py - 0.5) * -10;
  const ry = (px - 0.5) * 10;
  el.style.transition = 'transform .06s linear, box-shadow .2s';
  el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) translateZ(10px)`;
  el.style.boxShadow = `${-ry * 2.2}px ${18 - rx * 1.5}px 40px rgba(0,0,0,.45), 0 0 0 1px rgba(34,211,238,.15)`;
  el.style.backgroundImage = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(34,211,238,.16), transparent 60%)`;
}

export function resetTilt(e) {
  const el = e.currentTarget;
  el.style.transition = 'transform .4s cubic-bezier(.2,.8,.2,1), box-shadow .4s';
  el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0) translateZ(0)';
  el.style.boxShadow = 'none';
  el.style.backgroundImage = 'none';
}
