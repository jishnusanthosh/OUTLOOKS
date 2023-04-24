
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import  session  from "express-session";
import  multer  from "multer";
import { fileUpload  } from "file-upload";




import connectDB from './config/database.js';

// Import routers
import adminRouter from './routes/adminRouter.js';
import userRouter from './routes/userRouter.js';


//upload images



// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Create Express app
const app = express();

// Set view engine to EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(multer({
  dest: 'uploads',
  storage: storage,
  limits: { fileSize: 1024 * 1024 } // 1MB
}).single('productImage'));


// Set up middleware

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "key",
    cookie: { maxAge: 600000 },
    saveUninitialized: false,
    resave: false,
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use("/node_modules", express.static("node_modules"));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
// Set up routers
app.use('/', userRouter);
app.use('/admin', adminRouter);



const storage=multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')

    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const timestamp = Date.now();
      const newFilename = `${timestamp}_${path.basename(file.originalname, ext)}.jpg`;
      cb(null, newFilename);
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
        cb(new Error('Only jpeg and png files are allowed'));
        return;
      } else {
        cb(null, true);
        return
      }
    }
    
});



// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});



// Set headers for all responses
app.use(function (req, res, next) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
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
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}👶`);
  });
});

// Event listener for HTTP server "error" event
const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
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
