create table if not exists certificados (
  id uuid primary key default gen_random_uuid(),
  laboratorio text,
  direccion text,
  pais text,
  tipo_producto text,
  forma_farmaceutica text,
  tipo_certificado text,
  fecha_emision date,
  fecha_vencimiento date,
  archivo_pdf text,
  activo boolean default true,
  fecha_agregado timestamp with time zone default now()
);
