/**
 * AURA Fine Dining - Landing Page Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Initialize UI Selectors ---
  const header = document.querySelector('.header');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const bookingForm = document.getElementById('bookingForm');
  const bookingSuccess = document.getElementById('bookingSuccess');
  const btnResetForm = document.getElementById('btnResetForm');
  const newsletterForm = document.getElementById('newsletterForm');

  // --- 1. Sticky Header Scroll Effect ---
  const handleHeaderScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleHeaderScroll);
  handleHeaderScroll(); // Trigger on load in case page is already scrolled

  // --- 2. Mobile Navigation Toggle ---
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });

    // Close menu when clicking a nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // --- 3. Intersection Observer for Scroll Reveal Animations ---
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once revealed, no need to track it further
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null, // viewport
    threshold: 0.15, // trigger when 15% is visible
    rootMargin: '0px 0px -50px 0px' // offset bottom triggers slightly
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- 4. Active Navigation Links Highlighting (ScrollSpy) ---
  const sections = document.querySelectorAll('section[id]');
  
  const navObserverOptions = {
    root: null,
    threshold: 0,
    rootMargin: '-30% 0px -60% 0px' // observe when section is in middle viewport area
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(section => navObserver.observe(section));

  // --- 5. Date Picker Validation Constraints ---
  // Restrict booking date input to today and future dates
  const bookingDateInput = document.getElementById('bookingDate');
  if (bookingDateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    
    if (mm < 10) mm = '0' + mm;
    if (dd < 10) dd = '0' + dd;
    
    const minDateStr = `${yyyy}-${mm}-${dd}`;
    bookingDateInput.setAttribute('min', minDateStr);
  }

  // --- 6. Booking Form Custom Validation & Submission ---
  if (bookingForm) {
    // Utility functions to show/hide input error classes
    const setError = (element, messageElement = null) => {
      const group = element.closest('.form-group');
      if (group) group.classList.add('invalid');
    };

    const clearError = (element) => {
      const group = element.closest('.form-group');
      if (group) group.classList.remove('invalid');
    };

    // Live validation feedback on blur/input change
    const formFields = bookingForm.querySelectorAll('.form-input');
    formFields.forEach(field => {
      field.addEventListener('blur', () => {
        validateField(field);
      });
      field.addEventListener('input', () => {
        if (field.closest('.form-group').classList.contains('invalid')) {
          validateField(field);
        }
      });
    });

    const validateField = (field) => {
      let isValid = true;

      // 1. Text checks (Name)
      if (field.id === 'bookingName') {
        if (field.value.trim().length < 3) {
          setError(field);
          isValid = false;
        } else {
          clearError(field);
        }
      }

      // 2. Phone checks (Regex matches international and standard patterns, min 10 digits total)
      if (field.id === 'bookingPhone') {
        const phoneDigits = field.value.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
          setError(field);
          isValid = false;
        } else {
          clearError(field);
        }
      }

      // 3. Dropdown select check (Guest count)
      if (field.id === 'bookingGuests') {
        if (!field.value) {
          setError(field);
          isValid = false;
        } else {
          clearError(field);
        }
      }

      // 4. Date check
      if (field.id === 'bookingDate') {
        if (!field.value) {
          setError(field);
          isValid = false;
        } else {
          const selectedDate = new Date(field.value);
          const currentDate = new Date();
          // Reset times for date comparison
          selectedDate.setHours(0,0,0,0);
          currentDate.setHours(0,0,0,0);
          
          if (selectedDate < currentDate) {
            setError(field);
            isValid = false;
          } else {
            clearError(field);
          }
        }
      }

      // 5. Time check (Opening hours check: 17:00 to 22:30)
      if (field.id === 'bookingTime') {
        if (!field.value) {
          setError(field);
          isValid = false;
        } else {
          const [hours, minutes] = field.value.split(':').map(Number);
          const timeVal = hours * 60 + minutes; // Convert to total minutes
          
          const openTime = 17 * 60; // 17:00
          const closeTime = 22 * 60 + 30; // 22:30 last slot
          
          if (timeVal < openTime || timeVal > closeTime) {
            setError(field);
            isValid = false;
          } else {
            clearError(field);
          }
        }
      }

      return isValid;
    };

    // Form Submission Interceptor
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isFormValid = true;
      let firstInvalidField = null;

      // Validate all fields on submit
      formFields.forEach(field => {
        const isFieldValid = validateField(field);
        if (!isFieldValid) {
          isFormValid = false;
          if (!firstInvalidField) {
            firstInvalidField = field;
          }
        }
      });

      if (!isFormValid) {
        // Focus first field with validation error
        if (firstInvalidField) firstInvalidField.focus();
        return;
      }

      // If Form is Valid - Simulate Premium Server Latency & Confirm Booking
      const submitBtn = bookingForm.querySelector('.booking-submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Verifying Availability...';
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;

      setTimeout(() => {
        // Get confirmation values
        const nameVal = document.getElementById('bookingName').value;
        const guestsVal = document.getElementById('bookingGuests').value;
        const dateVal = document.getElementById('bookingDate').value;
        const timeVal = document.getElementById('bookingTime').value;

        // Format dates gracefully
        const dateObj = new Date(dateVal);
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('en-US', options);

        // Format times (12h clock style)
        const [hours, minutes] = timeVal.split(':');
        const hourNum = parseInt(hours);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const formattedHours = hourNum % 12 || 12;
        const formattedTime = `${formattedHours}:${minutes} ${ampm}`;

        // Populate details card
        document.getElementById('summaryName').textContent = nameVal;
        document.getElementById('summaryGuests').textContent = guestsVal + (parseInt(guestsVal) === 1 ? ' Guest' : ' Guests');
        document.getElementById('summaryDate').textContent = formattedDate;
        document.getElementById('summaryTime').textContent = formattedTime;

        // Reset submit button state
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '1';
        submitBtn.disabled = false;

        // Show Success Overlay Panel with animation
        bookingSuccess.classList.add('active');
      }, 1500); // 1.5s visual premium delay
    });
  }

  // --- 7. Reset Form / Return to Form Screen ---
  if (btnResetForm && bookingForm && bookingSuccess) {
    btnResetForm.addEventListener('click', () => {
      // Clear form inputs
      bookingForm.reset();
      
      // Remove any lingering validation styles
      const groups = bookingForm.querySelectorAll('.form-group');
      groups.forEach(group => group.classList.remove('invalid'));

      // Fade out success screen
      bookingSuccess.classList.remove('active');
    });
  }

  // --- 8. Newsletter Subscription (Micro-interaction) ---
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('.newsletter-input');
      const button = newsletterForm.querySelector('.newsletter-btn');
      
      if (!input.value.trim()) return;

      // Disable form during animation
      input.disabled = true;
      button.disabled = true;
      button.style.transform = 'scale(0)';

      setTimeout(() => {
        // Change text state to confirmation
        input.value = 'In Invitation Queue. Thank you!';
        input.style.color = '#D4A373';
        input.style.fontStyle = 'italic';
      }, 800);
    });
  }
});
