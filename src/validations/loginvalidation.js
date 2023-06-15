import { check } from "express-validator";
import { validateResult } from "../helpers/validationRegister.js";

export const validateLogin = [
  check("email").exists().not().isEmpty().isEmail(),
  check("password").exists().not().isEmpty(),
  (req, res, next) => {
    validateResult(req, res, next);
  },
];
