
const validate = (schema) => {
  return (req, res, next) => {

    const data = req.body;

    for (const field in schema) {

      if (
        schema[field].required &&
        (!data[field] || data[field].toString().trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    next();
  };
};

module.exports = validate;