import express from 'express';
import { createProduct } from '../controllers/productController.js'; // Correct
import multer from 'multer';
const router = express.Router();

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure an 'uploads' folder exists in your server directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/products', upload.single('image'), createProduct);

export default router;
