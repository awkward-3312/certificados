document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorEl = document.getElementById('error');
  const loaderEl = document.getElementById('loader');

  const isAuthorized = (email) => {
    return (window.ALLOWED_EMAILS || []).includes((email || '').toLowerCase());
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    loaderEl.classList.remove('hidden');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      loaderEl.classList.add('hidden');
      errorEl.textContent = 'Por favor, completa todos los campos.';
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      loaderEl.classList.add('hidden');

      if (error || !data.session) {
        errorEl.textContent = 'Credenciales inválidas.';
        return;
      }

      if (!isAuthorized(data.user.email)) {
        await supabase.auth.signOut();
        errorEl.textContent = 'Acceso no autorizado.';
        return;
      }

      window.location.href = 'index.html';
    } catch (err) {
      loaderEl.classList.add('hidden');
      console.error(err);
      errorEl.textContent = 'Ocurrió un error. Intenta nuevamente.';
    }
  });
});
