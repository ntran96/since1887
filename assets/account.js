// CALL API
fetch(`https://wgs-services.azurewebsites.net/Customer/api/customers/GetProfile?idCustomer=${window.customerID}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    'Authorization': 'Basic YWRtaW46YWRtaW4xMjM='
  }
})
.then(response => response.json()) 
.then(json => {
  let dateOfBirth = json.dateOfBirth.split('-')

  // change number month to text
  function monthName(mon) {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mon - 1];
  }

  let date = Number(dateOfBirth[1])
  let month = Number(dateOfBirth[0])
  let year = Number(dateOfBirth[2])

  let dateOfBirthText = document.getElementById('dateOfBirth') || false
  if (dateOfBirthText) {
    dateOfBirthText.innerHTML = `${date} ${monthName(month)} ${year}`
  }

  let dateOfBirthField = document.getElementById('edit-DOB') || false
  if (dateOfBirthField) {
    dateOfBirthField.value = `${year}-${month < 10 ? '0' + month : month}-${date < 10 ? '0' + date : date}`;
  }
})
.catch(err => {
  console.log('error: ', err);
});

let dateOfBirthField = document.getElementById('edit-DOB') || false
if (dateOfBirthField) {
  dateOfBirthField.onchange = function () {
    document.getElementById('errDOB').classList.remove('active')
    dateOfBirthField.classList.remove('wrap-field__input--error')
  }
}

let btnUpdateProfile = document.getElementById('updateProfile') || false
if (btnUpdateProfile) {
  btnUpdateProfile.addEventListener('click', function () {
    let fieldDOB = document.getElementById('edit-DOB')
    var datePicker = fieldDOB.value
    let DOB = datePicker.split('-')
    let date = Number(DOB[2])
    let month = Number(DOB[1])
    let year = Number(DOB[0])
    let selectDate = new Date(Number(year) + 18, month - 1, date)
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

    function isValidDate(date, month, year) {
      return month > 0 && month <= 12 && date > 0 && date <= daysInMonth(month, year);
    }
    
    // show error text
    let errorDOB = document.getElementById('errDOB')

    if (currentDate < selectDate) {
      errorDOB.innerHTML = 'You must be of the legal drinking age in Singapore'
      errorDOB.classList.add('active')
      document.getElementById('edit-DOB').classList.add('wrap-field__input--error')
    } 

    if (inputFName.value.length < 1) {
      inputFName.nextElementSibling.classList.add('active')
      inputFName.classList.add('wrap-field__input--error')
    }

    if (inputLName.value.length < 1) {
      inputLName.nextElementSibling.classList.add('active')
      inputLName.classList.add('wrap-field__input--error')
    }

    if (datePicker < fieldDOB.getAttribute('min')) {
      fieldDOB.classList.add('wrap-field__input--error')
      errorDOB.innerHTML = 'Minimum date of birth 01/01/1900'
      errorDOB.classList.add('active')
    } 

    if (isValidDate(date, month, year) == false) {
      errorDOB.innerHTML = 'Invalid Date'
      errorDOB.classList.add('active')
      fieldDOB.classList.add('wrap-field__input--error')
    }

    // call API updateProfile
    if (currentDate >= selectDate && 
      rexName.test(inputFName.value) && 
      rexName.test(inputLName.value) && 
      inputFName.value.length > 1 && 
      inputLName.value.length > 1 && 
      datePicker >= fieldDOB.getAttribute('min')) {
      fetch(`https://wgs-services.azurewebsites.net/Customer/api/customers/UpdateProfile`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With':'xmlhttprequest',
          'Authorization': 'Basic YWRtaW46YWRtaW4xMjM='
        },
        body: JSON.stringify({
          id: window.customerID,
          firstName: document.getElementById('FirstName').value,
          lastName: document.getElementById('LastName').value,
          dateOfBirth: `${month}/${date}/${year}`
        })
      }).then((response) => {
        return response.json();
      }).then(res => {
        window.location.href ='/account';
      })
    }

  })
}

let btnCancelUpdate = document.getElementById('cancelUpdate') || false
if (btnCancelUpdate) {
  btnCancelUpdate.addEventListener('click', function () {
    document.getElementById('btnEdit').setAttribute('aria-expanded', 'false')
  })
}

// set max date input
document.getElementById('edit-DOB').max = new Date().toISOString().split("T")[0];