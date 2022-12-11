const router = require('express').Router()
const AuthController = require('../controllers/auth.controller');

router
    .route("/")
    .post(AuthController.authenticate);

module.exports = router;