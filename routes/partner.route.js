const auth = require("../controllers/partnerController");
const leaveController = require('../controllers/leavesController');
const HelpLines = require('../controllers/helpLinesController');

const authJwt = require("../middlewares/authJwt");
const { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, userProfileUpload, spAgreementUpload } = require('../middlewares/imageUpload')
const express = require("express");
const app = express()
module.exports = (app) => {
        app.post("/api/v1/partner/registration", auth.partnerRegistration);
        app.post("/api/v1/partner/:id", auth.verifyOtp);
        app.put("/api/v1/partner/changePassword", [authJwt.verifyToken], auth.changePassword);
        app.post("/api/v1/partner-signin", auth.signin);
        app.post("/api/v1/partner/reset/Password", auth.reSetPassword);
        app.get('/api/v1/partner/getAllOrders', [authJwt.verifyToken], auth.getAllOrders);
        app.get('/api/v1/partner/getTodayOrders', [authJwt.verifyToken], auth.getTodayOrders);
        app.get('/api/v1/partner/getTomorrowOrders', [authJwt.verifyToken], auth.getTomorrowOrders);
        app.post('/api/v1/partner-leaves', [authJwt.verifyToken], leaveController.createLeave);
        app.get('/api/v1/partner/leaves', [authJwt.verifyToken], leaveController.getAllLeaves);
        app.get('/api/v1/partner/leaves/:id', [authJwt.verifyToken], leaveController.getLeaveById);
        app.post("/api/v1/partner/help/contact", [authJwt.verifyToken], HelpLines.createHelpLine);
        app.get("/api/v1/partner/help/contact", [authJwt.verifyToken], HelpLines.getAllHelpLines);
        app.post('/api/v1/partner-sp-agreements', authJwt.verifyToken, spAgreementUpload.fields([
                { name: 'photo', maxCount: 1 },
                { name: 'agreementDocument', maxCount: 1 },
                { name: 'aadharFrontImage', maxCount: 1 },
                { name: 'aadharBackImage', maxCount: 1 },
                { name: 'panCardImage', maxCount: 1 }
        ]), auth.createSPAgreement);
        app.get('/api/v1/partner-sp-agreements', authJwt.verifyToken, auth.getAllSPAgreements);
        app.get('/api/v1/partner-sp-agreements/:id', authJwt.verifyToken, auth.getSPAgreementById);
        app.put('/api/v1/partner-sp-agreements/:id', authJwt.verifyToken, spAgreementUpload.fields([
                { name: 'photo', maxCount: 1 },
                { name: 'agreementDocument', maxCount: 1 },
                { name: 'aadharFrontImage', maxCount: 1 },
                { name: 'aadharBackImage', maxCount: 1 },
                { name: 'panCardImage', maxCount: 1 }
        ]), auth.updateSPAgreement);




}