import {
  getDataBook,
  getDataImage,
  getDataAuthor,
  getDataGenre,
  getDataFormat,
  deleteBook as delete_Book,
} from "../helpers/dbQuerys.js";
import uuidBuffer from "uuid-buffer";
import dateFormat, { masks } from "dateformat";
export const getDataBooks = async (data) => {
  const array = [];
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
    } catch (error) {
      console.log(error);
    }

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
  return array;
};
