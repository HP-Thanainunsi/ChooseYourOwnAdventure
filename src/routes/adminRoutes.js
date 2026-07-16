/**
 * routes/adminRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Defines admin routes for managing GameStages and Options under /api/admin.
 * All endpoints are protected by the isAdmin middleware.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { Router } = require('express');
const { isAdmin } = require('../middleware/auth');
const {
  getAdminStages,
  createAdminStage,
  updateAdminStage,
  deleteAdminStage,
  reorderAdminStages,
} = require('../controllers/adminController');

const router = Router();

// Protect all admin routes with isAdmin middleware
router.use(isAdmin);

/**
 * GET /api/admin/stages
 * Fetch all stages with their options, ordered by step_order (including score_weight).
 */
router.get('/stages', getAdminStages);

/**
 * POST /api/admin/stages
 * Create a new stage along with its options in a single transaction.
 */
router.post('/stages', createAdminStage);

/**
 * PUT /api/admin/stages/reorder
 * Reorder stages atomically. Must be registered BEFORE /stages/:id
 */
router.put('/stages/reorder', reorderAdminStages);

/**
 * PUT /api/admin/stages/:id
 * Update an existing stage and its options.
 */
router.put('/stages/:id', updateAdminStage);

/**
 * DELETE /api/admin/stages/:id
 * Delete a stage and cascade delete its options.
 */
router.delete('/stages/:id', deleteAdminStage);

module.exports = router;
