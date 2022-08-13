function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

  if(summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch(e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach(submenu => {
      submenu.classList.remove('submenu-open');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
    document.querySelector('.header').classList.remove('header--menu-open');
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    this.header.classList.add('header--menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
      document.querySelector('.header').classList.add('header--menu-open')
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('header--menu-open');
  }
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this, false)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    this.initPages();
    const resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    if (this.sliderItemsToShow.length < 2) return;
    this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
    this.slidesPerPage = Math.floor((this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset);
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.initPages();
  }

  update() {
    const previousPage = this.currentPage;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(new CustomEvent('slideChanged', { detail: {
        currentPage: this.currentPage,
        currentElement: this.sliderItemsToShow[this.currentPage - 1]
      }}));
    }

    if (this.enableSliderLooping) return;

    if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft === 0) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
    return (element.offsetLeft + element.clientWidth) <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
  }

  onButtonClick(event) {
    event.preventDefault();
    const step = event.currentTarget.dataset.step || 1;
    this.slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + (step * this.sliderItemOffset) : this.slider.scrollLeft - (step * this.sliderItemOffset);
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }
}

customElements.define('slider-component', SliderComponent);

class SlideshowComponent extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.initSwiper();
  }

  get pagination() {
    return this.getAttribute('data-pagination');
  }

  get navigation() {
    return this.getAttribute('data-navigation') === 'true';
  }

  get delay() {
    return {
      delay: +this.getAttribute('data-delay'),
      disableOnInteraction: false,
    };
  }

  get effect() {
    return this.getAttribute('data-effect') === 'false'
      ? false 
      : this.getAttribute('data-effect');
  }

  get loop() {
    return this.getAttribute('data-loop') === 'true';
  }

  get autoplay() {
    return this.getAttribute('data-autoplay') === 'true';
  }

  get autoheight() {
    return this.getAttribute('data-autoheight') === 'true';
  }

  initSwiper() {
    if (this.swiper) return;

    const { delay, effect, loop, autoplay, autoheight, pagination, navigation } = this;

    return new Swiper('.swiper', {
      effect,
      speed: 500,
      autoHeight: autoheight,
      loop,
      autoplay: autoplay ? delay : false,
      pagination: pagination ? {
        clickable: true,
        el: '.swiper-pagination',
      } : false,
      navigation: navigation ? {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      } : false,
    });
  }

}

customElements.define('slideshow-component', SlideshowComponent);

class SwiperComponent extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.initSwiperComponent();
  }

  get componentClassName() {
    return this.getAttribute('data-component-class-name');
  }

  get pagination() {
    return this.getAttribute('data-pagination') === 'true';
  }

  get navigation() {
    return this.getAttribute('data-navigation') === 'true';
  }

  get slidesPerViewMobile() {
    return this.getAttribute('data-slides-per-view-mobile') ? Number(this.getAttribute('data-slides-per-view-mobile')) : 1;
  }
  
  get slidesPerViewTablet() {
    return this.getAttribute('data-slides-per-view-tablet') ? Number(this.getAttribute('data-slides-per-view-tablet')) : 1;
  }

  get slidesPerViewLaptop() {
    return this.getAttribute('data-slides-per-view-laptop') ? Number(this.getAttribute('data-slides-per-view-laptop')) : 1;
  }

  get slidesPerViewDesktop() {
    return this.getAttribute('data-slides-per-view-desktop') ? Number(this.getAttribute('data-slides-per-view-desktop')) : 1;
  }

  initSwiperComponent() {
    if (this.swiper) return;

    const { componentClassName, pagination, navigation, spaceMobile, spaceTablet, slidesPerViewMobile, slidesPerViewTablet, slidesPerViewLaptop, slidesPerViewDesktop } = this;

    return new Swiper(`${componentClassName} .swiper-custom`, {
      speed: 500,
      slidesPerView: slidesPerViewMobile,
      autoplay: false,
      pagination: pagination ? {
        clickable: true,
        el: `${componentClassName} .swiper-custom-pagination`,
      } : false,
      navigation: navigation ? {
        nextEl: `${componentClassName} .swiper-custom-button-next`,
        prevEl: `${componentClassName} .swiper-custom-button-prev`,
      } : false,
      breakpoints: {
        768: {
          slidesPerView: slidesPerViewTablet,
        },
        1200: {
          slidesPerView: slidesPerViewLaptop,
        },
        1440: {
          slidesPerView: slidesPerViewDesktop,
        }
      }
    });
  }
}

customElements.define('swiper-component', SwiperComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.toggleProductBarButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.toggleProductBarButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });

    const personalizeButtons = document.querySelectorAll('product-form .button--personalize');

    if(!personalizeButtons) return;

    personalizeButtons.forEach(btn => {
      const href = btn.getAttribute('href');

      const splitedHref = href.split('?');

      if (splitedHref.length === 2) {
        const searchParams = new URLSearchParams(splitedHref[1]);
  
        if(searchParams.get('variant')) {
          searchParams.set('variant', this.currentVariant.id);
          btn.setAttribute('href', `${splitedHref[0]}?${searchParams.toString()}`);
        }
      } 

    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);
    mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true);

    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);

    let urlLoadPageInput = document.querySelector('.notify-form input#url_load_page');
    if(urlLoadPageInput) {
      // urlLoadPageInput.value = window.location.href;
      urlLoadPageInput.value = `${this.dataset.url}?variant=${this.currentVariant.id}&contact_posted=true`;
    }
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #bar-product-form-${this.dataset.section} #product-form-installment-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    const productFormSection = document.querySelector('product-form.product-form');

    if(productFormSection) {
      productFormSection.classList.add('loading');
    }

    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(`price-${this.dataset.section}`);
        const source = html.getElementById(`price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
        
        this.toggleProductBarButton(!this.currentVariant.available, window.variantStrings.soldOut);
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    const productFormSection = document.querySelector('product-form.product-form');
    
    if (!productForm) return;

    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    const personalizeButton = productForm.querySelector('.button--personalize');
    const productFormWrap = document.querySelector('.product-form-wrap');
    const notifyForm = document.querySelector('.product-form-soldout');
    
    if (!addButton) return;
    
    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
      if(personalizeButton) {
        personalizeButton.classList.add('disabled');
      }

      if(productFormWrap) {
        productFormWrap.classList.add('hidden');
      }
      if(notifyForm) {
        notifyForm.classList.remove('hidden');
      }
      
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
      if(personalizeButton) {
        personalizeButton.classList.remove('disabled');
      }

      if(productFormWrap) {
        productFormWrap.classList.remove('hidden');
      }
      if(notifyForm) {
        notifyForm.classList.add('hidden');
      }
    }

    if(productFormSection) {
      productFormSection.classList.remove('loading');
    }

    if (!modifyClass) return;
  }

  toggleProductBarButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`bar-product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    const personalizeButton = productForm.querySelector('.button--personalize');
    const availableButton = document.querySelector('.product-bar__button--available');
    const soldOutButton = document.querySelector('.product-bar__button--soldout');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;

      if(personalizeButton) {
        personalizeButton.classList.add('disabled');
      }

      availableButton.classList.add('hidden');
      soldOutButton.classList.remove('hidden');
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
      if(personalizeButton) {
        personalizeButton.classList.remove('disabled');
      }

      availableButton.classList.remove('hidden');
      soldOutButton.classList.add('hidden');
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

function productTitleYearOld() {
  document.querySelectorAll('.product__title__year-old').forEach((text) => {
    console.log(isNaN(text.textContent));
    if(isNaN(text.textContent)){
      text.classList.add('normal');
      text.parentElement.classList.add('title-normal');
    } else {
      text.classList.add('highlight');
    }
  });
}
productTitleYearOld();

// add class btn
let inputSubmit = document.querySelector('.shopify-challenge__button[type="submit"]') || false
if (inputSubmit) {
  inputSubmit.classList.add('btn--primary')
}

// Check first visited website
// checkVisitedWeb();
function checkVisitedWeb() {
  let isExistsWelcome = sessionStorage.getItem('visited');
  if (isExistsWelcome == 'is_true') {
    console.log('visited');
  } else {
    sessionStorage.setItem('visited', 'is_true');
  }
};

// Check active Brand
activeBrandHandle();

function activeBrandHandle() {
  const currentThemeId = document.getElementById('current-theme-id').value;
  const glenfiddichThemeId = document.getElementById('glenfiddich-theme-id').value;
  const theBalvenieThemeId = document.getElementById('the-balvenie-theme-id').value;
  const monkeyShoulderThemeId = document.getElementById('monkey-shoulder-theme-id').value;
  const hendrickThemeId = document.getElementById('hendrick-theme-id').value;
  // const glenfiddichThemeId = 130251456666;
  // const theBalvenieThemeId = 1302514566662;
  // const monkeyShoulderThemeId = 1302514566663;
  // const hendrickThemeId = 1302514566664;
  const currentUrl = window.location.href;
  const suffixUrl = window.location.search;
  let suffixSubUrl = window.location.search.substring(1);
  let urlVariable = suffixSubUrl.split('&');
  let urlInfo = {};

  for (let entry of urlVariable) {
    let pair = entry.split("=");
    urlInfo[pair[0]] = pair[1];
  }

  if (urlInfo.brand != undefined ) {
    const brandInfo = urlInfo.brand;
    const itemBrand = document.getElementsByClassName('top-header__nav__item active');
    switch (brandInfo) {
      case `glenfiddich`:
        const itemGlenfiddichActive = document.getElementById('glenfiddich') || false;
        if (itemBrand.length > 0 && !itemGlenfiddichActive) {
          console.log('active glenfiddichThemeId', itemGlenfiddichActive);
          window.location.href = currentUrl + `&preview_theme_id=${glenfiddichThemeId}`;
        }
        break;
      case `the-balvenie`:
        const itemTheBalvenieActive = document.getElementById('the-balvenie') || false;
        if (itemBrand.length > 0 && !itemTheBalvenieActive) {
          console.log('active theBalvenieThemeId', itemTheBalvenieActive);
          window.location.href = currentUrl + `&preview_theme_id=${theBalvenieThemeId}`;
        }
        break;
      case `monkey-shoulder`:
        const itemMonkeyShoulderActive = document.getElementById('monkey-shoulder') || false;
        if (itemBrand.length > 0 && !itemMonkeyShoulderActive) {
          console.log('active monkeyShoulderThemeId', itemMonkeyShoulderActive);
          window.location.href = currentUrl + `&preview_theme_id=${monkeyShoulderThemeId}`;
        }
        break;
      case `hendrick`:
        const itemHendrickActive = document.getElementById('hendricks') || false;
        if (itemBrand.length > 0 && !itemHendrickActive) {
          console.log('active hendrickThemeId', itemHendrickActive);
          window.location.href = currentUrl + `&preview_theme_id=${hendrickThemeId}`;
        }
        break;
    }
  } else {
    switch (currentThemeId) {
      case `${glenfiddichThemeId}`:
        console.log('glenfiddichThemeId');
        if (history.pushState) {
          if (suffixUrl == "") {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?brand=glenfiddich';
            window.history.pushState({path:newurl},'',newurl);
          } else if (suffixUrl) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search + '&brand=glenfiddich';
            window.history.pushState({path:newurl},'',newurl);
          }
        }
        break;
      case `${theBalvenieThemeId}`:
        console.log('theBalvenieThemeId');
        if (history.pushState) {
          if (suffixUrl == "") {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?brand=the-balvenie';
            window.history.pushState({path:newurl},'',newurl);
          } else if (suffixUrl) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search + '&brand=the-balvenie';
            window.history.pushState({path:newurl},'',newurl);
          }
        }
        break;
      case `${monkeyShoulderThemeId}`:
        console.log('monkeyShoulderThemeId');
        if (history.pushState) {
          if (suffixUrl == "") {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?brand=monkey-shoulder';
            window.history.pushState({path:newurl},'',newurl);
          } else if (suffixUrl) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search + '&brand=monkey-shoulder';
            window.history.pushState({path:newurl},'',newurl);
          }
        }
        break;
      case `${hendrickThemeId}`:
        console.log('hendrickThemeId');
        if (history.pushState) {
          if (suffixUrl == "") {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?brand=hendrick';
            window.history.pushState({path:newurl},'',newurl);
          } else if (suffixUrl) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search + '&brand=hendrick';
            window.history.pushState({path:newurl},'',newurl);
          }
        }
        break;
    }
  };

  // Set timeout for Checkout button 
  function checkoutButtonHandle() {
    const cartPage = document.getElementsByClassName('cart-template');
    if (cartPage.length > 0) {
      const btnCheckout = document.querySelectorAll('.cart-template .cart__checkout-button');
      btnCheckout[0].classList.add('disabled');
      // console.log('btn checkout disable');
      window.onload = function(){ 
        setTimeout(() => {
          // console.log('btn checkout enable');
          btnCheckout[0].classList.remove('disabled');
        }, 4000);
      }
    }
  };

  checkoutButtonHandle();
};
