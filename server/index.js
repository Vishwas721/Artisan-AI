import express from 'express';
import cors from 'cors';

import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use('/api', productRoutes);
app.get('/', (req, res) => {
  res.send('ArtisanAI Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});