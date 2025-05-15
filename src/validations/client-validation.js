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

  body("street").trim().notEmpty().withMessage("Street is required."),

  body("city").trim().notEmpty().withMessage("City is required."),

  body("zip").trim().notEmpty().withMessage("ZIP Code is required."),

  body("garage_code").optional().trim(),

  body("price")
    .notEmpty()
    .withMessage("Price is required.")
    .isFloat({ min: 0 })
    .withMessage("Price must be a valid number."),

  body("full_house")
    .custom((value) => value === "true" || value === "false")
    .withMessage("Full house must be true or false."),

  body("notes")
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage("Notes must be under 500 characters."),

  body("is_active_new")
    .custom((value) => value === "true" || value === "false")
    .withMessage("Status must be true or false."),
];

module.exports = validateClient;
