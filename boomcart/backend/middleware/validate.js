const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400);
    // You can choose to return an array of errors or a single formatted string.
    // We'll return a flat string of all validation errors combined.
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return next(new Error(errorMessage));
  }
  next();
};

module.exports = validate;
