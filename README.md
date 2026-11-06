# Práctica 3 — API REST de usuarios (Sesión 1)

## Descripción
Proyecto base de API REST con Node.js y Express, preparado para integrar PostgreSQL y completar el CRUD en la siguiente sesión.

## Tecnologías
- Node.js
- Express
- JSON
- PostgreSQL (conexión preparada en sesión 2; integración CRUD pendiente)

## Requisitos
Tener Node.js y npm instalados.

## Instalación
```bash
npm install
npm run dev
```
Servidor: http://localhost:3000

## Endpoints
| Método | Ruta | Estado en sesión 1 |
|---|---|---|
| GET | / | Mensaje inicial |
| GET | /usuarios | Lista temporal de usuarios |
| GET | /usuarios/:id | Consulta temporal por ID |
| POST | /usuarios | Registro temporal de usuarios |
| PUT | /usuarios/:id | Preparado; devuelve 501 |
| DELETE | /usuarios/:id | Preparado; devuelve 501 |

Ejemplo para POST /usuarios:
```json
{"nombre":"Karla","correo":"karla@ejemplo.com"}
```

**Importante:** Los datos de la sesión 1 viven en memoria y se pierden al reiniciar el servidor. Las rutas aún no consultan la base de datos; el grupo debe integrar el CRUD en la sesión 2. La sesión 3 debe comprobar las operaciones con Postman.

## Estructura
- `src/app.js`: configuración del servidor y middleware.
- `src/routes/usuarios.routes.js`: definición de endpoints.
- `src/controllers/usuarios.controller.js`: funciones que responden a cada endpoint.

## Integración del equipo
En la sesión 2, reemplazar el almacenamiento temporal de `usuarios.controller.js` por consultas parametrizadas a PostgreSQL y completar los controladores PUT y DELETE. Conservar rutas y servidor para evitar conflictos.

## Sesión 2 – PostgreSQL

La conexión con PostgreSQL está preparada para que Gabriel integre el CRUD. Las rutas y los controladores actuales siguen utilizando el arreglo de usuarios en memoria.

1. Clonar el repositorio y entrar en la carpeta del proyecto:

   ```bash
   git clone https://github.com/KarlaSantillan/api-rest-usuarios.git
   cd api-rest-usuarios
   git switch sesion2-postgresql-wilmer
   ```

2. Instalar las dependencias de Node.js:

   ```bash
   npm install
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

   El script crea `usuarios` con `id SERIAL PRIMARY KEY`, `nombre VARCHAR(100) NOT NULL` y `correo VARCHAR(150) NOT NULL UNIQUE`. Se puede repetir sin borrar datos ni fallar por una tabla existente.

5. Opcionalmente, ejecutar `database/seed.sql` en la misma base desde **Query Tool** o desde la raíz del proyecto con:

   ```bash
   psql -U postgres -d api_rest_usuarios -f database/seed.sql
   ```

   Inserta a `Usuario de ejemplo` (`ejemplo@correo.com`) solo si ese correo aún no existe.

6. Copiar `.env.example` como `.env` en la raíz del proyecto. Reemplazar `CAMBIAR_CONTRASENA` por la contraseña local de PostgreSQL y ajustar `DB_HOST`, `DB_PORT`, `DB_USER` y `DB_NAME` según la instalación. `.env` está excluido de Git y no debe subirse.

7. Comprobar la conexión desde la raíz:

   ```bash
   node src/test-db.js
   ```

   La prueba muestra la base de datos, el usuario de PostgreSQL y hasta cinco registros de `usuarios`. Si se omitió el paso 5, es normal que no aparezcan registros. El Pool se cierra al terminar.

El servidor se inicia con `npm run dev` como en la sesión 1. La prueba de conexión es independiente del servidor y no modifica los datos.
