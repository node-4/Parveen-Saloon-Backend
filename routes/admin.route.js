const auth = require("../controllers/admin.controller");
const authJwt = require("../middlewares/authJwt");
var multer = require("multer");
const path = require("path");
const express = require("express");
const router = express()
const { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, BrandUpload,E4UUpload, offerUpload } = require('../middlewares/imageUpload')

router.post("/registration", auth.registration);
router.post("/login", auth.signin);
router.put("/update", [authJwt.verifyToken], auth.update);
router.post("/Category/addCategory", [authJwt.verifyToken], categoryUpload.single('image'), auth.createCategory);
router.get("/Category/allCategory", auth.getCategories);
router.put("/Category/updateCategory/:id", [authJwt.verifyToken], categoryUpload.single('image'), auth.updateCategory);
router.delete("/Category/deleteCategory/:id", [authJwt.verifyToken], auth.removeCategory);
router.post("/SubCategory/createSubCategory", [authJwt.verifyToken], subCategoryUpload.single('image'), auth.createSubCategory);
router.get("/SubCategory/allSubCategory", auth.getSubCategories);
router.put("/SubCategory/update/:id", [authJwt.verifyToken], subCategoryUpload.single('image'), auth.updateSubCategory);
router.delete("/SubCategory/delete/:id", [authJwt.verifyToken], auth.removeSubCategory);
router.post("/FacialType/addFacialType", [authJwt.verifyToken], auth.createFacialType);
router.get("/FacialType/allFacialType", auth.getFacialTypes);
router.put("/FacialType/updateFacialType/:id", [authJwt.verifyToken], auth.updateFacialType);
router.delete("/FacialType/deleteFacialType/:id", [authJwt.verifyToken], auth.removeFacialType);
router.post("/Banner/AddBanner", [authJwt.verifyToken], bannerUpload.single('image'), auth.AddBanner);
router.get("/Banner/allBanner", auth.getBanner);
router.get("/Banner/getBannerById/:id", auth.getBannerById);
router.delete("/Banner/deleteBanner/:id", [authJwt.verifyToken], auth.DeleteBanner);
router.post("/addContactDetails", [authJwt.verifyToken], auth.addContactDetails);
router.get("/viewContactDetails", auth.viewContactDetails);
router.post('/createSubscription', auth.createSubscription);
router.get('/getSubscription', auth.getSubscription);
router.post("/Service/addService", [authJwt.verifyToken], auth.createService);
router.put("/Service/uploadService/:id", [authJwt.verifyToken], serviceUpload.array('image'), auth.updateImagesinService);
router.get("/Service/:categoryId/:subCategoryId", auth.getService);
router.get("/Service/top/:categoryId/:subCategoryId", auth.getTopSellingService);
router.delete("/Service/delete/:id", [authJwt.verifyToken], auth.removeService);
router.put("/Service/update/:id", [authJwt.verifyToken], auth.updateService);
router.post("/Charges/addCharges", [authJwt.verifyToken], auth.createCharge);
router.get("/Charges/allCharges", auth.getCharges);
router.put("/Charges/updateCharges/:id", [authJwt.verifyToken], auth.updateCharge);
router.delete("/Charges/deleteCharges/:id", [authJwt.verifyToken], auth.removeCharge);
router.post("/FreeService/addFreeService", [authJwt.verifyToken], auth.createFreeService);
router.get("/FreeService/allFreeService", auth.getFreeServices);
router.put("/FreeService/updateFreeService/:id", [authJwt.verifyToken], auth.updateFreeServices);
router.delete("/FreeService/deleteFreeService/:id", [authJwt.verifyToken], auth.removeFreeServices);
router.post("/Coupan/addCoupan", [authJwt.verifyToken], auth.addCoupan);
router.get("/Coupan/listCoupan", [authJwt.verifyToken], auth.listCoupan);
router.post("/Brand/addBrand", [authJwt.verifyToken], BrandUpload.single('image'), auth.createBrands);
router.get("/Brand/allBrand", auth.getBrands);
router.put("/Brand/updateBrand/:id", [authJwt.verifyToken], BrandUpload.single('image'), auth.updateBrand);
router.delete("/Brand/deleteBrand/:id", [authJwt.verifyToken], auth.removeBrand);
router.post("/weCanhelpyou/createweCanhelpyou", [authJwt.verifyToken], auth.createweCanhelpyou);
router.get("/weCanhelpyou/getAllweCanhelpyou/:type", auth.getAllweCanhelpyou);
router.get("/weCanhelpyou/getweCanhelpyouById/:id", auth.getweCanhelpyouById);
router.put("/weCanhelpyou/updateweCanhelpyou/:id", [authJwt.verifyToken], auth.updateweCanhelpyou);
router.delete("/weCanhelpyou/deleteweCanhelpyou/:id", [authJwt.verifyToken], auth.deleteweCanhelpyou);
router.post("/E4u/createE4u", [authJwt.verifyToken],E4UUpload.single('image'), auth.createE4u);
router.get("/E4u/getE4uByType/:type", auth.getE4uByType);
router.get("/E4u/getE4u", auth.getE4u);
router.put("/E4u/updateE4u/:id", [authJwt.verifyToken],E4UUpload.single('image'), auth.updateE4u);
router.delete("/E4u/removeE4u/:id", [authJwt.verifyToken], auth.removeE4u);
router.get("/Feedback/getById/:id", auth.getById);
router.get("/Feedback/getAllfeedback", auth.getAllfeedback);
router.delete("/Feedback/DeleteFeedback/:id", [authJwt.verifyToken], auth.DeleteFeedback);
router.post("/Offer/addOffer", [authJwt.verifyToken],offerUpload.single('image'), auth.addOffer);
router.get("/Offer/listOffer", [authJwt.verifyToken], auth.listOffer);
module.exports = router;