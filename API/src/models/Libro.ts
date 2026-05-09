import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';

export interface LibroAttributes {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  isbn?: string | null;
  descripcion?: string | null;
  anio_publicacion?: number | null;
  cantidad_total: number;
  cantidad_disponible: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LibroCreationAttributes
  extends Optional<LibroAttributes, 'id' | 'isbn' | 'descripcion' | 'anio_publicacion'> {}

class Libro
  extends Model<LibroAttributes, LibroCreationAttributes>
  implements LibroAttributes
{
  declare id: number;
  declare titulo: string;
  declare autor: string;
  declare categoria: string;
  declare isbn: string | null;
  declare descripcion: string | null;
  declare anio_publicacion: number | null;
  declare cantidad_total: number;
  declare cantidad_disponible: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Libro.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    autor: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    categoria: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    anio_publicacion: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true,
    },
    cantidad_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    cantidad_disponible: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'libros',
    timestamps: true,
  }
);

export default Libro;
