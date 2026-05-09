import 'dotenv/config';
import bcrypt from 'bcrypt';
import sequelize from './connection';

// ─── Helpers ─────────────────────────────────────────────────
const SALT_ROUNDS = 10;
const ahora = new Date();
const enDias = (n: number) => new Date(ahora.getTime() + n * 86_400_000);
const haceDias = (n: number) => new Date(ahora.getTime() - n * 86_400_000);

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos...\n');

    const q = (sql: string, replacements: unknown[] = []) =>
      sequelize.query(sql, { replacements });

    // ─── Limpiar tablas en orden correcto ─────────────────────
    await q('SET FOREIGN_KEY_CHECKS = 0');
    await q('TRUNCATE TABLE `prestamos`');
    await q('TRUNCATE TABLE `libros`');
    await q('TRUNCATE TABLE `usuarios`');
    await q('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Tablas limpiadas.');

    // ─── Usuarios ─────────────────────────────────────────────
    // Credenciales de prueba:
    //   admin@biblioteca.com  /  Admin123!
    //   ana@correo.com        /  Usuario123!
    //   carlos@correo.com     /  Usuario123!
    //   maria@correo.com      /  Usuario123!
    const passAdmin    = await bcrypt.hash('Admin123!', SALT_ROUNDS);
    const passUsuario  = await bcrypt.hash('Usuario123!', SALT_ROUNDS);

    await q(
      `INSERT INTO usuarios (nombre, correo, password, rol) VALUES
       (?, ?, ?, 'admin'),
       (?, ?, ?, 'usuario'),
       (?, ?, ?, 'usuario'),
       (?, ?, ?, 'usuario')`,
      [
        'Administrador', 'admin@biblioteca.com', passAdmin,
        'Ana González',  'ana@correo.com',       passUsuario,
        'Carlos Ramos',  'carlos@correo.com',    passUsuario,
        'María López',   'maria@correo.com',     passUsuario,
      ]
    );
    console.log('Usuarios insertados.');

    // ─── Libros ───────────────────────────────────────────────
    await q(
      `INSERT INTO libros
         (titulo, autor, categoria, isbn, descripcion, anio_publicacion, cantidad_total, cantidad_disponible)
       VALUES
         (?, ?, ?, ?, ?, ?, ?, ?),
         (?, ?, ?, ?, ?, ?, ?, ?),
         (?, ?, ?, ?, ?, ?, ?, ?),
         (?, ?, ?, ?, ?, ?, ?, ?),
         (?, ?, ?, ?, ?, ?, ?, ?),
         (?, ?, ?, ?, ?, ?, ?, ?),
         (?, ?, ?, ?, ?, ?, ?, ?),
         (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Cien años de soledad',    'Gabriel García Márquez', 'Novela',   '978-0-06-088328-7', 'Obra cumbre del realismo mágico latinoamericano.',          1967, 3, 3,
        'El Principito',           'Antoine de Saint-Exupéry','Clásico', '978-2-07-040850-4', 'Cuento filosófico sobre la amistad y el sentido de la vida.',1943, 4, 4,
        'Clean Code',              'Robert C. Martin',        'Tecnología','978-0-13-235088-4','Guía de buenas prácticas para escribir código limpio.',      2008, 2, 2,
        '1984',                    'George Orwell',           'Distopía', '978-0-45-228423-4', 'Novela distópica sobre el totalitarismo y la vigilancia.',   1949, 3, 3,
        'El nombre de la rosa',    'Umberto Eco',             'Misterio', '978-8-43-220326-5', 'Thriller medieval ambientado en un monasterio italiano.',    1980, 2, 2,
        'Sapiens',                 'Yuval Noah Harari',       'Historia', '978-0-06-231609-7', 'Breve historia de la humanidad desde sus orígenes.',         2011, 3, 3,
        'El Quijote',              'Miguel de Cervantes',     'Clásico',  '978-8-49-131638-7', 'Primera novela moderna de la literatura occidental.',        1605, 2, 2,
        'Design Patterns',         'Gang of Four',            'Tecnología','978-0-20-163361-5','Patrones de diseño de software reutilizables.',              1994, 2, 2,
      ]
    );
    console.log('Libros insertados.');

    // ─── Préstamos ────────────────────────────────────────────
    await q(
      `INSERT INTO prestamos
         (usuario_id, libro_id, fecha_prestamo, fecha_limite, fecha_devolucion, estado)
       VALUES
         (?, ?, ?, ?, NULL,   'activo'),
         (?, ?, ?, ?, NULL,   'vencido'),
         (?, ?, ?, ?, ?,      'devuelto'),
         (?, ?, ?, ?, NULL,   'activo')`,
      [
        // Ana tomó "Clean Code", vence en 10 días
        2, 3, ahora,          enDias(10),
        // Carlos tomó "1984", ya venció hace 3 días
        3, 4, haceDias(17),   haceDias(3),
        // María tomó "El Principito" y ya lo devolvió
        4, 2, haceDias(10),   haceDias(3),  haceDias(1),
        // Ana también tiene "Sapiens", vence en 7 días
        2, 6, ahora,          enDias(7),
      ]
    );

    // Actualizar disponibilidad según préstamos activos/vencidos
    await q(`UPDATE libros SET cantidad_disponible = cantidad_disponible - 1 WHERE id IN (3, 4, 6)`);

    console.log('Préstamos insertados.');
    console.log('\n✔ Seed completado exitosamente.');
    console.log('\nCredenciales de prueba:');
    console.log('  admin@biblioteca.com  →  Admin123!  (rol: admin)');
    console.log('  ana@correo.com        →  Usuario123!');
    console.log('  carlos@correo.com     →  Usuario123!');
    console.log('  maria@correo.com      →  Usuario123!');

  } catch (error) {
    console.error('Error al ejecutar el seed:', error);
  } finally {
    await sequelize.close();
  }
}

seed();
