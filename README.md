# Práctica 3 — API REST de usuarios (Sesión 1)

## Descripción
Proyecto base de API REST con Node.js y Express, preparado para integrar PostgreSQL y completar el CRUD en la siguiente sesión.

## Tecnologías
- Node.js
- Express
- JSON
- PostgreSQL (pendiente de integración en sesión 2)

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

**Importante:** Los datos de la sesión 1 viven en memoria y se pierden al reiniciar el servidor. No se ha conectado ninguna base de datos; el grupo debe hacerlo en la sesión 2. La sesión 3 debe comprobar las operaciones con Postman.

## Estructura
- `src/app.js`: configuración del servidor y middleware.
- `src/routes/usuarios.routes.js`: definición de endpoints.
- `src/controllers/usuarios.controller.js`: funciones que responden a cada endpoint.

## Integración del equipo
En la sesión 2, reemplazar el almacenamiento temporal de `usuarios.controller.js` por consultas parametrizadas a PostgreSQL y completar los controladores PUT y DELETE. Conservar rutas y servidor para evitar conflictos.
