INSERT INTO carreras (nombre)
VALUES
  ('Ingeniería de Software'),
  ('Administración de Empresas'),
  ('Diseño Gráfico')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO usuarios (nombre, correo, carrera_id, semestre)
SELECT 'Estudiante de ejemplo', 'estudiante@correo.com', id, 3
FROM carreras
WHERE nombre = 'Ingeniería de Software'
ON CONFLICT (correo) DO NOTHING;
