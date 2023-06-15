import pool from "./connectionDb.js";
import { insertIntoTable, getId } from "./dbQuerys.js";
export const addAuthors = async (authors, bookId) => {
  authors.forEach((element) => {
    const authorName = element.split(" ")[0]; // add toLowerCase
    const authorLastName = element.split(" ")[1]; // add toLowerCase

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
};

export const addGenres = async (genres, bookId) => {
  genres.forEach((element) => {
    async function linkGenres() {
      const [res] = await getId("genre_ID", "genres", "name", element);
      const genreID = res[0].genre_ID;
      insertIntoTable("book_ID", "genre_ID", bookId, genreID, "book_genre");
    }
    linkGenres();
  });
};
