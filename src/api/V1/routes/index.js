const express = require('express');
const router = express.Router();
const authRoutes = require('./userRoutes/register'); 


router.use('/auth', authRoutes);


module.exports = router;
