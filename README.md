# Certificados

Plataforma web para la gestión de certificados regulatorios. Los archivos se encuentran en `src/`.

## Uso

Abra `src/index.html` en su navegador. Se conecta a Supabase utilizando la URL y clave pública proporcionada.

Necesita una tabla llamada `certificados` con los campos:

- `id` (UUID o entero)
- `lab_name`
- `address`
- `product_type`
- `pharmaceutical_form`
- `certificate_type`
- `issue_date` (date)
- `expiry_date` (date)

La aplicación permite agregar, editar y eliminar certificados, así como filtrar por los distintos campos.
