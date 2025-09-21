import express from 'express';
import { 
  createProduct, 
  getProductById, 
  generateSocialPlan, 
  verifyCertificate 
} from '../controllers/productController.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/products/:id', getProductById);
router.post('/products', upload.single('image'), createProduct);
router.post('/products/:id/social-plan', generateSocialPlan);
router.get('/verify/:certId', verifyCertificate);

export default router;