const authService = require("../services/authService");
exports.login = async (request, response) => {
  try {
    const result = await authService.login(request.body);
    response.json(result);
  } catch (error) {
    response.status(401).json({ message: error.message });
  }
};
exports.register = async (request, response) => {
  try {
    const result = await authService.register(request.body);
    response.json(result);
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
};