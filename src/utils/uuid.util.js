const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Validates if a string is a valid UUID format (v4 / standard UUID format).
 * @param {string} id 
 * @returns {boolean}
 */
const isValidUuid = (id) => {
  if (!id || typeof id !== "string") {
    return false;
  }
  return UUID_REGEX.test(id.trim());
};

module.exports = {
  isValidUuid,
};
