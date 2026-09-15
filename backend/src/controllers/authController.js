const authService = require('../services/authService');

function respondIfServiceError(res, error) {
  if (error instanceof authService.ServiceError) {
    res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
    return true;
  }
  return false;
}

function login(req, res) {
  try {
    const session = authService.login({
      userId: req.body?.userId,
      password: req.body?.password,
    });

    res.status(200).json(session);
  } catch (error) {
    if (respondIfServiceError(res, error)) return;
    res.status(500).json({
      error: { code: 'AUTHENTICATION_FAILED', message: 'Falha ao autenticar o usuário.' },
    });
  }
}

module.exports = {
  login,
};
