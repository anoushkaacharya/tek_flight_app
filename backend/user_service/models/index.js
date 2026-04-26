const User     = require("./userModel");
const Role     = require("./roleModel");
const UserRole = require("./userRoleModel");
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "user_id",
  otherKey: "role_id",
  as: "roles",
});
Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: "role_id",
  otherKey: "user_id",
  as: "users",
});
User.hasMany(UserRole, { foreignKey: "user_id" });
UserRole.belongsTo(User, { foreignKey: "user_id" });

Role.hasMany(UserRole, { foreignKey: "role_id" });
UserRole.belongsTo(Role, { foreignKey: "role_id" });

module.exports = { User, Role, UserRole };