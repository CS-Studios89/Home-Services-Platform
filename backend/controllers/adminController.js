const db = require('../config/db');
const { logAdminAction } = require('../models/adminAuditModel');

const USER_STATUSES = new Set(['active', 'disabled']);
const PROVIDER_APPROVALS = new Set(['pending', 'approved', 'rejected']);
  
function parseLimitOffset(req) {
  const limitRaw = Number(req.query.limit);
  const offsetRaw = Number(req.query.offset);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;
  const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;
  return { limit, offset };
} 
 
exports.listUsers = async (req, res, next) => {
  try {
    const { limit, offset } = parseLimitOffset(req);
    const { role, status, q } = req.query;

    const where = [];
    const params = [];

    if (role) {
      params.push(role);
      where.push(`role = $${params.length}`);
    }
    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      where.push(`(email ILIKE $${params.length} OR name ILIKE $${params.length})`);
    }

    params.push(limit);
    params.push(offset);

    const sql = `
      SELECT id, email, name, role, status, created_at
      FROM users
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY id DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const result = await db.query(sql, params);
    return res.json({ items: result.rows, limit, offset });
  } catch (err) {
    return next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  let client;
  let inTransaction = false;
  try {
    const userId = Number(req.params.userId);
    const { status } = req.body;

    if (!Number.isFinite(userId) || userId < 1) {
      return res.status(400).json({ error: 'Invalid userId' });
    }
    if (!USER_STATUSES.has(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    client = await db.connect();
    await client.query('BEGIN');
    inTransaction = true;

    const updateResult = await client.query(
      `
      UPDATE users
      SET status = $1
      WHERE id = $2
      RETURNING id, email, name, role, status, created_at
      `,
      [status, userId]
    );

    if (updateResult.rowCount !== 1) {
      await client.query('ROLLBACK');
      inTransaction = false;
      return res.status(404).json({ error: 'User not found' });
    }

    if (status === 'disabled') {
      await client.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
    }

    await logAdminAction({
      admin_user_id: req.user.user_id,
      action: 'user.status.update',
      entity_type: 'user',
      entity_id: userId,
      meta: { status }
    });

    await client.query('COMMIT');
    inTransaction = false;

    return res.json(updateResult.rows[0]);
  } catch (err) {
    if (inTransaction) {
      try {
        await client.query('ROLLBACK');
      } catch (_) {}
    }
    return next(err);
  } finally {
    try {
      if (client) client.release();
    } catch (_) {}
  }
};

exports.listProviders = async (req, res, next) => {
  try {
    const { limit, offset } = parseLimitOffset(req);
    const { approved } = req.query;

    const params = [];
    const where = [];
    if (approved) {
      params.push(approved);
      where.push(`p.approved = $${params.length}`);
    }

    params.push(limit);
    params.push(offset);

    const result = await db.query(
      `
      SELECT
        p.id,
        p.user_id,
        p.approved,
        p.bio,
        p.rating_avg,
        p.rating_count,
        u.email,
        u.name,
        u.status,
        u.created_at
      FROM providers p
      JOIN users u ON u.id = p.user_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY p.id DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params
    );

    return res.json({ items: result.rows, limit, offset });
  } catch (err) {
    return next(err);
  }
};

exports.setProviderApproval = async (req, res, next) => {
  try {
    const providerId = Number(req.params.providerId);
    const { approved } = req.body;

    if (!Number.isFinite(providerId) || providerId < 1) {
      return res.status(400).json({ error: 'Invalid providerId' });
    }
    if (!PROVIDER_APPROVALS.has(approved)) {
      return res.status(400).json({ error: 'Invalid approved value' });
    }

    const result = await db.query(
      `
      UPDATE providers
      SET approved = $1
      WHERE id = $2
      RETURNING id, user_id, approved, bio, rating_avg, rating_count
      `,
      [approved, providerId]
    );

    if (result.rowCount !== 1) return res.status(404).json({ error: 'Provider not found' });

    await logAdminAction({
      admin_user_id: req.user.user_id,
      action: 'provider.approval.update',
      entity_type: 'provider',
      entity_id: providerId,
      meta: { approved }
    });

    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
};

exports.disableProvider = async (req, res, next) => {
  let client;
  let inTransaction = false;
  try {
    const providerId = Number(req.params.providerId);
    if (!Number.isFinite(providerId) || providerId < 1) {
      return res.status(400).json({ error: 'Invalid providerId' });
    }

    const reason =
      req.body && typeof req.body.reason === 'string' ? req.body.reason.trim() : null;

    client = await db.connect();
    await client.query('BEGIN');
    inTransaction = true;

    const prov = await client.query(
      `
      SELECT p.id, p.user_id, u.role
      FROM providers p
      JOIN users u ON u.id = p.user_id
      WHERE p.id = $1
      `,
      [providerId]
    );

    if (!prov.rows.length) {
      await client.query('ROLLBACK');
      inTransaction = false;
      return res.status(404).json({ error: 'Provider not found' });
    }

    if (prov.rows[0].role !== 'provider') {
      await client.query('ROLLBACK');
      inTransaction = false;
      return res.status(400).json({ error: 'User is not a provider' });
    }

    const userId = prov.rows[0].user_id;

    await client.query(`UPDATE users SET status = $1 WHERE id = $2`, [
      'disabled',
      userId
    ]);
    await client.query(`UPDATE providers SET approved = $1 WHERE id = $2`, [
      'rejected',
      providerId
    ]);
    await client.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);

    await client.query('COMMIT');
    inTransaction = false;

    await logAdminAction({
      admin_user_id: req.user.user_id,
      action: 'provider.disable',
      entity_type: 'provider',
      entity_id: providerId,
      meta: { user_id: userId, reason }
    });

    return res.json({
      provider: { id: providerId, user_id: userId, approved: 'rejected' },
      user: { id: userId, status: 'disabled' }
    });
  } catch (err) {
    if (inTransaction) {
      try {
        await client.query('ROLLBACK');
      } catch (_) {}
    }
    return next(err);
  } finally {
    try {
      if (client) client.release();
    } catch (_) {}
  }
};

exports.listServices = async (req, res, next) => {
  try {
    const { limit, offset } = parseLimitOffset(req);
    const result = await db.query(
      `
      SELECT
        s.id,
        s.name,
        COUNT(o.id)::int AS offering_count
      FROM services s
      LEFT JOIN offerings o ON o.service_id = s.id
      GROUP BY s.id, s.name
      ORDER BY LOWER(s.name) ASC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );
    return res.json({ items: result.rows, limit, offset });
  } catch (err) {
    return next(err);
  }
};

exports.createService = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const result = await db.query(
      `INSERT INTO services (name) VALUES ($1) RETURNING id, name`,
      [name.trim()]
    );

    await logAdminAction({
      admin_user_id: req.user.user_id,
      action: 'service.create',
      entity_type: 'service',
      entity_id: result.rows[0].id,
      meta: { name: result.rows[0].name }
    });

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const serviceId = Number(req.params.serviceId ?? req.params.categoryId);
    const { name } = req.body;

    if (!Number.isFinite(serviceId) || serviceId < 1) {
      return res.status(400).json({ error: 'Invalid serviceId' });
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const result = await db.query(
      `
      UPDATE services
      SET name = $1
      WHERE id = $2
      RETURNING id, name
      `,
      [name.trim(), serviceId]
    );

    if (result.rowCount !== 1) return res.status(404).json({ error: 'Service not found' });

    await logAdminAction({
      admin_user_id: req.user.user_id,
      action: 'service.update',
      entity_type: 'service',
      entity_id: serviceId,
      meta: { name: result.rows[0].name }
    });

    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const serviceId = Number(req.params.serviceId ?? req.params.categoryId);
    if (!Number.isFinite(serviceId) || serviceId < 1) {
      return res.status(400).json({ error: 'Invalid serviceId' });
    }

    const result = await db.query(`DELETE FROM services WHERE id = $1 RETURNING id`, [
      serviceId
    ]);
    if (result.rowCount !== 1) return res.status(404).json({ error: 'Service not found' });

    await logAdminAction({
      admin_user_id: req.user.user_id,
      action: 'service.delete',
      entity_type: 'service',
      entity_id: serviceId
    });

    return res.status(204).send();
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error:
          'Cannot delete this category while offerings still reference it. Remove or reassign those offerings first.'
      });
    }
    return next(err);
  }
};

exports.listAudit = async (req, res, next) => {
  try {
    const { limit, offset } = parseLimitOffset(req);
    const result = await db.query(
      `
      SELECT
        a.id,
        a.admin_user_id,
        u.email AS admin_email,
        a.action,
        a.entity_type,
        a.entity_id,
        a.meta,
        a.created_at
      FROM admin_audit a
      JOIN users u ON u.id = a.admin_user_id
      ORDER BY a.id DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );
    return res.json({ items: result.rows, limit, offset });
  } catch (err) {
    return next(err);
  }
};

