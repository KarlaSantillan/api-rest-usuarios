const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');
const app = require('../src/app');
const pool = require('../src/config/db');

test('CRUD de usuarios con PostgreSQL real', { timeout: 30000 }, async (t) => {
  const correos = new Set();
  let carreraId;
  let server;
  let base;

  async function enviar(method, ruta, datos) {
    const response = await fetch(`${base}${ruta}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: datos === undefined ? undefined : JSON.stringify(datos)
    });
    return { status: response.status, headers: response.headers, body: await response.json() };
  }

  function usuario(extra = {}) {
    const correo = `prueba-${randomUUID()}@ejemplo.com`;
    correos.add(correo);
    return { nombre: 'Usuario de prueba', correo, ...extra };
  }

  async function crear(datos = usuario()) {
    const result = await enviar('POST', '/usuarios', datos);
    assert.equal(result.status, 201, JSON.stringify(result.body));
    return result;
  }

  try {
    const carrera = await pool.query(
      'INSERT INTO carreras (nombre) VALUES ($1) RETURNING id',
      [`Carrera de prueba ${randomUUID()}`]
    );
    carreraId = carrera.rows[0].id;
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    base = `http://127.0.0.1:${server.address().port}`;

    await t.test('registrar, listar, consultar, actualizar y eliminar con persistencia', async () => {
      const datos = usuario({ nombre: '  Gabriel de prueba  ', carrera_id: carreraId, semestre: 8 });
      const creado = await crear(datos);
      const id = creado.body.id;
      assert.equal(creado.headers.get('location'), `/usuarios/${id}`);
      assert.equal(creado.body.nombre, 'Gabriel de prueba');
      assert.equal(creado.body.carrera_id, carreraId);
      assert.equal(creado.body.semestre, 8);
      assert.ok(Number.isFinite(Date.parse(creado.body.fecha_registro)));

      const guardado = await pool.query('SELECT correo FROM usuarios WHERE id = $1', [id]);
      assert.equal(guardado.rows[0].correo, datos.correo);
      const lista = await enviar('GET', '/usuarios');
      assert.equal(lista.status, 200);
      assert.ok(lista.body.some((item) => item.id === id));
      const consultado = await enviar('GET', `/usuarios/${id}`);
      assert.equal(consultado.status, 200);
      assert.deepEqual(consultado.body, creado.body);

      const actualizado = await enviar('PUT', `/usuarios/${id}`, { ...datos, nombre: 'Gabriel actualizado', semestre: 9 });
      assert.equal(actualizado.status, 200);
      assert.equal(actualizado.body.nombre, 'Gabriel actualizado');
      assert.equal(actualizado.body.semestre, 9);
      assert.equal(actualizado.body.fecha_registro, creado.body.fecha_registro);
      const cambio = await pool.query('SELECT nombre, semestre FROM usuarios WHERE id = $1', [id]);
      assert.deepEqual(cambio.rows[0], { nombre: 'Gabriel actualizado', semestre: 9 });

      const eliminado = await enviar('DELETE', `/usuarios/${id}`);
      assert.equal(eliminado.status, 200);
      assert.equal(eliminado.body.id, id);
      assert.equal((await pool.query('SELECT id FROM usuarios WHERE id = $1', [id])).rowCount, 0);
      for (const metodo of ['GET', 'PUT', 'DELETE']) {
        const result = await enviar(metodo, `/usuarios/${id}`, metodo === 'PUT' ? datos : undefined);
        assert.equal(result.status, 404);
        assert.equal(result.body.mensaje, 'Usuario no encontrado');
      }
    });

    await t.test('registrar solo nombre y correo y reemplazar campos opcionales con PUT', async () => {
      const datos = usuario();
      const creado = await crear(datos);
      assert.equal(creado.body.carrera_id, null);
      assert.equal(creado.body.semestre, null);
      const completo = await enviar('PUT', `/usuarios/${creado.body.id}`, { ...datos, carrera_id: carreraId, semestre: 8 });
      assert.equal(completo.status, 200);
      const reemplazado = await enviar('PUT', `/usuarios/${creado.body.id}`, datos);
      assert.equal(reemplazado.status, 200);
      assert.equal(reemplazado.body.carrera_id, null);
      assert.equal(reemplazado.body.semestre, null);
    });

    await t.test('rechazar correos duplicados al registrar y actualizar sin modificar datos', async () => {
      const primero = await crear();
      const segundo = await crear();
      const duplicado = await enviar('POST', '/usuarios', { nombre: 'Duplicado', correo: primero.body.correo });
      assert.equal(duplicado.status, 409);
      assert.equal(duplicado.body.mensaje, 'El correo ya está registrado');
      const cambio = await enviar('PUT', `/usuarios/${segundo.body.id}`, { nombre: 'Duplicado', correo: primero.body.correo });
      assert.equal(cambio.status, 409);
      const guardado = await enviar('GET', `/usuarios/${segundo.body.id}`);
      assert.equal(guardado.body.correo, segundo.body.correo);
    });

    await t.test('validar campos, tipos, longitudes e identificadores antes de escribir', async () => {
      const existente = await crear();
      const validos = usuario();
      const invalidos = [
        {}, [], null, { correo: validos.correo }, { nombre: '   ', correo: validos.correo },
        { ...validos, correo: 'sin-formato' }, { ...validos, nombre: 'x'.repeat(101) },
        { ...validos, correo: `${'x'.repeat(145)}@ejemplo.com` },
        { ...validos, carrera_id: '1' }, { ...validos, carrera_id: -1 },
        { ...validos, semestre: 0 }, { ...validos, semestre: 1.5 },
        { ...validos, semestre: 2147483648 }
      ];
      for (const datos of invalidos) {
        assert.equal((await enviar('POST', '/usuarios', datos)).status, 400);
        assert.equal((await enviar('PUT', `/usuarios/${existente.body.id}`, datos)).status, 400);
      }
      for (const id of ['0', '-1', 'abc', '1.5', '1e2', '2147483648', '999999999999999999999']) {
        for (const metodo of ['GET', 'PUT', 'DELETE']) {
          assert.equal((await enviar(metodo, `/usuarios/${id}`, metodo === 'PUT' ? validos : undefined)).status, 400);
        }
      }
      assert.deepEqual((await enviar('GET', `/usuarios/${existente.body.id}`)).body, existente.body);
    });

    await t.test('rechazar una carrera inexistente y aceptar campos opcionales nulos', async () => {
      const temporal = await pool.query('INSERT INTO carreras (nombre) VALUES ($1) RETURNING id', [`Temporal ${randomUUID()}`]);
      const inexistente = temporal.rows[0].id;
      await pool.query('DELETE FROM carreras WHERE id = $1', [inexistente]);
      const datos = usuario({ carrera_id: inexistente });
      const respuesta = await enviar('POST', '/usuarios', datos);
      assert.equal(respuesta.status, 400);
      assert.equal(respuesta.body.mensaje, 'La carrera indicada no existe');
      const creado = await crear(usuario({ carrera_id: null, semestre: null }));
      const actualizado = await enviar('PUT', `/usuarios/${creado.body.id}`, datos);
      assert.equal(actualizado.status, 400);
      assert.equal((await enviar('GET', `/usuarios/${creado.body.id}`)).body.carrera_id, null);
    });

    await t.test('guardar texto con caracteres SQL como datos sin ejecutar instrucciones', async () => {
      const nombre = "Robert'); DROP TABLE usuarios; --";
      const creado = await crear(usuario({ nombre }));
      assert.equal(creado.body.nombre, nombre);
      const leido = await enviar('GET', `/usuarios/${creado.body.id}`);
      assert.equal(leido.body.nombre, nombre);
      assert.equal((await enviar('GET', '/usuarios')).status, 200);
    });

    await t.test('responder JSON para la ruta inicial, rutas inexistentes y JSON mal formado', async () => {
      assert.equal((await enviar('GET', '/')).body.sesion, 2);
      assert.equal((await enviar('GET', '/ruta-inexistente')).status, 404);
      const respuesta = await fetch(`${base}/usuarios`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{incorrecto'
      });
      assert.equal(respuesta.status, 400);
      assert.equal((await respuesta.json()).mensaje, 'El JSON enviado no es válido');
    });
  } finally {
    try {
      if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    } finally {
      try {
        await pool.query('DELETE FROM usuarios WHERE correo = ANY($1::text[])', [[...correos]]);
        if (carreraId) await pool.query('DELETE FROM carreras WHERE id = $1', [carreraId]);
      } finally {
        await pool.end();
      }
    }
  }
});
