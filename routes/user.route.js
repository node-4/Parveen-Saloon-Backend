const auth = require("../controllers/userController");
const authJwt = require("../middlewares/authJwt");
const { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, userProfileUpload } = require('../middlewares/imageUpload')
const express = require("express");
const router = express()
module.exports = (app) => {
        app.post("/api/v1/user/registration", [authJwt.verifyToken], auth.registration);
        app.post("/api/v1/user/socialLogin", auth.socialLogin);
        app.post("/api/v1/user/loginWithPhone", auth.loginWithPhone);
        app.post("/api/v1/user/:id", auth.verifyOtp);
        app.post("/api/v1/user/resendOtp/:id", auth.resendOTP);
        app.get("/api/v1/user/getProfile", [authJwt.verifyToken], auth.getProfile);
        app.put("/api/v1/user/updateProfile", [authJwt.verifyToken], userProfileUpload.single('image'), auth.updateProfile);
        app.put("/api/v1/user/updateLocation", [authJwt.verifyToken], auth.updateLocation);
        app.post("/api/v1/user/address/new", [authJwt.verifyToken], auth.createAddress);
        app.get("/api/v1/user/getAddress", [authJwt.verifyToken], auth.getallAddress);
        app.put("/api/v1/user/address/:id", [authJwt.verifyToken], auth.updateAddress)
        app.delete('/api/v1/user/address/:id', [authJwt.verifyToken], auth.deleteAddress);
        app.get('/api/v1/user/address/:id', [authJwt.verifyToken], auth.getAddressbyId);
        app.get("/api/v1/user/getFreeServices", [authJwt.verifyToken], auth.getFreeServices);
        app.get("/api/v1/user/getCart", [authJwt.verifyToken], auth.getCart);
        app.get("/api/v1/user/Offer/listOffer", [authJwt.verifyToken], auth.listOffer);
        app.post("/api/v1/user/ticket/createTicket", [authJwt.verifyToken], auth.createTicket);
        app.get("/api/v1/user/ticket/listTicket", [authJwt.verifyToken], auth.listTicket);
        app.get('/api/v1/user/ticket/:id', auth.getTicketbyId);
        app.put('/api/v1/user/replyOnTicket/:id', [authJwt.verifyToken], auth.replyOnTicket);
     
}