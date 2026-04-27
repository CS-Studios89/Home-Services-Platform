const db = require('../config/db');
exports.logAdminAction = async ({
  admin_user_id,
  action,
  entity_type = null,
  entity_id = null, 
  meta = null
}) => {
  await db.query(
    `
    INSERT INTO admin_audit (admin_user_id, action, entity_type, entity_id, meta)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [admin_user_id, action, entity_type, entity_id, meta]
  );
};
