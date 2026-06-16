import * as THREE from 'three';

// ----------------------------------------------------
// THREE.JS BACKGROUND SCENE
// ----------------------------------------------------
const canvas = document.querySelector('#bg');

const scene = new THREE.Scene();
// No background color set in Three.js so it remains transparent 
// if renderer is configured with alpha, but we'll set it here to be entirely dark
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.z = 30;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x6366f1, 2, 100);
pointLight.position.set(20, 20, 20);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xa855f7, 2, 100);
pointLight2.position.set(-20, -20, 20);
scene.add(pointLight2);

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
  // random positions from -50 to 50
  posArray[i] = (Math.random() - 0.5) * 100;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.15,
  color: 0x888888,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Center geometry (Floating Icosahedron)
const geometry = new THREE.IcosahedronGeometry(8, 1);
const material = new THREE.MeshPhysicalMaterial({ 
  color: 0xffffff,
  metalness: 0.3,
  roughness: 0.2,
  wireframe: true,
  transparent: true,
  opacity: 0.15
});
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

// Scroll interaction
let scrollY = 0;
let currentScroll = 0;
document.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

// Mouse interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // Rotate shapes
  torus.rotation.x += 0.001;
  torus.rotation.y += 0.002;
  
  particlesMesh.rotation.y = -0.05 * elapsedTime;

  // Parallax effect on scroll
  // Smooth scroll interpolation
  currentScroll = currentScroll + (scrollY - currentScroll) * 0.1;

  camera.position.y = -(currentScroll / window.innerHeight) * 5;
  camera.position.x = Math.sin(currentScroll / window.innerHeight) * 3;
  
  // Mouse parallax interaction
  targetX = mouseX * 0.001;
  targetY = mouseY * 0.001;
  
  particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
  particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);

  torus.position.x += 0.05 * (targetX * 10 - torus.position.x);
  torus.position.y += 0.05 * (-targetY * 10 - torus.position.y);

  renderer.render(scene, camera);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// ----------------------------------------------------
// UI INTERACTIONS
// ----------------------------------------------------

// Intersection Observer for scroll animations
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(element => {
  observer.observe(element);
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

function toggleMobileNav() {
  navLinks.classList.toggle('nav-open');
}

mobileMenuBtn.addEventListener('click', toggleMobileNav);
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('nav-open');
  });
});

// Contact Form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  const formStatus = contactForm.querySelector('.form-status');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = contactForm.querySelector('input[type="text"]');
    const emailInput = contactForm.querySelector('input[type="email"]');
    const messageInput = contactForm.querySelector('textarea');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    
    const name = nameInput.value;
    const email = emailInput.value;
    const message = messageInput.value;
    
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    if (formStatus) formStatus.textContent = '';

    fetch("https://formsubmit.co/ajax/valsangkaraishwarya987@gmail.com", {
      method: "POST",
      headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
      body: JSON.stringify({
          name: name,
          email: email,
          message: message,
          _subject: `New Portfolio Message from ${name}`
      })
    })
    .then(response => response.json())
    .then(() => {
      submitBtn.textContent = 'Message Sent!';
      if (formStatus) formStatus.textContent = 'Thanks — I’ll reply shortly.';
      contactForm.reset();
      
      setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          if (formStatus) formStatus.textContent = '';
      }, 4000);
    })
    .catch(error => {
      console.error("Form submission error:", error);
      submitBtn.textContent = 'Error! Try Again.';
      if (formStatus) formStatus.textContent = 'Unable to send the message right now.';
      
      setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          if (formStatus) formStatus.textContent = '';
      }, 4000);
    });
  });
}
