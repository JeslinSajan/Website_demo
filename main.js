// DOM Elements
const hamburger = document.querySelector('.hamburger');
// Use the dedicated mobile drawer in small screens
const mobileNav = document.querySelector('.mobile-nav');
const overlay = document.querySelector('.menu-overlay');
const navLinks = document.querySelectorAll('.nav-link');
const body = document.body;
const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const navItems = document.querySelectorAll('.nav-item');
const nav = document.querySelector('.nav');
const header = document.querySelector('.header');
const sections = document.querySelectorAll('section');

// State
let isMenuOpen = false;
let lastScrollTop = 0;
const navHeight = header ? header.offsetHeight : 0;

// Set initial theme
document.addEventListener('DOMContentLoaded', () => {
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  // Initialize components
  initEventListeners();
  updateActiveNavLink();
  initEducationTabs();
  initProjectLinks();
  animateOnScroll();
  
  // Initial check for elements in viewport
  window.addEventListener('load', () => {
    updateActiveNavLink();
    animateOnScroll();
  });
});

// Theme Toggle
function toggleTheme() {
  const currentTheme = root.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  root.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
  }
}

// Smooth scroll to element
function smoothScroll(target) {
  // Close mobile menu if open
  if (isMenuOpen) {
    closeMobileMenu();
  }
  
  const element = document.querySelector(target);
  if (element) {
    const headerOffset = navHeight;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// Toggle mobile menu
function toggleMobileMenu() {
  isMenuOpen = !isMenuOpen;
  
  // Toggle active classes
  hamburger.classList.toggle('active');
  // Toggle the drawer on the dedicated mobile nav element
  if (mobileNav) mobileNav.classList.toggle('active');
  overlay.classList.toggle('active');
  
  // Toggle body scroll
  if (isMenuOpen) {
    body.style.overflow = 'hidden';
  } else {
    body.style.overflow = '';
  }
  
  // Update aria attributes
  const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
  hamburger.setAttribute('aria-expanded', !expanded);
}

// Close mobile menu
function closeMobileMenu() {
  if (!isMenuOpen) return;
  
  isMenuOpen = false;
  hamburger.classList.remove('active');
  if (mobileNav) mobileNav.classList.remove('active');
  overlay.classList.remove('active');
  body.style.overflow = '';
  hamburger.setAttribute('aria-expanded', 'false');
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
  if (!sections.length || !navItems.length) return;
  
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    
    if (window.pageYOffset >= (sectionTop - sectionHeight / 3)) {
      current = section.getAttribute('id');
    }
  });
  
  navItems.forEach(item => {
    const link = item.querySelector('a');
    if (link && link.getAttribute('href') === `#${current}`) {
      item.classList.add('active');
      link.classList.add('active');
    } else if (link) {
      item.classList.remove('active');
      link.classList.remove('active');
    }
  });
  
  // Add/remove scrolled class to header based on scroll position
  if (!header) return;
  
  const scrollPosition = window.scrollY;
  
  if (scrollPosition > 100) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  // Hide/show header on scroll
  if (!isMenuOpen) {
    window.requestAnimationFrame(() => {
      if (scrollPosition > lastScrollTop && scrollPosition > navHeight) {
        // Scrolling down
        header.style.transform = `translateY(-${navHeight}px)`;
      } else {
        // Scrolling up
        header.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = scrollPosition <= 0 ? 0 : scrollPosition;
    });
  }
}

// Tab functionality for education section
function initEducationTabs() {
  const tabContainers = document.querySelectorAll('.tabs');
  
  // Check if mobile view
  const isMobile = window.innerWidth <= 768;
  
  tabContainers.forEach(container => {
    const tabButtons = container.querySelectorAll('.tab-button');
    const tabPanes = container.nextElementSibling.querySelectorAll('.tab-pane');
    
    // Ensure no residual inline display styles before setting up
    tabPanes.forEach(pane => {
      pane.style.removeProperty('display');
    });
    
    tabButtons.forEach((button, index) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        // Preserve current scroll positions to avoid page jump
        const prevWindowScrollY = window.scrollY;
        const prevContainerScrollLeft = container.scrollLeft;
        // Avoid focus-induced scroll
        button.blur();
        
        // Remove active class from all buttons and panes in this container
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => {
          pane.classList.remove('active');
          // Clear any inline display so CSS controls visibility
          pane.style.removeProperty('display');
        });
        
        // Add active class to clicked button and corresponding pane
        button.classList.add('active');
        const targetId = button.getAttribute('data-tab');
        const targetPane = document.getElementById(targetId);
        
        if (targetPane) {
          // Rely on CSS for showing/hiding panes (no inline display)
          targetPane.classList.add('active');
        }
        
        // Restore scroll positions after DOM updates to keep viewport steady
        requestAnimationFrame(() => {
          window.scrollTo({ top: prevWindowScrollY, behavior: 'auto' });
          container.scrollLeft = prevContainerScrollLeft;
        });
      });
    });
    
    // Initialize first tab as active
    if (tabButtons.length > 0) {
      // Clear actives and inline displays first
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        pane.style.removeProperty('display');
      });
      
      tabButtons[0].classList.add('active');
      if (tabPanes.length > 0) {
        tabPanes[0].classList.add('active');
      }
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
      // Apply mobile styles if needed
      document.documentElement.classList.add('mobile-view');
    } else {
      document.documentElement.classList.remove('mobile-view');
    }
  });
  
  // Initial check
  if (window.innerWidth <= 768) {
    document.documentElement.classList.add('mobile-view');
  }
}

// Add animation class to elements when they come into view
function animateOnScroll() {
  const elements = document.querySelectorAll('.section, .project, .about-content, .experience-content');
  
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (elementTop < windowHeight - 100) {
      element.classList.add('fade-in');
    }
  });
}

// Throttle function
function throttle(callback, limit) {
  let wait = false;
  return function() {
    if (!wait) {
      callback.apply(this, arguments);
      wait = true;
      setTimeout(() => {
        wait = false;
      }, limit);
    }
  };
}

// Initialize event listeners
function initEventListeners() {
  // Mobile menu toggle
  if (hamburger) {
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-controls', 'mobile-nav');
    
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }
  
  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Close mobile menu when clicking on nav links
  navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        smoothScroll(targetId);
      }
    });
  });

  // Header scroll behavior
  const header = document.getElementById('header');
  let lastScroll = 0;
  const scrollThreshold = 100;
  let ticking = false;

  const updateHeader = (currentScroll) => {
    if (currentScroll > 10) {
      header.classList.add('scrolled');
      
      if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
        header.classList.add('hide');
      } else {
        header.classList.remove('hide');
      }
    } else {
      header.classList.remove('scrolled', 'hide');
    }
    
    lastScroll = currentScroll;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateHeader(window.scrollY);
      });
      ticking = true;
    }
  };

  // Add scroll event listener
  window.addEventListener('scroll', onScroll, { passive: true });

  // Initialize header state
  updateHeader(window.scrollY);

  // Initialize AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  
  // Close drawer when clicking on a link inside the mobile drawer
  if (mobileNav) {
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }

  // Close mobile menu when clicking the overlay
  if (overlay) {
    overlay.addEventListener('click', () => closeMobileMenu());
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

// Make project cards clickable to open GitHub repos
function initProjectLinks() {
  const projects = document.querySelectorAll('.project');
  if (!projects.length) return;

  // TODO: Replace these URLs with your actual GitHub repository links
  const projectLinks = {
    'Network Monitoring Tool': 'https://github.com/username/network-monitoring-tool',
    'Network Intrusion Detection System (IDS)': 'https://github.com/username/network-ids',
  };

  projects.forEach(card => {
    const titleEl = card.querySelector('.project-title');
    const title = titleEl ? titleEl.textContent.trim() : '';
    // Prefer explicit data-repo on the card
    const dataRepo = card.getAttribute('data-repo');
    const url = dataRepo || projectLinks[title];

    if (url) {
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');

      const open = () => window.open(url, '_blank', 'noopener');

      card.addEventListener('click', (e) => {
        const target = e.target;
        if (target.closest('a')) return;
        open();
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });

      const imgLink = card.querySelector('.project-image a');
      if (imgLink) {
        imgLink.href = url;
        imgLink.target = '_blank';
        imgLink.rel = 'noopener noreferrer';
        imgLink.setAttribute('aria-label', `${title || 'Project'} repository on GitHub`);
      }
    }
  });
}

// Initialize the app
function init() {
  // All initialization is now handled in the DOMContentLoaded event
}

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Page is visible again, update any necessary states
    updateActiveNavLink();
  }
});

// Handle browser back/forward navigation
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.target) {
    smoothScroll(e.state.target);
  }
});

// Make mobile social links clickable
function initMobileSocialLinks() {
    const socialLinks = document.querySelectorAll('.mobile-social-links a');
    
    socialLinks.forEach(link => {
        // Ensure links are clickable
        link.style.pointerEvents = 'auto';
        
        // Add touch feedback
        link.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        link.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
        
        // Ensure links open in new tab
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
}

document.addEventListener('DOMContentLoaded', initMobileSocialLinks);
window.addEventListener('load', initMobileSocialLinks);

// Ghost Cursor
function initGhostCursor() {
  const ghost = document.querySelector('.ghost-cursor');
  if (!ghost) return;
  
  let mouseX = 0;
  let mouseY = 0;
  let ghostX = 0;
  let ghostY = 0;
  let isHovering = false;
  
  // Follow mouse movement
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!isHovering) {
      ghost.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(${isHovering ? 1.5 : 1})`;
    }
  });
  
  // Smooth animation loop
  function animate() {
    // Calculate distance to move (easing effect)
    const dx = mouseX - ghostX;
    const dy = mouseY - ghostY;
    ghostX += dx * 0.1; // Adjust speed (0.1 for more lag, 1 for instant)
    ghostY += dy * 0.1;
    
    // Apply the position
    ghost.style.left = `${ghostX}px`;
    ghost.style.top = `${ghostY}px`;
    
    // Add slight rotation based on movement
    const rotation = Math.atan2(dy, dx) * (180 / Math.PI);
    ghost.style.transform = `translate(-50%, -50%) rotate(${rotation + 45}deg)`;
    
    requestAnimationFrame(animate);
  }
  
  // Handle hover effects on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .cta-button, .btn, input, textarea, select, [role="button"], [tabindex]');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      isHovering = true;
      ghost.classList.add('ghost-hover');
      ghost.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });
    
    el.addEventListener('mouseleave', () => {
      isHovering = false;
      ghost.classList.remove('ghost-hover');
      ghost.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
  
  // Start animation
  requestAnimationFrame(animate);
}

// Initialize ghost cursor
initGhostCursor();
