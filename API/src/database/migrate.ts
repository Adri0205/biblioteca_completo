import 'dotenv/config';
import sequelize from './connection';

async function migrate() {
  try {
    await sequelize.authenticate();
    await sequelize.query('ALTER TABLE libros MODIFY COLUMN anio_publicacion SMALLINT UNSIGNED DEFAULT NULL');
    console.log('Columna anio_publicacion alterada correctamente.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();
