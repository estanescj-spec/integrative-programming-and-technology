const { body, validationResult } = require("express-validator");

const check = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

exports.registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Enter name")
    .isLength({ max: 30 })
    .withMessage("Name too long"),
  body("email").isEmail().withMessage("Enter valid email"),
  body("password")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password needs 8+ characters with upper, lower, number, and symbol",
    ),
  check,
];

exports.productRules = [
  body("name").trim().notEmpty().withMessage("Enter product name"),
  body("description").trim().notEmpty().withMessage("Enter description"),
  body("category").trim().notEmpty().withMessage("Select a category"),
  check,
];

exports.profileRules = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Enter name")
    .isLength({ max: 30 })
    .withMessage("Name too long"),
  body("email").optional().isEmail().withMessage("Enter valid email"),
  body("password")
    .optional({ values: "falsy" })
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password needs 8+ characters with upper, lower, number, and symbol",
    ),
  check,
];
