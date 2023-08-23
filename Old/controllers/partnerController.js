

exports.getRating = async (req, res) => {
        try {
                let overAllrating = 0, totalRating = 0;
                const data = await rating.find({ partnerId: req.user._id })
                if (data.length == 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                let findRating = await rating.findOne({ partnerId: req.user._id })
                if (findRating) {
                        overAllrating = findRating.averageRating
                }
                let findReview = await rating.findOne({ partnerId: req.user._id })
                if (findReview) {
                        totalRating = findRating.totalRating
                }
                const findJobs = await orderModel.find({ partnerId: req.user._id });
                if (findJobs.length == 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                let obj = {
                        overAllrating: overAllrating,
                        minRating: minRating,
                        jobs: jobs,
                        totalReview: totalReviews,
                        Escalations: Escalations,
                        Rating: Rating,
                        repeatCustomer: repeatCustomer,
                        allRating: data

                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.reportRating = async (req, res) => {
        try {
                let vendorData = await User.findOne({ _id: req.user._id });
                if (!vendorData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let month = new Date(Date.now()).getMonth() + 1;
                        let date = new Date(Date.now()).getDate();
                        let last50Job, overAllrating = 0, rat = 0, rats = 0, thisMonth = 0, lastsMonth = 0;
                        let year = new Date(Date.now()).getFullYear();
                        const xmas95 = new Date(`${vendorData.createdAt}`);
                        const startMonth = xmas95.getMonth() + 1;
                        const startYear = xmas95.getFullYear();
                        const startDate = xmas95.getDate();
                        let lastMonth = new Date(Date.now()).getMonth();

                        let findLastRating = await rating.findOne({ userId: vendorData._id, month: lastMonth })
                        if (findLastRating) {
                                lastsMonth = findLastRating.averageRating
                        }
                        let findLast50JobRating = await orderRatingModel.find({ $or: [{ vendorId: vendorData._id }, { staffId: vendorData._id }] }).sort({ 'createdAt': -1 });
                        if (findLast50JobRating.length > 0) {
                                for (let i = 0; i < 50; i++) {
                                        rat = rat + findLast50JobRating[i].rating
                                }
                        }
                        last50Job = rat / 50;
                        let findoverAllrating = await orderRatingModel.find({ $or: [{ vendorId: vendorData._id }, { staffId: vendorData._id }] }).sort({ 'createdAt': -1 });
                        if (findoverAllrating.length > 0) {
                                for (let i = 0; i < findoverAllrating.length; i++) {
                                        rats = rats + findoverAllrating[i].rating
                                }
                                overAllrating = rats / findoverAllrating.length;
                        }
                        var start = moment(`${startYear}-${startMonth}-${startDate}`);
                        var end = moment(`${year}-${month}-${date}`);
                        let noOfDays = end.diff(start, "days")
                        let obj = {
                                overAllrating: overAllrating,
                                thisMonth: thisMonth,
                                lastMonth: lastsMonth,
                                last50Job: last50Job,
                                jobTillDate: findLast50JobRating.length,
                                noOfDays: noOfDays
                        }
                        res.json({ status: 200, message: 'Data found successfully.', data: obj });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
