// Backend entry point for Snipe
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// --- MongoDB connection ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/snipe';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Snipe backend API running');
});


// --- API Routes ---
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users', require('./routes/users'));
app.use('/api/uploads', require('./routes/uploads'));
// TODO: uploads, admin/master routes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
