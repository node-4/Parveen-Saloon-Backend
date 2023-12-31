const auth = require("../controllers/user.controller");
const authJwt = require("../../middlewares/authJwt");
const { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, userProfileUpload } = require('../../middlewares/imageUpload')
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
        app.post("/api/v1/user/Cart/addToCart", [authJwt.verifyToken], auth.addToCart);
        app.put("/api/v1/user/Cart/provideTip", [authJwt.verifyToken], auth.provideTip);
        app.get("/api/v1/user/Coupan/listCoupan", [authJwt.verifyToken], auth.listCoupan);
        app.put("/api/v1/user/Cart/applyCoupan", [authJwt.verifyToken], auth.applyCoupan);
        app.put("/api/v1/user/Cart/applyWallet", [authJwt.verifyToken], auth.applyWallet);
        app.put("/api/v1/user/Cart/addFreeServiceToCart", [authJwt.verifyToken], auth.addFreeServiceToCart);
        app.put("/api/v1/user/Cart/addSuggestionToCart", [authJwt.verifyToken], auth.addSuggestionToCart);
        app.put("/api/v1/user/Cart/addAdressToCart/:id", [authJwt.verifyToken], auth.addAdressToCart);
        app.put("/api/v1/user/Cart/addDateAndTimeToCart", [authJwt.verifyToken], auth.addDateAndTimeToCart);
        app.post("/api/v1/user/Cart/checkout", [authJwt.verifyToken], auth.checkout);
        app.post("/api/v1/user/Cart/placeOrder/:orderId", [authJwt.verifyToken], auth.placeOrder);
        app.post("/api/v1/user/Cart/cancelOrder/:orderId", [authJwt.verifyToken], auth.cancelOrder);
        app.get('/api/v1/user/getOngoingOrders', [authJwt.verifyToken], auth.getOngoingOrders);
        app.get('/api/v1/user/getCompleteOrders', [authJwt.verifyToken], auth.getCompleteOrders);
        app.get("/api/v1/user/getOrder/:id", [authJwt.verifyToken], auth.getOrder);
        app.post("/api/v1/user/Feedback/AddFeedback", [authJwt.verifyToken], auth.AddFeedback);
        app.post("/api/v1/user/FavouriteBooking/addFavouriteBooking/:orderId", [authJwt.verifyToken], auth.addFavouriteBooking);
        app.get("/api/v1/user/FavouriteBooking/listFavouriteBooking", [authJwt.verifyToken], auth.listFavouriteBooking);
}