const Joi = require('joi')
//register validation
const resgisterValidation = (data) => {
    const schema = {
        name: Joi.string().min(6).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
        admin: Joi.bool().required(),

    }
    return Joi.validate(data, schema)
}
const mqttValidation = (data) => {
    const schema = {
        userId: Joi.string(),
        sn: Joi.string()
    }
    return Joi.validate(data, schema)
}
const deviceValidation = (data) => {
    const schema = {
        userId: Joi.string(),
        sn: Joi.string(),
        name: Joi.string()
    }
    return Joi.validate(data, schema)
}
const loginValidation = (data) => {
    const schema = {
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    }
    return Joi.validate(data, schema)
}
const createOrderValidation = (data) => {
    const schema = {
        userId: Joi.object().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "no userId" };
                    }
                })
            }),
        toolId: Joi.array().min(1)
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng chọn Tool" };
                    }
                })
            }),
        timeStart: Joi.date().required()
            .error((errors) => {
                return errors.map(error => {
                            return { message: "nhập sai định dạng ngày tháng" };
                    })
            }),
        timeStop: Joi.date().required()
            .error((errors) => {
                return errors.map(error => {
                    return { message: "nhập sai định dạng ngày tháng" };
                })
            }),
        WO: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "WO có 6 số" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng nhập WO" };
                    }
                })
            }),
        PCT: Joi.string().min(1).required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "number.min":
                            return { message: "Vui lòng nhập Số PCT" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng nhập Số PCT" };
                    }
                })
            }),
        NV: Joi.array().min(1)
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "number.min":
                            return { message: "Vui lòng nhập Số PCT" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng nhập nhân viên" };
                    }
                })
            }),
        content: Joi.string().min(1).required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "number.min":
                            return { message: "Vui lòng nhập Số PCT" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng nhập Số PCT" };
                    }
                })
            }),
        status: Joi.string().min(1).required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "number.min":
                            return { message: "Vui lòng chọn trạng thái" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng chọn trạng thái" };
                    }
                })
            }),
        statusTool: Joi.string()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "number.min":
                            return { message: "Vui lòng chọn trạng thái" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng chọn trạng thái" };
                    }
                })
            }),
    }
    return Joi.validate(data, schema)
}

const toolValidation = (data) => {
    const schema = {
        name: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Tên sản phẩm không để trống" };
                    }
                })
            }),
        manufacturer: Joi.string().min(1).required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "number.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Nhà sản xuất không để trống" };
                    }
                })
            }),
        type: Joi.string().min(1).required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "number.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng chọn chủng loại" };
                    }
                })
            }),
        quantity: Joi.number().min(0).required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "number.min":
                            return { message: "Vui lòng nhập số lượng" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Số lượng không để trống" };
                    }
                })
            }),
        images: Joi.array(),
    }
    return Joi.validate(data, schema)
}

const customerValidation = (data) => {
    const schema = {
        name: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Tên khách hàng không để trống" };
                    }
                })
            }),
            address: Joi.string()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Tên khách hàng không để trống" };
                    }
                })
            }),
            phoneNumber: Joi.number()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Tên khách hàng không để trống" };
                    }
                })
            }),
            facebook: Joi.string()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Tên khách hàng không để trống" };
                    }
                })
            }),
    }
    return Joi.validate(data, schema)
}
const cchttValidation = (data) => {
    const schema = {
        userId: Joi.string().required()
        .error((errors) => {
            return errors.map(error => {
                switch (error.type) {
                    case "string.min":
                        return { message: "first msg" };
                    case "string.max":
                        return { message: "second msg" };
                    case "any.empty":
                        return { message: "no userId" };
                }
            })
        }),
        WO: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "WO có 6 số" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng nhập WO" };
                    }
                })
            }),
        PCT: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "WO có 6 số" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng nhập số PCT" };
                    }
                })
            }),
        timeChange: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "WO có 6 số" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng chọn thời gian thay đổi" };
                    }
                })
            }),
         note: Joi.string().allow(null, '')
    }
    return Joi.validate(data, schema)
}
const cgsatValidation = (data) => {
    const schema = {
        userId: Joi.string().required()
        .error((errors) => {
            return errors.map(error => {
                switch (error.type) {
                    case "string.min":
                        return { message: "first msg" };
                    case "string.max":
                        return { message: "second msg" };
                    case "any.empty":
                        return { message: "no userId" };
                }
            })
        }),
        WO: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "WO có 6 số" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng nhập WO" };
                    }
                })
            }),
        PCT: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "WO có 6 số" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng nhập số PCT" };
                    }
                })
            }),
        timeChange: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "WO có 6 số" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng chọn thời gian thay đổi" };
                    }
                })
            }),
         note: Joi.string().allow(null, '')
    }
    return Joi.validate(data, schema)
}
const bbdgktValidation = (data) => {
    const schema = {
        userId: Joi.string().required()
        .error((errors) => {
            return errors.map(error => {
                switch (error.type) {
                    case "string.min":
                        return { message: "first msg" };
                    case "string.max":
                        return { message: "second msg" };
                    case "any.empty":
                        return { message: "no userId" };
                }
            })
        }),
        WO: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "WO có 6 số" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng nhập WO" };
                    }
                })
            }),
        content: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "WO có 6 số" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng nhập số PCT" };
                    }
                })
            }),
        time: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "WO có 6 số" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng chọn thời gian thay đổi" };
                    }
                })
            }),
        group: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "WO có 6 số" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng chọn thời gian thay đổi" };
                    }
                })
            }),
         note: Joi.string().allow(null, '')
    }
    return Joi.validate(data, schema)
}
const bptcValidation = (data) => {
    const schema = {
        userId: Joi.string().required()
        .error((errors) => {
            return errors.map(error => {
                switch (error.type) {
                    case "string.min":
                        return { message: "first msg" };
                    case "string.max":
                        return { message: "second msg" };
                    case "any.empty":
                        return { message: "no userId" };
                }
            })
        }),
        content: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "WO có 6 số" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng nhập số PCT" };
                    }
                })
            }),
        group: Joi.string().required()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "WO có 6 số" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Vui lòng chọn thời gian thay đổi" };
                    }
                })
            }),
         note: Joi.string().allow(null, '')
    }
    return Joi.validate(data, schema)
}

const postValidation = (data) => {
    const schema = {
            title: Joi.string()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Tiêu đề không để trống" };
                    }
                })
            }),
            author: Joi.string()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Tên tác giả không để trống" };
                    }
                })
            }),
            description: Joi.string()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Mô tả không để trống" };
                    }
                })
            }),
            content: Joi.string()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Nội dung không để trống" };
                    }
                })
            }),
            category: Joi.string()
            .error((errors) => {
                return errors.map(error => {
                    switch (error.type) {
                        case "string.min":
                            return { message: "first msg" };
                        case "string.max":
                            return { message: "second msg" };
                        case "any.empty":
                            return { message: "Danh mục không để trống" };
                    }
                })
            }),
    }
    return Joi.validate(data, schema)
}

module.exports.toolValidation = toolValidation;
module.exports.resgisterValidation = resgisterValidation;
module.exports.loginValidation = loginValidation;
module.exports.createOrderValidation = createOrderValidation;
module.exports.customerValidation = customerValidation;
module.exports.postValidation = postValidation;
module.exports.cchttValidation = cchttValidation;
module.exports.cgsatValidation = cgsatValidation;
module.exports.bbdgktValidation = bbdgktValidation;
module.exports.bptcValidation = bptcValidation;
module.exports.mqttValidation = mqttValidation;
module.exports.deviceValidation = deviceValidation;
