const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use(mongoSanitize());
app.use(hpp());
app.use(compression());
app.use(morgan('combined'));

app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/categories', require('./routes/categories.routes'));
app.use('/api/v1/posts', require('./routes/posts.routes'));
app.use('/api/v1/comments', require('./routes/comments.routes'));
app.use('/api/v1/likes', require('./routes/likes.routes'));
app.use('/api/v1/reports', require('./routes/reports.routes'));
app.use('/api/v1/users', require('./routes/users.routes'));

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
