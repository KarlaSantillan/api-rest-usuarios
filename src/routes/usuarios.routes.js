const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

router.get('/', usuariosController.listarUsuarios);
router.get('/:id', usuariosController.obtenerUsuario);
router.post('/', usuariosController.crearUsuario);
router.put('/:id', usuariosController.actualizarUsuario);
router.delete('/:id', usuariosController.pendienteBaseDatos);

module.exports = router;
