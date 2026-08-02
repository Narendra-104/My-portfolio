import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import chatRoutes from './src/routes/chatRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', chatRoutes);

app.get('/', (req, res) => {
  res.send('Narendra Gond Portfolio Backend Running');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});