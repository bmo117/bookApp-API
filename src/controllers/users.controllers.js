import asyncHandler from "express-async-handler";
import pool from "../helpers/connectionDb.js";
import {
  insertIntoTable,
  userData,
  getRole,
  getBookUserData,
  getReadingStatus,
  insertIntoBookUser,
  updateReadingStatus,
  getReadingBooks,
  getAllUserBooks,
  isInFavorites,
  deleteFavorites,
  getFavorites,
  deleteUserBook,
} from "../helpers/dbQuerys.js";
import { getDataBooks } from "../helpers/getDataBook.js";
import { insertIntoUsersTable } from "../helpers/dbQuerys.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import uuidBuffer from "uuid-buffer";

export const userRegister = asyncHandler(async (req, res) => {
  const data = req.body;
  // verify if user is already registered
  const [user] = await userData(data.email);

  if (!user) {
    try {
      const hashPassword = bcrypt.hashSync(data.password, 10);
      const insert = await insertIntoUsersTable(
        data.name,
        data.lastName,
        data.email,
        hashPassword
      );
      const [ActualUserData] = await userData(data.email);

      const [haveRole] = await getRole(ActualUserData.role_ID);

      const nameComplete = data.name + " " + data.lastName;

      const userIDParsed = uuidBuffer.toString(ActualUserData.user_ID);
      const token = jwt.sign(
        {
          userName: nameComplete,
          userId: userIDParsed,
          role: haveRole[0].name,
        },
        process.env.JWT_SECRET,
        {}
      );

      if (token) {
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({
            id: userIDParsed,
          });
      }
    } catch (error) {
      console.log(error, "falla");
    }
  } else {
    console.log(user, "user already exist");
    res.status(400).json({ message: "user already registered" });
  }
  res.send("userRegister");
});

export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [user] = await userData(email);

  if (user) {
    const rightPassword = await bcrypt.compare(password, user.password);

    if (rightPassword) {
      const nameComplete = user.name + " " + user.lastName;
      const [haveRole] = await getRole(user.role_ID);

      const userIDParsed = uuidBuffer.toString(user.user_ID);
      const token = jwt.sign(
        {
          userId: userIDParsed,
          userName: nameComplete,
          role: haveRole[0].name,
        },
        process.env.JWT_SECRET,
        {}
      );

      if (token) {
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(200)
          .json({
            id: userIDParsed,
          });
      }
    }
  } else {
    res.status(401).json({ message: "user or password incorrect" });
  }
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", { sameSite: "none", secure: true }).json("ok");
});

export const getProfile = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json("no token");
  }
});

export const addBookToUser = asyncHandler(async (req, res) => {
  let { userID, bookID, ReadingStatus } = req.body;
  const parseUserID = uuidBuffer.toBuffer(userID);

  const parseBookID = uuidBuffer.toBuffer(bookID);
  const [existRelation] = await getBookUserData(parseBookID, parseUserID);

  if (existRelation) {
    const [status] = await getReadingStatus(ReadingStatus);
    updateReadingStatus(parseUserID, parseBookID, status.status_ID);
  } else {
    const [status] = await getReadingStatus(ReadingStatus);
    try {
      const [rows] = await insertIntoBookUser(
        parseUserID,
        parseBookID,
        status.status_ID
      );
    } catch (error) {}
  }
  res.send(" book added to user");
});

export const getUserReadingBooks = asyncHandler(async (req, res) => {
  const userID = uuidBuffer.toBuffer(req.params.userID);
  const status = req.params.status;
  const [statusID] = await getReadingStatus(status);
  const books = await getReadingBooks(userID, statusID.status_ID);
  const arrayReadingBooks = await getDataBooks(books);
  res.status(200).json(arrayReadingBooks);
});

export const getAllMyBooks = asyncHandler(async (req, res) => {
  const userID = uuidBuffer.toBuffer(req.params.userID);
  const rows = await getAllUserBooks(userID);
  const arrayAllMyBooks = await getDataBooks(rows);
  res.status(200).json(arrayAllMyBooks);
});

export const setFavorites = asyncHandler(async (req, res) => {
  const userID = uuidBuffer.toBuffer(req.body.userID);
  const bookID = uuidBuffer.toBuffer(req.body.bookID);
  const [isAlreadyInFavorites] = await isInFavorites(userID, bookID);
  if (isAlreadyInFavorites) {
    deleteFavorites(userID, bookID);
  } else {
    try {
      insertIntoTable("book_ID", "user_ID", bookID, userID, "book_favorites");
    } catch (error) {}
  }
  res.status(201).json({ message: "success" });
});

export const getAllFavorites = asyncHandler(async (req, res) => {
  const userID = uuidBuffer.toBuffer(req.params.userID);
  const rows = await getFavorites(userID);
  const arrayFavorites = await getDataBooks(rows);
  res.status(200).json(arrayFavorites);
});

export const getFavoritesIDs = asyncHandler(async (req, res) => {
  const userID = uuidBuffer.toBuffer(req.params.userID);
  const rows = await getFavorites(userID);
  const arrIDsToString = [];
  rows.forEach((row) => {
    arrIDsToString.push(uuidBuffer.toString(row.book_ID));
  });
  res.status(200).json(arrIDsToString);
});

export const getBookReadingStatusIDs = asyncHandler(async (req, res) => {
  const userID = uuidBuffer.toBuffer(req.params.userID);
  const bookStatus = req.params.status;
  const [statusID] = await getReadingStatus(bookStatus);
  const books = await getReadingBooks(userID, statusID.status_ID);
  const arrIDsToString = [];
  books.forEach((row) => {
    arrIDsToString.push(uuidBuffer.toString(row.book_ID));
  });
  res.status(200).json(arrIDsToString);
});

export const deleteUserBooks = asyncHandler(async (req, res) => {
  const userID = uuidBuffer.toBuffer(req.params.userID);
  const bookID = uuidBuffer.toBuffer(req.params.bookID);
  const response = await deleteUserBook(userID, bookID);
  if (response.affectedRows) {
    res.sendStatus(200).json("deleteUserBook  successfully ");
  } else {
    res.sendStatus(400).json("deleteUserBook  failed ");
  }
});
