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
        app.post("/api/v1/admin/Banner/AddBanner", [authJwt.verifyToken], bannerUpload.single('image'), auth.AddBanner);
        app.get("/api/v1/admin/Banner/allBanner", auth.getBanner);
        app.get("/api/v1/admin/Banner/getBannerById/:id", auth.getBannerById);
        app.delete("/api/v1/admin/Banner/deleteBanner/:id", [authJwt.verifyToken], auth.DeleteBanner);
        app.post("/api/v1/admin/Brand/addBrand", [authJwt.verifyToken], BrandUpload.single('image'), auth.createBrands);
        app.get("/api/v1/admin/Brand/allBrand", auth.getBrands);
        app.put("/api/v1/admin/Brand/updateBrand/:id", [authJwt.verifyToken], BrandUpload.single('image'), auth.updateBrand);
        app.delete("/api/v1/admin/Brand/deleteBrand/:id", [authJwt.verifyToken], auth.removeBrand);
        app.post("/api/v1/admin/Charges/addCharges", [authJwt.verifyToken], auth.createCharge);
        app.get("/api/v1/admin/Charges/allCharges", auth.getCharges);
        app.put("/api/v1/admin/Charges/updateCharges/:id", [authJwt.verifyToken], auth.updateCharge);
        app.delete("/api/v1/admin/Charges/deleteCharges/:id", [authJwt.verifyToken], auth.removeCharge);
        app.post("/api/v1/admin/addContactDetails", [authJwt.verifyToken], auth.addContactDetails);
        app.get("/api/v1/admin/viewContactDetails", auth.viewContactDetails);
        app.post("/api/v1/admin/E4u/createE4u", [authJwt.verifyToken], E4UUpload.single('image'), auth.createE4u);
        app.get("/api/v1/admin/E4u/getE4uByType/:type", auth.getE4uByType);
        app.get("/api/v1/admin/E4u/getE4u", auth.getE4u);
        app.put("/api/v1/admin/E4u/updateE4u/:id", [authJwt.verifyToken], E4UUpload.single('image'), auth.updateE4u);
        app.delete("/api/v1/admin/E4u/removeE4u/:id", [authJwt.verifyToken], auth.removeE4u);
        app.post("/api/v1/admin/weCanhelpyou/createweCanhelpyou", [authJwt.verifyToken], auth.createweCanhelpyou);
        app.get("/api/v1/admin/weCanhelpyou/getAllweCanhelpyou/:type", auth.getAllweCanhelpyou);
        app.get("/api/v1/admin/weCanhelpyou/getweCanhelpyouById/:id", auth.getweCanhelpyouById);
        app.put("/api/v1/admin/weCanhelpyou/updateweCanhelpyou/:id", [authJwt.verifyToken], auth.updateweCanhelpyou);
        app.delete("/api/v1/admin/weCanhelpyou/deleteweCanhelpyou/:id", [authJwt.verifyToken], auth.deleteweCanhelpyou);
        app.get("/api/v1/admin/ticket/listTicket", [authJwt.verifyToken], auth.listTicket);
        app.put('/api/v1/admin/replyOnTicket/:id', [authJwt.verifyToken], auth.replyOnTicket);
        app.put('/api/v1/admin/closeTicket/:id', [authJwt.verifyToken], auth.closeTicket);
        app.post("/api/v1/admin/Coupan/addCoupan", [authJwt.verifyToken], auth.addCoupan);
        app.get("/api/v1/admin/Coupan/listCoupan", [authJwt.verifyToken], auth.listCoupan);
        app.get("/api/v1/admin/Feedback/getById/:id", auth.getById);
        app.get("/api/v1/admin/Feedback/getAllfeedback", auth.getAllfeedback);
        app.delete("/api/v1/admin/Feedback/DeleteFeedback/:id", [authJwt.verifyToken], auth.DeleteFeedback);
        app.post("/api/v1/admin/mainCategory/addCategory", [authJwt.verifyToken], categoryUpload.single('image'), auth.createMainCategory);
        app.get("/api/v1/admin/mainCategory/allCategory", auth.getMainCategories);
        app.put("/api/v1/admin/mainCategory/updateCategory/:id", [authJwt.verifyToken], categoryUpload.single('image'), auth.updateMainCategory);
        app.delete("/api/v1/admin/mainCategory/deleteCategory/:id", [authJwt.verifyToken], auth.removeMainCategory);
        app.post("/api/v1/admin/Category/createCategory", [authJwt.verifyToken], subCategoryUpload.single('image'), auth.createCategory);
        app.get("/api/v1/admin/Category/allCategory", auth.getCategories);
        app.put("/api/v1/admin/Category/update/:id", [authJwt.verifyToken], subCategoryUpload.single('image'), auth.updateCategory);
        app.delete("/api/v1/admin/Category/delete/:id", [authJwt.verifyToken], auth.removeCategory);
        app.post("/api/v1/admin/SubCategory/createCategory", [authJwt.verifyToken], auth.createSubCategory);
        app.get("/api/v1/admin/SubCategory/:categoryId/:subCategoryId", auth.getSubCategories);
        app.put("/api/v1/admin/SubCategory/update/:id", [authJwt.verifyToken], auth.updateSubCategory);
        app.delete("/api/v1/admin/SubCategory/delete/:id", [authJwt.verifyToken], auth.removeSubCategory);
        app.post("/api/v1/admin/ItemSubCategory/createCategory", [authJwt.verifyToken], auth.createItemSubCategory);
        app.get("/api/v1/admin/ItemSubCategory/:categoryId", auth.getItemSubCategories);
        app.put("/api/v1/admin/ItemSubCategory/update/:id", [authJwt.verifyToken], auth.updateItemSubCategory);
        app.delete("/api/v1/admin/ItemSubCategory/delete/:id", [authJwt.verifyToken], auth.removeItemSubCategory);
        app.post("/api/v1/admin/Item/createItem", [authJwt.verifyToken], auth.createItem);
        app.get("/api/v1/admin/Item/:categoryId/:itemSubCategoryId", auth.getItem);
        app.put("/api/v1/admin/Item/update/:id", [authJwt.verifyToken], auth.updateItem);
        app.delete("/api/v1/admin/Item/delete/:id", [authJwt.verifyToken], auth.removeItem);
        app.post("/api/v1/admin/Service/addService", [authJwt.verifyToken], serviceUpload.array('image'), auth.createService);
        app.get("/api/v1/admin/Service/:mainCategoryId/:categoryId/:subCategoryId", auth.getService);
        app.delete("/api/v1/admin/Service/delete/:id", [authJwt.verifyToken], auth.removeService);
        app.post("/api/v1/admin/Offer/addOffer", [authJwt.verifyToken], offerUpload.single('image'), auth.addOffer);
        app.get("/api/v1/admin/Offer/listOffer", [authJwt.verifyToken], auth.listOffer);









        app.post("/api/v1/admin/FacialType/addFacialType", [authJwt.verifyToken], auth.createFacialType);
        app.get("/api/v1/admin/FacialType/allFacialType", auth.getFacialTypes);
        app.put("/api/v1/admin/FacialType/updateFacialType/:id", [authJwt.verifyToken], auth.updateFacialType);
        app.delete("/api/v1/admin/FacialType/deleteFacialType/:id", [authJwt.verifyToken], auth.removeFacialType);
        app.post('/api/v1/admin/createSubscription', auth.createSubscription);
        app.get('/api/v1/admin/getSubscription/:mainCategoryId/:categoryId', auth.getSubscription);
        app.put("/api/v1/admin/Service/uploadService/:id", [authJwt.verifyToken], serviceUpload.array('image'), auth.updateImagesinService);
        app.get("/api/v1/admin/Service/top/:categoryId/:subCategoryId", auth.getTopSellingService);
        app.put("/api/v1/admin/Service/update/:id", [authJwt.verifyToken], auth.updateService);
        app.post("/api/v1/admin/FreeService/addFreeService", [authJwt.verifyToken], auth.createFreeService);
        app.get("/api/v1/admin/FreeService/allFreeService", auth.getFreeServices);
        app.put("/api/v1/admin/FreeService/updateFreeService/:id", [authJwt.verifyToken], auth.updateFreeServices);
        app.delete("/api/v1/admin/FreeService/deleteFreeService/:id", [authJwt.verifyToken], auth.removeFreeServices);
        app.get('/api/v1/admin/getOrders', [authJwt.verifyToken], auth.getOrders);
        app.put('/api/v1/admin/assignOrder/:userId/:orderId', [authJwt.verifyToken], auth.assignOrder);
}