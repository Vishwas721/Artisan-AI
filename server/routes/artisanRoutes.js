import express from 'express';
import { updateArtisanProfile } from '../controllers/artisanController.js';

const router = express.Router();
router.put('/artisans/profile', updateArtisanProfile);
export default router;