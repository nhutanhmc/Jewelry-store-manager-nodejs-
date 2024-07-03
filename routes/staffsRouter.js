var express = require('express');
const router = express.Router();
var staffController = require('../controller/staffController');
const passport = require("../config/passportConfig"); // Nhớ require passport

router.post('/refresh-token', staffController.refreshAccessToken);

// Khởi tạo quá trình xác thực Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback sau khi xác thực
router.get('/auth/google/callback', 
  passport.authenticate('google'), 
  staffController.googleAuthCallback);

  router.post('/auth/firebase', staffController.firebaseAuth);
// staffsRouter.js
/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: API for managing staff
 */

/**
 * @swagger
 * /staffsRouter/loginWithJWT:
 *   post:
 *     summary: Login with JWT
 *     tags: [Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request
 */
router.post('/loginWithJWT', staffController.loginWithJWT);


/**
 * @swagger
 * /staffsRouter/signup:
 *   post:
 *     summary: Sign up a new staff
 *     tags: [Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Staff created successfully
 *       400:
 *         description: Bad request
 */
router.post('/signup', staffController.signUp);

/**
 * @swagger
 * /staffsRouter/getAllUser:
 *   get:
 *     summary: Get all users
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: List of all users
 *       500:
 *         description: Internal server error
 */
router.get('/getAllUser', staffController.getAllUsers);

module.exports = router;
