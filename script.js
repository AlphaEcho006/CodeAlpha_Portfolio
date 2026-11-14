// ---------- 1. GRAB ELEMENTS ----------
const header = document.querySelector("#header");
const nav = document.querySelector("#nav");
const menuToggle = document.querySelector("#menu-toggle");
const navLinks = document.querySelectorAll(".nav a");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");

// ---------- 2. HEADER BACKGROUND ON SCROLL ----------
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 30);
});

// ---------- 3. MOBILE MENU ----------
menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.classList.remove("open");
  });
});

// ---------- 4. SCROLL REVEAL ----------
// Fades each element in the first time it scrolls into view.
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealItems.forEach((item) => revealObserver.observe(item));

// ---------- 5. HIGHLIGHT CURRENT SECTION IN THE NAV ----------
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sections.forEach((section) => sectionObserver.observe(section));

// ---------- 6. TAGS DODGE THE CURSOR (smooth, no jitter) ----------
// canHover / reduceMotion are also used by section 7, so keep these two lines.
const canHover = window.matchMedia("(hover: hover)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canHover && !reduceMotion) {
  const REACH = 150;   // how close (in pixels) the cursor must be to affect a tag
  const PUSH = 1;      // 1 = tags move AWAY from the cursor, -1 = tags move TOWARD it
  const EASE = 0.12;   // smoothness: smaller = slower and softer, bigger = snappier

  // One object per tag. We remember its resting spot (rest) and where it
  // is drawn right now (cur), so we never have to guess from a moving element.
  const tags = [...document.querySelectorAll(".px")].map((el) => ({
    el,
    depth: Number(el.dataset.depth),
    restX: 0, restY: 0,   // the tag's true resting center on the page
    curX: 0,  curY: 0,    // how far the tag is currently shifted
  }));

  // Measure every tag's resting center ONCE (and again if the window resizes).
  // We subtract the current shift, so the answer is always the resting spot.
  function measureRestPositions() {
    tags.forEach((tag) => {
      const box = tag.el.getBoundingClientRect();
      tag.restX = box.left + box.width / 2 + window.scrollX - tag.curX;
      tag.restY = box.top + box.height / 2 + window.scrollY - tag.curY;
    });
  }
  measureRestPositions();
  window.addEventListener("load", measureRestPositions); // fonts/images can shift the layout
  window.addEventListener("resize", measureRestPositions);

  // Track the cursor. -9999 means "far away", so every tag rests.
  let mouseX = -9999;
  let mouseY = -9999;

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  document.documentElement.addEventListener("mouseleave", () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  // This function runs about 60 times per second and eases each tag
  // a little closer to where it should be.
  function animateTags() {
    tags.forEach((tag) => {
      // Skip tags that are hidden (for example on small phone screens)
      if (tag.el.offsetParent === null) return;

      // Distance from the cursor to the tag's RESTING center (this never changes while
      // the tag moves, which is exactly what stops the shaking)
      const dx = mouseX + window.scrollX - tag.restX;
      const dy = mouseY + window.scrollY - tag.restY;
      const distance = Math.hypot(dx, dy);

      let targetX = 0;
      let targetY = 0;

      if (distance < REACH) {
        // 0 at the edge of the zone, 1 when the cursor is right on the tag
        const strength = 1 - distance / REACH;
        const maxMove = tag.depth * 1.6;

        // Move opposite to the cursor's direction
        targetX = (-dx / (distance || 1)) * strength * maxMove * PUSH;
        targetY = (-dy / (distance || 1)) * strength * maxMove * PUSH;
      }

      // Ease toward the target instead of jumping straight there
      tag.curX += (targetX - tag.curX) * EASE;
      tag.curY += (targetY - tag.curY) * EASE;

      // Stop tiny leftover movement so the tag fully settles
      if (Math.abs(tag.curX) < 0.05 && targetX === 0) tag.curX = 0;
      if (Math.abs(tag.curY) < 0.05 && targetY === 0) tag.curY = 0;

      tag.el.style.transform = `translate(${tag.curX}px, ${tag.curY}px)`;
    });

    requestAnimationFrame(animateTags); // schedule the next frame
  }

  animateTags();
}

// ---------- 7. 3D TILT ON PROJECT CARDS ----------
if (canHover && !reduceMotion) {
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const box = card.getBoundingClientRect();
      // Mouse position inside the card, from -0.5 to 0.5
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      // Rotate toward the mouse, up to 8 degrees
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${y * -8}deg) translateY(-6px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = ""; // snap back to normal
    });
  });
}

// ---------- 8. WORDS LIGHT UP AS YOU SCROLL ----------
const scrollText = document.querySelector(".scroll-words");

// Split the sentence into one <span> per word
const words = scrollText.textContent.trim().split(" ");
scrollText.innerHTML = words.map((word) => `<span>${word}</span> `).join("");
const wordSpans = scrollText.querySelectorAll("span");

function lightUpWords() {
  const box = scrollText.getBoundingClientRect();
  // progress: 0 when the text enters the bottom of the screen,
  // 1 when it reaches about 35% from the top
  const progress = (window.innerHeight - box.top) / (window.innerHeight * 0.65 + box.height);
  const litCount = Math.round(Math.min(Math.max(progress, 0), 1) * wordSpans.length);

  wordSpans.forEach((span, index) => {
    span.classList.toggle("lit", index < litCount);
  });
}

window.addEventListener("scroll", lightUpWords);
lightUpWords(); // run once on load

// ---------- 9. RESUME BUTTON PLACEHOLDER ----------
// DELETE this block once the button's href is "assets/resume.pdf".
const resumeBtn = document.querySelector("#resume-btn");
resumeBtn.addEventListener("click", (event) => {
  if (resumeBtn.getAttribute("href") === "#") {
    event.preventDefault();
    alert("Resume coming soon!");
  }
});

// ---------- 10. FOOTER YEAR ----------
document.querySelector("#year").textContent = new Date().getFullYear();