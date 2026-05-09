import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';
import Usuario from './Usuario';
import Libro from './Libro';

export interface PrestamoAttributes {
  id: number;
  usuario_id: number;
  libro_id: number;
  fecha_prestamo: Date;
  fecha_limite: Date;
  fecha_devolucion?: Date | null;
  estado: 'activo' | 'devuelto' | 'vencido';
  createdAt?: Date;
  updatedAt?: Date;
}

interface PrestamoCreationAttributes
  extends Optional<PrestamoAttributes, 'id' | 'fecha_devolucion'> {}

class Prestamo
  extends Model<PrestamoAttributes, PrestamoCreationAttributes>
  implements PrestamoAttributes
{
  declare id: number;
  declare usuario_id: number;
  declare libro_id: number;
  declare fecha_prestamo: Date;
  declare fecha_limite: Date;
  declare fecha_devolucion: Date | null;
  declare estado: 'activo' | 'devuelto' | 'vencido';
  declare createdAt: Date;
  declare updatedAt: Date;
}

Prestamo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    libro_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_prestamo: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_limite: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_devolucion: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    estado: {
      type: DataTypes.ENUM('activo', 'devuelto', 'vencido'),
      allowNull: false,
      defaultValue: 'activo',
    },
  },
  {
    sequelize,
    tableName: 'prestamos',
    timestamps: true,
  }
);

// Asociaciones
Prestamo.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Prestamo.belongsTo(Libro,   { foreignKey: 'libro_id',   as: 'libro'   });
Usuario.hasMany(Prestamo,   { foreignKey: 'usuario_id', as: 'prestamos' });
Libro.hasMany(Prestamo,     { foreignKey: 'libro_id',   as: 'prestamos' });

export default Prestamo;
