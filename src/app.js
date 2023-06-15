import express from "express";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/users.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
//import { config } from "dotenv";
import errorhandler from "./middleware/errorHandler.js";
const current_dir = dirname(fileURLToPath(import.meta.url));
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { PORT } from "../src/config.js";
//config();
const app = express();
app.use({
  credentials: true,
  origin: process.env.CLIENT_URL,
});

app.use("/public", express.static(join(current_dir, "../src/uploads")));
app.use(express.json());
app.use(cookieParser());

app.use("/api/admin/books", adminRoutes);
app.use("/api/v1/users", userRoutes);
app.use(errorhandler);

//const PORT = 3001;
app.listen(PORT, () => {
  console.log(`server listening on ${PORT}`);
});
