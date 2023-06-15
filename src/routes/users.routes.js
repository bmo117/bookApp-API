import { Router } from "express";
import {
  userRegister,
  userLogin,
  getProfile,
  addBookToUser,
  logout,
  getUserReadingBooks,
  getAllMyBooks,
  getAllFavorites,
  setFavorites,
  getFavoritesIDs,
  getBookReadingStatusIDs,
  deleteUserBooks,
} from "../controllers/users.controllers.js";
import { validateRegister } from "../validations/registerValidation.js";
import { validateLogin } from "../validations/loginvalidation.js";
import verifyTokenUser from "../middleware/VerifyTokenUser.js";
const route = Router();

route.get("/profile", getProfile);
route.get("/bookStatus/:userID/:status", verifyTokenUser, getUserReadingBooks);
route.get("/myBooks/:userID", verifyTokenUser, getAllMyBooks);
route.get("/favorites/:userID", verifyTokenUser, getAllFavorites);
route.get("/favoritesIDs/:userID", verifyTokenUser, getFavoritesIDs);
route.get(
  "/bookStatusIDs/:userID/:status",
  verifyTokenUser,
  getBookReadingStatusIDs
);
route.post("/login", validateLogin, userLogin);
route.post("/register", validateRegister, userRegister);
route.post("/userBook", verifyTokenUser, addBookToUser);
route.post("/favorites", verifyTokenUser, setFavorites);
route.post("/logout", verifyTokenUser, logout);
route.delete("/userBooks/:userID/:bookID", verifyTokenUser, deleteUserBooks);
export default route;
