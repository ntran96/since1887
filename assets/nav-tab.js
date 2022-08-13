function openContent(ev, name, param, paramValue) {
  var i, contentNav, btnLinks, textSelected;
  contentNav = document.getElementsByClassName("page__nav__content");
  btnLinks = document.getElementsByClassName("page__nav__top__link");
  for (i = 0; i < btnLinks.length; i++) {
    btnLinks[i].className = btnLinks[i].className.replace(" active", "");
  }
  textSelected = ev.currentTarget.textContent;

  ev.currentTarget.classList.toggle('active');
  ev.currentTarget.parentElement.classList.remove('show');
  if (ev.currentTarget.parentElement.previousElementSibling) {
    ev.currentTarget.parentElement.previousElementSibling.querySelector('.account__nav__selected__text').textContent = textSelected;
  }

  // remove error message 
  let errorMessage = document.querySelectorAll('.form-error') || false
  if (errorMessage) {
    errorMessage.forEach(el => {
      el.remove()
    })
  }

  //add param to url
  const params = new URLSearchParams();
  params.set(param, paramValue);
  window.history.replaceState({}, "", decodeURIComponent(`${window.location.pathname}?${params}`));

  if (objParamTab.page) {
    window.location.reload()
  } else {
    for (i = 0; i < contentNav.length; i++) {
      contentNav[i].classList.remove('active');
    }
    document.getElementById(name).classList.add('active');
  }
}

function handleDropdownMobi(event) {
  var dropdownList;
  dropdownList = document.getElementsByClassName("account__nav__list");
  event.currentTarget.nextElementSibling.classList.toggle('show');
};

let urlString = window.location.search.substring(1);
let paramURL = urlString.split('&');
var objParamTab = {};
paramURL.forEach(function(property) {
  var tup = property.split('=');
  objParamTab[tup[0]] = tup[1];
});

// Check param Url active
if (objParamTab.tab == 'myProfile') {
  document.getElementById('btnMyProfile').classList.add('active');
  document.getElementById('myProfile').classList.add('active');
  document.getElementById('btnAddressBook').classList.remove('active');
  document.getElementById('addressBook').classList.remove('active');
  document.getElementById('btnMyOrder').classList.remove('active');
  document.getElementById('myOrder').classList.remove('active');
} else if (objParamTab.tab == 'addressBook') {
  document.getElementById('btnAddressBook').classList.add('active');
  document.getElementById('addressBook').classList.add('active');
  document.getElementById('btnMyProfile').classList.remove('active');
  document.getElementById('myProfile').classList.remove('active');
  document.getElementById('btnMyOrder').classList.remove('active');
  document.getElementById('myOrder').classList.remove('active');
} else if (objParamTab.tab == 'myOrder') {
  document.getElementById('btnMyOrder').classList.add('active');
  document.getElementById('myOrder').classList.add('active');
  document.getElementById('btnAddressBook').classList.remove('active');
  document.getElementById('addressBook').classList.remove('active');
  document.getElementById('btnMyProfile').classList.remove('active');
  document.getElementById('myProfile').classList.remove('active');
} else if (objParamTab.tab == 'register') {
  document.getElementById('register').classList.add('active');
  document.querySelector('.page__nav__top__link--register').classList.add('active');
  document.getElementById('loginForm').classList.remove('active');
  document.querySelector('.page__nav__top__link--login').classList.remove('active');
} else if (objParamTab.tab == 'loginForm') {
  document.getElementById('loginForm').classList.add('active');
  document.querySelector('.page__nav__top__link--login').classList.add('active');
  document.getElementById('register').classList.remove('active');
  document.querySelector('.page__nav__top__link--register').classList.remove('active');
}