document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
// script.js (vacío por ahora, solo dejo smooth scroll si lo necesitas)
document.addEventListener('DOMContentLoaded', ()=> {
  // ejemplo: si quieres que al hacer click en logo vuelva arriba
  const logo = document.querySelector('.logo-leaf');
  if (logo) logo.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
});
