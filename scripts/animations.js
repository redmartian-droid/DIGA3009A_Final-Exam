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

particlesJS("particles-js", {
  particles: {
    number: {
      value: 80,
    },
    color: {
      value: "#f19ca3",
    },
    shape: {
      type: "circle", // round particles
    },
    opacity: {
      value: 0.5, // see-through level
    },
    size: {
      value: 3, // average size
      random: true, // all particles not the same size
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#f19ca3",
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 2, // how fast they float
      out_mode: "out", // drift off screen naturally
    },
  },

  interactivity: {
    events: {
      onhover: { enable: true, mode: "repulse" }, // push away when mouse is near
      onclick: { enable: true, mode: "push" }, // spawn new particles on click
    },
  },

  retina_detect: true, // looks nicer on HD screens
});
