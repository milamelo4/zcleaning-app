const { body } = require("express-validator");

const validateClient = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .isLength({ max: 30 })
    .withMessage("First name must be under 30 characters."),

  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .isLength({ max: 30 })
    .withMessage("Last name must be under 30 characters."),

  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required.")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be 10 digits."),

  body("hired_date")
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage("Hired date must be a valid date."),

  body("service_hours")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Service hours must be a number."),

  body("preferred_day").notEmpty().withMessage("Preferred day is required."),

  body("service_type_id")
    .notEmpty()
    .withMessage("Service type is required.")
    .isInt()
    .withMessage("Service type must be a number."),

  body("is_active")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(["active", "inactive"])
    .withMessage("Invalid status value."),
];

module.exports = validateClient;
