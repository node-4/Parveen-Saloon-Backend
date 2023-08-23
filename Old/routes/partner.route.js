const auth = require("../controllers/partnerController");
const authJwt = require("../middlewares/authJwt");
const { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, userProfileUpload } = require('../middlewares/imageUpload')
const express = require("express");
const router = express()
module.exports = (app) => {
        app.post("/api/v1/partner/registration", auth.partnerRegistration);
        app.post("/api/v1/partner/:id", auth.verifyOtp);
        app.put("/api/v1/partner/changePassword", [authJwt.verifyToken], auth.changePassword);
        app.post("/api/v1/partner/signin", auth.signin);
        app.post("/api/v1/partner/reset/Password", auth.reSetPassword);

        app.get('/api/v1/partner/getRating', [authJwt.verifyToken], auth.getRating);
}