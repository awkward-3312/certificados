document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  const themeToggle = document.getElementById('themeToggle');
  const errorEl = document.getElementById('error');
  const loaderEl = document.getElementById('loader');

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    const icon = themeToggle?.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    }
  }

  const isAuthorized = (email) => {
    return (window.ALLOWED_EMAILS || []).includes((email || '').toLowerCase());
  };

  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      const icon = togglePassword.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
      }
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
      }
      localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
  }

  // Redirige al dashboard si ya hay sesión activa y autorizada
  supa.auth.getSession().then(({ data }) => {
    const session = data.session;
    if (session && isAuthorized(session.user.email)) {
      window.location.href = 'index.html';
    }
  });

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
      const { data, error } = await supa.auth.signInWithPassword({
        email,
        password
      });

      loaderEl.classList.add('hidden');

      if (error || !data.session) {
        errorEl.textContent = 'Credenciales inválidas.';
        return;
      }

      if (!isAuthorized(data.user.email)) {
        await supa.auth.signOut();
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
