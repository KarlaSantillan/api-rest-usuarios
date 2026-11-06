INSERT INTO usuarios (nombre, correo)
VALUES ('Usuario de ejemplo', 'ejemplo@correo.com')
ON CONFLICT (correo) DO NOTHING;
