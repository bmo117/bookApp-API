import { validationResult } from "express-validator";

export const validateResult = (req, res, next) => {
  try {
    validationResult(req.body.data).throw();
    return next();
  } catch (error) {
    res.status(403);
    res.send({ errors: error.array() });
  }
};
