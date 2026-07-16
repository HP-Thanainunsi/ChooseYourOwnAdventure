/**
 * middleware/auth.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Simple admin authentication middleware.
 * Verifies requests against a secret token (`admin_secret_token` by default).
 *
 * Supports:
 *   - Authorization header: "Bearer admin_secret_token"
 *   - Custom header:        "x-admin-token: admin_secret_token"
 *   - Query parameter:      "?token=admin_secret_token" (convenient for testing)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

function isAdmin(req, res, next) {
  const authHeader  = req.headers.authorization;
  const xAdminToken = req.headers['x-admin-token'];
  const queryToken  = req.query.token;

  let token = null;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (xAdminToken) {
    token = xAdminToken.trim();
  } else if (queryToken) {
    token = queryToken.trim();
  }

  const SECRET_ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN || 'admin_secret_token';

  if (!token || token !== SECRET_ADMIN_TOKEN) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Valid admin token required (e.g. Authorization: Bearer admin_secret_token).',
    });
  }

  next();
}

module.exports = { isAdmin };
