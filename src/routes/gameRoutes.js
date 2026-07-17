/**
 * routes/gameRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Defines the two game API routes and wires them to their controller functions.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { Router } = require('express');
const multer = require('multer');
const { getAttractions, getGameFlow, calculateResult, uploadPhoto } = require('../controllers/gameController');

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

/**
 * GET /api/attractions
 * Returns all attractions (including Garden of Siam) from TURSO.
 */
router.get('/attractions', getAttractions);

/**
 * GET /api/game-flow
 * Returns all questions with their options (score_weight excluded).
 */
router.get('/game-flow', getGameFlow);

/**
 * POST /api/calculate-result
 * Body: { "selectedOptionIds": [1, 4, 7] }
 * Returns the matched drink based on hidden score calculation.
 */
router.post('/calculate-result', calculateResult);

/**
 * POST /api/upload-photo
 * Body: multipart/form-data with field "photo"
 * Returns base64 Data URL of uploaded image.
 */
router.post('/upload-photo', upload.single('photo'), uploadPhoto);

module.exports = router;

