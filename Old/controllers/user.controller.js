exports.addToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        let findService = await service.findById({ _id: req.body._id });
                                        if (findService) {
                                                let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
                                                const findCharge = await Charges.find({});
                                                if (findCharge.length > 0) {
                                                        for (let i = 0; i < findCharge.length; i++) {
                                                                let obj1 = {
                                                                        chargeId: findCharge[i]._id,
                                                                        charge: findCharge[i].charge,
                                                                        discountCharge: findCharge[i].discountCharge,
                                                                        discount: findCharge[i].discount,
                                                                        cancelation: findCharge[i].cancelation,
                                                                }
                                                                if (findCharge[i].cancelation == false) {
                                                                        if (findCharge[i].discount == true) {
                                                                                additionalFee = additionalFee + findCharge[i].discountCharge
                                                                        } else {
                                                                                additionalFee = additionalFee + findCharge[i].charge
                                                                        }
                                                                }
                                                                Charged.push(obj1)
                                                        }
                                                }
                                                totalAmount = findService.price * req.body.quantity;
                                                paidAmount = totalAmount + additionalFee;
                                                let obj = {
                                                        serviceId: findService._id,
                                                        price: findService.price,
                                                        quantity: req.body.quantity,
                                                        total: findService.price * req.body.quantity,
                                                }
                                                let update = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $push: { services: obj }, $set: { Charges: Charged, totalAmount: totalAmount, additionalFee: additionalFee, paidAmount: paidAmount, totalItem: 1, } }, { new: true });
                                                if (update) {
                                                        return res.status(200).json({ status: 200, message: "Service add to cart Successfully.", data: update })
                                                }
                                        } else {
                                                return res.status(404).send({ status: 404, message: "Service not found" });
                                        }
                                } else {
                                        for (let i = 0; i < findCart.services.length; i++) {
                                                console.log(findCart.services);
                                                let findService = await service.findById({ _id: req.body._id });
                                                if (findService) {
                                                        if (((findCart.services[i].serviceId).toString() == findService._id) == true) {
                                                                console.log("-----------------------------5555-");
                                                                let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
                                                                const findCharge = await Charges.find({});
                                                                if (findCharge.length > 0) {
                                                                        for (let i = 0; i < findCharge.length; i++) {
                                                                                let obj1 = {
                                                                                        chargeId: findCharge[i]._id,
                                                                                        charge: findCharge[i].charge,
                                                                                        discountCharge: findCharge[i].discountCharge,
                                                                                        discount: findCharge[i].discount,
                                                                                        cancelation: findCharge[i].cancelation,
                                                                                }
                                                                                if (findCharge[i].cancelation == false) {
                                                                                        if (findCharge[i].discount == true) {
                                                                                                additionalFee = additionalFee + findCharge[i].discountCharge
                                                                                        } else {
                                                                                                additionalFee = additionalFee + findCharge[i].charge
                                                                                        }
                                                                                }
                                                                                Charged.push(obj1)
                                                                        }
                                                                }
                                                                let obj = {
                                                                        serviceId: findService._id,
                                                                        price: findService.price,
                                                                        quantity: req.body.quantity,
                                                                        total: findService.price * req.body.quantity,
                                                                }
                                                                let update = await Cart.findByIdAndUpdate({ _id: findCart._id, 'services.serviceId': req.body._id }, { $set: { services: obj } }, { new: true });
                                                                for (let j = 0; j < update.services.length; j++) {
                                                                        totalAmount = totalAmount + update.services[j].total
                                                                }
                                                                paidAmount = totalAmount + additionalFee
                                                                let update1 = await Cart.findByIdAndUpdate({ _id: update._id }, { $set: { Charges: Charged, totalAmount: totalAmount, additionalFee: additionalFee, paidAmount: paidAmount, totalItem: update.services.length } }, { new: true });
                                                                return res.status(200).json({ status: 200, message: "Service add to cart Successfully.", data: update1 })
                                                        } else {
                                                                let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
                                                                const findCharge = await Charges.find({});
                                                                if (findCharge.length > 0) {
                                                                        for (let i = 0; i < findCharge.length; i++) {
                                                                                let obj1 = {
                                                                                        chargeId: findCharge[i]._id,
                                                                                        charge: findCharge[i].charge,
                                                                                        discountCharge: findCharge[i].discountCharge,
                                                                                        discount: findCharge[i].discount,
                                                                                        cancelation: findCharge[i].cancelation,
                                                                                }
                                                                                if (findCharge[i].cancelation == false) {
                                                                                        if (findCharge[i].discount == true) {
                                                                                                additionalFee = additionalFee + findCharge[i].discountCharge
                                                                                        } else {
                                                                                                additionalFee = additionalFee + findCharge[i].charge
                                                                                        }
                                                                                }
                                                                                Charged.push(obj1)
                                                                        }
                                                                }
                                                                let total = findService.price * req.body.quantity;
                                                                let obj = {
                                                                        serviceId: findService._id,
                                                                        price: findService.price,
                                                                        quantity: req.body.quantity,
                                                                        total: total,
                                                                }
                                                                totalAmount = totalAmount + findCart.totalAmount + total;
                                                                paidAmount = totalAmount + additionalFee
                                                                let update = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $push: { services: obj }, $set: { Charges: Charged, totalAmount: totalAmount, additionalFee: additionalFee, paidAmount: paidAmount, totalItem: findCart.totalItem + 1 } }, { new: true });
                                                                if (update) {
                                                                        return res.status(200).json({ status: 200, message: "Service add to cart Successfully.", data: update })
                                                                }
                                                        }
                                                } else {
                                                        return res.status(404).send({ status: 404, message: "Service not found" });
                                                }
                                        }
                                }
                        } else {
                                let findService = await service.findById({ _id: req.body._id });
                                if (findService) {
                                        let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
                                        const findCharge = await Charges.find({});
                                        if (findCharge.length > 0) {
                                                for (let i = 0; i < findCharge.length; i++) {
                                                        let obj1 = {
                                                                chargeId: findCharge[i]._id,
                                                                charge: findCharge[i].charge,
                                                                discountCharge: findCharge[i].discountCharge,
                                                                discount: findCharge[i].discount,
                                                                cancelation: findCharge[i].cancelation,
                                                        }
                                                        if (findCharge[i].cancelation == false) {
                                                                if (findCharge[i].discount == true) {
                                                                        additionalFee = additionalFee + findCharge[i].discountCharge
                                                                } else {
                                                                        additionalFee = additionalFee + findCharge[i].charge
                                                                }
                                                        }
                                                        Charged.push(obj1)
                                                }
                                        }
                                        totalAmount = findService.price * req.body.quantity;
                                        paidAmount = totalAmount + additionalFee;
                                        let obj = {
                                                userId: userData._id,
                                                Charges: Charged,
                                                services: [{
                                                        serviceId: findService._id,
                                                        price: findService.price,
                                                        quantity: req.body.quantity,
                                                        total: findService.price * req.body.quantity,
                                                }],
                                                totalAmount: totalAmount,
                                                additionalFee: additionalFee,
                                                paidAmount: paidAmount,
                                                totalItem: 1,
                                        }
                                        const Data = await Cart.create(obj);
                                        return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
                                } else {
                                        return res.status(404).send({ status: 404, message: "Service not found" });
                                }
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.provideTip = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        let Charged = [], paidAmount = 0, additionalFee = 0, coupan = 0, wallet = 0, tip;
                                        const findCharge = await Charges.find({});
                                        if (findCharge.length > 0) {
                                                for (let i = 0; i < findCharge.length; i++) {
                                                        let obj1 = {
                                                                chargeId: findCharge[i]._id,
                                                                charge: findCharge[i].charge,
                                                                discountCharge: findCharge[i].discountCharge,
                                                                discount: findCharge[i].discount,
                                                                cancelation: findCharge[i].cancelation,
                                                        }
                                                        if (findCharge[i].cancelation == false) {
                                                                if (findCharge[i].discount == true) {
                                                                        additionalFee = additionalFee + findCharge[i].discountCharge
                                                                } else {
                                                                        additionalFee = additionalFee + findCharge[i].charge
                                                                }
                                                        }
                                                        Charged.push(obj1)
                                                }
                                        }
                                        if (findCart.coupanUsed == true) {
                                                let findCoupan = await Coupan.findById({ _id: findCart.coupanId });
                                                coupan = findCoupan.discount;
                                        } else {
                                                coupan = 0
                                        }
                                        if (findCart.walletUsed == true) {
                                                wallet = userData.wallet;
                                        } else {
                                                wallet = 0
                                        }
                                        if (req.body.tipProvided > 0) {
                                                tip = true
                                        } else {
                                                tip = false
                                        }
                                        paidAmount = findCart.totalAmount + additionalFee + req.body.tipProvided - wallet - coupan;
                                        let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { Charges: Charged, tip: tip, tipProvided: req.body.tipProvided, walletUsed: findCart.walletUsed, coupanUsed: findCart.coupanUsed, freeServiceUsed: findCart.freeServiceUsed, wallet: wallet, coupan: coupan, freeService: findCart.freeService, totalAmount: findCart.totalAmount, additionalFee: additionalFee, paidAmount: paidAmount, totalItem: findCart.totalItem } }, { new: true });
                                        return res.status(200).json({ status: 200, message: "Tip add to cart Successfully.", data: update1 })
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.listCoupan = async (req, res) => {
        try {
                let vendorData = await User.findOne({ _id: req.user._id });
                if (!vendorData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findService = await Coupan.find({ userId: vendorData._id });
                        if (findService.length == 0) {
                                return res.status(404).send({ status: 404, message: "Data not found" });
                        } else {
                                res.json({ status: 200, message: 'Coupan Data found successfully.', service: findService });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.applyCoupan = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        let Charged = [], paidAmount = 0, additionalFee = 0, coupan = 0, coupanUsed, wallet = 0, tipProvided = 0;
                                        const findCharge = await Charges.find({});
                                        if (findCharge.length > 0) {
                                                for (let i = 0; i < findCharge.length; i++) {
                                                        let obj1 = {
                                                                chargeId: findCharge[i]._id,
                                                                charge: findCharge[i].charge,
                                                                discountCharge: findCharge[i].discountCharge,
                                                                discount: findCharge[i].discount,
                                                                cancelation: findCharge[i].cancelation,
                                                        }
                                                        if (findCharge[i].cancelation == false) {
                                                                if (findCharge[i].discount == true) {
                                                                        additionalFee = additionalFee + findCharge[i].discountCharge
                                                                } else {
                                                                        additionalFee = additionalFee + findCharge[i].charge
                                                                }
                                                        }
                                                        Charged.push(obj1)
                                                }
                                        }
                                        let findCoupan = await Coupan.findOne({ couponCode: req.body.couponCode });
                                        if (!findCoupan) {
                                                return res.status(404).json({ status: 404, message: "Coupan not found", data: {} });
                                        } else {
                                                if (findCoupan.status == true) {
                                                        return res.status(409).json({ status: 409, message: "Coupan Already used", data: {} });
                                                } else {
                                                        if (findCoupan.expirationDate > Date.now()) {
                                                                coupan = findCoupan.discount;
                                                                coupanUsed = true;
                                                                if (findCart.walletUsed == true) {
                                                                        wallet = userData.wallet;
                                                                } else {
                                                                        wallet = 0
                                                                }
                                                                if (findCart.tip == true) {
                                                                        tipProvided = findCart.tipProvided
                                                                } else {
                                                                        tipProvided = 0;
                                                                }
                                                                paidAmount = findCart.totalAmount + additionalFee + tipProvided - wallet - coupan;
                                                                let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, {
                                                                        $set: { coupanId: findCoupan._id, Charges: Charged, tip: findCart.tip, tipProvided: tipProvided, walletUsed: findCart.walletUsed, coupanUsed: coupanUsed, freeServiceUsed: findCart.freeServiceUsed, wallet: wallet, coupan: coupan, freeService: findCart.freeService, totalAmount: findCart.totalAmount, additionalFee: additionalFee, paidAmount: paidAmount, totalItem: findCart.totalItem }
                                                                }, { new: true });
                                                                return res.status(200).json({ status: 200, message: "Tip add to cart Successfully.", data: update1 })
                                                        } else {
                                                                return res.status(409).json({ status: 409, message: "Coupan expired", data: {} });
                                                        }
                                                }
                                        }
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.applyWallet = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        let Charged = [], paidAmount = 0, additionalFee = 0, coupan = 0, wallet = 0, walletUsed;
                                        const findCharge = await Charges.find({});
                                        if (findCharge.length > 0) {
                                                for (let i = 0; i < findCharge.length; i++) {
                                                        let obj1 = {
                                                                chargeId: findCharge[i]._id,
                                                                charge: findCharge[i].charge,
                                                                discountCharge: findCharge[i].discountCharge,
                                                                discount: findCharge[i].discount,
                                                                cancelation: findCharge[i].cancelation,
                                                        }
                                                        if (findCharge[i].cancelation == false) {
                                                                if (findCharge[i].discount == true) {
                                                                        additionalFee = additionalFee + findCharge[i].discountCharge
                                                                } else {
                                                                        additionalFee = additionalFee + findCharge[i].charge
                                                                }
                                                        }
                                                        Charged.push(obj1)
                                                }
                                        }
                                        if (findCart.coupanUsed == true) {
                                                let findCoupan = await Coupan.findById({ _id: findCart.coupanId });
                                                coupan = findCoupan.discount;
                                        } else {
                                                coupan = 0
                                        }
                                        if (userData.wallet > 0) {
                                                wallet = userData.wallet;
                                                walletUsed = true;
                                        } else {
                                                wallet = 0
                                        }
                                        if (findCart.tip == true) {
                                                tipProvided = findCart.tipProvided
                                        } else {
                                                tipProvided = 0;
                                        }
                                        paidAmount = findCart.totalAmount + additionalFee + tipProvided - wallet - coupan;
                                        let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { Charges: Charged, tip: findCart.tip, tipProvided: tipProvided, walletUsed: walletUsed, coupanUsed: findCart.coupanUsed, freeServiceUsed: findCart.freeServiceUsed, wallet: wallet, coupan: coupan, freeService: findCart.freeService, totalAmount: findCart.totalAmount, additionalFee: additionalFee, paidAmount: paidAmount, totalItem: findCart.totalItem } }, { new: true });
                                        return res.status(200).json({ status: 200, message: "wallet apply on cart Successfully.", data: update1 })
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.addFreeServiceToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        const findFreeService = await freeService.findOne({ _id: req.body.freeServiceId, userId: req.user._id })
                                        if (findFreeService) {
                                                let obj = {
                                                        freeServiceId: findFreeService._id
                                                }
                                                let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { freeServiceUsed: true, freeServiceCount: findCart.freeServiceCount + 1 }, $push: { freeService: obj } }, { new: true });
                                                return res.status(200).json({ status: 200, message: "Free service add to cart Successfully.", data: update1 })
                                        } else {
                                                return res.status(404).send({ status: 404, message: "Free service not found" });
                                        }
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.addSuggestionToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { suggestion: req.body.suggestion }, }, { new: true });
                                        return res.status(200).json({ status: 200, message: "suggestion add to cart Successfully.", data: update1 })
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.addAdressToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id })
                        if (!findCart) {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        } else {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        const data1 = await Address.findById({ _id: req.params.id });
                                        if (data1) {
                                                let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { houseFlat: data1.houseFlat, appartment: data1.appartment, landMark: data1.landMark, houseType: data1.houseType }, }, { new: true });
                                                return res.status(200).json({ status: 200, message: "suggestion add to cart Successfully.", data: update1 })
                                        } else {
                                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                                        }
                                }
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.addDateAndTimeToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).send({ status: 404, message: "Your cart have no service found." });
                                } else {
                                        const d = new Date(req.body.date);
                                        let text = d.toISOString();
                                        let update = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { Date: text, time: req.body.time } }, { new: true });
                                        if (update) {
                                                return res.status(200).send({ status: 200, message: "Date And Time add to Cart successfully.", data: update });
                                        }
                                }
                        } else {
                                return res.status(404).send({ status: 404, message: "Your cart is not found." });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.checkout = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id })
                        if (!findCart) {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        } else {
                                let orderId = await reffralCode()
                                let obj = {
                                        orderId: orderId,
                                        userId: findCart.userId,
                                        coupanId: findCart.coupanId,
                                        freeService: findCart.freeService,
                                        Charges: findCart.Charges,
                                        tipProvided: findCart.tipProvided,
                                        tip: findCart.tip,
                                        freeServiceUsed: findCart.freeServiceUsed,
                                        coupanUsed: findCart.coupanUsed,
                                        walletUsed: findCart.walletUsed,
                                        wallet: findCart.wallet,
                                        coupan: findCart.coupan,
                                        freeServiceCount: findCart.freeServiceCount,
                                        suggestion: findCart.suggestion,
                                        address: findCart.address,
                                        city: findCart.city,
                                        state: findCart.state,
                                        pinCode: findCart.pinCode,
                                        landMark: findCart.landMark,
                                        street: findCart.street,
                                        Date: findCart.Date,
                                        time: findCart.time,
                                        services: findCart.services,
                                        totalAmount: findCart.totalAmount,
                                        additionalFee: findCart.additionalFee,
                                        paidAmount: findCart.paidAmount,
                                        totalItem: findCart.totalItem
                                }
                                let SaveOrder = await orderModel.create(obj);
                                if (SaveOrder) {
                                        return res.status(200).json({ status: 200, message: "order create successfully.", data: SaveOrder });
                                }
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.placeOrder = async (req, res) => {
        try {
                let findUserOrder = await orderModel.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        if (req.body.paymentStatus == "paid") {
                                let update = await orderModel.findByIdAndUpdate({ _id: findUserOrder._id }, { $set: { orderStatus: "confirmed", status: "confirmed", paymentStatus: "paid" } }, { new: true });
                                return res.status(200).json({ message: "Payment success.", status: 200, data: update });
                        }
                        if (req.body.paymentStatus == "failed") {
                                return res.status(201).json({ message: "Payment failed.", status: 201, orderId: orderId });
                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.cancelOrder = async (req, res) => {
        try {
                let findUserOrder = await orderModel.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        let update = await orderModel.findByIdAndUpdate({ _id: findUserOrder._id }, { $set: { orderStatus: "cancel" } }, { new: true });
                        return res.status(200).json({ message: "order cancel success.", status: 200, data: update })
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getOngoingOrders = async (req, res) => {
        try {
                const data = await orderModel.find({ userId: req.user._id, serviceStatus: "Pending" });
                if (data.length > 0) {
                        return res.status(200).json({ message: "All orders", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getCompleteOrders = async (req, res) => {
        try {
                const data = await orderModel.find({ userId: req.user._id, serviceStatus: "Complete" });
                if (data.length > 0) {
                        return res.status(200).json({ message: "All orders", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getOrder = async (req, res) => {
        try {
                const data = await orderModel.findById({ _id: req.params.id });
                if (data) {
                        return res.status(200).json({ message: "view order", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.AddFeedback = async (req, res) => {
        try {
                const { type, Feedback, rating } = req.body;
                if (!type && Feedback && rating) {
                        return res.status(201).send({ message: "All filds are required" })
                } else {
                        let obj = {
                                userId: req.user._id,
                                type: type,
                                Feedback: Feedback,
                                rating: rating
                        }
                        const data = await feedback.create(obj);
                        return res.status(200).json({ details: data })
                }
        } catch (err) {
                console.log(err);
                return res.status(400).json({ message: err.message })
        }
}
exports.addFavouriteBooking = async (req, res) => {
        try {
                const data = await orderModel.findById({ _id: req.params.orderId });
                if (data) {
                        let obj = {
                                userId: req.user._id,
                                services: data.services,
                                totalAmount: data.paidAmount,
                                totalItem: data.totalItem
                        }
                        const newUser = await favouriteBooking.create(obj);
                        if (newUser) {
                                return res.status(200).json({ status: 200, message: "Add to favourite booking.", data: newUser });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.listFavouriteBooking = async (req, res) => {
        try {
                let findUser = await User.findOne({ _id: req.user._id });
                if (!findUser) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findTicket = await favouriteBooking.find({ userId: findUser._id });
                        if (findTicket.length == 0) {
                                return res.status(404).send({ status: 404, message: "Data not found" });
                        } else {
                                res.json({ status: 200, message: 'Favourite Booking found successfully.', data: findTicket });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
