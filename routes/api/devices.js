const express = require('express');
const router = express.Router();
const { deviceValidation } = require('../../validation')
const verify = require('../verifyToken');
// device Model
const device = require('../../models/device');
const Tool = require('../../models/Tool');
const TOKEN_SECRET = require('../../config/secretToken').secretToken;
const jwt = require('jsonwebtoken');
const { concat } = require('joi');
const { _isIsoDate } = require('joi/lib/types/date');
//@route GeT api/devices
//@desc Get all devices
//@access Public
router.get('', verify, async (req, res) => {
    var countdevice = await device.countDocuments({}, (err, count) => {
        return count;
    });
    let limit = Number(req.query.limit)
    let skip = Number(req.query.skip)

    //console.log(countdevice);
    //console.log(countdevice)
    await device.find().populate("userId", "-password -__v -date").skip(skip).limit(limit)
        .sort({ date: -1 })
        .then(devices => res.status(200).json(
            {
                Data: { Row: devices, Total: countdevice },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        ))
        .catch(err => res.status(400).json(err));
});

//@skip -limit-deviceby- device
// router.get('', verify, (req, res) => {
//     let limit = Number(req.query.limit)
//     let skip = Number(req.query.skip)
//     req.query.deviceby === 'desc' ? device.find().limit(limit).skip(skip)
//         .sort({ date: 1 })
//         .then(devices => res.json(devices)) :
//         device.find().limit(limit).skip(skip)
//             .sort({ date: -1 })
//             .then(devices => res.json(devices));
// });

//@route GeT api/devices
//@desc Get all devices
//@access Public
router.get('/search', verify, async (req, res) => {
    let token = req.headers['auth-token']
    //console.log(jwt.verify(token, TOKEN_SECRET))
    console.log(req.query)
    let limit = Number(req.query.limit)
    //let limit = 20;
    let skip = Number(req.query.skip)
   
    let paramsQuery = {
        userId: { '$regex': req.query.userId || '' },
        sn: { '$regex': req.query.sn || '' },
        
    }
    if (req.query.userId) {
        paramsQuery.userId = { '$in': req.query.userId.split(',') }
    }

    var countdevice = await device.find(paramsQuery)
        .countDocuments({}, (err, count) => {
            return count;
        });
    await device.find(paramsQuery)
        .skip(skip).limit(limit)
        .sort({ date: 1 })
        .then(devices => res.status(200).json(
            {
                Data: { Row: devices, Total: countdevice },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        ));
});
//@route Get api/device/collect-tools
//@desc Get all api/device/collect-tools
router.get('/collect-tools', verify, (req, res) => {
    let startDate = new Date(req.query.startDate)
    let endDate = new Date(req.query.endDate)
    queryParams = {
        timeStart: { $gte: startDate, $lte: endDate }
    }
    device.find(queryParams)
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
//@route POST api/devices
//@desc Create an devices
//@access Public
router.post('/', verify, async (req, res) => {
    console.log(req.body);
    const { error } = deviceValidation(req.body);
    if (error) {
        return res.status(400).json(error.details[0].message);
    }
    let lastWo = await device.findOne({}, {}, { sort: { 'date': -1 } }, function (err, device) {
        return device;
    });
    const newdevice = new device({
        userId: req.body.userId,
        sn: req.body.sn,
        name: req.body.name,
    });
    newdevice.save()
        .then(device => res.json(device))
        .catch(err => res.json(err))
        ;
})

//@route DELETE api/devices:id
//@desc delete an devices
//@access Public
router.delete('/:id', verify, async (req, res) => {
    try {
        var toolId = [];
        await device.findByIdAndDelete({ _id: req.params.id }).then(wo => {
            if (!wo) {
                return res.status(404).json({ error: "No device Found" });
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

//update device
router.patch('/:deviceId', verify, async (req, res) => {
    try {
        console.log(req.params)
        console.log(req.body)
        var toolId = [];
        const updatedevice = await device.updateOne(
            { _id: req.params.deviceId },
            {
                $set: {
                    userId: req.body.userId,
                    sn: req.body.sn,
                    name: req.body.name
                }
            })
        res.json(updatedevice);
        //console.log(toolId);
    } catch (err) {
        res.json({ message: err });
    }
})
//@route get device by id
router.get('/:id', verify, (req, res) => {
    device.findById(req.params.id)
        .then(device => {
            res.json(device)
            console.log(device)
        })
})
router.get('/user/:id', verify, (req, res) => {
    device.find().populate("userId")
        .then(device => {
            res.json(device)
        })
})
module.exports = router;