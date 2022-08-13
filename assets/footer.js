const emailSignUpForm = document.querySelector('.email-signup-form') || false;
  
if(emailSignUpForm) {
  const emailInput = document.querySelector('#emailSignUp') || false;
  // const checkboxInput = document.querySelector('#confirm') || false;
  const submitButton = document.querySelector('#subscribeButton') || false;
  const resultMess = document.querySelector('.result-mess') || false;
  const emailError = document.querySelector('.error-mess.email-error') || false;
  // const checkboxError = document.querySelector('.error-mess.checkbox-error') || false;

  const handleLabelPosition = function() {
    emailInput.addEventListener('change', function() {
      if(this.value.length) {
        this.classList.add("not-empty");
      } else {
        this.classList.remove("not-empty");
      }
    });
  };

  const displayErrorMess = function(type, message) {
    if(type == 'email') {
      emailError.classList.add('active');
      emailError.textContent = message;
    }

    // if(type == 'checkbox') {
    //   checkboxError.classList.add('active');
    //   checkboxError.textContent = message;
    // }
  };

  const validateForm = function() {
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(emailInput.value) {
      emailError.classList.remove('active');

      if(!regexEmail.test(emailInput.value)) {
        displayErrorMess('email', 'Please input a valid e-mail address');
      } else {
        emailError.classList.remove('active');
      }
    } else {
      displayErrorMess('email', 'This is a required field');
    }

    // if(checkboxInput.checked) {
    //   checkboxError.classList.remove('active');
    // } else {
    //   displayErrorMess('checkbox', 'Please check this box if you want to proceed.');
    // }
  };

  const onSubmitSignUpForm = function(e) {
    e.preventDefault();
    
    resultMess.classList.remove('active');

    validateForm();

    let error = emailSignUpForm.querySelectorAll('.error-mess.active');

    if(error.length == 0) {
      const contactBookId = emailSignUpForm.querySelector('#contactBookID').value;
      // const contactBookId = "13739186";
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
          emailSignUpForm.reset();
          emailInput.classList.remove('not-empty');
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

  if (emailInput) {
    handleLabelPosition();
  }

  if(submitButton) {
    submitButton.addEventListener('click', onSubmitSignUpForm);
  }
};