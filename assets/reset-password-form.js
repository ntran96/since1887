const resetPasswordForm = document.querySelector('.reset-pass-form') || false;

if(resetPasswordForm) {
  const passwordInput = document.querySelector('#password') || false;
  const cfPasswordInput = document.querySelector('#password_confirmation') || false;
  const passwordErrorMess = document.querySelector('#errPW') || false;
  const cfPasswordErrorMess = document.querySelector('#err_cf_pw') || false;
  const updateSuccessMess = document.querySelector('.update-pass-success') || false;
  const submitBtn = document.querySelector('#submit-btn') || false;

  cfPasswordInput.onpaste = e => e.preventDefault();

  function onSubmitForm(e) {
    e.preventDefault();

    updateSuccessMess.classList.remove('active');
    
    let passwordValue = passwordInput.value ? passwordInput.value.trim() : '';
    let cfPasswordValue = cfPasswordInput.value ? cfPasswordInput.value.trim() : '';
    
    if(passwordValue && cfPasswordValue) {
      if(!passwordErrorMess.classList.contains('active')) {
        if(passwordValue === cfPasswordValue ) {
          cfPasswordErrorMess.classList.remove('active');

          let customerId = document.querySelector('#customerID').value;

          let _data = {
            id: customerId,
            password: passwordValue,
            password_confirmation: cfPasswordValue
          }

          handleCallAPI(_data);
        } else {
          cfPasswordErrorMess.classList.add('active');
        }
      }
    }
  }

  function handleCallAPI(data) {
    fetch(`https://wgs-services.azurewebsites.net/Customer/api/customers/UpdatePassword`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Basic YWRtaW46YWRtaW4xMjM="
        }
      })
      .then(response => response.json()) 
      .then(json => {
        resetPasswordForm.reset();
        updateSuccessMess.classList.add('active');
        document.getElementById('changePasswordButton').setAttribute('aria-expanded', 'false');
        window.location.href ='/account/login';
      })
      .catch(err => {
        updateSuccessMess.classList.remove('active');
        console.log('error: ', err);
      });
  }

  if(submitBtn) {
    submitBtn.addEventListener('click', onSubmitForm);
  }
}