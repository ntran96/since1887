const newsletterAdvancedForm = document.querySelector('.newsletter-advanced__form') || false;

if(newsletterAdvancedForm) {
  const submitButton = newsletterAdvancedForm.querySelector('.newsletter-advanced-submit') || false;

  // Set max year
  let year = document.getElementById('RegisterForm-birthday-year');
  let today = new Date();
  year.setAttribute('max', today.getFullYear());

  const onSubmitSignUpForm = function(e) {
    e.preventDefault();

    let errorMessage = newsletterAdvancedForm.querySelectorAll('.error-message.active');
    let errorBorder = newsletterAdvancedForm.querySelectorAll('.wrap-field__input--error');

    if( errorMessage.length == 0 && errorBorder.length == 0) {
      console.log('valid form !!!')
      const contactBookId = newsletterAdvancedForm.querySelector('#contactBookID').value;
      // const contactBookId = "13739186";
      const email = newsletterAdvancedForm.querySelector('#RegisterForm-email').value.trim();
      const firstName = newsletterAdvancedForm.querySelector('#FirstName').value.trim();
      const lastName = newsletterAdvancedForm.querySelector('#LastName').value.trim();
      const date = newsletterAdvancedForm.querySelector('#RegisterForm-birthday-date').value;
      const month = newsletterAdvancedForm.querySelector('#RegisterForm-birthday-month').value;
      const year = newsletterAdvancedForm.querySelector('#RegisterForm-birthday-year').value;

      let _data = {
        idAddressBook: contactBookId,
        contact: {
          email: email,
          optInType: null,
          emailType: null,
          dataFields: [
            {
              key: "FIRSTNAME",
              value: firstName
            },
            {
              key: "LASTNAME",
              value: lastName
            },
            {
              key: "DOB",
              value: `${date}/${month}/${year}`
            }
          ]
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
          newsletterAdvancedForm.reset();
          document.querySelector('.newsletter-advanced__wrap').classList.add('hidden');
          document.querySelector('.thankyou-page').classList.add('active');
        }
      })
      .catch(err => {
        console.log('error: ', err);
      });
    }
  };

  if(submitButton) {
    submitButton.addEventListener('click', onSubmitSignUpForm);
  }
}