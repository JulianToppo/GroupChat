const path = require("path");
const user = require("../model/user");
const jwt = require('jsonwebtoken');

exports.authorizationUser = async (req, res, next) => {
    try {
       
        let token = req.header("Authorization");
        console.log(token);
        const activeUser =jwt.verify(token, "secretkey");
        user.findByPk(activeUser.userId).then(result =>{
            req.user=result;
            next();
        })
    } catch (error) {
        res.status(401).json({success: false});
    }
}