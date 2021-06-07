const express = require('express');
const router = express.Router();
const { toolValidation } = require('../../validation')
const verify = require('../verifyToken');
// Order Model
const Tool = require('../../models/Tool');

router.get('/', verify, (req, res) => {
    // Tool.aggregate([
    //     // { $project : {
    //     //     _id : 1,
    //     //     userId: 1
    //     //   }
    //     // },
    //     { $lookup : {
    //         "from" : "orders",
    //         "localField" : "_id",
    //         "foreignField" : "toolId",
    //         "as" : "woInfo"      
    //       }
    //     },
    //     {
    //         $unwind: "$woInfo"
    //     },
    //     {
    //         $lookup: {
    //             "from": "users",
    //             "localField": "woInfo.userId",
    //             "foreignField": "_id",
    //             "as": "woInfo.detail"
    //         }
    //     }
    //   ]).then(tools => res.json(tools));
    Tool.aggregate([
        {
            $lookup: {
                from: "orders",
                let: { id: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            $expr:
                            {
                                $and: [
                                    { $in: ["$$id", "$toolId"] },                                    
                                ]
                            }

                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: { id: "$userId" },
                            pipeline: [
                                { $match: { $expr: { $eq: ["$$id", "$_id"] } } },
                                {
                                    $project: {
                                        _id: 1,
                                        name: 1
                                    }
                                }
                            ],
                            as: "userInfo"
                        }
                    },
                    { $unwind: "$userInfo" }
                ],
                as: "woInfo"
            }
        }
    ]).then(tools => res.json(tools));
});


module.exports = router;