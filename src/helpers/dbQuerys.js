import pool from "./connectionDb.js";

export const getId = (campoId, table, searchingField, valueSearchingField) => {
  const query =
    "SELECT " +
    campoId +
    " FROM " +
    table +
    " WHERE " +
    searchingField +
    " = " +
    " ?";
  const id = pool.query(query, [valueSearchingField]);
  return id;
};

export const insertIntoTable = (field1, field2, id1, id2, table) => {
  const query =
    "INSERT INTO " +
    table +
    "(" +
    field1 +
    "," +
    field2 +
    ")" +
    " VALUES (?, ?)";
  const res = pool.query(query, [id1, id2]);
  return res;
};

export const getDataBook = (bookID) => {
  const data = pool.query("SELECT * FROM books WHERE book_ID = ?", [bookID]);
  return data;
};

export const getDataImage = async (bookID, parserBookId) => {
  const imageData = await pool.query(
    "SELECT * FROM book_image WHERE book_ID = ?",
    [bookID]
  );
  imageData[0][0].book_ID = parserBookId;
  return imageData[0];
};

export const getDataAuthor = async (bookID) => {
  const [authorData] = await pool.query(
    "SELECT  a.name, a.last_name  FROM  authors AS a JOIN book_author AS ba ON ba.author_ID = a.author_ID WHERE ba.book_ID = ?",
    [bookID]
  );

  const authors = [];
  authorData.forEach((element) => {
    const authorName = element.name + " " + element.last_name;
    authors.push(authorName);
  });
  return authors;
};

export const getDataGenre = async (bookID) => {
  const genreData = await pool.query(
    "SELECT  g.name  FROM  genres AS g JOIN book_genre AS bg ON bg.genre_ID = g.genre_ID  WHERE bg.book_ID = ?",
    [bookID]
  );

  const genres = [];
  for (let i = 0; i < genreData[0].length; i++) {
    const genreName = genreData[0][i].name;
    genres.push(genreName);
  }
  return genres;
};

export const getDataFormat = async (bookID) => {
  const formatData = await pool.query(
    "SELECT  f.name  FROM  formats AS f  JOIN book_format AS bf ON bf.format_ID = f.format_ID WHERE bf.book_ID = ?",
    [bookID]
  );
  return formatData[0][0].name;
};

// delete all authors
export const deleteAuthors = async (bookID) => {
  const deleteA = await pool.query(
    "DELETE FROM book_author WHERE book_ID = ?",
    [bookID]
  );
  return deleteA;
};

// delete all genres
export const deleteGenres = async (bookID) => {
  const deleteG = await pool.query("DELETE FROM book_genre WHERE book_ID = ?", [
    bookID,
  ]);

  return deleteG;
};

// delete format\
export const deleteFormat = async (bookID) => {
  const deleteF = await pool.query(
    "DELETE FROM book_format WHERE book_ID = ?",
    [bookID]
  );
  return deleteF;
};

// delete image data
export const deleteImageData = async (bookID) => {
  const res = await pool.query("DELETE FROM book_image WHERE book_ID = ?", [
    bookID,
  ]);
  console.log(res[0].affectedRows, "res de eliminacion de imagen");
  return res;
};

// delete book

export const deleteBook = async (bookID) => {
  const res = await pool.query("DELETE FROM  books WHERE book_ID = ?", [
    bookID,
  ]);

  return res;
};

// user's query

export const getRole = async (roleID) => {
  const role = await pool.query("SELECT name FROM roles WHERE role_ID = ?", [
    roleID,
  ]);
  //console.log(role, "-------");
  return role;
};

export const userData = async (email) => {
  const [res] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return res;
};

// insert into users collection
export const insertIntoUsersTable = async (
  name,
  last_name,
  email,
  password
) => {
  const [rol] = await pool.query("SELECT role_ID FROM roles   WHERE name = ?", [
    "user",
  ]);
  const [newUser] = await pool.query(
    "INSERT INTO users (user_ID,name, last_name,email,password, role_ID) VALUES (UUID_TO_BIN(UUID()), ?,?,?,?,?)",
    [name, last_name, email, password, rol[0].role_ID]
  );

  return newUser;
};

// query book_user table
export const getBookUserData = async (bookID, userID) => {
  const [res] = await pool.query(
    "SELECT * FROM book_user WHERE book_ID = ? AND user_ID = ?",
    [bookID, userID]
  );
  return res;
};
// getReadingStatus
export const getReadingStatus = async (readingStatus) => {
  const [res] = await pool.query(
    "SELECT status_ID FROM status WHERE name = ?",
    [readingStatus]
  );
  return res;
};

// insert into Book_User table
export const insertIntoBookUser = async (userID, bookID, statusID) => {
  const [res] = await pool.query(
    "INSERT INTO book_user (book_ID, user_ID, status_ID) VALUES (?, ?, ?)",
    [bookID, userID, statusID]
  );
  return res;
};

// update ReadingStatus on book_user table
export const updateReadingStatus = async (userID, bookID, statusID) => {
  const [res] = await pool.query(
    "UPDATE book_user SET status_ID  = ? WHERE user_ID = ? AND book_ID = ?",
    [statusID, userID, bookID]
  );
  return res;
};

// get user reading books
export const getReadingBooks = async (userID, statusID) => {
  const [res] = await pool.query(
    "SELECT book_ID FROM book_user WHERE user_ID = ? AND status_ID = ?",
    [userID, statusID]
  );

  return res;
};

// get all user books
export const getAllUserBooks = async (userID, statusID) => {
  const [res] = await pool.query(
    "SELECT book_ID FROM book_user WHERE user_ID = ?",
    [userID]
  );

  return res;
};

// check if is already in favorites
export const isInFavorites = async (userID, bookID) => {
  const [res] = await pool.query(
    "SELECT book_ID FROM book_favorites WHERE user_ID = ? AND book_ID = ?",
    [userID, bookID]
  );

  return res;
};

// delete from favorites list
export const deleteFavorites = async (userID, bookID) => {
  const [res] = await pool.query(
    "DELETE FROM book_favorites WHERE user_ID = ? AND book_ID = ?",
    [userID, bookID]
  );

  return res;
};

// get favorites
export const getFavorites = async (userID) => {
  const [res] = await pool.query(
    "select book_ID FROM book_favorites WHERE user_ID = ?",
    [userID]
  );

  return res;
};

// delete from book_user
export const deleteUserBook = async (userID, bookID) => {
  const [res] = await pool.query(
    "DELETE  FROM book_user WHERE user_ID = ? AND book_ID = ?",
    [userID, bookID]
  );

  return res;
};
