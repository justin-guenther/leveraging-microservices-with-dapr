import config from './config';

const allowedOrigins = config.ALLOWED_ORIGINS;

const corsOptionsDelegate = function (origin, callback) {
    let corsOptions;

    if (origin && allowedOrigins.includes(origin)) {
        corsOptions = {origin: true};
    } else {
        corsOptions = {origin: false};
    }

    callback(null, corsOptions);
};

export const corsOptions = {
    origin: corsOptionsDelegate,
    credentials: true,
    optionsSuccessStatus: 200
};