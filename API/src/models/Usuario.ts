import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';

export interface UsuarioAttributes {
  id: number;
  nombre: string;
  correo: string;
  password: string;
  rol: 'admin' | 'usuario';
  createdAt?: Date;
  updatedAt?: Date;
}

interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id'> {}

class Usuario
  extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes
{
  declare id: number;
  declare nombre: string;
  declare correo: string;
  declare password: string;
  declare rol: 'admin' | 'usuario';
  declare createdAt: Date;
  declare updatedAt: Date;
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM('admin', 'usuario'),
      allowNull: false,
      defaultValue: 'usuario',
    },
  },
  {
    sequelize,
    tableName: 'usuarios',
    timestamps: true,
  }
);

export default Usuario;
