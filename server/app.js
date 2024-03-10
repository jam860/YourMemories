import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import models from './models.js';
import sessions from 'express-session'
import dotenv from 'dotenv'

import apiRouter from './routes/api.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import WebAppAuthProvider from 'msal-node-wrapper'

dotenv.config();

const authConfig = {
	auth: {
		clientId: process.env.CLIENT_ID,
        authority: process.env.AUTHORITY,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: "/redirect"
	},
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: 3,
        }
    },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var app = express();

app.enable('trust proxy'); 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: {maxAge: oneDay},
    resave: false
}))

const authProvider = await WebAppAuthProvider.WebAppAuthProvider.initialize(authConfig);
app.use(authProvider.authenticate());


app.use((req, res, next) => {
    req.models = models;
    next();
})

app.use('/api', apiRouter);

app.get(
	'/signin',
	(req, res, next) => {
		return req.authContext.login({
			postLoginRedirectUri: "http://localhost:3000/",
		})
        (req, res, next);
	}
);

app.get(
	'/signout',
	(req, res, next) => {
		return req.authContext.logout({
			postLogoutRedirectUri: "http://localhost:3000/",
		})(req, res, next);
	}
);

app.use(authProvider.interactionErrorHandler());


export default app;
