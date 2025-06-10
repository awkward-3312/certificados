const ALLOWED_EMAILS = [
  'betza@certificate.com',
  'ingrid@certificate.com',
  'asly@certificate.com',
  'karen@certificate.com'
];

function isAuthorized(email) {
  return ALLOWED_EMAILS.includes((email || '').toLowerCase());
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorEl = document.getElementById('error');
  const loaderEl = document.getElementById('loader');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    loaderEl.classList.remove('hidden');
    errorEl.textContent = '';
    const { data, error } = await supa.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: passwordInput.value
    });
    loaderEl.classList.add('hidden');
    if (error || !data.session) {
      errorEl.textContent = 'Credenciales inválidas.';
      return;
    }
    if (!isAuthorized(data.user.email)) {
      await supa.auth.signOut();
      errorEl.textContent = 'Acceso no autorizado';
      return;
    }
    window.location.href = 'index.html';
  });
});
