const express = require('express');
const router = express.Router();
const { bptcValidation } = require('../../validation')
const verify = require('../verifyToken');
// bptc Model
const User = require('../../models/User');
const bptc = require('../../models/Bptc');
const Tool = require('../../models/Tool');
const TOKEN_SECRET = require('../../config/secretToken').secretToken;
const jwt = require('jsonwebtoken');
const { concat } = require('joi');
//@route GeT api/bptcs
//@desc Get all bptcs
//@access Public
router.get('', verify, async (req, res) => {
    var countBptc = await bptc.countDocuments({}, (err, count) => {
        return count;
    });
    let limit = Number(req.query.limit)
    let skip = Number(req.query.skip)

    //console.log(countBptc);
    //console.log(countBptc)
    await bptc.find().populate("userId", "-password -__v -date").skip(skip).limit(limit)
        .sort({ date: -1 })
        .then(bptcs => res.status(200).json(
            {
                Data: { Row: bptcs, Total: countBptc },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        ))
        .catch(err => res.status(400).json(err));
});

//@skip -limit-bptcby- bptc
// router.get('', verify, (req, res) => {
//     let limit = Number(req.query.limit)
//     let skip = Number(req.query.skip)
//     req.query.Bptcby === 'desc' ? bptc.find().limit(limit).skip(skip)
//         .sort({ date: 1 })
//         .then(bptcs => res.json(bptcs)) :
//         bptc.find().limit(limit).skip(skip)
//             .sort({ date: -1 })
//             .then(bptcs => res.json(bptcs));
// });

//@route GeT api/bptcs
//@desc Get all bptcs
//@access Public
router.get('/search', verify, async (req, res) => {
    let token = req.headers['auth-token']
    let userId = jwt.verify(token, TOKEN_SECRET)._id;

    let user = await User.findById(userId).select("name department group admin").exec();
    console.log(user)
    let groupName = user.group;
    let groupNumber;
    if (groupName === "Tự Động" || groupName === "Kiểm Nhiệt") {
        groupNumber = 2;
    } else if (groupName === "Thiết bị phụ" || groupName === "HRSG-BOP" || groupName === "Tổ Turbine") {
        groupNumber = 4;
    } else if (groupName === "Máy Tĩnh" || groupName === "Máy Động") {
        groupNumber = 3;
    }


    let limit = Number(req.query.limit)
    let skip = Number(req.query.skip)
    let paramsQuery;
    if (user.admin) {
        paramsQuery = {
            BPTC: { '$regex': req.query.bptc || '' },
            JSA: { '$regex': req.query.jsa || '' },
            content: { '$regex': req.query.content || '' }
        }
    } else {
        paramsQuery = {
            //groupNumber: {'$regex':req.query.group || ''},
            groupNumber: groupNumber,
            BPTC: { '$regex': req.query.bptc || '' },
            JSA: { '$regex': req.query.jsa || '' },
            content: { '$regex': req.query.content || '' }
        }
    }

    if (req.query.userId) {
        paramsQuery.userId = { '$in': req.query.userId.split(',') }
    }
    var countBptc = await bptc.find(paramsQuery)
        .countDocuments({}, (err, count) => {
            return count;
        });
    console.log(paramsQuery)
    await bptc.find(paramsQuery)
        .skip(skip).limit(limit).populate("userId", "-password -__v -date")
        .sort({ date: -1 })
        .then(bptcs => res.status(200).json(
            {
                Data: { Row: bptcs, Total: countBptc },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        ));
});
//@route Get api/bptc/collect-tools
//@desc Get all api/bptc/collect-tools
router.get('/collect-tools', verify, (req, res) => {
    let startDate = new Date(req.query.startDate)
    let endDate = new Date(req.query.endDate)
    queryParams = {
        timeStart: { $gte: startDate, $lte: endDate }
    }
    bptc.find(queryParams)
        .populate("toolId")
        .populate("userId", "-password -__v -date")
        .sort({ date: -1 })
        .then(tools => res.status(200).json(
            {
                Data: { Row: tools, Total: tools.length },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        ));
});
//@route POST api/bptcs
//@desc Create an bptcs
//@access Public
router.post('/', verify, async (req, res) => {
    let groupName = req.body.group;
    let groupNumber;
    if (groupName === "Tự Động" || groupName === "Kiểm Nhiệt") {
        groupNumber = 2;
    } else if (groupName === "Thiết bị phụ" || groupName === "HRSG-BOP" || groupName === "Tổ Turbine") {
        groupNumber = 4;
    } else if (groupName === "Máy Tĩnh" || groupName === "Máy Động") {
        groupNumber = 3;
    }
    console.log(groupNumber)
    const { error } = bptcValidation(req.body);
    if (error) {
        return res.status(400).json(error.details[0].message);
    }
    let lastWo = await bptc.findOne({ groupNumber: String(groupNumber) }, {}, { sort: { 'date': -1 } }, function (err, bptc) {
        return bptc;
    });
    console.log("lastWo " + lastWo)
    let pct = lastWo ? Number(lastWo.BPTC.split("/")[0]) + 1 : '1';
    if (pct < 10) {
        pctT = "00" + pct;
    } else if (pct >= 10 && pct < 100) {
        pctT = "0" + pct;
    } else pctT = pct;
    console.log(pctT)
    let jsa = lastWo ? Number(lastWo.JSA.split("/")[0]) + 1 : '1';
    if (jsa < 10) {
        jsaT = "00" + jsa;
    } else if (pct >= 10 && pct < 100) {
        jsaT = "0" + jsa;
    } else jsaT = jsa;
    console.log(jsaT)
    console.log(pctT + "/BPTC-CNCM." + groupNumber)
    const newBptc = new bptc({
        userId: req.body.userId,
        //BPTC: "001/BPTC-CNCM.2",
        //JSA: "001/JSA-CNCM.2",
        BPTC: pctT + "/BPTC-CNCM." + groupNumber,
        JSA: jsaT + "/JSA-CNCM." + groupNumber,
        note: req.body.note,
        content: req.body.content,
        groupNumber: String(groupNumber)
    });
    newBptc.save()
        .then(bptc => res.json(bptc))
        .catch(err => res.json(err))
        ;
})

//@route DELETE api/bptcs:id
//@desc delete an bptcs
//@access Public
router.delete('/:id', verify, async (req, res) => {
    try {
        var toolId = [];
        await bptc.findByIdAndDelete({ _id: req.params.id }).then(wo => {
            if (!wo) {
                return res.status(404).json({ error: "No bptc Found" });
            }
            else {
                toolId = wo.toolId;
                res.json(wo);
            }
        })
        console.log(toolId);
        toolId.forEach(_id => {
            Tool.findByIdAndUpdate(_id, { $set: { status: 1 } }).then(toolDeleted => {
                if (!toolDeleted) {
                    return res.status(404).json({ error: "No toolDelete Found" });
                } else {
                    ;
                    //res.status(200).json({ success: true });
                }
            }
            )
        })
    }
    catch (err) {
        res.status(404).json({ success: false })
    }
})

//update bptc
router.patch('/:bptcId', verify, async (req, res) => {
    try {
        console.log(req.params)
        console.log(req.body)
        var toolId = [];
        const updateBptc = await bptc.updateOne(
            { _id: req.params.bptcId },
            {
                $set: {
                    userId: req.body.userId,
                    WO: req.body.WO,
                    note: req.body.note,
                    content: req.body.content,
                    time: req.body.time
                }
            })

        const statusComplete = req.body.status;
        //console.log(statusComplete);
        toolId = req.body.toolId;
        if (statusComplete == "COMPLETE") {
            toolId.forEach(tools => {
                //console.log(tools._id)
                Tool.findByIdAndUpdate(tools._id, { $set: { status: 1 } }).then(toolDeleted => {
                    if (!toolDeleted) {
                        return res.status(404).json({ error: "No toolDelete Found" });
                    } else {
                        ;
                        //res.status(200).json({ success: true });
                    }
                })

            })
        };
        res.json(updateBptc);
        //console.log(toolId);
    } catch (err) {
        res.json({ message: err });
    }
})
//@route get bptc by id
router.get('/:id', verify, (req, res) => {
    bptc.findById(req.params.id).populate("toolId", "-toolId -__v").populate("userId", "-password -__v").populate("NV", "-password -__v")
        .then(bptc => {
            res.json(bptc)
        })
})
router.get('/user/:id', verify, (req, res) => {
    bptc.find().populate("userId")
        .then(bptc => {
            res.json(bptc)
        })
})
module.exports = router;