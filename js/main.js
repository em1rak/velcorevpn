document.addEventListener('DOMContentLoaded', function () {
  // Utility: Smooth Scroll to target element
  function smoothScrollTo(element) {
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Utility: Format numbers with spaces (e.g. 1 495 900)
  function formatNumber(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function formatCurrency(num) {
    return formatNumber(num) + ' ₽';
  }

  // Toast Notification helper
  function showToast(message, type = 'success') {
    let toast = document.querySelector('.velcore-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'velcore-toast';
      document.body.appendChild(toast);
    }
    toast.className = 'velcore-toast ' + type + ' show';
    toast.innerHTML = (type === 'success' ? '✓ ' : '✕ ') + message;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // ==========================================
  // 1. COOKIE BANNER (DESKTOP & MOBILE)
  // ==========================================
  function initCookies() {
    const dCookie = document.getElementById('12_1');
    const dBtn = document.getElementById('12_3');
    const mCookie = document.getElementById('5_420');
    const mBtn = document.getElementById('5_422');

    const containers = [dCookie, mCookie].filter(Boolean);
    const buttons = [dBtn, mBtn].filter(Boolean);

    if (containers.length === 0) return;

    if (localStorage.getItem('velcore_cookie_accepted') === '1') {
      containers.forEach(c => c.style.display = 'none');
      return;
    }

    const handleAccept = function () {
      containers.forEach(c => {
        c.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        c.style.opacity = '0';
        c.style.transform = 'scale(0.95)';
      });
      localStorage.setItem('velcore_cookie_accepted', '1');
      setTimeout(() => {
        containers.forEach(c => c.style.display = 'none');
      }, 300);
    };

    buttons.forEach(btn => {
      btn.classList.add('cookie-ok');
      btn.addEventListener('click', handleAccept);
    });

    containers.forEach(container => {
      container.addEventListener('click', function (e) {
        if (buttons.some(btn => e.target === btn || btn.contains(e.target))) {
          handleAccept();
        }
      });
    });
  }

  // ==========================================
  // 2. LEAD CAPTURE FORM (DESKTOP & MOBILE)
  // ==========================================
  function setupFormInstance(config) {
    const { containerId, contactId, submitId, fioTextId, contactTextId, inputFioId, inputContactId, platform, inputsWrapperId } = config;
    const fioContainer = document.getElementById(containerId);
    const contactContainer = document.getElementById(contactId);
    const submitBtn = document.getElementById(submitId);
    const inputsWrapper = document.getElementById(inputsWrapperId);

    const fioText = document.getElementById(fioTextId);
    let fioInput;
    if (fioText && fioContainer) {
      fioInput = document.createElement('input');
      fioInput.type = 'text';
      fioInput.id = inputFioId;
      fioInput.className = 'custom-input';
      fioInput.placeholder = 'ВВЕДИТЕ ВАШЕ ФИО';
      fioText.parentNode.replaceChild(fioInput, fioText);

      fioInput.addEventListener('focus', () => {
        fioContainer.classList.add('input-container-focus');
        fioContainer.classList.remove('input-container-error');
      });
      fioInput.addEventListener('blur', () => fioContainer.classList.remove('input-container-focus'));
      fioInput.addEventListener('input', () => {
        if (fioInput.value.trim().length > 0) {
          fioContainer.classList.remove('input-container-error');
        }
      });
    }

    const contactText = document.getElementById(contactTextId);
    let contactInput;
    if (contactText && contactContainer) {
      contactInput = document.createElement('input');
      contactInput.type = 'text';
      contactInput.id = inputContactId;
      contactInput.className = 'custom-input';
      contactInput.placeholder = '@USERNAME ИЛИ ТЕЛЕФОН';
      contactText.parentNode.replaceChild(contactInput, contactText);

      contactInput.addEventListener('focus', () => {
        contactContainer.classList.add('input-container-focus');
        contactContainer.classList.remove('input-container-error');
      });
      contactInput.addEventListener('blur', () => contactContainer.classList.remove('input-container-focus'));
      contactInput.addEventListener('input', () => {
        if (contactInput.value.trim().length > 0) {
          contactContainer.classList.remove('input-container-error');
        }
      });
    }

    if (submitBtn) {
      submitBtn.classList.add('clickable-btn');
      submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const fio = fioInput ? fioInput.value.trim() : '';
        const contact = contactInput ? contactInput.value.trim() : '';

        let hasError = false;

        if (!fio) {
          if (fioContainer) fioContainer.classList.add('input-container-error');
          hasError = true;
        } else {
          if (fioContainer) fioContainer.classList.remove('input-container-error');
        }

        if (!contact) {
          if (contactContainer) contactContainer.classList.add('input-container-error');
          hasError = true;
        } else {
          if (contactContainer) contactContainer.classList.remove('input-container-error');
        }

        if (hasError) {
          // Focus first empty field
          if (!fio && fioInput) {
            fioInput.focus();
          } else if (!contact && contactInput) {
            contactInput.focus();
          }
          return;
        }

        // Both fields filled: Save lead data
        const leads = JSON.parse(localStorage.getItem('velcore_leads') || '[]');
        leads.push({
          fio,
          contact,
          platform,
          date: new Date().toISOString()
        });
        localStorage.setItem('velcore_leads', JSON.stringify(leads));

        // Replace input fields with confirmation text & hide submit button
        const successBox = document.createElement('div');
        successBox.className = 'lead-form-success-box';
        successBox.innerHTML = `
          <p class="lead-form-success-title">Заявка успешно отправлена!</p>
          <p class="lead-form-success-desc">Мы свяжемся с вами в течение дня и пришлем все материалы.</p>
        `;

        if (inputsWrapper) {
          inputsWrapper.replaceWith(successBox);
        } else if (fioContainer && contactContainer) {
          fioContainer.style.display = 'none';
          contactContainer.style.display = 'none';
          if (submitBtn && submitBtn.parentNode) {
            submitBtn.parentNode.insertBefore(successBox, submitBtn);
          }
        }
      });
    }

    return { fioInput, contactInput, fioContainer };
  }

  function initForms() {
    // Desktop form
    const deskForm = setupFormInstance({
      containerId: '5_790',
      contactId: '5_791',
      submitId: '5_45',
      fioTextId: '5_51',
      contactTextId: '5_50',
      inputFioId: 'input_fio_d',
      inputContactId: 'input_contact_d',
      inputsWrapperId: '5_792',
      platform: 'desktop'
    });

    const dHeroPresBtn = document.getElementById('5_211');
    if (dHeroPresBtn) {
      dHeroPresBtn.classList.add('clickable-btn');
      dHeroPresBtn.addEventListener('click', function () {
        const target = document.getElementById('5_794') || deskForm.fioContainer;
        smoothScrollTo(target);
        if (deskForm.fioInput) setTimeout(() => deskForm.fioInput.focus(), 600);
      });
    }

    // Mobile form
    const mobForm = setupFormInstance({
      containerId: '5_751',
      contactId: '5_748',
      submitId: '5_745',
      fioTextId: '5_753',
      contactTextId: '5_750',
      inputFioId: 'input_fio_m',
      inputContactId: 'input_contact_m',
      inputsWrapperId: '5_827',
      platform: 'mobile'
    });

    const mHeroPresBtn = document.getElementById('5_542');
    if (mHeroPresBtn) {
      mHeroPresBtn.classList.add('clickable-btn');
      mHeroPresBtn.addEventListener('click', function () {
        const target = document.getElementById('5_755') || mobForm.fioContainer;
        smoothScrollTo(target);
        if (mobForm.fioInput) setTimeout(() => mobForm.fioInput.focus(), 600);
      });
    }
  }

  // ==========================================
  // 3. PROFIT CALCULATOR (DESKTOP & MOBILE)
  // ==========================================
  function setupSlider(track, fill, thumb, min, max, step, onValueChange, getInitialRatio, onUpdate) {
    if (!track || !fill) return;

    track.classList.add('calc-track');
    let isDragging = false;

    function setVisualPosition(ratio) {
      const pct = Math.max(0, Math.min(100, ratio * 100));
      fill.style.width = pct + '%';
      if (thumb) {
        if (pct >= 99) {
          thumb.style.opacity = '0';
        } else {
          thumb.style.opacity = '1';
          thumb.style.left = `calc(${pct}% + 6px)`;
        }
      }
    }

    function updateFromEvent(e) {
      const rect = track.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      if (!rect.width) return;
      let ratio = (clientX - rect.left) / rect.width;
      ratio = Math.max(0, Math.min(1, ratio));

      let val = min + ratio * (max - min);
      val = Math.round(val / step) * step;
      val = Math.max(min, Math.min(max, val));

      const snappedRatio = (val - min) / (max - min);
      setVisualPosition(snappedRatio);
      onValueChange(val);
      onUpdate();
    }

    track.addEventListener('mousedown', function (e) {
      isDragging = true;
      updateFromEvent(e);
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      updateFromEvent(e);
    });

    window.addEventListener('mouseup', function () {
      isDragging = false;
    });

    track.addEventListener('touchstart', function (e) {
      isDragging = true;
      updateFromEvent(e);
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (!isDragging) return;
      updateFromEvent(e);
    }, { passive: true });

    window.addEventListener('touchend', function () {
      isDragging = false;
    });

    const initRatio = getInitialRatio();
    setVisualPosition(initRatio);
  }

  function initCalculators() {
    // Desktop Calculator
    let dSubscribers = 77650;
    let dAvgCheck = 420;

    const elDSubscribers = document.getElementById('5_246');
    const elDAvgCheck = document.getElementById('5_248');
    const elDRevenue = document.getElementById('5_228');
    const elDAcquiring = document.getElementById('5_229');
    const elDRoyalty = document.getElementById('5_230');
    const elDTax = document.getElementById('5_231');
    const elDPromo = document.getElementById('5_232');
    const elDProfit = document.getElementById('5_249');

    const trackDSubscribers = document.getElementById('5_239');
    const fillDSubscribers = document.getElementById('5_240');
    const thumbDSubscribers = document.getElementById('5_241');

    const trackDAvgCheck = document.getElementById('5_235');
    const fillDAvgCheck = document.getElementById('5_236');
    const thumbDAvgCheck = document.getElementById('5_237');

    function updateDCalc() {
      const revenue = dSubscribers * dAvgCheck;
      const acquiring = Math.round(revenue * 0.049);
      const royalty = Math.round(revenue * 0.20);
      const tax = Math.round(revenue * 0.06);
      const promo = Math.round(revenue * 0.1404);
      const profit = Math.max(0, revenue - acquiring - royalty - tax - promo);

      if (elDSubscribers) elDSubscribers.textContent = formatNumber(dSubscribers);
      if (elDAvgCheck) elDAvgCheck.textContent = formatNumber(dAvgCheck);
      if (elDRevenue) elDRevenue.textContent = formatCurrency(revenue);
      if (elDAcquiring) elDAcquiring.textContent = '- ' + formatCurrency(acquiring);
      if (elDRoyalty) elDRoyalty.textContent = '- ' + formatCurrency(royalty);
      if (elDTax) elDTax.textContent = '- ' + formatCurrency(tax);
      if (elDPromo) elDPromo.textContent = '- ' + formatCurrency(promo);
      if (elDProfit) elDProfit.textContent = formatCurrency(profit);
    }

    if (trackDSubscribers && trackDAvgCheck) {
      setupSlider(
        trackDSubscribers,
        fillDSubscribers,
        thumbDSubscribers,
        1000,
        100000,
        500,
        v => { dSubscribers = v; },
        () => (dSubscribers - 1000) / (100000 - 1000),
        updateDCalc
      );

      setupSlider(
        trackDAvgCheck,
        fillDAvgCheck,
        thumbDAvgCheck,
        199,
        499,
        1,
        v => { dAvgCheck = v; },
        () => (dAvgCheck - 199) / (499 - 199),
        updateDCalc
      );

      updateDCalc();
    }

    const dWantCheckBtn = document.getElementById('5_218') || document.getElementById('5_219');
    if (dWantCheckBtn) {
      dWantCheckBtn.classList.add('clickable-btn');
      dWantCheckBtn.addEventListener('click', function () {
        smoothScrollTo(document.getElementById('5_794'));
      });
    }

    // Mobile Calculator
    let mSubscribers = 77650;
    let mAvgCheck = 420;

    const elMSubscribers = document.getElementById('5_572');
    const elMAvgCheck = document.getElementById('5_569');
    const elMRevenue = document.getElementById('5_581');
    const elMAcquiring = document.getElementById('5_582');
    const elMRoyalty = document.getElementById('5_583');
    const elMTax = document.getElementById('5_584');
    const elMPromo = document.getElementById('5_585');
    const elMProfit = document.getElementById('5_556');

    const trackMSubscribers = document.getElementById('5_563');
    const fillMSubscribers = document.getElementById('5_564');
    const thumbMSubscribers = document.getElementById('5_565');

    const trackMAvgCheck = document.getElementById('5_560');
    const fillMAvgCheck = document.getElementById('5_561');
    const thumbMAvgCheck = document.getElementById('5_562');

    function updateMCalc() {
      const revenue = mSubscribers * mAvgCheck;
      const acquiring = Math.round(revenue * 0.049);
      const royalty = Math.round(revenue * 0.20);
      const tax = Math.round(revenue * 0.06);
      const promo = Math.round(revenue * 0.1404);
      const profit = Math.max(0, revenue - acquiring - royalty - tax - promo);

      if (elMSubscribers) elMSubscribers.textContent = formatNumber(mSubscribers);
      if (elMAvgCheck) elMAvgCheck.textContent = formatNumber(mAvgCheck);
      if (elMRevenue) elMRevenue.textContent = formatCurrency(revenue);
      if (elMAcquiring) elMAcquiring.textContent = '- ' + formatCurrency(acquiring);
      if (elMRoyalty) elMRoyalty.textContent = '- ' + formatCurrency(royalty);
      if (elMTax) elMTax.textContent = '- ' + formatCurrency(tax);
      if (elMPromo) elMPromo.textContent = '- ' + formatCurrency(promo);
      if (elMProfit) elMProfit.textContent = formatCurrency(profit);
    }

    if (trackMSubscribers && trackMAvgCheck) {
      setupSlider(
        trackMSubscribers,
        fillMSubscribers,
        thumbMSubscribers,
        1000,
        100000,
        500,
        v => { mSubscribers = v; },
        () => (mSubscribers - 1000) / (100000 - 1000),
        updateMCalc
      );

      setupSlider(
        trackMAvgCheck,
        fillMAvgCheck,
        thumbMAvgCheck,
        199,
        499,
        1,
        v => { mAvgCheck = v; },
        () => (mAvgCheck - 199) / (499 - 199),
        updateMCalc
      );

      updateMCalc();
    }

    const mWantCheckBtn = document.getElementById('5_550') || document.getElementById('5_551');
    if (mWantCheckBtn) {
      mWantCheckBtn.classList.add('clickable-btn');
      mWantCheckBtn.addEventListener('click', function () {
        smoothScrollTo(document.getElementById('5_755'));
      });
    }
  }

  // ==========================================
  // 4. FAQ ACCORDION (DESKTOP & MOBILE)
  // ==========================================
  function initFAQ() {
    function bindAccordion(containerId, itemSelector, headerSelector) {
      const container = document.getElementById(containerId) || document.querySelector(`[id="${containerId}"]`);
      if (!container) return;

      const items = container.querySelectorAll(itemSelector);

      // Initialize initial open state
      items.forEach(item => {
        const drawer = item.querySelector('.faq-answer-drawer');
        if (drawer) {
          if (item.classList.contains('active')) {
            drawer.style.maxHeight = drawer.scrollHeight + 'px';
          } else {
            drawer.style.maxHeight = '0px';
          }
        }
      });

      items.forEach(item => {
        const header = headerSelector ? (item.querySelector(headerSelector) || item) : item;
        header.style.cursor = 'pointer';

        header.addEventListener('click', function (e) {
          if (e.target.closest('.faq-answer-drawer')) return;

          const isCurrentlyActive = item.classList.contains('active');
          const currentDrawer = item.querySelector('.faq-answer-drawer');

          // Close all other items in this accordion smoothly
          items.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
              otherItem.classList.remove('active');
              const d = otherItem.querySelector('.faq-answer-drawer');
              if (d) d.style.maxHeight = '0px';
            }
          });

          // Toggle clicked item
          if (!isCurrentlyActive) {
            item.classList.add('active');
            if (currentDrawer) {
              currentDrawer.style.maxHeight = currentDrawer.scrollHeight + 'px';
            }
          } else {
            item.classList.remove('active');
            if (currentDrawer) {
              currentDrawer.style.maxHeight = '0px';
            }
          }
        });
      });
    }

    // Initialize Desktop FAQ
    bindAccordion('5_844', '.faq-desktop-item', '.faq-desktop-header');

    // Initialize Mobile FAQ
    bindAccordion('5_702', '.faq-mobile-item', '.faq-mobile-header');
  }

  // ==========================================
  // 5. ANCHOR NAVIGATION & BUTTONS
  // ==========================================
  function initNav() {
    // Desktop links
    const dNavMap = [
      { id: '5_59', target: '5_799' },
      { id: '5_60', target: '5_789' },
      { id: '5_61', target: '5_841' },
      { id: '5_62', target: '5_844' },
      { id: '5_63', target: '5_802' },
      { id: '5_64', target: '5_794' },
      { id: '5_116', target: '5_799' },
      { id: '5_117', target: '5_789' },
      { id: '5_118', target: '5_841' },
      { id: '5_119', target: '5_844' },
      { id: '5_120', target: '5_802' },
      { id: '5_121', target: '5_794' },
      { id: '5_53', target: '5_789' },
    ];

    dNavMap.forEach(item => {
      const el = document.getElementById(item.id);
      const targetEl = document.getElementById(item.target);
      if (el && targetEl) {
        el.classList.add('interactive-nav');
        el.addEventListener('click', () => smoothScrollTo(targetEl));
      }
    });

    ['5_255', '5_260', '5_265'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.add('clickable-btn');
        btn.addEventListener('click', () => smoothScrollTo(document.getElementById('5_794')));
      }
    });

    // Mobile links
    const mNavMap = [
      { id: '5_760', target: '5_504' },
      { id: '5_761', target: '5_586' },
      { id: '5_762', target: '5_859' },
      { id: '5_763', target: '5_860' },
      { id: '5_764', target: '4_221' },
      { id: '5_765', target: '5_755' },
    ];

    mNavMap.forEach(item => {
      const el = document.getElementById(item.id);
      const targetEl = document.getElementById(item.target);
      if (el && targetEl) {
        el.classList.add('interactive-nav');
        el.addEventListener('click', () => smoothScrollTo(targetEl));
      }
    });

    // Desktop Hero "Рассчитать стоимость" (кнопка 5_79 и надпись 5_82) -> к калькулятору 5_789
    const dHeroCalcBtn = document.getElementById('5_79') || document.querySelector('.vector-wrapper-5_79');
    const dHeroCalcText = document.getElementById('5_82');
    [dHeroCalcBtn, dHeroCalcText].filter(Boolean).forEach(el => {
      el.classList.add('clickable-btn');
      el.addEventListener('click', () => {
        const target = document.getElementById('5_789');
        if (target) smoothScrollTo(target);
      });
    });

    // Mobile Hero "Рассчитать стоимость" (кнопка 5_414 и надпись 5_417) -> к калькулятору 5_586
    const mHeroCalcBtn = document.getElementById('5_414') || document.getElementById('4_227');
    const mHeroCalcText = document.getElementById('5_417');
    [mHeroCalcBtn, mHeroCalcText].filter(Boolean).forEach(el => {
      el.classList.add('clickable-btn');
      el.addEventListener('click', () => {
        const target = document.getElementById('5_586');
        if (target) smoothScrollTo(target);
      });
    });

    // ==========================================
    // Tariff Buttons -> Anchor to Lead Form
    // ==========================================
    // Desktop Tariff Buttons -> Desktop Lead Form (5_798 / 5_845)
    const dTariffIds = ['4_144', '4_145', '4_177', '4_178', '4_208', '4_209'];
    const dTariffButtons = new Set();
    dTariffIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) dTariffButtons.add(el);
    });
    document.querySelectorAll('#desktop-view .btn-tariff, #desktop-view .stroke-wrapper-4_144, #desktop-view .stroke-wrapper-4_177, #desktop-view .stroke-wrapper-4_208').forEach(el => {
      dTariffButtons.add(el);
    });

    dTariffButtons.forEach(btn => {
      btn.style.cursor = 'pointer';
      btn.classList.add('clickable-btn');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = document.getElementById('5_798') || document.getElementById('5_845') || document.getElementById('5_794');
        if (target) {
          smoothScrollTo(target);
          const input = document.getElementById('input_fio_d') || document.getElementById('input_contact_d');
          if (input) setTimeout(() => input.focus(), 600);
        }
      });
    });

    // Mobile Tariff Buttons -> Mobile Lead Form (5_755 / 5_861)
    const mTariffIds = ['4_253', '4_254', '4_289', '4_290', '4_325', '4_326'];
    const mTariffButtons = new Set();
    mTariffIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) mTariffButtons.add(el);
    });
    document.querySelectorAll('#mobile-view .btn-tariff, #mobile-view .stroke-wrapper-4_253, #mobile-view .stroke-wrapper-4_289, #mobile-view .stroke-wrapper-4_325').forEach(el => {
      mTariffButtons.add(el);
    });

    mTariffButtons.forEach(btn => {
      btn.style.cursor = 'pointer';
      btn.classList.add('clickable-btn');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = document.getElementById('5_755') || document.getElementById('5_861');
        if (target) {
          smoothScrollTo(target);
          const input = document.getElementById('input_fio_m') || document.getElementById('input_contact_m');
          if (input) setTimeout(() => input.focus(), 600);
        }
      });
    });

    document.querySelectorAll('.Pixso-paragraph-5_741, .Pixso-paragraph-5_743, .Pixso-paragraph-5_744').forEach(btn => {
      btn.classList.add('clickable-btn');
      btn.addEventListener('click', () => smoothScrollTo(document.getElementById('5_755')));
    });
  }

  // ==========================================
  // 6. RESPONSIVE FIT (ELIMINATE HORIZONTAL SCROLL)
  // ==========================================
  function fitFrames() {
    const windowWidth = document.documentElement.clientWidth || window.innerWidth;
    const desktopFrame = document.getElementById('5_802');
    const mobileFrame = document.getElementById('4_221');
    const mobileCanvas = document.getElementById('0_1_mob');

    if (windowWidth > 768) {
      if (desktopFrame) {
        const scale = windowWidth < 1920 ? (windowWidth / 1920) : 1;
        desktopFrame.style.zoom = scale;
      }
      if (mobileFrame) {
        mobileFrame.style.transform = 'none';
        mobileFrame.style.zoom = '1';
      }
      if (mobileCanvas) {
        mobileCanvas.style.height = '';
      }
    } else {
      if (desktopFrame) desktopFrame.style.zoom = '1';
      if (mobileFrame) {
        // Base mobile artboard in Pixso is 440px wide
        const scale = windowWidth / 440;
        mobileFrame.style.transform = `scale(${scale})`;
        mobileFrame.style.transformOrigin = 'top center';
        if (mobileCanvas) {
          const baseHeight = parseFloat(window.getComputedStyle(mobileFrame).height) || 9260;
          mobileCanvas.style.height = `${Math.ceil(baseHeight * scale)}px`;
        }
      }
    }
  }

  // ==========================================
  // 6. NAVBAR COLLAPSE / EXPAND TOGGLE & ICONS
  // ==========================================
  function initNavbarToggle() {
    // --- Desktop Navbar ---
    const dNavGroup = document.getElementById('5_113');
    const dToggleTrigger = document.getElementById('5_122');
    const dArrow = document.getElementById('5_124');
    const dLogo = document.getElementById('5_123');

    if (dNavGroup) {
      function toggleDesktopNav(e) {
        if (e) e.stopPropagation();
        dNavGroup.classList.toggle('desktop-navbar-expanded');
      }

      if (dToggleTrigger) {
        dToggleTrigger.style.cursor = 'pointer';
        dToggleTrigger.addEventListener('click', toggleDesktopNav);
      }
      if (dArrow) {
        dArrow.style.cursor = 'pointer';
        dArrow.addEventListener('click', toggleDesktopNav);
      }
      if (dLogo) {
        dLogo.style.cursor = 'pointer';
        dLogo.addEventListener('click', toggleDesktopNav);
      }

      // Collapse when any navigation link is clicked
      const dNavLinks = ['5_116', '5_117', '5_118', '5_119', '5_120', '5_121'];
      dNavLinks.forEach(id => {
        const link = document.getElementById(id);
        if (link) {
          link.addEventListener('click', (e) => {
            e.stopPropagation();
            dNavGroup.classList.remove('desktop-navbar-expanded');
          });
        }
      });
    }

    // --- Mobile Navbar ---
    const mNavGroup = document.getElementById('5_448');
    const mLogo = document.getElementById('5_450');
    const mArrow = document.getElementById('5_451');

    if (mNavGroup) {
      function toggleMobileNav(e) {
        if (e) e.stopPropagation();
        mNavGroup.classList.toggle('mobile-navbar-expanded');
      }

      if (mLogo) {
        mLogo.style.cursor = 'pointer';
        mLogo.addEventListener('click', toggleMobileNav);
      }
      if (mArrow) {
        mArrow.style.cursor = 'pointer';
        mArrow.addEventListener('click', toggleMobileNav);
      }

      // Mobile dropdown links
      const mItems = mNavGroup.querySelectorAll('.mobile-nav-item');
      mItems.forEach(item => {
        item.addEventListener('click', function (e) {
          e.stopPropagation();
          const targetId = item.getAttribute('data-target');
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            smoothScrollTo(targetEl);
          }
          mNavGroup.classList.remove('mobile-navbar-expanded');
        });
      });
    }

    // --- Icon Actions (Desktop & Mobile) ---
    // Question Mark icon -> Scroll to FAQ
    ['5_126', '5_453'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', function (e) {
          e.stopPropagation();
          const faqTarget = document.getElementById(id === '5_126' ? '5_844' : '5_860');
          if (faqTarget) smoothScrollTo(faqTarget);
        });
      }
    });

    // Telegram icon -> Link to Telegram
    ['5_125', '5_452'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', function (e) {
          e.stopPropagation();
          window.open('https://t.me/', '_blank');
        });
      }
    });

    // Top Presentation Buttons -> Scroll to lead form
    ['5_127', '5_454'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.add('clickable-btn');
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          const formTarget = document.getElementById(id === '5_127' ? '5_794' : '5_755');
          if (formTarget) smoothScrollTo(formTarget);
        });
      }
    });

    // Close on click outside
    document.addEventListener('click', function (e) {
      if (mNavGroup && mNavGroup.classList.contains('mobile-navbar-expanded') && !mNavGroup.contains(e.target)) {
        mNavGroup.classList.remove('mobile-navbar-expanded');
      }
      if (dNavGroup && dNavGroup.classList.contains('desktop-navbar-expanded') && !dNavGroup.contains(e.target)) {
        dNavGroup.classList.remove('desktop-navbar-expanded');
      }
    });
  }

  // Initialize all features
  fitFrames();
  window.addEventListener('resize', fitFrames);
  window.addEventListener('orientationchange', fitFrames);

  initCookies();
  initForms();
  initCalculators();
  initFAQ();
  initNav();
  initNavbarToggle();
});

