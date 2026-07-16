/**
 * controllers/gameController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Business logic for the two game endpoints:
 *
 *  getGameFlow      →  GET  /api/game-flow
 *  calculateResult  →  POST /api/calculate-result
 *
 * Uses the query helpers from db.js to abstract sql.js's lower-level API.
 * score_weight is intentionally NEVER selected in any client-facing query.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { getDb, queryAll, queryOne } = require('../database/db');

// ─────────────────────────────────────────────────────────────────────────────
// Controller: GET /api/game-flow
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all questions with nested options.
 * score_weight is EXCLUDED from the SELECT — it never leaves the server.
 *
 * Response shape:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "type": "swipe",
 *       "content": "...",
 *       "options": [
 *         { "id": 1, "question_id": 1, "label": "...", "image_url": "..." },
 *         ...
 *       ]
 *     },
 *     ...
 *   ]
 * }
 */
function getGameFlow(req, res) {
  try {
    const db = getDb();

    // Fetch all game stages sequenced by step_order (no score data)
    const stages = queryAll(db,
      `SELECT id, step_order, story_text, game_type, background_image_url
       FROM   GameStages
       ORDER  BY step_order ASC, id ASC`
    );

    // Attach options to each stage
    // score_weight intentionally omitted from SELECT
    const gameFlow = stages.map((stage) => ({
      ...stage,
      // Provide compatibility mappings for frontend components expecting type/content:
      type:    stage.game_type,
      content: stage.story_text,
      options: queryAll(db,
        `SELECT id, stage_id, label, image_url
         FROM   Options
         WHERE  stage_id = ?
         ORDER  BY id`,
        [stage.id]
      ),
    }));

    return res.status(200).json({
      success: true,
      data: gameFlow,
    });
  } catch (err) {
    console.error('[getGameFlow] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve game flow. Please try again.',
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Controller: POST /api/calculate-result
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Accepts an array of selected option IDs, sums their hidden score_weight
 * values entirely on the server, then returns the matching drink.
 *
 * Request body:  { "selectedOptionIds": [1, 4, 8] }
 *
 * Response (match found):
 * {
 *   "success": true,
 *   "totalScore": 10,
 *   "drink": { "id": 2, "name": "Tropical Smoothie", ... }
 * }
 *
 * Response (no band match):
 * {
 *   "success": true,
 *   "totalScore": 99,
 *   "drink": null,
 *   "message": "..."
 * }
 */
function calculateResult(req, res) {
  try {
    const { selectedOptionIds } = req.body;

    // ── Input validation ────────────────────────────────────────────────────
    if (!Array.isArray(selectedOptionIds) || selectedOptionIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'selectedOptionIds must be a non-empty array.',
      });
    }

    const ids = selectedOptionIds.map(Number);

    if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      return res.status(400).json({
        success: false,
        error: 'All option IDs must be positive integers.',
      });
    }

    const db = getDb();

    // ── Score calculation (server-side only) ────────────────────────────────
    // Build a safe parameterised IN clause — one ? per ID, no string injection
    const placeholders = ids.map(() => '?').join(', ');

    const scoreRow = queryOne(db,
      `SELECT COALESCE(SUM(score_weight), 0) AS total_score
       FROM   Options
       WHERE  id IN (${placeholders})`,
      ids
    );

    const totalScore = scoreRow ? scoreRow.total_score : 0;

    // ── Drink lookup ─────────────────────────────────────────────────────────
    const drink = queryOne(db,
      `SELECT id, name, description, image_url, min_score, max_score, abv, sweetness, location_id
       FROM   Drinks
       WHERE  min_score <= ?
         AND  max_score >= ?
       LIMIT  1`,
      [totalScore, totalScore]
    );

    if (!drink) {
      return res.status(200).json({
        success: true,
        totalScore,
        drink: null,
        location: null,
        message: `No drink matched score ${totalScore}. Please check Drinks score bands.`,
      });
    }

    // ── Location lookup ──────────────────────────────────────────────────────
    let location = null;
    if (drink.location_id) {
      location = queryOne(db,
        `SELECT id, name, address, latitude, longitude, google_maps_link
         FROM   Locations
         WHERE  id = ?`,
        [drink.location_id]
      );
    }
    drink.location = location;

    // ── Success ───────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      totalScore,   // include for dev debugging; remove in strict production
      drink,
      location,
    });
  } catch (err) {
    console.error('[calculateResult] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate result. Please try again.',
    });
  }
}

/**
 * POST /api/upload-photo
 * Handles file upload using multer in memory and returns a base64 Data URL.
 */
function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No photo uploaded.',
      });
    }

    const base64 = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64}`;

    return res.status(200).json({
      success: true,
      imageUrl,
    });
  } catch (err) {
    console.error('[uploadPhoto] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload photo.',
    });
  }
}

module.exports = { getGameFlow, calculateResult, uploadPhoto };

