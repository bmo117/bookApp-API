import { Router } from "express";
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getAuthors,
  getGenres,
  getFormats,
} from "../controllers/admin.controllers.js";
import verifyTokenAdmin from "../middleware/vereifyTokenAdmin.js";
import multerUpload from "../middleware/imageHandler.js";
import { validateCreate } from "../validations/adminRoutes.js";
const router = Router();

router.get("/authors", getAuthors);
router.get("/genres", getGenres);
router.get("/formats", getFormats);
router.get("/:amount", getBooks);
router.get("/:id", getBook);
//imageFile es el nombre del campo en donde viene la imagen
router.post(
  "/",
  verifyTokenAdmin,
  multerUpload.single("imageFile"),
  validateCreate,
  createBook
);

router.put(
  "/",
  verifyTokenAdmin,
  multerUpload.single("imageFile"),
  validateCreate,
  updateBook
);

router.delete("/:id", verifyTokenAdmin, deleteBook);

export default router;
