import express from 'express';
var router = express.Router();

import albumRouter from './api/albums.js';
import users from './users.js';
import profileRouter from './api/profile.js';


router.use('/albums', albumRouter);
router.use('/users', users);
router.use('/profile', profileRouter)

export default router;