const authService = require("../services/authService");
exports.register = async (request, response) => {
  try {
    const result = await authService.register(request.body);
    response.status(201).send();
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
};
exports.login = async (request, response) => {
  try {
    const result = await authService.login(request.body);
    response.json(result);
  } catch (error) {
    response.status(401).json({ message: error.message });
  }
};