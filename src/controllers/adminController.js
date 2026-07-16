/**
 * controllers/adminController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin controller for CRUD operations on GameStages and their Options.
 * Protect all endpoints using the isAdmin middleware.
 *
 * Endpoints handled:
 *   GET    /api/admin/stages
 *   POST   /api/admin/stages
 *   PUT    /api/admin/stages/:id
 *   DELETE /api/admin/stages/:id
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { getDb, saveDb, queryAll, queryOne, runInsert } = require('../database/db');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stages
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Fetch all stages with their options, ordered by step_order.
 * Includes score_weight since this is the admin panel.
 */
async function getAdminStages(_req, res) {
  try {
    const db = getDb();

    const stages = await queryAll(db,
      `SELECT id, step_order, story_text, game_type, background_image_url
       FROM   GameStages
       ORDER  BY step_order ASC, id ASC`
    );

    const stagesWithOptions = await Promise.all(stages.map(async (stage) => ({
      ...stage,
      options: await queryAll(db,
        `SELECT id, stage_id, label, image_url, score_weight, sub_question
         FROM   Options
         WHERE  stage_id = ?
         ORDER  BY id ASC`,
        [stage.id]
      ),
    })));

    return res.status(200).json({
      success: true,
      data: stagesWithOptions,
    });
  } catch (err) {
    console.error('[getAdminStages] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve admin stages.',
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/stages
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Create a new stage along with its options in a single transaction.
 */
async function createAdminStage(req, res) {
  try {
    const { step_order, story_text, game_type, background_image_url = null, options = [] } = req.body;

    // Validation
    if (step_order === undefined || !Number.isInteger(Number(step_order))) {
      return res.status(400).json({ success: false, error: 'step_order must be a valid integer.' });
    }
    if (!story_text || typeof story_text !== 'string' || story_text.trim() === '') {
      return res.status(400).json({ success: false, error: 'story_text is required.' });
    }
    const validTypes = ['swipe', 'mixology', 'tarot', 'drag_drop'];
    if (!validTypes.includes(game_type)) {
      return res.status(400).json({ success: false, error: `game_type must be one of: ${validTypes.join(', ')}` });
    }
    if (!Array.isArray(options)) {
      return res.status(400).json({ success: false, error: 'options must be an array.' });
    }

    const db = getDb();

    // Check step_order unique
    const existingOrder = await queryOne(db, 'SELECT id FROM GameStages WHERE step_order = ?', [Number(step_order)]);
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        error: `step_order ${step_order} is already in use by stage ID ${existingOrder.id}.`,
      });
    }

    await db.run('BEGIN TRANSACTION');
    try {
      const stageId = await runInsert(db,
        `INSERT INTO GameStages (step_order, story_text, game_type, background_image_url)
         VALUES (?, ?, ?, ?)`,
        [Number(step_order), story_text.trim(), game_type, background_image_url]
      );

      for (const opt of options) {
        if (!opt.label || typeof opt.label !== 'string' || opt.label.trim() === '') {
          throw new Error('Each option must have a valid non-empty label.');
        }
        await db.run(
          `INSERT INTO Options (stage_id, label, image_url, score_weight, sub_question)
           VALUES (?, ?, ?, ?, ?)`,
          [stageId, opt.label.trim(), opt.image_url || null, Number(opt.score_weight) || 0, opt.sub_question || null]
        );
      }

      await db.run('COMMIT');
      saveDb();

      // Fetch created stage with options to return
      const createdStage = await queryOne(db,
        `SELECT id, step_order, story_text, game_type, background_image_url
         FROM   GameStages
         WHERE  id = ?`,
        [stageId]
      );
      createdStage.options = await queryAll(db,
        `SELECT id, stage_id, label, image_url, score_weight, sub_question
         FROM   Options
         WHERE  stage_id = ?
         ORDER  BY id ASC`,
        [stageId]
      );

      return res.status(201).json({
        success: true,
        data: createdStage,
      });
    } catch (txErr) {
      await db.run('ROLLBACK');
      throw txErr;
    }
  } catch (err) {
    console.error('[createAdminStage] Error:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to create stage.',
    });
  }
}

/**
 * Helper to sync options for a stage during an update.
 */
async function syncStageOptions(db, stageId, options) {
  if (!Array.isArray(options)) return;

  // Keep track of option IDs provided in request
  const providedOptionIds = options
    .filter((opt) => opt.id && Number.isInteger(Number(opt.id)))
    .map((opt) => Number(opt.id));

  // Delete existing options not in providedOptionIds
  if (providedOptionIds.length > 0) {
    const placeholders = providedOptionIds.map(() => '?').join(', ');
    await db.run(`DELETE FROM Options WHERE stage_id = ? AND id NOT IN (${placeholders})`, [stageId, ...providedOptionIds]);
  } else {
    // If options array is provided but none have id, replace all options
    await db.run(`DELETE FROM Options WHERE stage_id = ?`, [stageId]);
  }

  // Insert or update each option
  for (const opt of options) {
    if (!opt.label || typeof opt.label !== 'string' || opt.label.trim() === '') {
      throw new Error('Each option must have a valid non-empty label.');
    }
    if (opt.id && Number.isInteger(Number(opt.id))) {
      const optId = Number(opt.id);
      const exists = await queryOne(db, 'SELECT id FROM Options WHERE id = ? AND stage_id = ?', [optId, stageId]);
      if (exists) {
        await db.run(
          `UPDATE Options SET label = ?, image_url = ?, score_weight = ?, sub_question = ? WHERE id = ? AND stage_id = ?`,
          [opt.label.trim(), opt.image_url || null, Number(opt.score_weight) || 0, opt.sub_question || null, optId, stageId]
        );
        continue;
      }
    }
    await db.run(
      `INSERT INTO Options (stage_id, label, image_url, score_weight, sub_question) VALUES (?, ?, ?, ?, ?)`,
      [stageId, opt.label.trim(), opt.image_url || null, Number(opt.score_weight) || 0, opt.sub_question || null]
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/stages/:id
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Update an existing stage and its options in a single transaction.
 */
async function updateAdminStage(req, res) {
  try {
    const stageId = Number(req.params.id);
    if (!Number.isInteger(stageId) || stageId <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid stage ID.' });
    }

    const db = getDb();
    const existingStage = await queryOne(db,
      `SELECT id, step_order, story_text, game_type, background_image_url
       FROM   GameStages
       WHERE  id = ?`,
      [stageId]
    );

    if (!existingStage) {
      return res.status(404).json({ success: false, error: 'Stage not found.' });
    }

    const {
      step_order           = existingStage.step_order,
      story_text           = existingStage.story_text,
      game_type            = existingStage.game_type,
      background_image_url = existingStage.background_image_url,
      options
    } = req.body;

    if (!Number.isInteger(Number(step_order))) {
      return res.status(400).json({ success: false, error: 'step_order must be a valid integer.' });
    }
    const validTypes = ['swipe', 'mixology', 'tarot', 'drag_drop'];
    if (!validTypes.includes(game_type)) {
      return res.status(400).json({ success: false, error: `game_type must be one of: ${validTypes.join(', ')}` });
    }

    // Check step_order unique if changed
    if (Number(step_order) !== existingStage.step_order) {
      const orderConflict = await queryOne(db, 'SELECT id FROM GameStages WHERE step_order = ? AND id != ?', [Number(step_order), stageId]);
      if (orderConflict) {
        return res.status(400).json({
          success: false,
          error: `step_order ${step_order} is already in use by stage ID ${orderConflict.id}.`,
        });
      }
    }

    await db.run('BEGIN TRANSACTION');
    try {
      await db.run(
        `UPDATE GameStages
         SET    step_order = ?, story_text = ?, game_type = ?, background_image_url = ?
         WHERE  id = ?`,
        [Number(step_order), story_text.trim(), game_type, background_image_url, stageId]
      );

      await syncStageOptions(db, stageId, options);

      await db.run('COMMIT');
      saveDb();

      // Fetch updated stage with options
      const updatedStage = await queryOne(db,
        `SELECT id, step_order, story_text, game_type, background_image_url
         FROM   GameStages
         WHERE  id = ?`,
        [stageId]
      );
      updatedStage.options = await queryAll(db,
        `SELECT id, stage_id, label, image_url, score_weight
         FROM   Options
         WHERE  stage_id = ?
         ORDER  BY id ASC`,
        [stageId]
      );

      return res.status(200).json({
        success: true,
        data: updatedStage,
      });
    } catch (txErr) {
      await db.run('ROLLBACK');
      throw txErr;
    }
  } catch (err) {
    console.error('[updateAdminStage] Error:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to update stage.',
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/stages/:id
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Delete a stage and cascade delete its options in a single transaction.
 */
async function deleteAdminStage(req, res) {
  try {
    const stageId = Number(req.params.id);
    if (!Number.isInteger(stageId) || stageId <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid stage ID.' });
    }

    const db = getDb();
    const stage = await queryOne(db, 'SELECT id FROM GameStages WHERE id = ?', [stageId]);
    if (!stage) {
      return res.status(404).json({ success: false, error: 'Stage not found.' });
    }

    await db.run('BEGIN TRANSACTION');
    try {
      // Explicit cascade delete first
      await db.run('DELETE FROM Options WHERE stage_id = ?', [stageId]);
      await db.run('DELETE FROM GameStages WHERE id = ?', [stageId]);
      await db.run('COMMIT');
      saveDb();

      return res.status(200).json({
        success: true,
        message: `Stage ${stageId} and its options deleted successfully.`,
      });
    } catch (txErr) {
      await db.run('ROLLBACK');
      throw txErr;
    }
  } catch (err) {
    console.error('[deleteAdminStage] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete stage.',
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/stages/reorder
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Reorder stages atomically.
 * Request body: { orderedIds: [3, 1, 2] }
 */
async function reorderAdminStages(req, res) {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ success: false, error: 'orderedIds must be a non-empty array of stage IDs.' });
    }

    const db = getDb();
    await db.run('BEGIN TRANSACTION');
    try {
      // First set all involved step_orders to negative values to avoid UNIQUE constraint conflicts
      for (let i = 0; i < orderedIds.length; i++) {
        const id = Number(orderedIds[i]);
        if (Number.isInteger(id) && id > 0) {
          await db.run('UPDATE GameStages SET step_order = ? WHERE id = ?', [-(i + 1), id]);
        }
      }
      // Then set them to positive sequential order 1, 2, 3...
      for (let i = 0; i < orderedIds.length; i++) {
        const id = Number(orderedIds[i]);
        if (Number.isInteger(id) && id > 0) {
          await db.run('UPDATE GameStages SET step_order = ? WHERE id = ?', [i + 1, id]);
        }
      }
      await db.run('COMMIT');
      saveDb();

      return res.status(200).json({ success: true, message: 'Stages reordered successfully.' });
    } catch (txErr) {
      await db.run('ROLLBACK');
      throw txErr;
    }
  } catch (err) {
    console.error('[reorderAdminStages] Error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to reorder stages.' });
  }
}

module.exports = {
  getAdminStages,
  createAdminStage,
  updateAdminStage,
  deleteAdminStage,
  reorderAdminStages,
};
