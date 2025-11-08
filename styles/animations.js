// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Animate sections on scroll
gsap.from(".section", {
  y: 50,
  opacity: 0,
  duration: 1,
  stagger: 0.2,
  scrollTrigger: {
    trigger: ".section",
    start: "top 80%",
    end: "bottom 20%",
    toggleActions: "play none none reverse",
  },
});

// Animate hero section
gsap.from(".hero", {
  opacity: 0,
  scale: 0.9,
  duration: 1.5,
  ease: "power2.out",
});

// Animate header on load
gsap.from("header", {
  y: -100,
  opacity: 0,
  duration: 1,
  ease: "power2.out",
});
