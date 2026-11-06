const pool = require('../config/db');

const CAMPOS = 'id, nombre, correo, carrera_id, semestre, fecha_registro';
const MAX_ENTERO = 2147483647;

function esEnteroPositivo(valor) {
  return Number.isInteger(valor) && valor > 0 && valor <= MAX_ENTERO;
}

function leerId(req, res) {
  const texto = req.params.id;
  const id = Number(texto);
  if (!/^[1-9]\d*$/.test(texto) || !esEnteroPositivo(id)) {
    res.status(400).json({ mensaje: 'El ID debe ser un entero positivo válido' });
    return null;
  }
  return id;
}

function validarUsuario(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Se debe enviar un objeto JSON con los datos del usuario' };
  }
  if (typeof body.nombre !== 'string' || !body.nombre.trim() ||
      typeof body.correo !== 'string' || !body.correo.trim()) {
    return { error: 'Nombre y correo son obligatorios' };
  }

  const nombre = body.nombre.trim();
  const correo = body.correo.trim();
  if (nombre.length > 100 || correo.length > 150) {
    return { error: 'Nombre admite hasta 100 caracteres y correo hasta 150' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return { error: 'El correo no tiene un formato válido' };
  }

  const carrera_id = body.carrera_id ?? null;
  const semestre = body.semestre ?? null;
  if (carrera_id !== null && !esEnteroPositivo(carrera_id)) {
    return { error: 'carrera_id debe ser un entero positivo o null' };
  }
  if (semestre !== null && !esEnteroPositivo(semestre)) {
    return { error: 'semestre debe ser un entero positivo o null' };
  }
  return { datos: [nombre, correo, carrera_id, semestre] };
}

async function listarUsuarios(req, res) {
  const resultado = await pool.query(`SELECT ${CAMPOS} FROM usuarios ORDER BY id`);
  return res.status(200).json(resultado.rows);
}

async function obtenerUsuario(req, res) {
  const id = leerId(req, res);
  if (id === null) return;

  const resultado = await pool.query(`SELECT ${CAMPOS} FROM usuarios WHERE id = $1`, [id]);
  if (!resultado.rowCount) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }
  return res.status(200).json(resultado.rows[0]);
}

async function crearUsuario(req, res) {
  const { error, datos } = validarUsuario(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  const resultado = await pool.query(
    `INSERT INTO usuarios (nombre, correo, carrera_id, semestre)
     VALUES ($1, $2, $3, $4) RETURNING ${CAMPOS}`,
    datos
  );
  const usuario = resultado.rows[0];
  return res.location(`/usuarios/${usuario.id}`).status(201).json(usuario);
}

async function actualizarUsuario(req, res) {
  const id = leerId(req, res);
  if (id === null) return;
  const { error, datos } = validarUsuario(req.body);
  if (error) return res.status(400).json({ mensaje: error });

  const resultado = await pool.query(
    `UPDATE usuarios SET nombre = $1, correo = $2, carrera_id = $3, semestre = $4
     WHERE id = $5 RETURNING ${CAMPOS}`,
    [...datos, id]
  );
  if (!resultado.rowCount) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }
  return res.status(200).json(resultado.rows[0]);
}

function pendienteBaseDatos(req, res) {
  return res.status(501).json({
    mensaje: 'Pendiente de implementacion de CRUD con PostgreSQL en sesion 2'
  });
}

module.exports = { listarUsuarios, obtenerUsuario, crearUsuario, actualizarUsuario, pendienteBaseDatos };
