const jwt = require('jsonwebtoken');
const offeringsModel = require('../models/offeringsModel');
const userModel = require('../models/usersModel');

exports.getOfferings = async (req, res, next) => {
    try {
        let offers = await offeringsModel.fetchOffers();
        return res.json(offers);
    } catch (err) {
        next(err);
    }
}

exports.getOfferingsWithFilters = async (req, res, next) => {
    try{
        const filters = req.body.filters || {};
        let offers = await offeringsModel.fetchFilteredOffers(filters);
        return res.json(offers);
    }
    catch(err){
        next(err);
    }
}

exports.getProviderOffers = async (req, res, next) => {
    try {

        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // attach user_id
        const { user_id } = payload;

        if(!userModel.isAProvider(user_id)){
            return res.status(401).json({message : "You are not a provider"});
        }

        let offers = await offeringsModel.fetchProviderOffers(user_id);
        return res.json(offers);
    } catch (err) {
        next(err);
    }
}

exports.createProviderOffer = async (req, res, next) => {
    try {

        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = payload; // attach user_id
        const { user_id } = payload;

        let isProvider = await userModel.isAProvider(user_id);
        if(!isProvider){
            return res.status(401).json({message : "You are not a provider"});
        }

        const { offer } = req.body;

        if(!offer.service_id || !offer.title || offer.rate === null || offer.rate === undefined || 
            !offer.curr || offer.active === null || offer.active === undefined){
                return res.status(401).json({message : "Please fill all required fields"});
        }

        const resultt = await offeringsModel.createOffer(user_id, offer);
        if(!resultt){
            return res.status(401).json({message : "Failed to create offer"});
        }

        return res.json({success : true, offerId : resultt});
    } catch (err) {
        next(err);
    }
}

exports.editProviderOffer = async (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = payload; // attach user_id
        const { user_id } = payload;

        const isProvider = await userModel.isAProvider(user_id);
        if(!isProvider){
            return res.status(401).json({message : "You are not a provider"});
        }

        const offeringId = req.params.offeringId;
        if(!offeringId){
            return res.status(401).json({message : "Invalid Offering Id"});
        }

        const isOfferOwner = await userModel.isOfferOwner(user_id, offeringId);
        if(!isOfferOwner){
            return res.status(401).json({message : "You are not the owner of this offering"});
        }

        const { offer } = req.body;

        if(!offer.title || offer.rate == null || offer.rate == undefined ||
            !offer.curr || offer.active == null || offer.active == undefined || !offer.service_id){
                return res.status(401).json({message : "Please fill all required fields"});
        }

        const patchResult = await offeringsModel.updateOffer(offeringId, offer);
        if(!patchResult){
            return res.status(401).json({message : "Failed to update offer data"});
        }

        return res.json({success: true});
    }
    catch(err){
        next(err);
    }
}

exports.deleteProviderOffer = async (req, res, next) => { 
    try{
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = payload; // attach user_id
        const { user_id } = payload;

        const isProvider = await userModel.isAProvider(user_id);
        if(!isProvider){
            return res.status(401).json({message : "You are not a provider"});
        }

        const offeringId = req.params.offeringId;
        if(!offeringId){
            return res.status(401).json({message : "Invalid Offering Id"});
        }

        const isOfferOwner = await userModel.isOfferOwner(user_id, offeringId);
        if(!isOfferOwner){
            return res.status(401).json({message : "You are not the owner of this offering"});
        }

        const deleteResult = await offeringsModel.deleteOffer(offeringId);
        if(!deleteResult){
            return res.status(401).json({message : "Failed to delete offer"});
        }

        return res.json({success: true});
    }
    catch(err){
        next(err);
    }
}