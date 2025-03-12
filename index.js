const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const logger = require('./logger');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(authRoutes);

app.listen(3000, () => {
    logger.info('Server running on port 3000');
});
