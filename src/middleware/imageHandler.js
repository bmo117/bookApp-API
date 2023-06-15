import multer from "multer";
import { dirname, extname, join } from "path";
import { fileURLToPath } from "url";
const MIMETYPES = ["image/jpeg", "image/png", "image/jpg"];
const current_dir = dirname(fileURLToPath(import.meta.url));
const multerUpload = multer({
  storage: multer.diskStorage({
    destination: join(current_dir, "../uploads"),
    filename: (req, file, cb) => {
      const fileExtension = extname(file.originalname);
      let aux = file.originalname.split(fileExtension)[0];
      const fileName = `${aux}-${Date.now()}${fileExtension}`;
      req.imageName = fileName;
      req.imageExtension = fileExtension;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (MIMETYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Only mimetype ${MIMETYPES.join(" ")} are supported`));
  },
  limits: {
    fieldSize: 10000000,
  },
});

export default multerUpload;
