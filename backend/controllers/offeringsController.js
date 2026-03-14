const offeringsModel = require('../models/offeringsModel');

exports.getOfferings = async (req, res, next) => {
    try {
        let offers = await offeringsModel.fetchOffers();
        return res.json(offers);
    } catch (err) {
        next(err);
    }
}
