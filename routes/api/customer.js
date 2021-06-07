const express = require('express');
const router = express.Router();
const { customerValidation } = require('../../validation')
const verify = require('../verifyToken');
// Customer Model
const Customer = require('../../models/Customer');

//@route GeT api/customers
//@desc Get all customers
//@access Public
router.get('/', verify, (req, res) => {
    Customer.find()
        .sort({ date: -1 })
        .then(customers => res.json(customers));
});
//@route POST api/customers
//@desc Create an customers
//@access Public
router.post('/', verify, (req, res) => {
    //let validate the data before we a user
    const { error } = customerValidation(req.body);
    if (error) {
        console.log(error)

        return res.status(400).json(error.details[0].message);
    }

    const newCustomer = new Customer({
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        facebook: req.body.facebook
    });
    newCustomer.save()
        .then(customer => res.json(customer))
        .catch(err =>
            //console.log(err.message)
            res.status(400).json(err.errors.name.message) //gửi lỗi khi trùng customerID
        )
        ;
})

//@route DELETE api/orders:id
//@desc delete an orders
//@access Public
router.delete('/:id', verify, (req, res) => {
    Customer.findById(req.params.id)
        .then(customer => customer.remove().then(() => res.json({ success: true })))
        .catch(err => res.status(404).json({ success: false }))
})

//update customer
router.patch('/:customerId', verify, async (req, res) => {
    try {
        const updateCustomer = await Customer.updateOne(
            { _id: req.params.customerId },
            {
                $set: {
                    name: req.body.name,
                    phoneNumber: req.body.phoneNumber,
                    address: req.body.address,
                    facebook: req.body.facebook
                }
            })
        res.json(updateCustomer);
    } catch (err) {
        res.json({ message: err });
    }
})
//get one customer by id
router.get('/:id', verify, (req, res) => {
    Customer.findById(req.params.id)
        .then(customer => {
            res.json(customer)
        })
})

module.exports = router;