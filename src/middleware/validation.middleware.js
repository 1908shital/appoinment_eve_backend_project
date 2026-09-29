const validate = (requiredFields = []) => {
  return (req, res, next) => {
    const data = req.body || {};
    const fields = Array.isArray(requiredFields)
      ? requiredFields
      : Object.keys(requiredFields || {});

    for (const field of fields) {
      if (data[field] === undefined || data[field] === null || data[field].toString().trim() === "") {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    next();
  };
};

export default validate;