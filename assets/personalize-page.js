class PersonalizeCustom extends HTMLElement {

  constructor() {
    super();

    // this.progressElm = this.querySelector('.progress-bar');
    this.bottleItemElms = this.querySelectorAll('.choose-bottle-item');
    this.bottleImageElms = this.querySelectorAll('.add-message__form__image__inner img');
    this.variantSelectorElms = this.querySelectorAll('.choose-bottle-item__select');
    this.addMessageFormElm = this.querySelector('.add-message__form');

    this.personalLineProperty1Elm = this.querySelector('#bottle-1_personalize-line-1');
    this.personalLineProperty2Elm = this.querySelector('#bottle-1_personalize-line-2');
    this.personalLineProperty3Elm = this.querySelector('#bottle-2_personalize-line-1');
    this.personalLineProperty4Elm = this.querySelector('#bottle-2_personalize-line-2');
    // this.btnSubmit = this.querySelector('.btn__submit-persionalize');

    this.line1 = this.querySelector('[data-actions="render-personalize-text-1"]');
    this.line2 = this.querySelector('[data-actions="render-personalize-text-2"]');
    this.line3 = this.querySelector('[data-actions="render-personalize-text-3"]');
    this.line4 = this.querySelector('[data-actions="render-personalize-text-4"]');

    this.personalLineProperty1Elm.addEventListener('input', evt => {
      const target = evt.currentTarget;
      let value = target.value.trim();
      const maxLength = target.getAttribute('maxlength');

      if(value.length >= maxLength) {
        value = value.slice(0, maxLength);
        target.value = value;
      }

      if(this.line1) this.line1.innerHTML = value;

      if (value) {
        this.personalLineProperty2Elm.removeAttribute('disabled');
        this.personalLineProperty3Elm.removeAttribute('disabled');
      } else {
        this.personalLineProperty2Elm.setAttribute('disabled', true);
        this.personalLineProperty3Elm.setAttribute('disabled', true);
        this.personalLineProperty4Elm.setAttribute('disabled', true);
        this.personalLineProperty2Elm.value = '';
        this.personalLineProperty3Elm.value = '';
        this.personalLineProperty4Elm.value = '';
        if(this.line2) this.line2.innerHTML = '';
        if(this.line3) this.line3.innerHTML = '';
        if(this.line4) this.line4.innerHTML = '';
      }
    });

    this.personalLineProperty2Elm.addEventListener('input', evt => {
      const target = evt.currentTarget;
      let value = target.value.trim();
      const maxLength = target.getAttribute('maxlength');

      if(value.length >= maxLength) {
        value = value.slice(0, maxLength);
        target.value = value;
      }

      if(this.line2) this.line2.innerHTML = value;
    });

    this.personalLineProperty3Elm.addEventListener('input', evt => {
      const target = evt.currentTarget;
      let value = target.value.trim();
      const maxLength = target.getAttribute('maxlength');

      if(value.length >= maxLength) {
        value = value.slice(0, maxLength);
        target.value = value;
      }

      if(this.line3) this.line3.innerHTML = value;

      if (value) {
        this.personalLineProperty4Elm.removeAttribute('disabled');
      } else {
        this.personalLineProperty4Elm.setAttribute('disabled', true);
        this.personalLineProperty4Elm.value = '';
        if(this.line4) this.line4.innerHTML = '';
      }
    });

    this.personalLineProperty4Elm.addEventListener('input', evt => {
      const target = evt.currentTarget;
      let value = target.value.trim();
      const maxLength = target.getAttribute('maxlength');

      if(value.length >= maxLength) {
        value = value.slice(0, maxLength);
        target.value = value;
      }

      if(this.line4) this.line4.innerHTML = value;
    });

    this.bottleItemElms.forEach(elm => {
      elm.querySelector('.choose-bottle-item__image').addEventListener('click', this.handleSelectBottle.bind(this))
    });

    if (this.variantSelectorElms?.length) {
      this.variantSelectorElms.forEach(elm => {
        elm.addEventListener('change', evt => {
          const bottleElm = evt.currentTarget.closest('.choose-bottle-item');
          this.handleChangeData(bottleElm);
          this.handleChangePriceAndCoverImage(bottleElm);
        });
      })
    }

    // handle url query string
    const activeBottleElm = this.handleAutoSelectBottle();

    if (activeBottleElm) {
      this.handleShowHideTwinItems(activeBottleElm);
    }
  }

  handleAutoSelectBottle() {
    const searchParams = new URLSearchParams(window.location.search);

    const productId = searchParams.get('product');

    if (!productId) return this.bottleItemElms[0];
    
    // active product
    const bottleElm = this.querySelector(`[data-product-id="${productId}"]`);

    if (!bottleElm) return this.bottleItemElms[0];
    
    bottleElm.querySelector('.choose-bottle-item__image').click();
    
    const variantId = searchParams.get('variant');

    if (!variantId) return bottleElm;
    
    const variantSelectorElm = bottleElm.querySelector('[data-variant-selected]');

    if (!variantSelectorElm || variantSelectorElm.value === variantId) return bottleElm;

    const optionElm = variantSelectorElm.querySelector(`option[value="${variantId}"]`);

    if (!optionElm || optionElm.classList.contains('sold-out')) return bottleElm;

    variantSelectorElm.value = variantId;

    variantSelectorElm.dispatchEvent(new Event('change'));

    return null;
  }

  // clearForm() {
  //   this.personalLineProperty1Elm.value = '';
  //   this.personalLineProperty2Elm.value = '';
  //   this.personalLineProperty3Elm.value = '';
  //   this.personalLineProperty4Elm.value = '';
  //   if(this.line1) this.line1.innerHTML = '';
  //   if(this.line2) this.line2.innerHTML = '';
  //   if(this.line3) this.line3.innerHTML = '';
  //   if(this.line4) this.line4.innerHTML = '';
  //   this.personalLineProperty2Elm.setAttribute('disabled', true);
  //   this.personalLineProperty3Elm.setAttribute('disabled', true);
  //   this.personalLineProperty4Elm.setAttribute('disabled', true);
  // }

  // handleActiveStep(step) {
  //   this.progressElm
  //     .querySelectorAll('.progress-bar__step')
  //     .forEach(elm => {
  //       elm.classList.toggle('active', +elm.getAttribute('data-step') <= step);
  //     });
  // }

  handleDisableVariantSelector(bottleElm) {
    const variantSelectorElm = bottleElm.querySelector('.choose-bottle-item__select');
    if (variantSelectorElm) {
      variantSelectorElm.setAttribute('disabled', true);
    }
  }

  handleEnableVariantSelector(bottleElm) {
    const variantSelectorElm = bottleElm.querySelector('.choose-bottle-item__select');
    if (variantSelectorElm) {
      variantSelectorElm.removeAttribute('disabled');
    }
  }

  handleDeactiveBottles() {
    this.bottleItemElms.forEach(elm => {
      if (elm.classList.contains('active')) {
        elm.classList.remove('active');
        this.handleDisableVariantSelector(elm);
      }
    });
  }

  handleActiveBottle(bottleItemElm) {
    this.handleDeactiveBottles();
    bottleItemElm.classList.add('active');
    this.handleEnableVariantSelector(bottleItemElm);
    // this.clearForm();
  }

  // handleActiveFormControls() {
  //   this.btnSubmit.removeAttribute('disabled');
  //   this.personalLineProperty1Elm.removeAttribute('disabled');
  // }

  handleChangePreviewImage(bottleItemElm) {
    const variantSelectedElm = bottleItemElm.querySelector('[data-variant-selected]');
    let imgUrl = '';

    if (variantSelectedElm.tagName.toLowerCase() === 'input') {
      imgUrl = variantSelectedElm.getAttribute('data-personalize-image');
    } else {
      imgUrl = variantSelectedElm.querySelector('option:checked').getAttribute('data-personalize-image');
    }

    this.bottleImageElms.forEach(elm => {
      elm.setAttribute('src', imgUrl);
    });
  }

  handleChangePriceAndCoverImage(bottleItemElm) {
    const variantSelectedElm = bottleItemElm.querySelector('[data-variant-selected]');
    let imgUrl = '';
    let price = 0;

    if (variantSelectedElm.tagName.toLowerCase() === 'input') {
      price = variantSelectedElm.getAttribute('data-price');
      imgUrl = variantSelectedElm.getAttribute('data-cover-bottle-image');
    } else {
      price = variantSelectedElm.querySelector('option:checked').getAttribute('data-price');
      imgUrl = variantSelectedElm.querySelector('option:checked').getAttribute('data-cover-bottle-image');
    }

    bottleItemElm.querySelector('.choose-bottle-item__image img').setAttribute('src', imgUrl);

    bottleItemElm.querySelector('.choose-bottle-item__price .price-item').innerHTML = 
      Shopify.formatMoney(price, window.theme.moneyWithCurrencyFormat);
  }

  handleShowHideTwinItems(bottleElm) {
    const variantSelectedElm = bottleElm.querySelector('[data-variant-selected]');
    let variantName = '';

    if (variantSelectedElm.tagName.toLowerCase() === 'input') {
      variantName = variantSelectedElm.getAttribute('data-variant-name');
    } else {
      variantName = variantSelectedElm.querySelector('option:checked').getAttribute('data-variant-name');    
    }

    if(variantName.indexOf('twin') >= 0) {
      this.querySelector('[data-personalize-twin-item]').classList.remove('hidden');
      this.personalLineProperty3Elm.setAttribute('required', true);
    } else {
      this.querySelector('[data-personalize-twin-item]').classList.add('hidden');
      this.personalLineProperty3Elm.removeAttribute('required');
      this.personalLineProperty3Elm.value = '';
      this.personalLineProperty4Elm.value = '';
      if(this.line3) this.line3.innerHTML = '';
      if(this.line4) this.line4.innerHTML = '';
    }
  }

  handleChangeData(bottleElm) {
    // addMessageFormElm
    const variantSelectedElm = bottleElm.querySelector('[data-variant-selected]');
    let variantName = '';

    if (variantSelectedElm.tagName.toLowerCase() === 'input') {
      variantName = variantSelectedElm.getAttribute('data-variant-name');
    } else {
      variantName = variantSelectedElm.querySelector('option:checked').getAttribute('data-variant-name');    
    };

    const productId = bottleElm.getAttribute('data-product-id');
    const variantId = variantSelectedElm.value;
    const title = bottleElm.querySelector('.choose-bottle-item__product-name').textContent.trim();

    this.addMessageFormElm.setAttribute('id', `personalize-product-${productId}`);
    this.addMessageFormElm.querySelector('input[name="id"]').value = variantId;

    const titleValue = variantName !== 'default title' ? `${title} - ${variantName}` : `${title}`; 
    this.addMessageFormElm.querySelector('input[name="title"]').value = titleValue;

    this.handleShowHideTwinItems(bottleElm);
  }

  handleSelectBottle(evt) {
    const bottleItemElm = evt.currentTarget.closest('.choose-bottle-item');

    // this.handleActiveStep(2);
    // this.handleActiveFormControls();
    this.handleActiveBottle(bottleItemElm);
    this.handleChangePreviewImage(bottleItemElm);
    this.handleChangeData(bottleItemElm);
  }
}

customElements.define('personalize-custom', PersonalizeCustom);