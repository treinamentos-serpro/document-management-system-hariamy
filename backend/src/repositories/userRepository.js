const crypto = require('crypto');
const { AUTH_USERS } = require('../config');

function hasSamePassword(expectedPassword, providedPassword) {
  const expectedBuffer = Buffer.from(expectedPassword);
  const providedBuffer = Buffer.from(providedPassword);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

function findByCredentials(userId, password) {
  return AUTH_USERS.find((user) => user.id === userId && hasSamePassword(user.password, password));
}

module.exports = {
  findByCredentials,
};
