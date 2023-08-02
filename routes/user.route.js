const auth = require("../controllers/user.controller");
const authJwt = require("../middlewares/authJwt");
const { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, userProfileUpload } = require('../middlewares/imageUpload')

const express = require("express");
const router = express()
router.post("/registration", [authJwt.verifyToken], auth.registration);
router.post("/socialLogin", auth.socialLogin);
router.post("/loginWithPhone", auth.loginWithPhone);
router.post("/:id", auth.verifyOtp);
router.post("/resendOtp/:id", auth.resendOTP);
router.get("/getProfile", [authJwt.verifyToken], auth.getProfile);
router.put("/updateProfile", [authJwt.verifyToken], userProfileUpload.single('image'), auth.updateProfile);
router.put("/updateLocation", [authJwt.verifyToken], auth.updateLocation);
router.post("/address/new", [authJwt.verifyToken], auth.createAddress);
router.get("/getAddress", [authJwt.verifyToken], auth.getallAddress);
router.put("/address/:id", [authJwt.verifyToken], auth.updateAddress)
router.delete('/address/:id', [authJwt.verifyToken], auth.deleteAddress);
router.get('/address/:id', [authJwt.verifyToken], auth.getAddressbyId);
router.get("/getFreeServices", [authJwt.verifyToken], auth.getFreeServices);
router.get("/getCart", [authJwt.verifyToken], auth.getCart);
router.post("/Cart/addToCart", [authJwt.verifyToken], auth.addToCart);
router.put("/Cart/provideTip", [authJwt.verifyToken], auth.provideTip);
router.get("/Coupan/listCoupan", [authJwt.verifyToken], auth.listCoupan);
router.put("/Cart/applyCoupan", [authJwt.verifyToken], auth.applyCoupan);
router.put("/Cart/applyWallet", [authJwt.verifyToken], auth.applyWallet);
router.put("/Cart/addFreeServiceToCart", [authJwt.verifyToken], auth.addFreeServiceToCart);
router.put("/Cart/addSuggestionToCart", [authJwt.verifyToken], auth.addSuggestionToCart);
router.put("/Cart/addAdressToCart/:id", [authJwt.verifyToken], auth.addAdressToCart);
router.put("/Cart/addDateAndTimeToCart", [authJwt.verifyToken], auth.addDateAndTimeToCart);
router.post("/Cart/checkout", [authJwt.verifyToken], auth.checkout);
router.post("/Cart/placeOrder/:orderId", [authJwt.verifyToken], auth.placeOrder);
router.post("/Cart/cancelOrder/:orderId", [authJwt.verifyToken], auth.cancelOrder);
router.get('/getOngoingOrders', [authJwt.verifyToken], auth.getOngoingOrders);
router.get('/getCompleteOrders', [authJwt.verifyToken], auth.getCompleteOrders);
router.get("/getOrder/:id", [authJwt.verifyToken], auth.getOrder);
router.post("/Feedback/AddFeedback", [authJwt.verifyToken], auth.AddFeedback);
router.get("/Offer/listOffer", [authJwt.verifyToken], auth.listOffer);

module.exports = router;