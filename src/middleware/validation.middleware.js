const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{10,18}$/;

/**
 * Enhanced Request Validation Middleware
 * Checks for required fields presence AND validates email, password, phone, date, price formats.
 */
const validate = (requiredFields = []) => {
  return (req, res, next) => {
    const data = req.body || {};
    const fields = Array.isArray(requiredFields)
      ? requiredFields
      : Object.keys(requiredFields || {});

    // 1. Validate required fields presence
    for (const field of fields) {
      if (data[field] === undefined || data[field] === null || data[field].toString().trim() === "") {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
          data: null,
        });
      }
    }

    // 2. Validate Email format if email is provided
    const emailVal = data.email;
    if (emailVal !== undefined && emailVal !== null && emailVal.toString().trim() !== "") {
      if (!EMAIL_REGEX.test(emailVal.toString().trim())) {
        return res.status(400).json({
          success: false,
          message: "Invalid email address format (e.g. user@example.com)",
          data: null,
        });
      }
    }

    // 3. Validate Password length if password is provided
    const passwordVal = data.password;
    if (passwordVal !== undefined && passwordVal !== null && passwordVal.toString().trim() !== "") {
      if (passwordVal.toString().length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
          data: null,
        });
      }
    }

    // 4. Validate Phone Number format if phone_number or phoneNumber is provided
    const phoneVal = data.phone_number || data.phoneNumber;
    if (phoneVal !== undefined && phoneVal !== null && phoneVal.toString().trim() !== "") {
      if (!PHONE_REGEX.test(phoneVal.toString().trim())) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format (must contain 10-15 digits, e.g. +919876543210)",
          data: null,
        });
      }
    }

    // 5. Validate Date formats if start_time / end_time are provided
    if (data.start_time !== undefined && data.start_time !== null && data.start_time.toString().trim() !== "") {
      const startTimeParsed = Date.parse(data.start_time);
      if (isNaN(startTimeParsed)) {
        return res.status(400).json({
          success: false,
          message: "Invalid start_time date format (must be a valid ISO date string)",
          data: null,
        });
      }
    }

    if (data.end_time !== undefined && data.end_time !== null && data.end_time.toString().trim() !== "") {
      const endTimeParsed = Date.parse(data.end_time);
      if (isNaN(endTimeParsed)) {
        return res.status(400).json({
          success: false,
          message: "Invalid end_time date format (must be a valid ISO date string)",
          data: null,
        });
      }
    }

    if (data.start_time && data.end_time) {
      if (new Date(data.end_time) <= new Date(data.start_time)) {
        return res.status(400).json({
          success: false,
          message: "end_time must be strictly after start_time",
          data: null,
        });
      }
    }

    // 6. Validate Price & Amount numeric values if provided
    if (data.price !== undefined && data.price !== null && data.price !== "") {
      const priceNum = parseFloat(data.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        return res.status(400).json({
          success: false,
          message: "price must be a positive number",
          data: null,
        });
      }
    }

    if (data.amount !== undefined && data.amount !== null && data.amount !== "") {
      const amountNum = parseFloat(data.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({
          success: false,
          message: "amount must be a positive number",
          data: null,
        });
      }
    }

    next();
  };
};

export default validate;