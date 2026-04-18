/* =====================================================
   Sai Chodagam – Portfolio Script v2.0
   ===================================================== */

"use strict";

// ── Utility ──────────────────────────────────────────
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// ── Smooth scroll to section ─────────────────────────
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) lenis.scrollTo(el, { offset: 0, duration: 1 });
}

// ── Lenis smooth scroll ───────────────────────────────
// Disable native smooth-scroll so Lenis is the sole driver
document.documentElement.style.scrollBehavior = "auto";

const lenis = new Lenis({
    duration: 0.6,
    easing: t => 1 - Math.pow(1 - t, 3),   // ease-out-cubic — fast start, clean stop
    wheelMultiplier: 1.4,                    // amplify wheel delta for snappier response
    touchMultiplier: 2.0,                    // faster on mobile too
    smoothWheel: true,
    syncTouch: false,
});

// Single rAF loop drives Lenis; everything scroll-dependent hooks into it
let scrollY = 0;
lenis.on("scroll", ({ scroll }) => { scrollY = scroll; });

(function lenisLoop(time) {
    lenis.raf(time);
    requestAnimationFrame(lenisLoop);
})(0);

// ── AOS ───────────────────────────────────────────────
AOS.init({ once: true, offset: 80, duration: 650, easing: "ease-out-cubic" });

// ── Theme toggle ──────────────────────────────────────
(function initTheme() {
    const btn = $("#theme-toggle");
    const body = document.body;
    const stored = localStorage.getItem("theme") || "dark";
    body.setAttribute("data-theme", stored);
    if (btn) btn.textContent = stored === "dark" ? "☀️" : "🌙";

    if (!btn) return;
    btn.addEventListener("click", () => {
        const isDark = body.getAttribute("data-theme") === "dark";
        const next = isDark ? "light" : "dark";
        body.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        btn.textContent = next === "dark" ? "☀️" : "🌙";
    });
})();

// ── Navbar scroll shrink ─────────────────────────────
(function initNavbar() {
    const nav = $("#navbar");
    if (!nav) return;
    lenis.on("scroll", ({ scroll }) => nav.classList.toggle("scrolled", scroll > 60));
})();

// ── Hamburger / mobile menu ───────────────────────────
(function initHamburger() {
    const btn = $("#hamburger");
    const links = $("#nav-links");
    if (!btn || !links) return;

    btn.addEventListener("click", () => {
        const open = links.classList.toggle("open");
        btn.classList.toggle("open", open);
        btn.setAttribute("aria-expanded", open);
        document.body.style.overflow = open ? "hidden" : "";
    });

    // Close when a link is clicked
    links.addEventListener("click", e => {
        if (e.target.tagName === "A") {
            links.classList.remove("open");
            btn.classList.remove("open");
            document.body.style.overflow = "";
        }
    });
})();

// ── Custom cursor ─────────────────────────────────────
(function initCursor() {
    const dot = $("#cursor-dot");
    const ring = $("#cursor-ring");
    if (!dot || !ring) return;

    // Only on devices that support hover
    if (!window.matchMedia("(hover: hover)").matches) return;

    let rx = 0, ry = 0; // ring position (lerped)

    document.addEventListener("mousemove", e => {
        const { clientX: x, clientY: y } = e;
        dot.style.transform = `translate(${x}px, ${y}px)`;
        // Ring follows with slight lag via lerp in rAF below
        Object.assign(dot.dataset, { x, y });
    });

    let ringRaf;
    (function lerpRing() {
        const tx = parseFloat(dot.dataset.x || 0);
        const ty = parseFloat(dot.dataset.y || 0);
        rx += (tx - rx) * 0.12;
        ry += (ty - ry) * 0.12;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        ringRaf = requestAnimationFrame(lerpRing);
    })();

    // Hide when leaving window
    document.addEventListener("mouseleave", () => { dot.style.opacity = "0"; ring.style.opacity = "0"; });
    document.addEventListener("mouseenter", () => { dot.style.opacity = "1"; ring.style.opacity = "1"; });
})();

// ── Project cards – click to open link ───────────────
(function initProjectCards() {
    $$(".project-card").forEach(card => {
        card.addEventListener("click", e => {
            // Don't navigate if clicking a child <a>
            if (e.target.closest("a")) return;
            const href = card.dataset.link;
            if (href) window.open(href, "_blank", "noopener,noreferrer");
        });
    });
})();

// ── 3D tilt on cards ─────────────────────────────────
(function initTilt() {
    $$(".tilt").forEach(card => {
        card.addEventListener("mousemove", e => {
            const r = card.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;   // −0.5 … 0.5
            const ny = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(900px) rotateX(${ny * -12}deg) rotateY(${nx * 12}deg) scale(1.03)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(900px) rotateX(0) rotateY(0) scale(1)";
        });
    });
})();

// ── Parallax on scroll ───────────────────────────────
(function initParallax() {
    const els = $$(".parallax");
    if (!els.length) return;
    // Use Lenis scroll event instead of window scroll — no double-firing
    lenis.on("scroll", ({ scroll }) => {
        els.forEach(el => {
            const speed = parseFloat(el.dataset.speed) || 0.1;
            el.style.transform = `translateY(${scroll * speed}px)`;
        });
    });
})();

// ── Fade-up on scroll ────────────────────────────────
// IntersectionObserver is zero-cost vs scroll listeners
(function initFadeUp() {
    const els = $$(".fade-up");
    if (!els.length) return;
    const obs = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } }),
        { rootMargin: "0px 0px -80px 0px" }
    );
    els.forEach(el => obs.observe(el));
})();

// ── Back-to-top button ───────────────────────────────
(function initBackToTop() {
    const btn = $("#back-to-top");
    if (!btn) return;
    lenis.on("scroll", ({ scroll }) => btn.classList.toggle("show", scroll > 320));
    btn.addEventListener("click", () => lenis.scrollTo(0, { duration: 1 }));
})();

// ── Social sidebar arrow rotation ────────────────────
(function initSocialSidebar() {
    const sidebar = $(".social-sidebar");
    const toggle = $(".social-toggle", sidebar);
    if (!sidebar || !toggle) return;
    sidebar.addEventListener("mouseenter", () => { toggle.style.transform = "scaleX(-1)"; });
    sidebar.addEventListener("mouseleave", () => { toggle.style.transform = "scaleX(1)"; });
})();

/* ══════════════════════════════════════════════════════
   🐛 BUG SQUASHER — Portfolio Mini-Game
   ──────────────────────────────────────────────────────
   Bugs labeled with tech names fall from the top.
   Click / tap to squash them before they hit the bottom.
   Miss 3 bugs → Game Over. Clear all waves → You Win!
   ══════════════════════════════════════════════════════ */
(function initGame() {

    /* ── Launch button ── */
    const playBtn = document.createElement("button");
    playBtn.innerHTML = "🐛 Bug Squasher";
    Object.assign(playBtn.style, {
        position: "fixed", bottom: "88px", right: "1.5rem",
        zIndex: "9999", padding: "12px 22px", borderRadius: "999px",
        background: "linear-gradient(90deg,#38bdf8,#cf51c2)",
        color: "#fff", border: "none", cursor: "pointer",
        fontWeight: "700", fontSize: "0.88rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        transition: "transform 0.25s, box-shadow 0.25s",
        fontFamily: "inherit",
    });
    playBtn.addEventListener("mouseenter", () => {
        playBtn.style.transform = "scale(1.08)";
        playBtn.style.boxShadow = "0 12px 30px rgba(56,189,248,0.45)";
    });
    playBtn.addEventListener("mouseleave", () => {
        playBtn.style.transform = "scale(1)";
        playBtn.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
    });
    document.body.appendChild(playBtn);

    const funBtn = $("#fun-mode");
    if (funBtn) funBtn.addEventListener("click", () => { if (!isPlaying) launch(); });
    playBtn.addEventListener("click", launch);

    /* ── Game state ── */
    let isPlaying = false;
    let animFrameId = null;
    let canvas, ctx, overlay;
    let score, lives, wave, bugsThisWave, bugsSquashed;
    let bugs = [];
    let particles = [];
    let spawnTimer = 0;
    let waveCleared = false;
    let waveBanner = 0;           // countdown for "WAVE N" banner
    let gameOverMsg = "";
    let lastTime = 0;

    /* ── Tech labels on bugs ── */
    const TECH = [
        "NullPointerException", "Merge Conflict", "CORS Error",
        "502 Bad Gateway", "npm ERR!", "Segfault",
        "CSS overflow", "Memory Leak", "Race Condition",
        "Infinite Loop", "404 Not Found", "Stack Overflow",
        "Undefined is not a function", "AWS Timeout", "Git rebase hell",
        "Off-by-one", "Heap dump", "Broken pipe",
    ];

    /* ── Bug emoji pool ── */
    const BUG_EMOJI = ["🐛", "🦟", "🪲", "🦗", "🐜", "🕷️"];

    /* ── Colors ── */
    const C = { cyan: "#38bdf8", violet: "#cf51c2", red: "#f87171", green: "#4ade80", yellow: "#facc15" };

    /* ── Helpers ── */
    function rand(a, b) { return a + Math.random() * (b - a); }
    function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
    function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

    /* ── Spawn a bug ── */
    function spawnBug() {
        const size = randInt(36, 56);
        const speed = rand(1.2, 2.0 + wave * 0.35);   // faster each wave
        const wobble = rand(0.5, 1.8);                  // side-to-side amplitude
        bugs.push({
            x: rand(size, canvas.width - size),
            y: -size,
            size,
            speed,
            wobble,
            wobbleOffset: rand(0, Math.PI * 2),
            emoji: pick(BUG_EMOJI),
            label: pick(TECH),
            hp: wave >= 3 ? 2 : 1,                   // armoured bugs on wave 3+
            hit: false,
            hitTimer: 0,
        });
    }

    /* ── Squash particles ── */
    function splat(x, y, color) {
        for (let i = 0; i < 14; i++) {
            const angle = rand(0, Math.PI * 2);
            const spd = rand(2, 9);
            particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                r: rand(3, 8),
                color,
                life: 1.0,
            });
        }
    }

    /* ── Build full-screen canvas overlay ── */
    function buildOverlay() {
        overlay = document.createElement("div");
        Object.assign(overlay.style, {
            position: "fixed", inset: "0", zIndex: "10000",
            pointerEvents: "none",
        });

        canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        Object.assign(canvas.style, {
            position: "absolute", inset: "0",
            cursor: "crosshair", pointerEvents: "auto",
        });
        overlay.appendChild(canvas);
        document.body.appendChild(overlay);
        ctx = canvas.getContext("2d");

        // Resize handler
        window.addEventListener("resize", onResize);

        // Click / tap to squash
        canvas.addEventListener("pointerdown", onSquash);
    }

    function onResize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function onSquash(e) {
        if (!isPlaying) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Iterate reversed so topmost (last drawn) wins
        for (let i = bugs.length - 1; i >= 0; i--) {
            const b = bugs[i];
            const dx = mx - b.x, dy = my - b.y;
            if (Math.sqrt(dx * dx + dy * dy) < b.size * 0.7) {
                b.hp--;
                b.hit = true; b.hitTimer = 6;
                if (b.hp <= 0) {
                    splat(b.x, b.y, pick([C.cyan, C.violet, C.green, C.yellow]));
                    bugs.splice(i, 1);
                    score += 100 + wave * 25;
                    bugsSquashed++;
                }
                break;
            }
        }
    }

    /* ── HUD ── */
    function drawHUD() {
        const W = canvas.width;

        // Semi-transparent top bar
        ctx.fillStyle = "rgba(2,6,23,0.75)";
        ctx.fillRect(0, 0, W, 56);

        // Score
        ctx.fillStyle = C.cyan;
        ctx.font = "bold 18px 'Syne', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`SCORE  ${score}`, 24, 36);

        // Wave
        ctx.textAlign = "center";
        ctx.fillStyle = C.yellow;
        ctx.fillText(`WAVE  ${wave}`, W / 2, 36);

        // Lives (hearts)
        ctx.textAlign = "right";
        ctx.font = "22px sans-serif";
        let hearts = "";
        for (let i = 0; i < 3; i++) hearts += i < lives ? "❤️ " : "🖤 ";
        ctx.fillText(hearts.trim(), W - 20, 38);

        // Progress bar
        const total = bugsThisWave;
        const progress = bugsSquashed / total;
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(0, 56, W, 5);
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, C.cyan);
        grad.addColorStop(1, C.violet);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 56, W * progress, 5);
    }

    /* ── Wave banner ── */
    function drawWaveBanner() {
        if (waveBanner <= 0) return;
        const alpha = Math.min(1, waveBanner / 40);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.textAlign = "center";
        ctx.font = "bold 64px 'Syne', sans-serif";
        const grad = ctx.createLinearGradient(canvas.width / 2 - 160, 0, canvas.width / 2 + 160, 0);
        grad.addColorStop(0, C.cyan);
        grad.addColorStop(1, C.violet);
        ctx.fillStyle = grad;
        ctx.fillText(`WAVE  ${wave}`, canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = "18px 'DM Sans', sans-serif";
        ctx.fillStyle = "#e2e8f0";
        ctx.fillText("Click the bugs before they escape!", canvas.width / 2, canvas.height / 2 + 30);
        ctx.restore();
        waveBanner--;
    }

    /* ── Draw a single bug ── */
    function drawBug(b) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Flash white on hit
        if (b.hitTimer > 0) {
            ctx.filter = "brightness(3)";
            b.hitTimer--;
        }

        // Shadow glow
        ctx.shadowColor = C.violet;
        ctx.shadowBlur = 12;

        // Emoji
        ctx.font = `${b.size}px sans-serif`;
        ctx.fillText(b.emoji, b.x, b.y);
        ctx.filter = "none";
        ctx.shadowBlur = 0;

        // Label pill
        const label = b.hp > 1 ? `🛡 ${b.label}` : b.label;
        ctx.font = "bold 11px 'DM Sans', sans-serif";
        const tw = ctx.measureText(label).width;
        const pillW = tw + 16, pillH = 20;
        const pillX = b.x - pillW / 2;
        const pillY = b.y + b.size * 0.55;

        ctx.fillStyle = "rgba(2,6,23,0.82)";
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 6);
        ctx.fill();

        ctx.fillStyle = b.hp > 1 ? C.yellow : C.cyan;
        ctx.fillText(label, b.x, pillY + pillH / 2 + 1);

        ctx.restore();
    }

    /* ── Main game loop ── */
    function gameLoop(ts) {
        if (!isPlaying) return;
        const dt = Math.min((ts - lastTime) / 16.67, 3);   // normalise to 60fps
        lastTime = ts;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        /* Spawn bugs */
        if (!waveCleared && waveBanner <= 0) {
            spawnTimer -= dt;
            if (spawnTimer <= 0 && bugs.length + bugsSquashed < bugsThisWave) {
                spawnBug();
                spawnTimer = Math.max(28 - wave * 3, 10);   // faster spawns each wave
            }
        }

        /* Update & draw bugs */
        for (let i = bugs.length - 1; i >= 0; i--) {
            const b = bugs[i];
            b.y += b.speed * dt;
            b.x += Math.sin(b.wobbleOffset + b.y * 0.025) * b.wobble * dt;
            b.x = clamp(b.x, b.size, canvas.width - b.size);

            // Escaped!
            if (b.y > canvas.height + b.size) {
                bugs.splice(i, 1);
                bugsSquashed++;          // count as "gone" so wave can end
                lives--;
                splat(b.x, canvas.height - 10, C.red);
                if (lives <= 0) { endGame(false); return; }
                continue;
            }
            drawBug(b);
        }

        /* Particles */
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy;
            p.vy += 0.25;           // gravity
            p.vx *= 0.94; p.vy *= 0.94;
            p.life -= 0.035;
            if (p.life <= 0) { particles.splice(i, 1); continue; }
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        drawHUD();
        drawWaveBanner();

        /* Wave cleared? */
        if (!waveCleared && bugsSquashed >= bugsThisWave && bugs.length === 0) {
            waveCleared = true;
            if (wave >= 5) { endGame(true); return; }
            setTimeout(() => {
                wave++;
                bugsThisWave = 8 + wave * 3;
                bugsSquashed = 0;
                waveCleared = false;
                waveBanner = 90;
                spawnTimer = 60;
            }, 1200);
        }

        animFrameId = requestAnimationFrame(gameLoop);
    }

    /* ── Launch ── */
    function launch() {
        if (isPlaying) return;
        isPlaying = true;
        score = 0;
        lives = 3;
        wave = 1;
        bugsThisWave = 10;
        bugsSquashed = 0;
        bugs = [];
        particles = [];
        waveCleared = false;
        waveBanner = 90;
        spawnTimer = 60;

        playBtn.style.display = "none";
        buildOverlay();

        // Exit button
        const exitBtn = document.createElement("button");
        exitBtn.textContent = "✕ Exit";
        Object.assign(exitBtn.style, {
            position: "absolute", top: "70px", right: "1.5rem",
            zIndex: "1", padding: "7px 16px", borderRadius: "999px",
            background: "rgba(248,113,113,0.75)", color: "#fff",
            border: "none", cursor: "pointer", fontWeight: "600",
            fontSize: "0.8rem", backdropFilter: "blur(6px)", fontFamily: "inherit",
        });
        exitBtn.addEventListener("click", () => endGame(false));
        overlay.appendChild(exitBtn);

        lastTime = performance.now();
        animFrameId = requestAnimationFrame(gameLoop);
    }

    /* ── End game ── */
    function endGame(won) {
        isPlaying = false;
        cancelAnimationFrame(animFrameId);

        // Final screen drawn on canvas
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(2,6,23,0.88)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.textAlign = "center";
            ctx.font = "bold 56px 'Syne', sans-serif";
            const grad = ctx.createLinearGradient(canvas.width / 2 - 200, 0, canvas.width / 2 + 200, 0);
            grad.addColorStop(0, C.cyan); grad.addColorStop(1, C.violet);
            ctx.fillStyle = grad;
            ctx.fillText(won ? "🎉 ALL BUGS FIXED!" : "💀 BUGS WON", canvas.width / 2, canvas.height / 2 - 40);

            ctx.font = "22px 'DM Sans', sans-serif";
            ctx.fillStyle = "#e2e8f0";
            ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

            ctx.font = "16px 'DM Sans', sans-serif";
            ctx.fillStyle = C.cyan;
            ctx.fillText("Closing in 3 seconds…", canvas.width / 2, canvas.height / 2 + 50);
        }

        window.removeEventListener("resize", onResize);

        setTimeout(() => {
            if (overlay) { overlay.remove(); overlay = null; canvas = null; ctx = null; }
            playBtn.style.display = "block";
            playBtn.innerHTML = won ? "🐛 Play Again" : "🐛 Bug Squasher";
        }, 3000);
    }

})();