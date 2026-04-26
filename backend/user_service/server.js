const app = require("./app");
const sequelize = require("./config/db");
const dataInitializer = require("./utils/dbInitializer");
const { User, Role, UserRole } = require("./models/index"); // import all models so Sequelize registers them
require("dotenv").config();

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(async () => {
    console.log("Database connected");
    console.log("Tables synced");
    await dataInitializer(); // seeds roles + admin user on first run
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => console.error("Startup error:", error));