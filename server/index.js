import express from 'express';
import cors from 'cors';
import artisanRoutes from './routes/artisanRoutes.js'; 
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Configure CORS to allow requests specifically from your frontend
const corsOptions = {
  origin: [
    'http://localhost:5173',                // Your local dev frontend
    'https://artisan-ai-six.vercel.app'   // Your live Vercel frontend
  ],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', productRoutes);
app.get('/', (req, res) => {
  res.send('ArtisanAI Backend is running!');
});
app.use('/api', artisanRoutes); // Add this line
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});