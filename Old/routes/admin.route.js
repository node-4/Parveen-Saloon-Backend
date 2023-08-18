const auth = require("../controllers/admin.controller");
const authJwt = require("../middlewares/authJwt");
var multer = require("multer");
const path = require("path");
const express = require("express");
const router = express()
const { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, BrandUpload, E4UUpload, offerUpload } = require('../middlewares/imageUpload')
module.exports = (app) => {
        app.post("/api/v1/admin/registration", auth.registration);
        app.post("/api/v1/admin/login", auth.signin);
        app.put("/api/v1/admin/update", [authJwt.verifyToken], auth.update);
        app.post("/api/v1/admin/Category/addCategory", [authJwt.verifyToken], categoryUpload.single('image'), auth.createCategory);
        app.get("/api/v1/admin/Category/allCategory", auth.getCategories);
        app.put("/api/v1/admin/Category/updateCategory/:id", [authJwt.verifyToken], categoryUpload.single('image'), auth.updateCategory);
        app.delete("/api/v1/admin/Category/deleteCategory/:id", [authJwt.verifyToken], auth.removeCategory);
        app.post("/api/v1/admin/SubCategory/createSubCategory", [authJwt.verifyToken], subCategoryUpload.single('image'), auth.createSubCategory);
        app.get("/api/v1/admin/SubCategory/allSubCategory", auth.getSubCategories);
        app.put("/api/v1/admin/SubCategory/update/:id", [authJwt.verifyToken], subCategoryUpload.single('image'), auth.updateSubCategory);
        app.delete("/api/v1/admin/SubCategory/delete/:id", [authJwt.verifyToken], auth.removeSubCategory);
        app.post("/api/v1/admin/FacialType/addFacialType", [authJwt.verifyToken], auth.createFacialType);
        app.get("/api/v1/admin/FacialType/allFacialType", auth.getFacialTypes);
        app.put("/api/v1/admin/FacialType/updateFacialType/:id", [authJwt.verifyToken], auth.updateFacialType);
        app.delete("/api/v1/admin/FacialType/deleteFacialType/:id", [authJwt.verifyToken], auth.removeFacialType);
        app.post("/api/v1/admin/Banner/AddBanner", [authJwt.verifyToken], bannerUpload.single('image'), auth.AddBanner);
        app.get("/api/v1/admin/Banner/allBanner", auth.getBanner);
        app.get("/api/v1/admin/Banner/getBannerById/:id", auth.getBannerById);
        app.delete("/api/v1/admin/Banner/deleteBanner/:id", [authJwt.verifyToken], auth.DeleteBanner);
        app.post("/api/v1/admin/addContactDetails", [authJwt.verifyToken], auth.addContactDetails);
        app.get("/api/v1/admin/viewContactDetails", auth.viewContactDetails);
        app.post('/api/v1/admin/createSubscription', auth.createSubscription);
        app.get('/api/v1/admin/getSubscription', auth.getSubscription);
        app.post("/api/v1/admin/Service/addService", [authJwt.verifyToken], auth.createService);
        app.put("/api/v1/admin/Service/uploadService/:id", [authJwt.verifyToken], serviceUpload.array('image'), auth.updateImagesinService);
        app.get("/api/v1/admin/Service/:categoryId/:subCategoryId", auth.getService);
        app.get("/api/v1/admin/Service/top/:categoryId/:subCategoryId", auth.getTopSellingService);
        app.delete("/api/v1/admin/Service/delete/:id", [authJwt.verifyToken], auth.removeService);
        app.put("/api/v1/admin/Service/update/:id", [authJwt.verifyToken], auth.updateService);
        app.post("/api/v1/admin/Charges/addCharges", [authJwt.verifyToken], auth.createCharge);
        app.get("/api/v1/admin/Charges/allCharges", auth.getCharges);
        app.put("/api/v1/admin/Charges/updateCharges/:id", [authJwt.verifyToken], auth.updateCharge);
        app.delete("/api/v1/admin/Charges/deleteCharges/:id", [authJwt.verifyToken], auth.removeCharge);
        app.post("/api/v1/admin/FreeService/addFreeService", [authJwt.verifyToken], auth.createFreeService);
        app.get("/api/v1/admin/FreeService/allFreeService", auth.getFreeServices);
        app.put("/api/v1/admin/FreeService/updateFreeService/:id", [authJwt.verifyToken], auth.updateFreeServices);
        app.delete("/api/v1/admin/FreeService/deleteFreeService/:id", [authJwt.verifyToken], auth.removeFreeServices);
        app.post("/api/v1/admin/Coupan/addCoupan", [authJwt.verifyToken], auth.addCoupan);
        app.get("/api/v1/admin/Coupan/listCoupan", [authJwt.verifyToken], auth.listCoupan);
        app.post("/api/v1/admin/Brand/addBrand", [authJwt.verifyToken], BrandUpload.single('image'), auth.createBrands);
        app.get("/api/v1/admin/Brand/allBrand", auth.getBrands);
        app.put("/api/v1/admin/Brand/updateBrand/:id", [authJwt.verifyToken], BrandUpload.single('image'), auth.updateBrand);
        app.delete("/api/v1/admin/Brand/deleteBrand/:id", [authJwt.verifyToken], auth.removeBrand);
        app.post("/api/v1/admin/weCanhelpyou/createweCanhelpyou", [authJwt.verifyToken], auth.createweCanhelpyou);
        app.get("/api/v1/admin/weCanhelpyou/getAllweCanhelpyou/:type", auth.getAllweCanhelpyou);
        app.get("/api/v1/admin/weCanhelpyou/getweCanhelpyouById/:id", auth.getweCanhelpyouById);
        app.put("/api/v1/admin/weCanhelpyou/updateweCanhelpyou/:id", [authJwt.verifyToken], auth.updateweCanhelpyou);
        app.delete("/api/v1/admin/weCanhelpyou/deleteweCanhelpyou/:id", [authJwt.verifyToken], auth.deleteweCanhelpyou);
        app.post("/api/v1/admin/E4u/createE4u", [authJwt.verifyToken], E4UUpload.single('image'), auth.createE4u);
        app.get("/api/v1/admin/E4u/getE4uByType/:type", auth.getE4uByType);
        app.get("/api/v1/admin/E4u/getE4u", auth.getE4u);
        app.put("/api/v1/admin/E4u/updateE4u/:id", [authJwt.verifyToken], E4UUpload.single('image'), auth.updateE4u);
        app.delete("/api/v1/admin/E4u/removeE4u/:id", [authJwt.verifyToken], auth.removeE4u);
        app.get("/api/v1/admin/Feedback/getById/:id", auth.getById);
        app.get("/api/v1/admin/Feedback/getAllfeedback", auth.getAllfeedback);
        app.delete("/api/v1/admin/Feedback/DeleteFeedback/:id", [authJwt.verifyToken], auth.DeleteFeedback);
        app.post("/api/v1/admin/Offer/addOffer", [authJwt.verifyToken], offerUpload.single('image'), auth.addOffer);
        app.get("/api/v1/admin/Offer/listOffer", [authJwt.verifyToken], auth.listOffer);
        app.get("/api/v1/admin/ticket/listTicket", [authJwt.verifyToken], auth.listTicket);
        app.put('/api/v1/admin/replyOnTicket/:id', [authJwt.verifyToken], auth.replyOnTicket);
        app.put('/api/v1/admin/closeTicket/:id', [authJwt.verifyToken], auth.closeTicket);
        app.get('/api/v1/admin/getOrders', [authJwt.verifyToken], auth.getOrders);
        app.put('/api/v1/admin/assignOrder/:userId/:orderId', [authJwt.verifyToken], auth.assignOrder);
}