# Práctica 3 — API REST de usuarios con PostgreSQL

## Descripción
API REST con Node.js y Express para registrar, consultar, actualizar y eliminar usuarios en PostgreSQL. Los datos permanecen guardados al reiniciar el servidor. En este proyecto los usuarios representan estudiantes, que pueden estar asociados a una carrera.

## Tecnologías
- Node.js
- Express
- JSON
- PostgreSQL y el controlador `pg`
- dotenv para la configuración local

## Requisitos
Tener Node.js 22 o posterior, npm y PostgreSQL instalados. Preparar la base de datos y el archivo `.env` siguiendo los pasos de la sección PostgreSQL antes de iniciar la aplicación.

## Instalación
```bash
npm ci
npm run test:db
npm run dev
```
Servidor: http://localhost:3000

## Endpoints
| Método | Ruta | Funcionalidad |
|---|---|---|
| GET | / | Mensaje inicial de la API |
| GET | /usuarios | Consultar todos los usuarios, ordenados por ID |
| GET | /usuarios/:id | Consultar un usuario por ID |
| POST | /usuarios | Registrar un usuario en PostgreSQL |
| PUT | /usuarios/:id | Reemplazar los datos de un usuario |
| DELETE | /usuarios/:id | Eliminar un usuario de PostgreSQL |

Ejemplo para POST /usuarios:
```json
{"nombre":"Karla","correo":"karla@ejemplo.com"}
```

Enviar las solicitudes POST y PUT con `Content-Type: application/json`. `nombre` y `correo` son obligatorios en ambas operaciones. El nombre admite hasta 100 caracteres, el correo hasta 150 y debe tener un formato válido. Se eliminan los espacios al inicio y al final de ambos campos.

`carrera_id` y `semestre` son opcionales y admiten `null`; si se envían, deben ser números enteros positivos dentro del rango de PostgreSQL INTEGER. La carrera indicada debe existir en `carreras`. En PUT, los campos opcionales omitidos quedan en `null`. `id` y `fecha_registro` son generados por la base de datos y no se modifican desde el cuerpo de la solicitud.

Ejemplo con los campos opcionales para POST o PUT (reemplazar `carrera_id` por un ID existente):

```json
{
  "nombre": "Gabriel",
  "correo": "gabriel@ejemplo.com",
  "carrera_id": 1,
  "semestre": 8
}
```

Las consultas y los registros devuelven `id`, `nombre`, `correo`, `carrera_id`, `semestre` y `fecha_registro`. POST devuelve además la cabecera `Location: /usuarios/<id>`. DELETE devuelve un mensaje de confirmación y el ID eliminado.

| Código HTTP | Situación |
|---|---|
| 200 | Consulta, actualización o eliminación correcta |
| 201 | Usuario registrado |
| 400 | Datos inválidos, JSON mal formado, ID inválido o carrera inexistente |
| 404 | Usuario o ruta inexistente |
| 409 | Correo ya registrado, tanto en POST como en PUT |
| 500 | Error interno del servidor |

Los errores se devuelven como `{"mensaje":"Descripción del error"}`. Las consultas SQL usan parámetros para separar los datos recibidos de las instrucciones SQL. La sesión 3 debe comprobar las operaciones con Postman.

## Estructura
- `src/app.js`: configuración del servidor y middleware.
- `src/routes/usuarios.routes.js`: definición de endpoints.
- `src/controllers/usuarios.controller.js`: funciones que responden a cada endpoint.
- `src/config/db.js`: conexión a PostgreSQL mediante un Pool.
- `database/schema.sql` y `database/seed.sql`: tablas y datos de ejemplo.
- `tests/usuarios.integration.test.js`: pruebas HTTP con PostgreSQL real.

## Integración del equipo
La sesión 1 preparó Express, las rutas y los controladores iniciales. Wilmer preparó la conexión y el esquema PostgreSQL en la sesión 2. Gabriel integró las cinco operaciones CRUD con consultas parametrizadas, validaciones y respuestas HTTP. Las rutas originales se conservan para las pruebas de la sesión 3.

## Sesión 2 – PostgreSQL

La API utiliza la conexión configurada en `src/config/db.js` para todas las operaciones de usuarios. La configuración se carga desde `.env`; este archivo está excluido de Git.

En la base de datos, `usuarios` representa a los estudiantes. Cada estudiante puede pertenecer a una carrera mediante `carrera_id`; una carrera puede tener muchos estudiantes (relación **1:N**). `carrera_id` y `semestre` son opcionales, por lo que un estudiante puede registrarse solo con `nombre` y `correo`. `fecha_registro` se completa automáticamente.

1. Clonar el repositorio y entrar en la carpeta del proyecto:

   ```bash
   git clone https://github.com/KarlaSantillan/api-rest-usuarios.git
   cd api-rest-usuarios
   git switch sesion2-crud-gabriel
   ```

2. Instalar las dependencias de Node.js:

   ```bash
   npm ci
   ```

3. Crear la base de datos `api_rest_usuarios` en PostgreSQL. En pgAdmin 4: **Databases → Create → Database**, escribir el nombre y guardar. También se puede usar `psql`:

   ```bash
   psql -U postgres -d postgres -c "CREATE DATABASE api_rest_usuarios;"
   ```

   Si ya existe, omitir este paso.

4. Ejecutar `database/schema.sql` **dentro de `api_rest_usuarios`**. En pgAdmin 4: seleccionar la base, abrir **Query Tool**, cargar el archivo SQL y ejecutarlo. Con `psql`, desde la raíz del proyecto:

   ```bash
   psql -U postgres -d api_rest_usuarios -f database/schema.sql
   ```

   El script crea `carreras` (`id` y `nombre` único) y `usuarios` (`id`, `nombre`, `correo` único, `carrera_id` como clave foránea opcional, `semestre` opcional y `fecha_registro`). Si `usuarios` ya existe con el modelo anterior, añade las columnas faltantes sin borrar registros; estos reciben como `fecha_registro` la fecha de la migración. Puede repetirse sin fallar por tablas, columnas o la clave foránea existentes.

5. Opcionalmente, ejecutar `database/seed.sql` en la misma base desde **Query Tool** o desde la raíz del proyecto con:

   ```bash
   psql -U postgres -d api_rest_usuarios -f database/seed.sql
   ```

   Inserta tres carreras ficticias y a `Estudiante de ejemplo` (`estudiante@correo.com`) en Ingeniería de Software, semestre 3. Si ya existen los nombres de las carreras o el correo del estudiante, no los duplica. Si existe el registro anterior `ejemplo@correo.com`, se conserva.

6. Copiar `.env.example` como `.env` en la raíz del proyecto. Reemplazar `CAMBIAR_CONTRASENA` por la contraseña local de PostgreSQL y ajustar `DB_HOST`, `DB_PORT`, `DB_USER` y `DB_NAME` según la instalación. `.env` está excluido de Git y no debe subirse.

7. Comprobar la conexión desde la raíz:

   ```bash
   node src/test-db.js
   ```

   La prueba muestra la base de datos, el usuario de PostgreSQL y hasta cinco registros de `usuarios`. Si se omitió el paso 5, es normal que no aparezcan registros. El Pool se cierra al terminar.

El servidor se inicia con `npm run dev` como en la sesión 1. La prueba de conexión es independiente del servidor y no modifica los datos.

## Pruebas de integración

Con la base de datos, el esquema y `.env` preparados, ejecutar:

```bash
npm run test:integration
```

Las pruebas inician su propia API en un puerto libre y verifican el ciclo CRUD completo, la persistencia en PostgreSQL, los correos duplicados, la carrera inexistente y los datos inválidos. También comprueban el manejo de JSON mal formado y que un texto con caracteres SQL se guarde como dato. No es necesario detener el servidor del puerto 3000.

Cada ejecución crea usuarios y carreras de prueba propios y los elimina al finalizar; los registros anteriores se conservan. Se requiere permiso para insertar y eliminar en ambas tablas. Las secuencias de ID pueden avanzar durante estas pruebas.

Para comprobar manualmente desde Postman, usar `http://localhost:3000`, registrar un usuario y usar el ID devuelto en las operaciones GET por ID, PUT y DELETE. Verificar también los errores 400, 404 y 409 de la tabla anterior.
