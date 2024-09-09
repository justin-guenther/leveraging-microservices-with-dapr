// default
import express from 'express';
import cookieParser from 'cookie-parser';

// cors
import cors from 'cors';
import {corsOptions} from './config/corsOptions';

// logger
import {logger} from './middleware/logEvents';
import errorHandler from './middleware/errorHandler';

// env
import * as dotenv from 'dotenv';

// config
import config from './config/config';

dotenv.config();

const PORT = process.env.PORT || 3500;
const app = express();

app.enable('trust proxy');

// custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// Built-in middleware to handle urlencoded data
// in other words, form data:
// `content-type: application/x-www-form-urlencoded'
app.use(express.urlencoded({extended: false}));

// built-in middleware for json
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

app.use('*', function(req, res, next) {
    res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");

    next();
});

app.use('/api/' + config.VERSION + '/order', require('./routes/order'));

app.all('*', function (req, res) {
    res.sendStatus(404);
});

// error handler
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));