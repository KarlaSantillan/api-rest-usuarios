const express = require('express');
const usuariosRoutes = require('./routes/usuarios.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API REST de usuarios funcionando', sesion: 2 });
});

app.use('/usuarios', usuariosRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ mensaje: 'El JSON enviado no es válido' });
  }
  if (err.code === '23505') {
    return res.status(409).json({ mensaje: 'El correo ya está registrado' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ mensaje: 'La carrera indicada no existe' });
  }
  console.error('Error interno de la API:', err.code || err.name);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor disponible en http://localhost:${PORT}`);
  });
}

module.exports = app;
