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
router.put("/updateProfile", [authJwt.verifyToken],userProfileUpload.single('image'), auth.updateProfile);
router.put("/updateLocation", [authJwt.verifyToken], auth.updateLocation);
router.post("/address/new", [authJwt.verifyToken], auth.createAddress);
router.get("/getAddress", [authJwt.verifyToken], auth.getallAddress);
router.put("/address/:id", [authJwt.verifyToken], auth.updateAddress)
router.delete('/address/:id', [authJwt.verifyToken], auth.deleteAddress);
router.get('/address/:id', [authJwt.verifyToken], auth.getAddressbyId);
module.exports = router;