import express from 'express';

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { createProduct, getProductById, generateSocialPlan, verifyCertificate, updateProduct, regenerateContent,getShowcaseByArtisan} from '../controllers/productController.js';
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'artisan-ai-uploads', // A folder name in your Cloudinary account
    format: async (req, file) => 'jpg',
    public_id: (req, file) => Date.now() + '-' + file.originalname,
  },
});

const upload = multer({ storage: storage });
const router = express.Router();
router.get('/showcase/:artisanId', getShowcaseByArtisan);
// Your routes remain the same
router.get('/products/:id', getProductById);
router.post('/products', upload.single('image'), createProduct);
router.post('/products/:id/social-plan', generateSocialPlan);
router.get('/verify/:certId', verifyCertificate);
router.put('/products/:id', updateProduct);
router.post('/products/:id/regenerate', regenerateContent);
export default router;