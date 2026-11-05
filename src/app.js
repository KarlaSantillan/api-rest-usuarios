const express = require('express');
const usuariosRoutes = require('./routes/usuarios.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Permite recibir datos en formato JSON.
app.use(express.json());

// Ruta inicial para confirmar que el servidor funciona.
app.get('/', (req, res) => {
  res.json({ mensaje: 'API REST de usuarios funcionando', sesion: 1 });
});

// Agrupa las rutas relacionadas con usuarios.
app.use('/usuarios', usuariosRoutes);

// Respuesta para rutas inexistentes.
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Manejo básico de errores, incluyendo JSON mal formado.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ mensaje: 'El JSON enviado no es válido' });
  }
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor disponible en http://localhost:${PORT}`);
  });
}

module.exports = app;
