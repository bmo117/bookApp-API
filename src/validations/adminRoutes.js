import { check } from "express-validator";
import { validateResult } from "../helpers/validationHelper.js";

export const validateCreate = [
  check("bookName").exists().not().isEmpty(),
  check("author").exists().not().isEmpty().isArray(),
  check("genres").exists().not().isEmpty().isArray(),
  check("format").exists().not().isEmpty(),
  check("isbn").exists().not().isEmpty(),
  check("publisher").exists().not().isEmpty(),
  check("publicationDate").exists().not().isEmpty().isISO8601("yyyy-mm-dd"),
  check("pages").exists().isNumeric().not().isEmpty(),
  check("rating").exists().not().isEmpty(),
  check("description").exists().not().isEmpty(),
  (req, res, next) => {
    validateResult(req, res, next);
  },
];
