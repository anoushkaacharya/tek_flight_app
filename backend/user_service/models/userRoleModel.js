const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserRole = sequelize.define("UserRole", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
  indexes: [{ unique: true, fields: ["user_id", "role_id"] }],
});

module.exports = UserRole;