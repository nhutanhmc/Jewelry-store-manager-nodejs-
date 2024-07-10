var express = require('express');
const router = express.Router();
var staffController = require('../controller/staffController');
const passport = require("../config/passportConfig");

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: API endpoints for managing staff authentication and details
 */

/**
 * @swagger
 * /staffsRouter/auth/google:
 *   get:
 *     summary: Google authentication
 *     tags: [Staff]
 *     description: Redirects to Google for authentication. The response is a redirect to Google OAuth.
 *     responses:
 *       302:
 *         description: Redirects to Google for authentication
 */
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /staffsRouter/auth/google/callback:
 *   get:
 *     summary: Google authentication callback
 *     tags: [Staff]
 *     description: Callback endpoint for Google OAuth. Redirects to the frontend with tokens.
 *     parameters:
 *       - in: query
 *         name: accessToken
 *         schema:
 *           type: string
 *         description: Access token
 *       - in: query
 *         name: refreshToken
 *         schema:
 *           type: string
 *         description: Refresh token
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: User role
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: User name
 *     responses:
 *       302:
 *         description: Redirects to frontend with tokens
 */
router.get('/auth/google/callback', 
  passport.authenticate('google'), 
  staffController.googleAuthCallback);

/**
 * @swagger
 * /staffsRouter/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Refresh token not provided
 *       403:
 *         description: Invalid refresh token
 *       500:
 *         description: Internal server error
 */
router.post('/refresh-token', staffController.refreshAccessToken);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 role:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post('/loginWithJWT', staffController.loginWithJWT);

/**
 * @swagger
 * /staffsRouter/signup:
 *   post:
 *     summary: Signup
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
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/Staff'
 *       500:
 *         description: Internal server error
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Staff'
 *       500:
 *         description: Internal server error
 */
router.get('/getAllUser', staffController.getAllUsers);

/**
 * @swagger
 * /staffsRouter/updateUser/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             password:
 *               type: string
 *             name:
 *               type: string
 *             age:
 *               type: number
 *             role:
 *               type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/updateUser/:id', staffController.updateUser);
/**
 * @swagger
 * /staffsRouter/deleteUser/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/Staff'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/deleteUser/:id', staffController.deleteUser);

module.exports = router;
