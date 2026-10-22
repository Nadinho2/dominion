/**
 * DOMINION INTERNATIONAL SCHOOL
 * Official Website JavaScript Logic
 * Motto: "Dominion Through Excellence"
 * Location: Ajao Estate, Airport Road, Ikeja, Lagos
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close menu when clicking links
    document.querySelectorAll('.nav-link, .mobile-nav-cta a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  // 2. Sticky Header Effect on Scroll
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // 3. Hero Carousel Slideshow
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slide-dot');
  let currentSlide = 0;
  let slideInterval;

  function goToSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) {
      dots[currentSlide].classList.add('active');
    }
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function startSlideShow() {
    slideInterval = setInterval(nextSlide, 5500);
  }

  function resetSlideTimer() {
    clearInterval(slideInterval);
    startSlideShow();
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetSlideTimer();
    });
  });

  if (slides.length > 0) {
    startSlideShow();
  }

  // 4. Academic Pathway Tabs Switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(targetId);
      if (activePane) {
        activePane.classList.add('active');
      }
    });
  });

  // 5. FAQs Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close others
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  // 6. Interactive Tour Booking Form Submission
  const tourForm = document.getElementById('tourBookingForm');
  const successBanner = document.getElementById('tourSuccessBanner');

  if (tourForm) {
    tourForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const parentName = document.getElementById('parentName')?.value || 'Parent';
      const visitDate = document.getElementById('visitDate')?.value || 'the selected date';
      const studentGrade = document.getElementById('studentGrade')?.value || 'the requested level';

      if (successBanner) {
        successBanner.innerHTML = `
          <i class="fa-solid fa-circle-check" style="font-size: 1.5rem;"></i>
          <div>
            <strong>Appointment Confirmed, ${parentName}!</strong><br>
            Your private campus tour for <strong>${studentGrade}</strong> is scheduled for <strong>${visitDate}</strong>. Our Admissions Team in Ajao Estate will call you shortly to confirm directions.
          </div>
        `;
        successBanner.classList.add('visible');
        tourForm.reset();

        setTimeout(() => {
          successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    });
  }

  // 7. Animated Counter for Statistics
  const counters = document.querySelectorAll('.stat-number');
  let hasAnimatedCounters = false;

  function animateCounters() {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-count');
      const suffix = counter.getAttribute('data-suffix') || '';
      let count = 0;
      const speed = 25;
      const increment = Math.ceil(target / 40);

      const updateCount = () => {
        count += increment;
        if (count < target) {
          counter.innerText = count + suffix;
          setTimeout(updateCount, speed);
        } else {
          counter.innerText = target + suffix;
        }
      };

      updateCount();
    });
  }

  window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('.hero-stats-bar');
    if (statsSection && !hasAnimatedCounters) {
      const rect = statsSection.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.9) {
        animateCounters();
        hasAnimatedCounters = true;
      }
    }
  });

  // 8. Interactive Fee Estimator Calculator
  const calcGrade = document.getElementById('calcGrade');
  const calcTransport = document.getElementById('calcTransport');
  const calcLunch = document.getElementById('calcLunch');
  const calcAddons = document.querySelectorAll('.calc-addon-check');
  const calcTotalPrice = document.getElementById('calcTotalPrice');

  function calculateFees() {
    if (!calcTotalPrice) return;

    let baseTuition = calcGrade ? parseInt(calcGrade.value, 10) || 0 : 270000;
    let transportCost = calcTransport ? parseInt(calcTransport.value, 10) || 0 : 0;
    let lunchCost = (calcLunch && calcLunch.checked) ? parseInt(calcLunch.value, 10) || 0 : 0;

    let addonsCost = 0;
    calcAddons.forEach(addon => {
      if (addon.checked) {
        addonsCost += parseInt(addon.value, 10) || 0;
      }
    });

    const total = baseTuition + transportCost + lunchCost + addonsCost;
    calcTotalPrice.textContent = '₦' + total.toLocaleString();
  }

  if (calcGrade) calcGrade.addEventListener('change', calculateFees);
  if (calcTransport) calcTransport.addEventListener('change', calculateFees);
  if (calcLunch) calcLunch.addEventListener('change', calculateFees);
  calcAddons.forEach(addon => addon.addEventListener('change', calculateFees));

  // Run initial calculation
  calculateFees();
});

