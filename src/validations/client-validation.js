const { body } = require("express-validator");

const validateClient = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("Please enter the first name.")
    .isLength({ max: 30 })
    .withMessage("First name must be 30 characters or fewer."),

  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Please enter the last name.")
    .isLength({ max: 30 })
    .withMessage("Last name must be 30 characters or fewer."),

  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Please enter a phone number.")
    .customSanitizer((value) => value.replace(/\D/g, "")) // <-- Strip non-digits
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits."),

  body("hired_date")
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage("Please enter a valid hired date."),

  body("service_hours")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Service hours must be a positive number."),

  body("preferred_day")
    .notEmpty()
    .withMessage("Please select a preferred day."),

  body("service_type_id")
    .notEmpty()
    .withMessage("Please select a service type.")
    .isInt()
    .withMessage("Service type must be a valid number."),

  body("street")
    .trim()
    .notEmpty()
    .withMessage("Please enter the street address."),

  body("city").trim().notEmpty().withMessage("Please enter the city."),

  body("zip").trim().notEmpty().withMessage("Please enter the ZIP code."),

  body("garage_code").optional().trim(),

  body("price")
    .notEmpty()
    .withMessage("Please enter the service price.")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number."),

  body("full_house")
    .custom((value) => value === "true" || value === "false")
    .withMessage("Full house must be true or false."),

  body("notes")
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage("Notes must be 500 characters or fewer."),

  body("is_active_new")
    .custom((value) => value === "true" || value === "false")
    .withMessage("Status must be true or false."),
];

module.exports = validateClient;
