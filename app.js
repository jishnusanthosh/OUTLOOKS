import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routers
import adminRouter from './routes/adminRouter.js';
import userRouter from './routes/userRouter.js';

// Import database connection function
import connectDB from './config/database.js';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Create Express app
const app = express();

// Set view engine to EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set up middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set up routers
app.use('/', userRouter);
app.use('/admin', adminRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Create HTTP server
const server = http.createServer(app);

// Set port
const PORT = normalizePort(process.env.PORT || '4000');
app.set('port', PORT);

// Listen on provided port, on all network interfaces
mongoose.connection.once('open', () => {
  console.log('Connected to the database.');
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Event listener for HTTP server "error" event
const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
    const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;
    
    // Handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
};

console.log('Listening to the server on http://localhost:4000');

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    // Named pipe
    return val;
  }

  if (port >= 0) {
    // Port number
    return port;
  }

  return false;
}

module.exports=app
