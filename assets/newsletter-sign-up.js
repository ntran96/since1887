const newsletterSignUpForm = document.querySelector('.newsletter-sign-up__form') || false;

if(newsletterSignUpForm) {
  const emailInput = newsletterSignUpForm.querySelector('#newsletter-email') || false;
   const checkboxInput = newsletterSignUpForm.querySelector('#newsletter-checkbox') || false;
  const submitButton = newsletterSignUpForm.querySelector('.newsletter-submit') || false;
  const resultMess = newsletterSignUpForm.querySelector('.result-mess') || false;
  const emailError = newsletterSignUpForm.querySelector('.error-message.email-error') || false;
  const checkboxError = newsletterSignUpForm.querySelector('.error-message.checkbox-error') || false;

  const displayErrorMess = function(type, message) {
    if(type == 'email') {
      emailError.classList.add('active');
      emailError.textContent = message;
      emailInput.classList.add('border-error-color');
    }

    if(type == 'checkbox') {
      checkboxError.classList.add('active');
      checkboxError.textContent = message;
    }
  };

  const hiddenErrorMess = function(type) {
    if(type == 'email') {
      emailError.classList.remove('active');
      emailInput.classList.remove('border-error-color');
    }

    if(type == 'checkbox') {
      checkboxError.classList.remove('active');
    }
  };

  const validateForm = function() {
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(emailInput.value) {
      hiddenErrorMess('email');

      if(!regexEmail.test(emailInput.value)) {
        displayErrorMess('email','Please input a valid e-mail address');
      } else {
        hiddenErrorMess('email');
      }
    } else {
      displayErrorMess('email','This is a required field');
    }

    if(checkboxInput.checked) {
      hiddenErrorMess('checkbox');
    } else {
      displayErrorMess('checkbox', 'Please check this box if you want to proceed.');
    }
  };

  const onSubmitSignUpForm = function(e) {
    e.preventDefault();
    
    resultMess.classList.remove('active');

    validateForm();

    let error = newsletterSignUpForm.querySelectorAll('.error-message.active');

    if(error.length == 0) {
      const contactBookId = newsletterSignUpForm.querySelector('#contactBookID').value;
      // const contactBookId = "13596945";
      let _data = {
        idAddressBook: contactBookId,
        contact: {
          email: emailInput.value,
          optInType: null,
          emailType: null,
          dataFields: null
        }
      };

      fetch(`https://wgs-services.azurewebsites.net/Customer/api/customers/AddContactToAddressBook`, {
        method: "POST",
        body: JSON.stringify(_data),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Basic YWRtaW46YWRtaW4xMjM="
        }
      })
      .then(response => response.json()) 
      .then(json => {
        console.log('success: ', json);
        if(json.status == 200) {
          resultMess.classList.add('active');
          resultMess.textContent = 'Thanks for subscribing';
          resultMess.style.color = '#199B4D';
          newsletterSignUpForm.reset();
        } else {
          resultMess.classList.add('active');
          resultMess.textContent = json.message;
          resultMess.style.color = '#D45757';
        }
      })
      .catch(err => {
        console.log('error: ', err);
        resultMess.classList.add('active');
        resultMess.textContent = 'Call API Failed';
        resultMess.style.color = '#D45757';
      });
    }
  }

  if(submitButton) {
    submitButton.addEventListener('click', onSubmitSignUpForm);
  }
}