const month = new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric' }).format(new Date());
document.querySelector('#today').textContent = month;
document.querySelector('#year').textContent = new Date().getFullYear();
const button = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
button.addEventListener('click', () => { const isOpen = nav.classList.toggle('open'); button.setAttribute('aria-expanded', isOpen); });
document.querySelector('.subscribe-form').addEventListener('submit', (event) => { event.preventDefault(); event.currentTarget.querySelector('.form-message').textContent = 'شكرًا! ستصلك الرسالة القادمة بإذن الله.'; event.currentTarget.reset(); });
