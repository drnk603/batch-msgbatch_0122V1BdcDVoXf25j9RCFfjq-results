(function() {
  'use strict';

  const PATTERNS = {
    email: /^[^s@]+@[^s@]+.[^s@]+$/,
    phone: /^[ds+-()]{10,20}$/,
    name: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
    message: /^.{10,}$/
  };

  const MESSAGES = {
    name: 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen)',
    email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
    phone: 'Bitte geben Sie eine gültige Telefonnummer ein',
    message: 'Bitte geben Sie mindestens 10 Zeichen ein',
    privacy: 'Bitte akzeptieren Sie die Datenschutzerklärung',
    required: 'Dieses Feld ist erforderlich'
  };

  class FormValidator {
    constructor(form) {
      this.form = form;
      this.fields = this.form.querySelectorAll('input, textarea');
      this.init();
    }

    init() {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
      
      this.fields.forEach(field => {
        field.addEventListener('blur', () => this.validateField(field));
        field.addEventListener('input', () => this.clearError(field));
      });
    }

    validateField(field) {
      this.clearError(field);
      
      const value = field.value.trim();
      const type = field.type;
      const name = field.name;
      const required = field.hasAttribute('required') || field.hasAttribute('aria-required');

      if (required && !value) {
        this.showError(field, MESSAGES.required);
        return false;
      }

      if (!value) return true;

      if (type === 'email' && !PATTERNS.email.test(value)) {
        this.showError(field, MESSAGES.email);
        return false;
      }

      if (type === 'tel' && value && !PATTERNS.phone.test(value)) {
        this.showError(field, MESSAGES.phone);
        return false;
      }

      if (name === 'name' && !PATTERNS.name.test(value)) {
        this.showError(field, MESSAGES.name);
        return false;
      }

      if (name === 'message' && !PATTERNS.message.test(value)) {
        this.showError(field, MESSAGES.message);
        return false;
      }

      if (type === 'checkbox' && required && !field.checked) {
        this.showError(field, MESSAGES.privacy);
        return false;
      }

      return true;
    }

    showError(field, message) {
      field.classList.add('has-error');
      
      let errorEl = field.parentElement.querySelector('.c-form__error');
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'c-form__error';
        errorEl.setAttribute('role', 'alert');
        field.parentElement.appendChild(errorEl);
      }
      errorEl.textContent = message;
    }

    clearError(field) {
      field.classList.remove('has-error');
      const errorEl = field.parentElement.querySelector('.c-form__error');
      if (errorEl) {
        errorEl.remove();
      }
    }

    validateAll() {
      let isValid = true;
      this.fields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });
      return isValid;
    }

    handleSubmit(e) {
      e.preventDefault();
      e.stopPropagation();

      if (!this.validateAll()) {
        return;
      }

      const submitBtn = this.form.querySelector('button[type="submit"]');
      if (!submitBtn) return;

      submitBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        window.location.href = 'thank_you.html';
      }, 1000);
    }
  }

  class BurgerMenu {
    constructor() {
      this.nav = document.querySelector('.c-nav#main-nav');
      this.toggle = document.querySelector('.c-nav__toggle');
      this.navList = document.querySelector('.c-nav__list');
      this.body = document.body;
      this.isOpen = false;

      if (!this.nav || !this.toggle || !this.navList) return;

      this.init();
    }

    init() {
      this.toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMenu();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMenu();
          this.toggle.focus();
        }
      });

      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.nav.contains(e.target)) {
          this.closeMenu();
        }
      });

      const links = this.nav.querySelectorAll('.c-nav__link');
      links.forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
          this.closeMenu();
        }
      });
    }

    toggleMenu() {
      this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
      this.isOpen = true;
      this.nav.classList.add('is-open');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.body.classList.add('u-no-scroll');
    }

    closeMenu() {
      this.isOpen = false;
      this.nav.classList.remove('is-open');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.body.classList.remove('u-no-scroll');
    }
  }

  class ScrollAnimations {
    constructor() {
      this.observer = null;
      this.init();
    }

    init() {
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              this.animateElement(entry.target);
            }
          });
        }, {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        });

        this.observeElements();
      }
    }

    observeElements() {
      const elements = document.querySelectorAll('.c-card, .c-service-card, .c-quick-link, img, .c-section-header, .c-hero');
      elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.8s ease-out';
        this.observer.observe(el);
      });
    }

    animateElement(el) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }
  }

  class SmoothScroll {
    constructor() {
      this.init();
    }

    init() {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('a[href^="#"]');
        if (!target) return;

        const href = target.getAttribute('href');
        if (!href || href === '#' || href === '#!') return;

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();
          const header = document.querySelector('.l-header');
          const headerHeight = header ? header.offsetHeight : 80;
          const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    }
  }

  class ActiveMenu {
    constructor() {
      this.init();
    }

    init() {
      const currentPath = window.location.pathname;
      const navLinks = document.querySelectorAll('.c-nav__link');

      navLinks.forEach(link => {
        link.classList.remove('active', 'is-active');
        link.removeAttribute('aria-current');

        const linkPath = link.getAttribute('href');
        if (!linkPath) return;

        const linkPathClean = linkPath.split('#')[0].split('?')[0];
        const currentPathClean = currentPath.split('#')[0].split('?')[0];

        if (linkPathClean === currentPathClean ||
            (linkPathClean === '/' && (currentPathClean === '/' || currentPathClean === '/index.html')) ||
            (linkPathClean === '/index.html' && currentPathClean === '/')) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active', 'is-active');
        }
      });
    }
  }

  class ImageSlider {
    constructor(slider) {
      this.slider = slider;
      this.track = slider.querySelector('.c-slider__track');
      this.items = slider.querySelectorAll('.c-slider__item');
      this.prevBtn = slider.querySelector('.c-slider__control--prev');
      this.nextBtn = slider.querySelector('.c-slider__control--next');
      this.currentIndex = 0;
      this.autoplayInterval = null;

      if (!this.track || this.items.length === 0) return;

      this.init();
    }

    init() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.next());
      }

      this.startAutoplay();

      this.slider.addEventListener('mouseenter', () => this.stopAutoplay());
      this.slider.addEventListener('mouseleave', () => this.startAutoplay());

      this.updateSlider();
    }

    next() {
      this.currentIndex = (this.currentIndex + 1) % this.items.length;
      this.updateSlider();
    }

    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
      this.updateSlider();
    }

    updateSlider() {
      const offset = -this.currentIndex * 100;
      this.track.style.transform = `translateX(${offset}%)`;
    }

    startAutoplay() {
      this.stopAutoplay();
      this.autoplayInterval = setInterval(() => this.next(), 5000);
    }

    stopAutoplay() {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    }
  }

  class ButtonHoverEffects {
    constructor() {
      this.init();
    }

    init() {
      const buttons = document.querySelectorAll('.c-button, .btn, .c-nav__link, .c-service-card__link, .c-quick-link');
      
      buttons.forEach(btn => {
        btn.addEventListener('mouseenter', (e) => this.createRipple(e));
      });
    }

    createRipple(e) {
      const button = e.currentTarget;
      const ripple = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${diameter}px;
        height: ${diameter}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
      `;

      const rect = button.getBoundingClientRect();
      ripple.style.left = `${e.clientX - rect.left - radius}px`;
      ripple.style.top = `${e.clientY - rect.top - radius}px`;

      const oldRipple = button.querySelector('span[style*="ripple"]');
      if (oldRipple) oldRipple.remove();

      if (getComputedStyle(button).position === 'static') {
        button.style.position = 'relative';
      }

      button.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    }
  }

  class CookieBanner {
    constructor() {
      this.banner = document.getElementById('cookie-banner');
      if (!this.banner) return;

      this.acceptBtn = document.getElementById('cookie-accept');
      this.declineBtn = document.getElementById('cookie-decline');

      this.init();
    }

    init() {
      const cookieConsent = localStorage.getItem('cookieConsent');
      
      if (!cookieConsent) {
        setTimeout(() => {
          this.banner.classList.add('is-visible');
        }, 1000);
      }

      if (this.acceptBtn) {
        this.acceptBtn.addEventListener('click', () => this.accept());
      }

      if (this.declineBtn) {
        this.declineBtn.addEventListener('click', () => this.decline());
      }
    }

    accept() {
      localStorage.setItem('cookieConsent', 'accepted');
      this.banner.classList.remove('is-visible');
    }

    decline() {
      localStorage.setItem('cookieConsent', 'declined');
      this.banner.classList.remove('is-visible');
    }
  }

  class PortfolioFilter {
    constructor() {
      this.filterBtns = document.querySelectorAll('.c-button--filter');
      this.items = document.querySelectorAll('.portfolio-item');

      if (this.filterBtns.length === 0 || this.items.length === 0) return;

      this.init();
    }

    init() {
      this.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const filter = btn.getAttribute('data-filter');
          this.filter(filter);
          
          this.filterBtns.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
        });
      });
    }

    filter(category) {
      this.items.forEach(item => {
        if (category === 'all' || item.classList.contains(category)) {
          item.classList.remove('is-hidden');
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9)';
          
          setTimeout(() => {
            item.style.transition = 'all 0.5s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.transition = 'all 0.3s ease-out';
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9)';
          
          setTimeout(() => {
            item.classList.add('is-hidden');
          }, 300);
        }
      });
    }
  }

  class ImagesLoader {
    constructor() {
      this.init();
    }

    init() {
      const images = document.querySelectorAll('img');
      
      images.forEach(img => {
        if (!img.classList.contains('img-fluid')) {
          img.classList.add('img-fluid');
        }

        const isCritical = img.hasAttribute('data-critical') || img.classList.contains('c-logo__img');
        if (!img.hasAttribute('loading') && !isCritical) {
          img.setAttribute('loading', 'lazy');
        }

        img.addEventListener('error', function() {
          const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#f0f0f0" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="sans-serif" font-size="18">Bild nicht verfügbar</text></svg>';
          this.src = 'data:image/svg+xml;base64,' + btoa(svg);
          this.style.objectFit = 'contain';
        });
      });
    }
  }

  function addRippleAnimationCSS() {
    if (document.getElementById('ripple-animation-style')) return;

    const style = document.createElement('style');
    style.id = 'ripple-animation-style';
    style.textContent = `
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      .is-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    if (window.__appInitialized) return;
    window.__appInitialized = true;

    addRippleAnimationCSS();

    new BurgerMenu();
    new SmoothScroll();
    new ActiveMenu();
    new ScrollAnimations();
    new ButtonHoverEffects();
    new CookieBanner();
    new PortfolioFilter();
    new ImagesLoader();

    const forms = document.querySelectorAll('.c-form, form[id="contact-form"]');
    forms.forEach(form => new FormValidator(form));

    const sliders = document.querySelectorAll('.c-slider');
    sliders.forEach(slider => new ImageSlider(slider));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.is-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

.c-nav__list {
  height: 0;
  transition: height 0.4s ease-in-out;
}

.c-nav.is-open .c-nav__list {
  height: calc(100vh - var(--header-h));
}

.c-button, .btn, .c-nav__link, .c-service-card, .c-quick-link, .c-card {
  position: relative;
  overflow: hidden;
}

.c-form__input.has-error,
.c-form__textarea.has-error {
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.c-button:active {
  animation: button-press 0.2s ease-out;
}

@keyframes button-press {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.c-card:hover, .c-service-card:hover, .c-quick-link:hover {
  animation: float 0.3s ease-out forwards;
}

@keyframes float {
  to {
    transform: translateY(-8px);
  }
}

img {
  transition: opacity 0.4s ease-out, transform 0.6s ease-out;
}

.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: text-bottom;
  border: 0.2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border-animation 0.75s linear infinite;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
  border-width: 0.15em;
}

@keyframes spinner-border-animation {
  to {
    transform: rotate(360deg);
  }
}

.c-cookie-banner {
  animation: slide-up 0.5s ease-out forwards;
}

.c-cookie-banner.is-visible {
  animation: slide-up-visible 0.5s ease-out forwards;
}

@keyframes slide-up-visible {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}

.portfolio-item {
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.portfolio-item.is-hidden {
  opacity: 0;
  transform: scale(0.9);
}

.c-hero__content {
  animation: fade-in-up 1s ease-out;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.c-section-header {
  animation: fade-in 0.8s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
