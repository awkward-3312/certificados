const supabaseUrl = 'https://yzdjpwdoutjeuuvxmqmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGpwd2RvdXRqZXV1dnhtcW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MTg2NTMsImV4cCI6MjA2NTA5NDY1M30.WgC0o1VLVCMTi2cKiGC6OIPHrwgjTAav3DQ_k7JUGEg';

window.supa = supabase.createClient(supabaseUrl, supabaseKey);

window.ALLOWED_EMAILS = [
  'betza@platform.com',
  'ingrid@certificate.com',
  'asly@certificate.com',
  'karen@certificate.com'
  'jas@platform.com'
];
