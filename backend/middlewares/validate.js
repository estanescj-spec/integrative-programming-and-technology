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
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  check,
];

exports.productRules = [
  body("name").trim().notEmpty().withMessage("Enter product name"),
  body("description").trim().notEmpty().withMessage("Enter description"),
  body("category")
    .isIn([
      "Lego Sets",
      "RC Cars",
      "Hot Wheels",
      "Nerf Blasters",
      "Puzzles",
      "Plush Toys",
    ])
    .withMessage("Select a valid category"),
  check,
];
