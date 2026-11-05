// Datos temporales en memoria SOLO para demostrar las rutas de la sesion 1.
// El equipo reemplazara este arreglo por consultas a PostgreSQL en la sesion 2.
const usuarios = [
  { id: 1, nombre: 'Usuario de ejemplo', correo: 'ejemplo@correo.com' }
];
let siguienteId = 2;

function listarUsuarios(req, res) {
  return res.status(200).json(usuarios);
}

function obtenerUsuario(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: 'El ID debe ser un entero positivo' });
  }
  const usuario = usuarios.find((item) => item.id === id);
  if (!usuario) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }
  return res.status(200).json(usuario);
}

function crearUsuario(req, res) {
  const { nombre, correo } = req.body || {};
  if (typeof nombre !== 'string' || !nombre.trim() ||
      typeof correo !== 'string' || !correo.trim()) {
    return res.status(400).json({ mensaje: 'Nombre y correo son obligatorios' });
  }
  const nuevoUsuario = {
    id: siguienteId++, nombre: nombre.trim(), correo: correo.trim()
  };
  usuarios.push(nuevoUsuario);
  return res.status(201).json(nuevoUsuario);
}

function pendienteBaseDatos(req, res) {
  return res.status(501).json({
    mensaje: 'Pendiente de implementacion de CRUD con PostgreSQL en sesion 2'
  });
}

module.exports = { listarUsuarios, obtenerUsuario, crearUsuario, pendienteBaseDatos };
