const staticContent = require('../controllers/static.Controller');
const { authJwt, authorizeRoles } = require("../middlewares");

const express = require("express");
const router = express();
    router.post('/createAboutus', [authJwt.verifyToken], staticContent.createAboutUs);
    router.put('/aboutUs/:id', [authJwt.verifyToken], staticContent.updateAboutUs);
    router.delete('/aboutUs/:id', [authJwt.verifyToken], staticContent.deleteAboutUs);
    router.get('/getAboutUs', staticContent.getAboutUs);
    router.get('/aboutUs/:id', staticContent.getAboutUsById);
    router.post('/createPrivacy', [authJwt.verifyToken], staticContent.createPrivacy);
    router.put('/privacy/:id', [authJwt.verifyToken], staticContent.updatePrivacy);
    router.delete('/privacy/:id', [authJwt.verifyToken], staticContent.deletePrivacy);
    router.get('/getPrivacy', staticContent.getPrivacy);
    router.get('/privacy/:id', staticContent.getPrivacybyId);
    router.post('/createTerms', [authJwt.verifyToken], staticContent.createTerms);
    router.put('/terms/:id', [authJwt.verifyToken], staticContent.updateTerms);
    router.delete('/terms/:id', [authJwt.verifyToken], staticContent.deleteTerms);
    router.get('/getTerms', staticContent.getTerms);
    router.get('/terms/:id', staticContent.getTermsbyId);
    router.post("/faq/createFaq", [authJwt.verifyToken], staticContent.createFaq);
    router.put("/faq/:id", [authJwt.verifyToken], staticContent.updateFaq);
    router.delete("/faq/:id", [authJwt.verifyToken], staticContent.deleteFaq);
    router.get("/faq/All", staticContent.getAllFaqs);
    router.get("/faq/:id", staticContent.getFaqById);
module.exports = router;