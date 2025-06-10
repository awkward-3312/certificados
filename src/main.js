import { createApp, ref, computed, onMounted } from 'vue';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const SUPABASE_URL = 'https://yzdjpwdoutjeuuvxmqmv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGpwd2RvdXRqZXV1dnhtcW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MTg2NTMsImV4cCI6MjA2NTA5NDY1M30.WgC0o1VLVCMTi2cKiGC6OIPHrwgjTAav3DQ_k7JUGEg';
const supa = createClient(SUPABASE_URL, SUPABASE_KEY);

const ALLOWED_EMAILS = [
  'betza@certificate.com',
  'ingrid@certificate.com',
  'asly@certificate.com',
  'karen@certificate.com'
];

function isAuthorized(email) {
  return ALLOWED_EMAILS.includes((email || '').toLowerCase());
}

async function getSession() {
  const { data } = await supa.auth.getSession();
  return data.session;
}

function formatDate(str) {
  const d = new Date(str);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

function rowClass(row) {
  const hoy = new Date();
  const limite = 30 * 24 * 60 * 60 * 1000;
  const vto = row.fecha_vencimiento ? new Date(row.fecha_vencimiento) : null;
  if (!vto) return '';
  const diff = vto - hoy;
  if (diff < 0) return 'expirado';
  if (diff <= limite) return 'por-vencer';
  return 'valido';
}

const loginApp = {
  setup() {
    const correo = ref('');
    const clave = ref('');
    const error = ref('');
    const loader = ref(false);

    const submit = async () => {
      loader.value = true;
      error.value = '';
      const { data, error: err } = await supa.auth.signInWithPassword({
        email: correo.value.trim(),
        password: clave.value
      });
      loader.value = false;
      if (err || !data.session) {
        error.value = 'Credenciales inválidas.';
        return;
      }
      if (!isAuthorized(data.user.email)) {
        alert('Acceso no autorizado');
        await supa.auth.signOut();
        window.location.href = 'certificados-login.html';
        return;
      }
      window.location.href = 'index.html';
    };

    return { correo, clave, error, loader, submit };
  }
};

const dashboardApp = {
  setup() {
    const certificados = ref([]);
    const search = ref('');
    const filterPais = ref('');
    const filterTipoProducto = ref('');
    const filterTipoCertificado = ref('');
    const loading = ref(false);
    const error = ref('');

    const paises = computed(() => [...new Set(certificados.value.map(r => r.pais).filter(Boolean))]);
    const productos = computed(() => [...new Set(certificados.value.map(r => r.tipo_producto).filter(Boolean))]);
    const certificadosTipo = computed(() => [...new Set(certificados.value.map(r => r.tipo_certificado).filter(Boolean))]);

    const filtrados = computed(() => {
      return certificados.value.filter(row => {
        const texto = `${row.laboratorio || ''} ${row.pais || ''} ${row.tipo_producto || ''} ${row.forma_farmaceutica || ''} ${row.tipo_certificado || ''}`.toLowerCase();
        const matchSearch = !search.value || texto.includes(search.value.toLowerCase());
        const matchPais = !filterPais.value || row.pais === filterPais.value;
        const matchProd = !filterTipoProducto.value || row.tipo_producto === filterTipoProducto.value;
        const matchCert = !filterTipoCertificado.value || row.tipo_certificado === filterTipoCertificado.value;
        return matchSearch && matchPais && matchProd && matchCert;
      });
    });

    const verPdf = (url) => {
      window.open(url, '_blank');
    };

    const loadCertificados = async () => {
      loading.value = true;
      error.value = '';
      const { data, error: err } = await supa
        .from('dataBase')
        .select('*')
        .order('fecha_emision', { ascending: false });
      loading.value = false;
      if (err) {
        error.value = 'Error al cargar los certificados.';
        console.error(err);
      } else {
        certificados.value = data || [];
      }
    };

    const logout = async () => {
      await supa.auth.signOut();
      window.location.href = 'certificados-login.html';
    };

    onMounted(async () => {
      const session = await getSession();
      if (!session) {
        window.location.href = 'certificados-login.html';
        return;
      }
      if (!isAuthorized(session.user.email)) {
        alert('Acceso no autorizado');
        await supa.auth.signOut();
        window.location.href = 'certificados-login.html';
        return;
      }
      await loadCertificados();
    });

    return {
      certificados,
      search,
      filterPais,
      filterTipoProducto,
      filterTipoCertificado,
      paises,
      productos,
      certificados: certificadosTipo,
      filtrados,
      verPdf,
      rowClass,
      formatDate,
      loading,
      error,
      logout
    };
  }
};

 document.addEventListener('DOMContentLoaded', () => {
   const path = window.location.pathname;
   if (path.includes('certificados-login.html')) {
     createApp(loginApp).mount('#app');
   } else {
     createApp(dashboardApp).mount('#app');
   }
 });
