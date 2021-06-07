const express = require('express');
const router = express.Router();
const { cgsatValidation } = require('../../validation')
const verify = require('../verifyToken');
// cgsat Model
const cgsat = require('../../models/Cgsat');
const Tool = require('../../models/Tool');
const TOKEN_SECRET = require('../../config/secretToken').secretToken;
const jwt = require('jsonwebtoken');
const { concat } = require('joi');
//@route GeT api/cgsats
//@desc Get all cgsats
//@access Public
router.get('', verify, async (req, res) => {
    var countCgsat = await cgsat.countDocuments({}, (err, count) => {
        return count;
    });
    let limit = Number(req.query.limit)
    let skip = Number(req.query.skip)

    //console.log(countCgsat);
    //console.log(countCgsat)
    await cgsat.find().populate("userId", "-password -__v -date").skip(skip).limit(limit)
        .sort({ date: -1 })
        .then(cgsats => res.status(200).json(
            {
                Data: { Row: cgsats, Total: countCgsat },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        ))
        .catch(err => res.status(400).json(err));
});

//@skip -limit-cgsatby- cgsat
// router.get('', verify, (req, res) => {
//     let limit = Number(req.query.limit)
//     let skip = Number(req.query.skip)
//     req.query.Cgsatby === 'desc' ? cgsat.find().limit(limit).skip(skip)
//         .sort({ date: 1 })
//         .then(cgsats => res.json(cgsats)) :
//         cgsat.find().limit(limit).skip(skip)
//             .sort({ date: -1 })
//             .then(cgsats => res.json(cgsats));
// });

//@route GeT api/cgsats
//@desc Get all cgsats
//@access Public
router.get('/search', verify, async (req, res) => {
    let token = req.headers['auth-token']
    //console.log(jwt.verify(token, TOKEN_SECRET))
    console.log(req.query)
    let limit = Number(req.query.limit)
    let skip = Number(req.query.skip)
    let paramsQuery = {
        PCGSAT: { '$regex': req.query.gsat || '' },
        WO: { '$regex': req.query.wo || '' },
        PCT: { '$regex': req.query.pct || '' }
    }
    if (req.query.userId) {
        paramsQuery.userId = { '$in': req.query.userId.split(',') }
    }

    var countCgsat = await cgsat.find(paramsQuery)
        .countDocuments({}, (err, count) => {
            return count;
        });
    await cgsat.find(paramsQuery)
        .skip(skip).limit(limit).populate("userId", "-password -__v -date")
        .sort({ date: -1 })
        .then(cgsats => res.status(200).json(
            {
                Data: { Row: cgsats, Total: countCgsat },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        ));
});
//@route Get api/cgsat/collect-tools
//@desc Get all api/cgsat/collect-tools
router.get('/collect-tools', verify, (req, res) => {
    let startDate = new Date(req.query.startDate)
    let endDate = new Date(req.query.endDate)
    queryParams = {
        timeStart: { $gte: startDate, $lte: endDate }
    }
    cgsat.find(queryParams)
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
//@route POST api/cgsats
//@desc Create an cgsats
//@access Public
router.post('/', verify, async (req, res) => {
    console.log(req.body)
    //const WOExist = await cgsat.findOne({ WO: req.body.WO });
    //console.log(WOExist)
    //if (WOExist) return res.status(400).send('WO ' + WOExist.WO + ' đã tồn tại, vui lòng kiểm tra lại!')
    const { error } = cgsatValidation(req.body);
    if (error) {
        console.log(error)
        return res.status(400).json(error.details[0].message);
    }
    let date = new Date();
    let month = ("0" + (date.getMonth() + 1)).slice(-2)
    let year = date.getYear() - 100;
    let lastWo = await cgsat.findOne({}, {}, { sort: { 'date': -1 } }, function (err, cgsat) {
        return cgsat;
    });
    console.log(lastWo)
    let lastyear = lastWo ? Number(lastWo.PCGSAT.split("/")[2]) : year;
    let pct;
    console.log(lastyear);
    if (Number(year) !== lastyear) {
        pct = 1;
    } else {
        pct = lastWo ? Number(lastWo.PCGSAT.split("/")[0]) + 1 : '1';
    }
    //let pct = Number(lastWo.PCT.split("/")[0]) + 1;
    //console.log("last:" + lastWo);
    if (pct < 10) {
        pctT = "00" + pct;
    } else if (pct >= 10 && pct < 100) {
        pctT = "0" + pct;
    } else pctT = pct;
    //console.log("pct: " + pctT)
    const newCgsat = new cgsat({
        userId: req.body.userId,
        WO: req.body.WO,
        PCT: req.body.PCT,
        PCGSAT: pctT + "/ GSAT /" + year,
        note: req.body.note,
        content: req.body.content,
        timeChange: req.body.timeChange
    });
    newCgsat.save()
        .then(cgsat => res.json(cgsat))
        .catch(err => res.json(err))
        ;
})

//@route DELETE api/cgsats:id
//@desc delete an cgsats
//@access Public
router.delete('/:id', verify, async (req, res) => {
    try {
        var toolId = [];
        await cgsat.findByIdAndDelete({ _id: req.params.id }).then(wo => {
            if (!wo) {
                return res.status(404).json({ error: "No cgsat Found" });
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

//update cgsat
router.patch('/:cgsatId', verify, async (req, res) => {
    try {
        console.log(req.params)
        console.log(req.body)
        var toolId = [];
        const updateCgsat = await cgsat.updateOne(
            { _id: req.params.cgsatId },
            {
                $set: {
                    userId: req.body.userId,
                    WO: req.body.WO,
                    PCT: req.body.PCT,
                    note: req.body.note,
                    content: req.body.content,
                    timeChange: req.body.timeChange
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
        res.json(updateCgsat);
        //console.log(toolId);
    } catch (err) {
        res.json({ message: err });
    }
})
//@route get cgsat by id
router.get('/:id', verify, (req, res) => {
    cgsat.findById(req.params.id).populate("toolId", "-toolId -__v").populate("userId", "-password -__v").populate("NV", "-password -__v")
        .then(cgsat => {
            res.json(cgsat)
        })
})
router.get('/user/:id', verify, (req, res) => {
    cgsat.find().populate("userId")
        .then(cgsat => {
            res.json(cgsat)
        })
})
module.exports = router;