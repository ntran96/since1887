function openDropDown() {
  let dropdown = document.querySelector('.dropdown-menu');
  dropdown.classList.toggle('show');
}

let header = document.querySelector('#shopify-section-header .header') || false
let topHeader = document.querySelector('#shopify-section-header .top-header') || false
if (header) {
  if (topHeader) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 0) {
        this.document.body.classList.add('sticky-header')
      } else {
        this.document.body.classList.remove('sticky-header')
      }
    })
  } else {
    this.document.body.classList.add('sticky-header')
  }
}

let detailMenu = document.getElementById('Details-menu-drawer-container') || false
if (detailMenu != false) {
  document.addEventListener('click', function (event) {
    if (!detailMenu.contains(event.target)) {
      detailMenu.classList.remove('menu-opening')
      detailMenu.removeAttribute('open')
      detailMenu.firstElementChild.setAttribute('aria-expanded', false);
      document.querySelector('.header--has-menu').classList.remove('header--menu-open')
    }
  })
}