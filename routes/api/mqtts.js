const express = require('express');
const router = express.Router();
const { mqttValidation } = require('../../validation')
const verify = require('../verifyToken');
// mqtt Model
const mqtt = require('../../models/mqtt');
const Tool = require('../../models/Tool');
const TOKEN_SECRET = require('../../config/secretToken').secretToken;
const jwt = require('jsonwebtoken');
const { concat } = require('joi');
//@route GeT api/mqtts
//@desc Get all mqtts
//@access Public
router.get('', verify, async (req, res) => {
    var countmqtt = await mqtt.countDocuments({}, (err, count) => {
        return count;
    });
    let limit = Number(req.query.limit)
    let skip = Number(req.query.skip)

    //console.log(countmqtt);
    //console.log(countmqtt)
    await mqtt.find().populate("userId", "-password -__v -date").skip(skip).limit(limit)
        .sort({ date: -1 })
        .then(mqtts => res.status(200).json(
            {
                Data: { Row: mqtts, Total: countmqtt },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        ))
        .catch(err => res.status(400).json(err));
});

//@skip -limit-mqttby- mqtt
// router.get('', verify, (req, res) => {
//     let limit = Number(req.query.limit)
//     let skip = Number(req.query.skip)
//     req.query.mqttby === 'desc' ? mqtt.find().limit(limit).skip(skip)
//         .sort({ date: 1 })
//         .then(mqtts => res.json(mqtts)) :
//         mqtt.find().limit(limit).skip(skip)
//             .sort({ date: -1 })
//             .then(mqtts => res.json(mqtts));
// });

//@route GeT api/mqtts
//@desc Get all mqtts
//@access Public
router.get('/search', verify, async (req, res) => {
    let token = req.headers['auth-token']
    //console.log(jwt.verify(token, TOKEN_SECRET))
    console.log(req.query)
    let limit = Number(req.query.limit)
    //let limit = 20;
    let skip = Number(req.query.skip)
    let paramsQuery = {
        topic: { '$regex': req.query.topic || '' }
    }
    if (req.query.userId) {
        paramsQuery.userId = { '$in': req.query.userId.split(',') }
    }

    var countmqtt = await mqtt.find(paramsQuery)
        .countDocuments({}, (err, count) => {
            return count;
        });
    await mqtt.find(paramsQuery)
        .skip(skip).limit(limit)
        .sort({ date: 1 })
        .then(mqtts => res.status(200).json(
            {
                Data: { Row: mqtts, Total: countmqtt },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        ));
});
//@route Get api/mqtt/collect-tools
//@desc Get all api/mqtt/collect-tools
router.get('/collect-tools', verify, (req, res) => {
    let startDate = new Date(req.query.startDate)
    let endDate = new Date(req.query.endDate)
    queryParams = {
        timeStart: { $gte: startDate, $lte: endDate }
    }
    mqtt.find(queryParams)
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
//@route POST api/mqtts
//@desc Create an mqtts
//@access Public
router.post('/', verify, async (req, res) => {
    console.log(req.body);
    const { error } = mqttValidation(req.body);
    if (error) {
        return res.status(400).json(error.details[0].message);
    }
    let lastWo = await mqtt.findOne({}, {}, { sort: { 'date': -1 } }, function (err, mqtt) {
        return mqtt;
    });
    const newmqtt = new mqtt({
        userId: req.body.userId,
        sn: req.body.sn,
    });
    newmqtt.save()
        .then(mqtt => res.json(mqtt))
        .catch(err => res.json(err))
        ;
})

//@route DELETE api/mqtts:id
//@desc delete an mqtts
//@access Public
router.delete('/:id', verify, async (req, res) => {
    try {
        var toolId = [];
        await mqtt.findByIdAndDelete({ _id: req.params.id }).then(wo => {
            if (!wo) {
                return res.status(404).json({ error: "No mqtt Found" });
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

//update mqtt
router.patch('/:mqttId', verify, async (req, res) => {
    try {
        console.log(req.params)
        console.log(req.body)
        var toolId = [];
        const updatemqtt = await mqtt.updateOne(
            { _id: req.params.mqttId },
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
        res.json(updatemqtt);
        //console.log(toolId);
    } catch (err) {
        res.json({ message: err });
    }
})
//@route get mqtt by id
router.get('/:id', verify, (req, res) => {
    mqtt.findById(req.params.id).populate("toolId", "-toolId -__v").populate("userId", "-password -__v").populate("NV", "-password -__v")
        .then(mqtt => {
            res.json(mqtt)
        })
})
router.get('/user/:id', verify, (req, res) => {
    mqtt.find().populate("userId")
        .then(mqtt => {
            res.json(mqtt)
        })
})
module.exports = router;