if(document.querySelector('.modal-section')) {

  function closeModal(e) {
    document.body.classList.remove('overflow-hidden');
    e.target.closest('.modal-section').removeAttribute('open');
  }
}