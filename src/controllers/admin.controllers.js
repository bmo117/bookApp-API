import asyncHandler from "express-async-handler";
import pool from "../helpers/connectionDb.js";
import dateFormat, { masks } from "dateformat";
import uuidBuffer from "uuid-buffer";
import { addAuthors, addGenres } from "../helpers/adminFunctionHelpers.js";
import {
  getId,
  insertIntoTable,
  getDataBook,
  getDataImage,
  getDataAuthor,
  getDataGenre,
  getDataFormat,
  deleteAuthors,
  deleteGenres,
  deleteFormat,
  deleteImageData,
  deleteBook as delete_Book,
} from "../helpers/dbQuerys.js";
import { json } from "express";

export const getBooks = asyncHandler(async (req, res) => {
  let amount = req.params.amount;
  let query = "";
  if (amount > 0) {
    query = "SELECT book_ID FROM books LIMIT " + amount;
  } else {
    res.status(404).json({ error: "Book not found" });
  }
  const [data] = await pool.query(query, [amount]);
  const array = [];
  console.log("1");
  for (let i = 0; i < data.length; i++) {
    const [dataBook] = await getDataBook(data[i].book_ID);
    const tmp = {};
    tmp.book = dataBook[0];
    tmp.book.book_ID = uuidBuffer.toString(data[i].book_ID);
    try {
      const rr = dataBook[0].publication_date.toString().split("00")[0];
      const newDate = new Date(rr);
      const prb = dateFormat(rr, "isoDateTime").split("T")[0];
      const fulldate =
        newDate.getFullYear() +
        "-" +
        newDate.getMonth() +
        "-" +
        newDate.getDate();
      tmp.book.publication_date = prb;
    } catch (error) {}

    //tmp.book.publicationDate = dte;

    // authors
    tmp.book.authors = await getDataAuthor(data[i].book_ID);
    //tmp.book.authors = dataAuthor;

    // genres
    tmp.book.genres = await getDataGenre(data[i].book_ID);
    // tmp.book.genres = dataGenres;

    // format
    tmp.book.format = await getDataFormat(data[i].book_ID);

    // image
    const [dataImage] = await getDataImage(data[i].book_ID, tmp.book.book_ID);
    tmp.book.dataImage = dataImage;
    array.push(tmp);
  }
  res.status(200).json(array);
});

export const getAllBooks = asyncHandler(async (req, res) => {
  let query = "SELECT book_ID FROM books";
  const [data] = await pool.query(query);

  const array = [];
  console.log("1");
  for (let i = 0; i < data.length; i++) {
    const [dataBook] = await getDataBook(data[i].book_ID);
    const tmp = {};
    tmp.book = dataBook[0];
    tmp.book.book_ID = uuidBuffer.toString(data[i].book_ID);
    try {
      const rr = dataBook[0].publication_date.toString().split("00")[0];
      const newDate = new Date(rr);
      const prb = dateFormat(rr, "isoDateTime").split("T")[0];
      const fulldate =
        newDate.getFullYear() +
        "-" +
        newDate.getMonth() +
        "-" +
        newDate.getDate();
      tmp.book.publication_date = prb;
    } catch (error) {}

    //tmp.book.publicationDate = dte;

    // authors
    tmp.book.authors = await getDataAuthor(data[i].book_ID);
    //tmp.book.authors = dataAuthor;

    // genres
    tmp.book.genres = await getDataGenre(data[i].book_ID);
    // tmp.book.genres = dataGenres;

    // format
    tmp.book.format = await getDataFormat(data[i].book_ID);

    // image
    const [dataImage] = await getDataImage(data[i].book_ID, tmp.book.book_ID);
    tmp.book.dataImage = dataImage;
    array.push(tmp);
  }
  res.status(200).json(array);
});

// ----------------------------------------------------------------

export const getBook = asyncHandler(async (req, res) => {
  try {
    const [data] = await pool.query("SELECT * FROM books WHERE ISBN = ?", [
      req.params.id,
    ]);
    if (data[0] === undefined) {
      res.status(400).json({ message: "book not found" });
    } else {
      const book = data[0];
      const bookID = data[0].book_ID;
      const parserBookId = uuidBuffer.toString(book.book_ID);
      book.book_ID = parserBookId;

      // image
      const [imageData] = await pool.query(
        "SELECT * FROM book_image WHERE book_ID = ?",
        [bookID]
      );
      imageData[0].book_ID = parserBookId;
      book.data_image = imageData;

      //authors
      const [authorData] = await pool.query(
        "SELECT  a.name, a.last_name  FROM  authors AS a JOIN book_author AS ba ON ba.author_ID = a.author_ID WHERE ba.book_ID = ?",
        [bookID]
      );
      const authors = [];
      authorData.forEach((element) => {
        const authorName = element.name + " " + element.last_name;
        authors.push(authorName);
      });
      book.authors = authors;

      // genres

      const [genreData] = await pool.query(
        "SELECT  g.name  FROM  genres AS g JOIN book_genre AS bg ON bg.genre_ID = g.genre_ID  WHERE bg.book_ID = ?",
        [bookID]
      );

      const genres = [];
      genreData.forEach((element) => {
        const genreName = element.name;
        genres.push(genreName);
      });
      book.genres = genres;

      // format

      const [formatData] = await pool.query(
        "SELECT  f.name  FROM  formats AS f  JOIN book_format AS bf ON bf.format_ID = f.format_ID WHERE bf.book_ID = ?",
        [bookID]
      );
      book.format = formatData[0].name;
      res.status(200).json(book);
    }
  } catch (error) {
    res.status(400).json({ message: "something went wrong searching book" });
  }
});

// ----------------------------------------------------------------

export const createBook = asyncHandler(async (req, res) => {
  const imgName = req.imageName ? req.imageName : "defaultBookImage.png";
  const imgExtension = req.imageExtension ? req.imageExtension : ".png";
  let data = JSON.parse(req.body.data);
  const authors = data.author.filter(Boolean);
  const genres = data.genres;

  const [existBook] = await pool.query(
    "select name from books where ISBN = ?",
    [data.isbn]
  );

  if (existBook[0] === undefined) {
    try {
      const book = await pool.query(
        "insert into books (book_ID, name, ISBN, publisher, publication_date, pages, rating, description) VALUES (UUID_TO_BIN(UUID()), ?, ?, ?, ?, ?,?,?)",
        [
          data.bookName,
          data.isbn,
          data.publisher,
          data.publicationDate,
          data.pages,
          data.rating,
          data.description,
        ]
      );

      const [Id] = await getId("book_ID", "books", "name", data.bookName);
      const bookId = await Id[0].book_ID;
      // insert authors
      authors.forEach((element) => {
        const authorName = element.split(" ")[0].toLowerCase();
        const authorLastName = element.split(" ")[1].toLowerCase();

        async function linkAuthors() {
          const [rows] = await pool.query(
            "SELECT author_ID FROM authors WHERE name = ?",
            [authorName]
          );
          if (rows[0]) {
            const authorId = rows[0].author_ID;

            insertIntoTable(
              "book_ID",
              "author_ID",
              bookId,
              authorId,
              "book_author"
            );
          } else {
            // author not exist

            const res = await pool.query(
              "INSERT INTO authors (author_ID, name, last_name) VALUES (UUID_TO_BIN(UUID()),?, ?)",
              [authorName, authorLastName]
            );
            const [author] = await getId(
              "author_ID",
              "authors",
              "name",
              authorName
            );
            const authorId = author[0].author_ID;
            insertIntoTable(
              "book_ID",
              "author_ID",
              bookId,
              authorId,
              "book_author"
            );
          }
        }
        linkAuthors();
      });

      // insert genres
      genres.forEach((element) => {
        async function linkGenres() {
          const [res] = await getId("genre_ID", "genres", "name", element);
          const genreID = res[0].genre_ID;
          insertIntoTable("book_ID", "genre_ID", bookId, genreID, "book_genre");
        }
        linkGenres();
      });
      // insert formats
      const [dataFormat] = await getId(
        "format_ID",
        "formats",
        "name",
        data.format
      );
      const formatId = dataFormat[0].format_ID;
      insertIntoTable("book_ID", "format_ID", bookId, formatId, "book_format");

      // insert dataImage
      pool.query(
        "INSERT INTO book_image (book_ID, name, type, data) VALUES (?,?,?,?)",
        [bookId, imgName, imgExtension, ""]
      );
      res.status(201).json({
        message: "book created successfully",
      });
    } catch (error) {}
  } else {
    res.status(400).json({ message: "book already exists" });
  }
});

// ----------------------------------------------------------------

export const updateBook = asyncHandler(async (req, res) => {
  let data = JSON.parse(req.body.data);
  let bookId = uuidBuffer.toBuffer(data.book_ID);
  const authors = data.author;

  const genres = data.genres;
  const [existBook] = await pool.query(
    "select * from books where book_ID = ?",
    bookId
  );
  const nameImage = await getDataImage(bookId, data.book_ID);
  const newImgName = req.imageName;
  const imgExtension = req.imageExtension
    ? req.imageExtension
    : nameImage[0].type;
  if (existBook) {
    const [rows] = await pool.query(
      "Update books SET name = ?, ISBN = ? , publisher = ?, publication_date = ?, pages = ? , rating = ?, description = ? WHERE book_ID = ?",
      [
        data.bookName,
        data.isbn,
        data.publisher,
        data.publicationDate,
        data.pages,
        data.rating,
        data.description,
        bookId,
      ]
    );
    // new dataImage
    if (newImgName) {
      const [rows] = await pool.query(
        "UPDATE book_image SET name = ? , type = ? WHERE book_ID = ?",
        [newImgName, imgExtension, bookId]
      );
    }
    //new Authors

    const [resDelete] = await deleteAuthors(bookId);
    addAuthors(authors, bookId);
    //new Genres
    const [af] = await deleteGenres(bookId);
    addGenres(genres, bookId);
    //format;
    const [dataFormat] = await getId(
      "format_ID",
      "formats",
      "name",
      data.format
    );
    const df = await deleteFormat(bookId);
    const formatId = dataFormat[0].format_ID;
    const [res] = await insertIntoTable(
      "book_ID",
      "format_ID",
      bookId,
      formatId,
      "book_format"
    );
  } else {
    res.status(400).json({ message: "book dont found" });
  }
  res.status(200).json({ message: "book updated" });
});

// -----------------------------------------------------------------
export const deleteBook = asyncHandler(async (req, res) => {
  const bookId = uuidBuffer.toBuffer(req.params.id);
  const [rows] = await pool.query(
    "select book_ID from books where book_ID = ?",
    bookId
  );
  if (rows) {
    const delete_Image_Data = await deleteImageData(bookId);
    const delete_Format = await deleteFormat(bookId);
    const delete_Genres = await deleteGenres(bookId);
    const delete_Authors = await deleteAuthors(bookId);
    const delete_Books = await delete_Book(bookId);
    res.status(200).json({ message: "book deleted successfully" });
  } else {
    res.status(400).json({ message: "book not found" });
  }
});

export const getAuthors = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT name, last_name FROM authors");

  const arrayAuthors = [];
  rows.forEach((element) => {
    let aux = element.name + " " + element.last_name;
    console.log(aux);
    arrayAuthors.push(aux);
  });
  res.status(200).json({
    authors: arrayAuthors,
  });
});

export const getGenres = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT name FROM genres");

  const arrayGenres = [];
  rows.forEach((element) => {
    arrayGenres.push(element.name);
  });
  res.status(200).json({
    genres: arrayGenres,
  });
});

export const getFormats = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT name FROM formats");

  const arrayFormats = [];
  rows.forEach((element) => {
    arrayFormats.push(element.name);
  });
  res.status(200).json({
    formats: arrayFormats,
  });
});
