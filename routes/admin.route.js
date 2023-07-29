const auth = require("../controllers/admin.controller");
const authJwt = require("../middlewares/authJwt");
var multer = require("multer");
const path = require("path");
const express = require("express");
const router = express()
const { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload,categoryUpload } = require('../middlewares/imageUpload')

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
router.post("/Banner/AddBanner", [authJwt.verifyToken], bannerUpload.single('image'), auth.AddBanner);
router.get("/Banner/allBanner", auth.getBanner);
router.get("/Banner/getBannerById/:id", auth.getBannerById);
router.delete("/Banner/deleteBanner/:id", [authJwt.verifyToken], auth.DeleteBanner);
router.post("/addContactDetails", [authJwt.verifyToken], auth.addContactDetails);
router.get("/viewContactDetails", auth.viewContactDetails);
router.post('/createSubscription', auth.createSubscription);
router.get('/getSubscription', auth.getSubscription);
module.exports = router;