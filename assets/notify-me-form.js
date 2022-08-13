let productSoldoutForm = document.querySelector('.product-form-soldout');
if(productSoldoutForm) {
  // Get variant selected
  let variantInputs = document.querySelectorAll('variant-radios input');

  if(variantInputs) {
    let variantSelected = document.querySelector('variant-radios input:checked');
    let notiVariant = document.querySelector('.notify-form input.product-variant-value');

    if(variantSelected) {
      notiVariant.setAttribute("name", "contact[Product Variant]");
      notiVariant.value = variantSelected.value;

      variantInputs.forEach(variant => {
        variant.addEventListener('change', function() {
          if(variant.checked) {
            notiVariant.value = variant.value;
          }
        })
      })
    }
  }

  // Add logic for submit notify form
  let submitButtons = productSoldoutForm.querySelectorAll('.notify-btn');
  let successMess = productSoldoutForm.querySelector('.success-message');
  
  if(submitButtons) {
    submitButtons.forEach( button => {
      button.addEventListener('click', function(ev) {

        // Update validate rule for email input
        let email = productSoldoutForm.querySelector('#notifyContactFormEmail').value;
        if(email) {
          if(!regexEmail.test(email)) {
            ev.preventDefault();
          }
        }

        // Hidden success message when user tries to register another email invalid
        if(successMess) {
          let errorMessage = productSoldoutForm.querySelectorAll('.error-message.active');
          let errorBorder = productSoldoutForm.querySelectorAll('.wrap-field__input--error');

          if(!(errorMessage.length == 0 && errorBorder.length == 0)) {
            successMess.remove()
          }
        }
      })
    })
  }
}

// Scroll To Notify Form
if(document.querySelector('.product-bar__button--soldout')) {
  let scrollNotifyButton = document.querySelector('.button-scroll-to-notify');
  let notifyForm = productSoldoutForm;

  if(scrollNotifyButton) {
    scrollNotifyButton.addEventListener('click', function() {
      notifyForm.scrollIntoView({behavior: 'smooth', block: "center",});
    })
  }
}