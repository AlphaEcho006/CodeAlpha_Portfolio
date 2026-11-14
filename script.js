// ---------- 1. GRAB ELEMENTS ----------
const header = document.querySelector("#header");
const nav = document.querySelector("#nav");
const menuToggle = document.querySelector("#menu-toggle");
const navLinks = document.querySelectorAll(".nav a");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");

// ---------- 2. HEADER BACKGROUND ON SCROLL ----------
// Once you scroll more than 30px, the header gets a dark blurred background.
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 30);
});

// ---------- 3. MOBILE MENU ----------
menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open"); // add/remove the class, tells us which
  menuToggle.classList.toggle("open", isOpen);
});

// Close the menu after tapping any link
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.classList.remove("open");
  });
});

// ---------- 4. SCROLL REVEAL ----------
// IntersectionObserver tells us when an element enters the screen,
// so we can fade it in only when the visitor gets there.
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target); // animate once, then stop watching
      }
    });
  },
  { threshold: 0.15 } // trigger when 15% of the element is visible
);

revealItems.forEach((item) => revealObserver.observe(item));

// ---------- 5. HIGHLIGHT THE CURRENT SECTION IN THE NAV ----------
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          // Mint-color the link whose href matches the section on screen
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" } // counts a section once it reaches the middle of the screen
);

sections.forEach((section) => sectionObserver.observe(section));

// ---------- 6. RESUME BUTTON PLACEHOLDER ----------
// While there is no resume file yet, show a friendly message instead of a dead link.
// DELETE this whole block once you set the button's href to "assets/resume.pdf".
const resumeBtn = document.querySelector("#resume-btn");
resumeBtn.addEventListener("click", (event) => {
  if (resumeBtn.getAttribute("href") === "#") {
    event.preventDefault();
    alert("Resume coming soon!");
  }
});

// ---------- 7. FOOTER YEAR ----------
// Keeps the copyright year correct automatically.
document.querySelector("#year").textContent = new Date().getFullYear();