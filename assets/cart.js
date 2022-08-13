class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();

    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');
    this.cartFreeGiftElm = this.querySelector('[data-free-gifts-cart]');

    const mainCartFooter = document.querySelector('#main-cart-footer');

    if(mainCartFooter) {
      this.btnCheckout = mainCartFooter.querySelector('#checkout');
  
      this.btnCheckout.addEventListener('click', this.handleProcessCheckout.bind(this));
    }
    
    this.freeGiftModal = document.querySelector('.free-gift-modal');
    if(this.freeGiftModal) {
      this.freeGiftModal.querySelector('.modal__close-button').addEventListener('click', this.closeMessageModal.bind(this))
      this.freeGiftModal.querySelector('[data-actions="close-modal"]').addEventListener('click', this.closeMessageModal.bind(this))
    };

    this.currentItemCount = Array.from(this.querySelectorAll('[name="cart-quantity-update[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      if (event.target.id.startsWith('free-gift')) return;
      this.onChange(event);
    }, 300);

    document.addEventListener('click', evt => {
      if (evt.target.classList.contains('free-gift-modal')) {
        this.closeMessageModal();
      }
    });

    this.addEventListener('change', this.debouncedOnChange.bind(this));

    this.handleBuyXGetY();

    if(!document.querySelector('[data-free-gifts-cart]')) {
      this.fetchCartData();
    }
  }

  fetchBuyXGetYDiscountData() {
    // return Promise.resolve({
    //   discountName: 'Test',
    //   customerSpends: {
    //     amount: 500,
    //     items: [
    //       '21-year-old-gran-reserva',
    //       'glenfiddich-12-year-old',
    //       'glenfiddich-15-year-old',
    //       'glenfiddich-18-year-old',
    //       'glenfiddich-50-year-old',
    //       'testing-copy-of-year-old-single-malt-scotch-whisky'
    //     ]
    //   },
    //   customerGets: {
    //     quantity: 2,
    //     items: ['free-gift', 'free-gift-2', 'free-gift-3']
    //   }
    // })
    return fetch(`https://wgs-services.azurewebsites.net/Discount/api/discounts/GetAutomationDiscount`, {
      method: 'get',
      headers: {
        'Authorization': 'Basic YWRtaW46YWRtaW4xMjM=',
        'issuer': '0'
      },
      
    }).then(res => res.json());
  }

  getSectionsToRenderForRemoveFreeGift() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner'
      },
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items')?.dataset?.id,
        selector: '.js-contents',
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer')?.dataset?.id,
        selector: '.js-contents',
      }
    ];
  }

  fetchCartData() {
    return fetch(`${routes.cart_url}.js`)
      .then(res => res.json())
      .then(res => {
        const freeGiftItems = res.items.filter(item => item.properties?._is_free_gift);

        if (freeGiftItems.length > 0) {
          const dataToRemove = freeGiftItems.reduce((acc, cur) => {
            acc[cur.id] = 0;
            return acc;
          }, {});

          const sections = this.getSectionsToRenderForRemoveFreeGift().map((section) => section.section);

          const body = JSON.stringify({
            updates: dataToRemove,
            sections,
            sections_url: window.location.pathname
          });

          fetch(`${routes.cart_update_url}`, {...fetchConfig(), ...{ body }})
            .then(res => res.text())
            .then(state => {
              const parsedState = JSON.parse(state);

              console.log('parsedState', parsedState);
              
              document.getElementById('cart-icon-bubble').querySelector('.cart-count').innerHTML = parsedState.item_count;

              this.getSectionsToRenderForRemoveFreeGift().forEach((section => {
                const elementToReplace =
                  document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
                
                if(elementToReplace) {
                  elementToReplace.innerHTML =
                    this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
                }
              }));

            })
            .catch((err) => {
              console.log('error when fetchCartData: ', err);
            });
        }

        // call ajax remove
        return res.items.filter(item => !item.properties?._is_free_gift);
      });
  }

  fetchProductData(handle) {
    return fetch(window.Shopify.routes.root + `products/${handle}.js`)
      .then(res => res.json());
  }

  renderFreeGift(freeGift, isOnly1) {
    const firstAvailableVariant = freeGift.variants.find(variant => variant.available) || freeGift.variants[0];
    const featuredImage = freeGift?.media.find(m => m?.media_type === 'image') || freeGift?.featured_image;

    const available = freeGift.variants.find(variant => variant.available);
    const outStockClass = available ? '' : ' out-stock';

    return `
      <div class="free-gift__item free-gift__checkbox${outStockClass}">
        <div class="free-gift__image-container aspect-ratio" style="padding-bottom: 100%"> 
          <img src="${featuredImage.src}"
            class="free-gift__image"
            alt="${freeGift.title}"
          />
        </div>

        <div class="free-gift__info">
          <input type="checkbox"
            ${isOnly1 ? 'checked' : ''}
            id="free-gift-${firstAvailableVariant.id}" 
            data-variant-id="${firstAvailableVariant.id}"
            aria-label="${freeGift.title}" />
          <label class="free-gift__name" for="free-gift-${firstAvailableVariant.id}">
            ${freeGift.title}
          </label>
        </div>
      </div>
    `
  }

  closeMessageModal() {
    document.body.classList.remove('overflow-hidden');
    this.freeGiftModal.removeAttribute('open');
  }

  handleProcessCheckout(evt) {
    if (!this.cartFreeGiftElm || !this.discountData.discountName) return;

    evt.preventDefault();
    this.cartFreeGiftElm.querySelector('.error_message').innerHTML = '';

    const freeGiftSelectedElm = this.cartFreeGiftElm.querySelector('.free-gift__selected');
    const checkedInputFreeGiftElms = this.cartFreeGiftElm.querySelectorAll('input[type="checkbox"]:checked');

    if (freeGiftSelectedElm.classList.contains('hidden')) {
      // go to checkout
      window.location.href = '/checkout';
      return;
    }

    if (!checkedInputFreeGiftElms?.length && this.freeGiftModal) {
      document.body.classList.add('overflow-hidden');
      this.freeGiftModal.setAttribute('open', true);
      return;
    }

    if(checkedInputFreeGiftElms) {
      if (checkedInputFreeGiftElms.length < this.discountData.customerGets.quantity) {
        this.cartFreeGiftElm.querySelector('.error_message').innerHTML = `Please select ${this.discountData.customerGets.quantity} free gifts.`;
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
      else if (checkedInputFreeGiftElms.length > this.discountData.customerGets.quantity) {
        this.cartFreeGiftElm.querySelector('.error_message').innerHTML = `You can only select ${this.discountData.customerGets.quantity} free gifts.`;
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
      else {
        let errors = [];
        checkedInputFreeGiftElms.forEach((item, idx) => {
          if (item.closest('.out-stock')) {
            errors.push(item.getAttribute('aria-label'))
          }
        });

        if (errors?.length) {
          this.cartFreeGiftElm.querySelector('.error_message').innerHTML =
            `${errors.join(', ')} ${errors.length > 1 ? 'are' : 'is'} out of stock. Please select another free gift.`;
          window.scrollTo({top: 0, behavior: 'smooth'});

        } else {
          const data = [...checkedInputFreeGiftElms].map(item => ({
            quantity: 1,
            id: +item.getAttribute('data-variant-id'),
            properties: {
              '_is_free_gift': true
            }
          }));

          fetch(`${routes.cart_add_url}.js`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With':'xmlhttprequest',
            },
            body: JSON.stringify({items: data})
          }).then((response) => {
            return response.json();
          }).then(res => {
            if (res.status === 422) {
              const soldoutItem = res.description.replace("The product '", '').replace("' is already sold out.", '');
              this.cartFreeGiftElm.querySelector('.error_message').innerHTML =
                `${soldoutItem} is out of stock. Please select another free gift.`;
              window.scrollTo({top: 0, behavior: 'smooth'});
            } else {
              window.location.href ='/checkout';
            }
          })
        }

      }
    }

  }

  handleBuyXGetY() {
    if (!this.cartFreeGiftElm) return;

    this.cartFreeGiftElm.classList.add('hidden');
    this.cartFreeGiftElm.querySelector('.free-gift__spend-more').classList.add('hidden');
    this.cartFreeGiftElm.querySelector('.free-gift__selected').classList.add('hidden');

    Promise.all([this.fetchCartData(), this.fetchBuyXGetYDiscountData()])
      .then(([cartItems, discountData]) => {
        this.discountData = discountData;

        if (!discountData.discountName) return;
        
        const customerSpends = discountData.customerSpends.items;

        if (!customerSpends.length) return;

        const discountedItems = cartItems.filter(item => customerSpends.indexOf(item.handle) !== -1);

        if(!discountedItems.length) return;

        const totalDiscountedAmount = discountedItems.reduce((acc, cur) => acc += cur.line_price, 0);

        const customerSpendsAmount = discountData.customerSpends.amount * 100;

        const customerGetHandles = discountData.customerGets.items;
        if(!customerGetHandles.length) return;

        const fetchProductDatas = [...new Set(customerGetHandles)].map(handle => this.fetchProductData(handle));

        // Free gift spend more
        if (totalDiscountedAmount < customerSpendsAmount) {
          const spendAmount = customerSpendsAmount - totalDiscountedAmount;
          this.cartFreeGiftElm.querySelector('[data-spend-quantity]').innerHTML = discountData.customerGets.quantity;
          this.cartFreeGiftElm.querySelector('[data-total-amount]').innerHTML = Shopify.formatMoney(customerSpendsAmount, window.theme.moneyFormat);
          this.cartFreeGiftElm.querySelector('[data-spend-amount]').innerHTML = Shopify.formatMoney(spendAmount, window.theme.moneyFormat);

          Promise.all(fetchProductDatas).then((arrFreeGiftProduct) => {
            if (arrFreeGiftProduct?.length) {
              const firstFreeGiftProduct = arrFreeGiftProduct[0];
  
              this.cartFreeGiftElm.querySelector('.free-gift__spend-more .free-gift__image-container').innerHTML = `
                <img src="${firstFreeGiftProduct.featured_image}"
                  class="free-gift__image"
                  alt="${firstFreeGiftProduct.title}"
                />
              `;
  
              this.cartFreeGiftElm.classList.remove('hidden');
              this.cartFreeGiftElm.querySelector('.free-gift__spend-more').classList.remove('hidden');
              this.cartFreeGiftElm.querySelector('.free-gift__selected').classList.add('hidden');
            }
          });

          return;
        }; 


        // Free gift Selected
        this.cartFreeGiftElm.querySelector('[data-amount]').innerHTML = Shopify.formatMoney(customerSpendsAmount, window.theme.moneyFormat);
        this.cartFreeGiftElm.querySelector('[data-quantity]').innerHTML = discountData.customerGets.quantity;

        Promise.all(fetchProductDatas).then((arrFreeGiftProduct) => {
          if(arrFreeGiftProduct?.length) {
            const isOnly1 = arrFreeGiftProduct.length === 1;
            const freeGiftTemplate = arrFreeGiftProduct.slice(0, 4).map(freeGift => this.renderFreeGift(freeGift, isOnly1)).join('');
            this.cartFreeGiftElm.querySelector('.free-gifts').innerHTML = freeGiftTemplate;
            this.cartFreeGiftElm.classList.remove('hidden');
            this.cartFreeGiftElm.querySelector('.free-gift__spend-more').classList.add('hidden');
            this.cartFreeGiftElm.querySelector('.free-gift__selected').classList.remove('hidden');
          }
        });

      });
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section'
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner'
      }
    ];
  }

  updateQuantity(line, quantity, name) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        this.handleBuyXGetY();

        const parsedState = JSON.parse(state);

        this.classList.toggle('is-empty', parsedState.item_count === 0);
        const cartDrawerWrapper = document.querySelector('cart-drawer');
        const cartFooter = document.getElementById('main-cart-footer');

        if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }));

        this.updateLiveRegions(line, parsedState.item_count);
        const lineItem =  document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);

        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`)) : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'))
        } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'))
        }
        this.disableLoading();

      }).catch(() => {
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        errors.textContent = window.cartStrings.error;
        this.disableLoading();
      });
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      const lineItemError = document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
      const quantityElement = document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);

      lineItemError
        .querySelector('.cart-item__error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          quantityElement.value
        );
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-overlay`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');
  }
}

customElements.define('cart-items', CartItems);
