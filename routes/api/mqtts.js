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
    console.log("search thuong");
    var analysicPower = []
    //let limit = Number(req.query.limit)
    let limit = 20;
    let paramsQuery;
    //let skip = Number(req.query.skip)
    let duration = req.query.duration
    if (!duration) {
        duration = 5;
    }
    let skip = 20
    if (req.query.from && req.query.to && duration) {
        let from = new Date(req.query.from)
        let to = new Date(req.query.to)

        console.log(from)
        console.log(to)
        paramsQuery = {
            topic: { '$regex': req.query.topic || '' },
            date: {
                $gte: from,
                $lte: to
            }

        }
        analysicPower = await mqtt
            .aggregate(
                [
                    {
                        $match: {
                            topic: req.query.topic,
                            date: {
                                $gte: from,
                                $lte: to
                            }
                        }

                    },
                    {
                        $group:
                        {
                            _id: "$topic",
                            maxPower: { $max: "$power" },
                            minPower: { $min: "$power" },
                            maxVolt: { $max: "$volt" },
                            minVolt: { $min: "$volt" },
                            maxCurrent: { $max: "$current" },
                            minCurrent: { $min: "$current" },
                            maxEnergy: { $max: "$energy" },
                            minEnergy: { $min: "$energy" },
                            //total: {$subtract: [ "$maxEnergy", "$minEnergy" ]}
                        }
                    },
                    {
                        $addFields: {
                            totalEnergy: { $subtract: ["$maxEnergy", "$minEnergy"] }
                        }
                    }
                ]
            )
        console.log(analysicPower)
        const countSampleInterval = await mqtt.aggregate([
            {
                $match: {
                    topic: req.query.topic,
                    date: {
                        $gte: from,
                        $lte: to
                    }
                }

            },
            {
                $group: {
                    "_id": null,
                    count: { "$sum": 1 }
                }
            }
        ])
        if (countSampleInterval[0]) {
            console.log(countSampleInterval[0].count)
        }
        const countSamplePowerGreater = await mqtt.aggregate([
            {
                $match: {
                    topic: req.query.topic,
                    date: {
                        $gte: from,
                        $lte: to
                    },
                    power: { $gte: 1000 }
                }

            },
            {
                $group: {
                    "_id": null,
                    count: { "$sum": 1 }
                }
            }
        ])
        if (countSamplePowerGreater[0]) { console.log(countSamplePowerGreater[0].count) }

        await mqtt.aggregate([
            {
                $match: {
                    topic: req.query.topic,
                    date: {
                        $gte: from,
                        $lte: to
                    }
                }

            },
            {
                $group: {
                    "_id": {
                        "$toDate": {
                            "$subtract": [
                                { "$toLong": "$date" },
                                { "$mod": [{ "$toLong": "$date" }, 1000 * 60 * Number(duration)] }
                            ]
                        },

                    },
                    "power": { $max: "$power" },
                    "volt": { $first: "$volt" },
                    "curr": { $first: "$current" },
                    "fre": { $first: "$frequency" },
                    "count": { "$sum": 1 }
                }
            }
        ]).sort({ _id: 1 })
            .then(interval =>
                res.status(200).json(
                    {
                        Data: { Row: interval, Total: interval.length, analysic: analysicPower[0] },
                        Status: { StatusCode: 200, Message: 'OK' }
                    }
                )
            );

    } else {
        res.status(200).json(
            {
                Data: { Row: [], Total: 0, analysic: {} },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        )
    }
});
router.get('/powerdaily', verify, async (req, res) => {
    let token = req.headers['auth-token']
    //console.log(jwt.verify(token, TOKEN_SECRET))
    console.log(req.query)
    var powerDailyArray = [];
    var dateArray = [];
    var resultPowerArray = [];
    //let limit = Number(req.query.limit)
    let limit = 20;
    let paramsQuery;
    //let skip = Number(req.query.skip)
    let duration = Number(req.query.duration)
    if (!duration) {
        duration = 7;
    }
    let sampleNewest = await mqtt.find().sort({ 'date': -1 }).limit(1)
    console.log(sampleNewest)
    let skip = 20
    if (req.query.from && req.query.to && duration) {
        let from = new Date(req.query.from)
        let to = new Date(req.query.to)
        console.log(from)
        let toOneDay = new Date(req.query.from)
        toOneDay.setDate(toOneDay.getDate() + 1);
        console.log(duration)
        for (let i = 0; i <= duration; i++) {

            from.setDate(from.getDate() + i);
            if (i === duration) {
                toOneDay = new Date()
            } else {
                toOneDay.setDate(toOneDay.getDate() + i);
            }
            console.log("From: ", from);
            console.log("To: ", toOneDay);
            //element.date = toOneDay;
            //element.value = await getpower(req.query.topic, from, toOneDay);
            //powerDailyArray[i] = element;
            dateArray.push(toOneDay);
            powerDailyArray.push(await getpower(req.query.topic, from, toOneDay))
            from = new Date(req.query.from);
            toOneDay = new Date(req.query.from)
            toOneDay.setDate(toOneDay.getDate() + 1);
        }
        console.log(dateArray)
        console.log(powerDailyArray)
        for (let i = 0; i < dateArray.length; i++) {
            resultPowerArray[i] = {
                date: dateArray[i],
                value: powerDailyArray[i]
            }
        }
        //console.log(resultPowerArray)
        res.status(200).json(
            {
                Data: { Row: resultPowerArray },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        )
        // analysicPower = await mqtt
        //     .aggregate(
        //         [
        //             {
        //                 $match: {
        //                     topic: req.query.topic,
        //                     date: {
        //                         $gte: from,
        //                         $lte: to
        //                     }
        //                 }

        //             },
        //             {
        //                 $group:
        //                 {
        //                     _id: "$topic",
        //                     maxPower: { $max: "$power" },
        //                     minPower: { $min: "$power" },
        //                     maxVolt: { $max: "$volt" },
        //                     minVolt: { $min: "$volt" },
        //                     maxCurrent: { $max: "$current" },
        //                     minCurrent: { $min: "$current" },
        //                     maxEnergy: { $max: "$energy" },
        //                     minEnergy: { $min: "$energy" },
        //                     //total: {$subtract: [ "$maxEnergy", "$minEnergy" ]}
        //                 }
        //             },
        //             {
        //                 $addFields: {
        //                     totalEnergy: { $subtract: ["$maxEnergy", "$minEnergy"] }
        //                 }
        //             }
        //         ]
        //     )
        //console.log(analysicPower)
        const countSampleInterval = await mqtt.aggregate([
            {
                $match: {
                    topic: req.query.topic,
                    date: {
                        $gte: from,
                        $lte: to
                    }
                }

            },
            {
                $group: {
                    "_id": null,
                    count: { "$sum": 1 }
                }
            }
        ])
        if (countSampleInterval[0]) {
            console.log(countSampleInterval[0].count)
        }
        const countSamplePowerGreater = await mqtt.aggregate([
            {
                $match: {
                    topic: req.query.topic,
                    date: {
                        $gte: from,
                        $lte: to
                    },
                    power: { $gte: 1000 }
                }

            },
            {
                $group: {
                    "_id": null,
                    count: { "$sum": 1 }
                }
            }
        ])
        if (countSamplePowerGreater[0]) { console.log(countSamplePowerGreater[0].count) }

        await mqtt.aggregate([
            {
                $match: {
                    topic: req.query.topic,
                    date: {
                        $gte: from,
                        $lte: to
                    }
                }

            },
            {
                $group: {
                    "_id": {
                        "$toDate": {
                            "$subtract": [
                                { "$toLong": "$date" },
                                { "$mod": [{ "$toLong": "$date" }, 1000 * 60 * Number(duration)] }
                            ]
                        },

                    },
                    "power": { $max: "$power" },
                    "volt": { $first: "$volt" },
                    "curr": { $first: "$current" },
                    "fre": { $first: "$frequency" },
                    "count": { "$sum": 1 }
                }
            }
        ]).sort({ _id: 1 })
        // .then(interval =>
        //     res.status(200).json(
        //         {
        //             Data: { Row: interval, Total: interval.length, analysic: analysicPower[0] },
        //             Status: { StatusCode: 200, Message: 'OK' }
        //         }
        //     )
        // );

    } else {
        res.status(200).json(
            {
                Data: { Row: [], Total: 0, analysic: {} },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        )
    }
});
router.get('/searchpowerdata', verify, async (req, res) => {
    let token = req.headers['auth-token']
    //console.log(jwt.verify(token, TOKEN_SECRET))
    console.log("search chi tiet");
    console.log(req.query)
    var powerDailyArray = [];
    var dateArray = [];
    var resultPowerArray = [];
    var element = {};
    //let limit = Number(req.query.limit)
    let limit = 20;
    let paramsQuery;
    //let skip = Number(req.query.skip)
    let duration = Number(req.query.duration)
    if (!duration) {
        duration = 10;
    }
    let sampleNewest = await mqtt.find().sort({ 'date': -1 }).limit(1)
    if (req.query.search_date_from && req.query.search_date_to && req.query.search_time_from && req.query.search_time_to && duration) {
        let searchDateFrom = new Date(req.query.search_date_from);
        let searchDateTo = new Date(req.query.search_date_to);

        let searchTimeFrom = req.query.search_time_from;
        let hourSearchTimeFrom = searchTimeFrom.split(":")[0]
        let minSearchTimeFrom = searchTimeFrom.split(":")[1]
        let searchTimeTo = req.query.search_time_to;
        let hourSearchTimeTo = searchTimeTo.split(":")[0]
        let minSearchTimeTo = searchTimeTo.split(":")[1]

        searchDateFrom.setHours(hourSearchTimeFrom, minSearchTimeFrom);
        searchDateTo.setHours(hourSearchTimeTo, minSearchTimeTo);

        // console.log(searchDateFrom)
        // console.log(searchDateTo)
        //console.log(sampleNewest)
        let dateFrom = searchDateFrom.getDate()
        let dateTo = searchDateTo.getDate()
        let j = 0;
        for (let i = dateFrom; i <= dateTo; i++) {

            let searchDateFromm = searchDateFrom.setDate(searchDateFrom.getDate() + j);
            let fromAnalysic = new Date(searchDateFromm);
            console.log("From:", fromAnalysic)
            element.from = fromAnalysic;
            dateArray[j] = {
                ...element,
                from: new Date(searchDateFromm)
            }
            let searchDateToo = searchDateFrom.setHours(hourSearchTimeTo, minSearchTimeTo)
            let toAnalysic = new Date(searchDateToo);
            console.log("To:", toAnalysic)
            element.to = toAnalysic
            dateArray[j] = {
                ...element,
                to: element.to
            }
            searchDateFrom = new Date(req.query.search_date_from);
            searchDateFrom.setHours(hourSearchTimeFrom, minSearchTimeFrom)
            j++;
        }
        console.log(dateArray)

        for (let i = 0; i < dateArray.length; i++) {
            let value = await getPowerLongArchie(req.query.topic, dateArray[i].from, dateArray[i].to, duration);
            element.value = value;
            dateArray[i] = {
                ...element,
                value: element.value
            }
        }
        console.log(dateArray)
        res.status(200).json(
            {
                Data: { Row: dateArray },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        )
    }
    else {
        res.status(200).json(
            {
                Data: { Row: [], Total: 0, analysic: {} },
                Status: { StatusCode: 200, Message: 'OK' }
            }
        )
    }
});

getpower = async (topic, from, to) => {
    let Power = await mqtt
        .aggregate(
            [
                {
                    $match: {
                        topic,
                        date: {
                            $gte: from,
                            $lte: to
                        }
                    }

                },
                {
                    $group:
                    {
                        _id: "$topic",
                        maxEnergy: { $max: "$energy" },
                        minEnergy: { $min: "$energy" },
                    }
                },
                {
                    $addFields: {
                        totalEnergy: { $subtract: ["$maxEnergy", "$minEnergy"] }
                    }
                }
            ]
        )
    return Power[0];
}
getPowerLongArchie = async (topic, from, to, duration) => {
    console.log(topic);
    console.log(from);
    console.log(to);
    console.log(duration);
    let power = await mqtt.aggregate([
        {
            $match: {
                topic: topic,
                date: {
                    $gte: from,
                    $lte: to
                }
            }

        },
        {
            $group: {
                "_id": {
                    "$toDate": {
                        "$subtract": [
                            { "$toLong": "$date" },
                            { "$mod": [{ "$toLong": "$date" }, 1000 * 60 * Number(duration)] }
                        ]
                    },

                },
                "power": { $max: "$power" },
                "volt": { $first: "$volt" },
                "curr": { $first: "$current" },
                "fre": { $first: "$frequency" },
                "count": { "$sum": 1 }
            }
        }
    ]).sort({ _id: 1 })

    return power;
}
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