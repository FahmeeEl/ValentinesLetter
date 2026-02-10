const stage = document.getElementById("stage");
const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");
const result = document.getElementById("result");
const restart = document.getElementById("restart");

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function placeInitial(){
  const r = stage.getBoundingClientRect();
  yesBtn.style.left = "18px";
  yesBtn.style.top  = (r.height/2 - 22) + "px";

  noBtn.style.left = (r.width - 110) + "px";
  noBtn.style.top  = (r.height/2 - 22) + "px";
}
placeInitial();
window.addEventListener("resize", placeInitial);

function moveNoButton(){
  const s = stage.getBoundingClientRect();
  const b = noBtn.getBoundingClientRect();

  const maxX = s.width - b.width - 10;
  const maxY = s.height - b.height - 10;

  // nouvelle position random, mais pas trop proche du "Oui"
  let x, y;
  for(let i=0;i<20;i++){
    x = Math.random() * maxX + 5;
    y = Math.random() * maxY + 5;

    const yes = yesBtn.getBoundingClientRect();
    const yesX = parseFloat(yesBtn.style.left) || 0;
    const yesY = parseFloat(yesBtn.style.top) || 0;

    const dx = (x - yesX);
    const dy = (y - yesY);
    if(Math.hypot(dx, dy) > 90) break;
  }

  noBtn.style.left = clamp(x, 5, maxX) + "px";
  noBtn.style.top  = clamp(y, 5, maxY) + "px";
}

// Desktop: fuite au survol
noBtn.addEventListener("mouseenter", moveNoButton);
// Mobile: fuite au tap
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNoButton();
}, {passive:false});
// Et si elle clique quand même 😅
noBtn.addEventListener("click", moveNoButton);

yesBtn.addEventListener("click", () => {
  stage.style.display = "none";
  result.hidden = false;
  fireConfetti();
});

restart.addEventListener("click", (e) => {
  e.preventDefault();
  result.hidden = true;
  stage.style.display = "block";
  placeInitial();
});

/* Hearts (canvas) */
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
let W, H, hearts = [], animId;

function resizeCanvas(){
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  W = window.innerWidth;
  H = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function drawHeart(x, y, size, rot, alpha){
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;

  ctx.beginPath();
  // coeur via courbes de bézier (simple & joli)
  const s = size;
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(s * 0.5, -s * 0.1, s * 1.1, s * 0.35, 0, s * 1.1);
  ctx.bezierCurveTo(-s * 1.1, s * 0.35, -s * 0.5, -s * 0.1, 0, s * 0.35);
  ctx.closePath();

  // couleur rose/rouge douce (pas de rainbow)
  const hue = 340 + Math.random() * 20; // roses
  ctx.fillStyle = `hsla(${hue}, 85%, 70%, ${alpha})`;
  ctx.fill();

  ctx.restore();
}

function fireConfetti(){
  cancelAnimationFrame(animId);
  hearts = [];

  // génère une pluie de coeurs qui PARTENT DU HAUT
  const count = 160;
  for(let i=0;i<count;i++){
    hearts.push({
      x: Math.random() * W,
      y: -20 - Math.random() * 400,  // ✅ depuis le haut (au-dessus de l'écran)
      size: 6 + Math.random() * 10,
      vy: 2 + Math.random() * 4,
      vx: -0.6 + Math.random() * 1.2, // légère dérive
      sway: 0.8 + Math.random() * 1.8,
      a: Math.random() * Math.PI * 2,
      va: -0.02 + Math.random() * 0.04,
      life: 240 + Math.random() * 80,
      t: 0
    });
  }

  const tick = () => {
    ctx.clearRect(0, 0, W, H);

    hearts.forEach(h => {
      h.t++;
      h.a += h.va;

      // mouvement: chute + petit "sway" horizontal
      h.y += h.vy;
      h.x += h.vx + Math.sin((h.y / 40) + h.a) * h.sway;

      const alpha = 1 - (h.t / h.life);
      drawHeart(h.x, h.y, h.size, h.a, Math.max(0, alpha));
    });

    hearts = hearts.filter(h => h.t < h.life && h.y < H + 50);
    if(hearts.length) animId = requestAnimationFrame(tick);
  };

  tick();
}


