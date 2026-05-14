const db = require('../config/db');



function toInt(value) {

  const n = Number.parseInt(String(value), 10);

  return Number.isFinite(n) ? n : null;

}



exports.getReviewByBookingId = async (req, res, next) => {

  try {

    const bookingId = toInt(req.params.bookingId);

    if (!bookingId) return res.status(400).json({ message: 'Invalid bookingId' });



    const r = await db.query(

      `SELECT id, booking_id, user_id, rating, note, created_at

       FROM reviews

       WHERE booking_id = $1`,

      [bookingId]

    );



    if (!r.rows.length) return res.status(404).json({ message: 'Review not found' });

    return res.json(r.rows[0]);

  } catch (err) {

    next(err);

  }

};



exports.listReviewsForProvider = async (req, res, next) => {

  try {

    const providerId = toInt(req.params.providerId);

    if (!providerId) return res.status(400).json({ message: 'Invalid providerId' });



    const r = await db.query(

      `SELECT rv.id,

              rv.booking_id,

              rv.user_id,

              u.name AS user_name,

              rv.rating,

              rv.note,

              rv.created_at

       FROM reviews rv

       JOIN bookings b ON b.id = rv.booking_id

       JOIN order_items oi ON oi.id = b.order_item_id

       JOIN offerings o ON o.id = oi.offering_id

       JOIN providers p ON p.id = o.provider_id

       JOIN users u ON u.id = rv.user_id

       WHERE p.id = $1

       ORDER BY rv.created_at DESC`,

      [providerId]

    );



    return res.json(r.rows);

  } catch (err) {

    next(err);

  }

};



exports.listReviewsForOffering = async (req, res, next) => {

  try {

    const offeringId = toInt(req.params.offeringId);

    if (!offeringId) return res.status(400).json({ message: 'Invalid offeringId' });



    const r = await db.query(

      `SELECT rv.id,

              rv.booking_id,

              rv.user_id,

              u.name AS user_name,

              rv.rating,

              rv.note,

              rv.created_at

       FROM reviews rv

       JOIN bookings b ON b.id = rv.booking_id

       JOIN order_items oi ON oi.id = b.order_item_id

       JOIN users u ON u.id = rv.user_id

       WHERE oi.offering_id = $1

       ORDER BY rv.created_at DESC`,

      [offeringId]

    );



    return res.json(r.rows);

  } catch (err) {

    next(err);

  }

};



exports.createReview = async (req, res, next) => {

  let client;

  let inTx = false;

  try {

    const userId = req.user?.user_id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });



    const bookingId = toInt(req.body?.booking_id);

    const rating = toInt(req.body?.rating);

    const note = req.body?.note != null ? String(req.body.note) : null;



    if (!bookingId || !rating) {

      return res.status(400).json({ message: 'booking_id and rating are required' });

    }

    if (rating < 1 || rating > 5) {

      return res.status(400).json({ message: 'rating must be between 1 and 5' });

    }

    if (note && note.length > 1000) {

      return res.status(400).json({ message: 'note is too long (max 1000 chars)' });

    }



    client = await db.connect();

    await client.query('BEGIN');

    inTx = true;



    const booking = await client.query(

      `SELECT b.id, b.user_id, oi.offering_id, o.provider_id

       FROM bookings b

       JOIN order_items oi ON oi.id = b.order_item_id

       JOIN offerings o ON o.id = oi.offering_id

       WHERE b.id = $1`,

      [bookingId]

    );

    if (!booking.rows.length) {

      await client.query('ROLLBACK');

      inTx = false;

      return res.status(404).json({ message: 'Booking not found' });

    }

    if (booking.rows[0].user_id !== userId) {

      await client.query('ROLLBACK');

      inTx = false;

      return res.status(403).json({ message: 'You can only review your own booking' });

    }



    const existing = await client.query(`SELECT id FROM reviews WHERE booking_id = $1`, [bookingId]);

    if (existing.rows.length) {

      await client.query('ROLLBACK');

      inTx = false;

      return res.status(409).json({ message: 'Booking already reviewed' });

    }



    const inserted = await client.query(

      `INSERT INTO reviews(booking_id, user_id, rating, note)

       VALUES ($1, $2, $3, $4)

       RETURNING id, booking_id, user_id, rating, note, created_at`,

      [bookingId, userId, rating, note]

    );



    const providerId = booking.rows[0].provider_id;

    const p = await client.query(`SELECT rating_avg, rating_count FROM providers WHERE id = $1`, [

      providerId

    ]);

    if (p.rows.length) {

      const avg = Number(p.rows[0].rating_avg) || 0;

      const count = Number(p.rows[0].rating_count) || 0;

      const newCount = count + 1;

      const newAvg = (avg * count + rating) / newCount;

      await client.query(

        `UPDATE providers

         SET rating_avg = $2, rating_count = $3

         WHERE id = $1`,

        [providerId, newAvg, newCount]

      );

    }



    await client.query('COMMIT');

    inTx = false;



    return res.status(201).json(inserted.rows[0]);

  } catch (err) {

    if (inTx) {

      try {

        await client.query('ROLLBACK');

      } catch (_) {}

    }

    next(err);

  } finally {

    try {

      if (client) client.release();

    } catch (_) {}

  }

};



