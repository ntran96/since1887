document.addEventListener('invalid', (function () {
  return function (el) {
    el.preventDefault();
    el.target.classList.add('wrap-field__input--error');
    if (el.target.nextElementSibling) {
      if (el.target.nextElementSibling.classList.contains('error-message'))
        el.target.nextElementSibling.classList.add('active')
    }
  };
})(), true);
document.addEventListener('keyup', (function () {
  return function (el) {
    el.target.classList.remove('wrap-field__input--error');
    if (el.target.nextElementSibling) {
      if (el.target.nextElementSibling.classList.contains('error-message'))
        el.target.nextElementSibling.classList.remove('active')
    }
    if (el.target.parentElement.nextElementSibling) {
      if (el.target.parentElement.nextElementSibling.classList.contains('error-message'))
        el.target.parentElement.nextElementSibling.classList.remove('active')
    }
  };
})(), true);

//Validate Checkbox required
if(document.querySelector('.checkbox-required')) {
  const submitButtons = document.querySelector('.checkbox-required').closest('form').querySelectorAll('button');

  submitButtons.forEach( button => {
    button.addEventListener('click', function() {
      if(document.querySelector('.checkbox-required input').checked) {
        document.querySelector('.checkbox-required input').parentElement.nextElementSibling.classList.remove('active')
      } else {
        document.querySelector('.checkbox-required input').parentElement.nextElementSibling.classList.add('active')
      }
    })
  })
}

let validate = true
let rexName =  /^[a-zA-Z ]*$/
let inputFName = document.getElementById('FirstName')
let inputLName = document.getElementById('LastName')
let errorFName = document.getElementById('errFName')
let errorLName = document.getElementById('errLName')

let regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
let inputPW = document.getElementById('password')  
let inputPWConfirm = document.getElementById('password_confirmation')

let emailInput = document.querySelectorAll('input[type="email"]')
// let regexEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
emailInput.forEach( el => {
  let errorMsgEmail = el.parentElement.querySelector('.error-message--email') || false
  el.onchange = function () {
    if (el.value) {
      if (!regexEmail.test(el.value)) {
        validate = false
        el.classList.add('wrap-field__input--error')
        if (errorMsgEmail) {
          errorMsgEmail.innerHTML = `Please input a valid e-mail address.`
          errorMsgEmail.classList.add('active')
        }
      } else {
        validate = true
        if (errorMsgEmail) 
          errorMsgEmail.classList.remove('active')
        el.classList.remove('wrap-field__input--error')
      }
    } else {
      validate = false
      if (errorMsgEmail) {
        errorMsgEmail.innerHTML = `This field can't be blank.`
        errorMsgEmail.classList.add('active')
      }
      el.classList.add('wrap-field__input--error')
    }
  }
  el.onkeydown = function (ev) {
    if(ev.keyCode == 32){
      ev.preventDefault();
    }
  }
})

function validateName() {
  if (inputFName.value) {
    if (!rexName.test(inputFName.value)) {
      errorFName.classList.add('active')
      errorFName.innerHTML = 'Name is incorrect'
      inputFName.classList.add('wrap-field__input--error')
    } else {
      errorFName.classList.remove('active')
      inputFName.classList.remove('wrap-field__input--error')
    }
  }
  
  if (inputLName.value) {
    if (!rexName.test(inputLName.value)) {
      errorLName.classList.add('active')
      errorLName.innerHTML = 'Name is incorrect'
      inputLName.classList.add('wrap-field__input--error')
    } else {
      errorLName.classList.remove('active')
      inputLName.classList.remove('wrap-field__input--error')
    }
  }
}

if (inputFName) {
  inputFName.onchange = function () {
    inputFName.value = inputFName.value.trim()
  }
}

if (inputLName) {
  inputLName.onchange = function () {
    inputLName.value = inputLName.value.trim()
  }
}

function checkPw() {
  if (inputPWConfirm.value) {
    if (inputPW.value != inputPWConfirm.value) {
      document.getElementById('message-error').classList.add('active')
      inputPWConfirm.classList.add('wrap-field__input--error')
    } else {
      document.getElementById('message-error').classList.remove('active')
      inputPWConfirm.classList.remove('wrap-field__input--error')
    }
  }
}
  
if (inputPW) {
  inputPW.onchange = function () {
    if (!regexPassword.test(inputPW.value)) {
      document.getElementById('errPW').classList.add('active')
      inputPW.classList.add('wrap-field__input--error')
    } else {
      inputPW.classList.remove('wrap-field__input--error')
      document.getElementById('errPW').classList.remove('active')
    }
  }
}

let checkForm = document.getElementById('check-form')
if (checkForm) {
  checkForm.onchange = function () {
    if (checkForm.checked) {
      document.querySelector('.error-message--checkbox').classList.remove('active')
    } else {
      document.querySelector('.error-message--checkbox').classList.add('active')
    }
  }
}

let errorForm = document.querySelectorAll('.form-error') || false
let inputPhone = document.getElementById('AddressPhoneNew')

let btnSubmit = document.getElementById('submit-btn') || false
if (btnSubmit) {
  btnSubmit.addEventListener('click', ev => {
    if (errorForm) {
      errorForm.forEach(el => {
        el.remove()
      })
    }

    if (document.getElementById('RegisterForm-birthday-date')) {
      let day = Number(document.getElementById('RegisterForm-birthday-date').value)
      let month = Number(document.getElementById('RegisterForm-birthday-month').value)
      let year = Number(document.getElementById('RegisterForm-birthday-year').value)
      let selectDate = new Date(Number(year) + 18, month - 1, day)
      let currentDate = new Date()
      function daysInMonth(month, year) {
        switch (month) {
          case 2 :
            return (year % 4 == 0 && year % 100) || year % 400 == 0 ? 29 : 28;
          case 8 : case 3 : case 5 : case 10 :
            return 30;
          default :
            return 31
        }
      }
  
      function isValidDate(day, month, year) {
        return month > 0 && month <= 12 && day > 0 && day <= daysInMonth(month, year);
      }
  
      if (isValidDate(day, month, year) == false) {
        document.getElementById('errDOB').classList.add('active')
        document.getElementById('RegisterForm-birthday-date').classList.add('wrap-field__input--error')
        document.getElementById('RegisterForm-birthday-month').classList.add('wrap-field__input--error')
        document.getElementById('RegisterForm-birthday-year').classList.add('wrap-field__input--error')
        ev.preventDefault()
      } else {
        document.getElementById('errDOB').classList.remove('active')
        document.getElementById('RegisterForm-birthday-date').classList.remove('wrap-field__input--error')
        document.getElementById('RegisterForm-birthday-month').classList.remove('wrap-field__input--error')
        document.getElementById('RegisterForm-birthday-year').classList.remove('wrap-field__input--error')
      }

      if (currentDate < selectDate) {
        ev.preventDefault()
        document.getElementById('errDOB').innerHTML = 'You must be of the legal drinking age in Singapore'
        document.getElementById('errDOB').classList.add('active')
        
        if (isValidDate(day, month, year) == false || year > new Date().getFullYear()) {
          document.getElementById('errDOB').innerHTML = 'Invalid date'
        }
      } 
    }

    if (inputFName) {
      if (!rexName.test(inputFName.value) || !rexName.test(inputLName.value)) {
        ev.preventDefault()
      }

      if (inputFName.value.length < 1) {
        inputFName.classList.add('wrap-field__input--error')
        errorFName.classList.add('active')
        errorFName.innerHTML = "This field can't be blank"
      }
      
      if (inputLName.value.length < 1) {
        inputLName.classList.add('wrap-field__input--error')
        errorLName.classList.add('active')
        errorLName.innerHTML = "This field can't be blank"
      }
    }
    
    if (inputPW) {
      if (!regexPassword.test(inputPW.value)) {
        ev.preventDefault()
      } 
      
      if (inputPW.value != inputPWConfirm.value) {
        ev.preventDefault()
      }
  
      if (inputPW.value.length < 1) {
        inputPW.classList.add('wrap-field__input--error')
        inputPW.nextElementSibling.classList.add('active')
      }
      
      if (inputPWConfirm.value.length < 1) {
        inputPWConfirm.classList.add('wrap-field__input--error')
        inputPWConfirm.nextElementSibling.classList.add('active')
      }
    }

    let inputMailRegister = document.getElementById('RegisterForm-email') || false
    if (inputMailRegister) {
      if (inputMailRegister.value.length < 1) {
        inputMailRegister.classList.add('wrap-field__input--error')
        inputMailRegister.nextElementSibling.classList.add('active')
      }
    }

    if (checkForm) {
      if (checkForm.checked == false) {
        validate = false
        checkForm.parentElement.querySelector('.error-message--checkbox').classList.add('active')
      } else {
        validate = true
      }
    }

    if (validate == false) {
      ev.preventDefault()
    }  
  })
}

let regexPhone = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

if (inputPhone) {
  inputPhone.addEventListener('keydown', hanldeEv)
}

function hanldeEv(event) {
  var selectionStart = this.selectionStart;
    if (selectionStart < 2) { 
      event.preventDefault();
      return false;
    } else if (selectionStart === 2 && event.keyCode === 8) {
      event.preventDefault();
      return false;
    }
}

document.querySelectorAll('.button-save').forEach(el => {
  let phone = el.parentElement.parentElement.querySelector('.input_phone')
  if (phone.value == '') {
    phone.value = '65'
  }

  let valueCheck = `${phone.value[0]}${phone.value[1]}`
  
  if (valueCheck == '65') {
    phone.addEventListener('keydown', hanldeEv)
  } else {
    phone.addEventListener('keyup', function () {
      if (phone.value == '') {
        phone.value = '65'
        phone.addEventListener('keydown', hanldeEv)
      }
    })
  }

  el.addEventListener('click', function (ev) {
    if (phone.value.length < 10 || !regexPhone.test(phone.value)) {
      ev.preventDefault()
      phone.classList.add('wrap-field__input--error')
      phone.parentElement.querySelector('.error-message--phone').classList.add('active')
    }
  })
})

// check number key
function isNumberKey(evt) {
  var charCode = (evt.which) ? evt.which : event.keyCode;
  if ((charCode < 48 || charCode > 57))
    return false;
  return true;
}