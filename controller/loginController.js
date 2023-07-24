const path = require('path')
const users = require('../model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

var generateToken = (id) => {
    return jwt.sign({ userId: id }, "secretkey");
}

var getLoginPage = async (req, res, next) => {
    try {
        res.sendFile(path.join(__dirname, "..", "views", "login.html"));
    } catch (error) {
        res.status(500).json({ Error: error });
    }
}

var submitLoginForm = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        var userFound = await users.findOne({
            where: {
                email: email
            }
        })
        if (!userFound) {
            res.status(404).json({ Error: "User not found", success: "false" });
        } else {
            // console.log(userFound.password,userFound.id)
            // console.log(generateToken(userFound.id));
            if (await bcrypt.compare(password, userFound.password)) {
                res.status(200).json({ message: "User login successful", status: true, token: generateToken(userFound.id) })

            } else {
                res.status(401).json({ Error: "User not authorized", success: "false" });
            }

        }

    } catch (error) {
        res.status(500).json({ Error: error, success: "false" });
    }
}

module.exports = {
    getLoginPage,
    submitLoginForm
}