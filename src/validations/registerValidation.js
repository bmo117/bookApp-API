import { check } from "express-validator";
import { validateResult } from "../helpers/validationRegister.js";

export const validateRegister = [
  check("name").exists().not().isEmpty(),
  check("lastName").exists().not().isEmpty(),
  check("email").exists().not().isEmpty().isEmail(),
  check("password").exists().not().isEmpty(),
  (req, res, next) => {
    validateResult(req, res, next);
  },
];
