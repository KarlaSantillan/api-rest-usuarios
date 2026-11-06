const pool = require('./config/db');

async function probarConexion() {
  try {
    const datosConexion = await pool.query(
      'SELECT current_database() AS base_datos, current_user AS usuario'
    );
    const { base_datos, usuario } = datosConexion.rows[0];
    console.log(`Conexión establecida con la base de datos: ${base_datos}`);
    console.log(`Usuario de PostgreSQL: ${usuario}`);

    const usuarios = await pool.query(
      'SELECT id, nombre, correo FROM usuarios ORDER BY id LIMIT 5'
    );
    console.log(`Primeros usuarios encontrados: ${usuarios.rows.length}`);
    if (usuarios.rows.length > 0) {
      console.table(usuarios.rows);
    }
  } catch (error) {
    const codigo = error.code ? ` (código: ${error.code})` : '';
    console.error(`No se pudo comprobar la conexión o consultar usuarios${codigo}.`);
    console.error('Revisa la configuración de .env y que PostgreSQL esté disponible.');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

probarConexion();
