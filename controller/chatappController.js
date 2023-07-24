const path = require('path')
const messagesTB = require('../model/messages')
const archiveChats = require('../model/archivedChat')
const UserTB = require('../model/user')
const groupTB = require('../model/groups')
const { Op } = require("sequelize");
const UserGroupsTB = require('../model/user-groups');
const inviteRequests = require('../model/inviteRequest')
const admin = require('../model/admin')
const AWS = require('aws-sdk');
const sequelize = require("../util/database")
const fileUploads = require('../model/fileUploads')

var getChatAppPage = async (req, res, next) => {

    try {
        res.sendFile(path.join(__dirname, "..", "views", "chatapppage.html"))
    } catch (error) {
        res.status(500).json({ Error: error })
    }
}

// Uploads the file to s3bucket in aws
var uploadToS3 = (data, filename) => {
    console.log("inside upload to s3");
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET

    console.log(BUCKET_NAME);
    var s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    })

    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read' //access control list
    }

    console.log("after params")

    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3reponse) => {
            if (err) {
                console.log("Something went wrong", err);
                reject(err);
            } else {
                console.log("Success", s3reponse);
                resolve(s3reponse.Location);
            }
        })
    })
}

//Retrives and uploads the messages for corresponding groups and user with realtime update
//in connected socket-clients
var sendMessages = async (req, res, next,) => {
    const t = await sequelize.transaction();
    try {
        console.log("Send messages called")
        const { message, groupID } = req.body;
        console.log(message, groupID)
        let fileUploadCreated;
        let createSuccessful;
        if (req.files != null) {
            let filename = req.user.id + "/" + req.files.file.name;
            const fileContent = Buffer.from(req.files.file.data, 'binary');

            const S3fileURL = await uploadToS3(fileContent, filename);
            fileUploadCreated = await fileUploads.create({
                fileURL: S3fileURL,
                userId: req.user.id
            }, { transaction: t })
            createSuccessful = await messagesTB.create({
                message: message,
                userId: req.user.id,
                groupId: groupID,
                fileUploadId: req.files != null ? fileUploadCreated.id : 0
            }, { transaction: t })

        }
        else {
            await messagesTB.create({
                message: message,
                userId: req.user.id,
                groupId: groupID,
            }, { transaction: t })
        }
        await t.commit();
        res.status(201).json({ message: "Message entry made into the database", status: true })
        req.io.emit('showmessages', { groupId: groupID, userId: req.user.id });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error, status: false })
    }
}

var getMessages = async (req, res, next) => {

    try {
        const { lastId, groupId } = req.params;
        console.log(lastId);
        let userMessages = await messagesTB.findAll({
            where: {
                id: {
                    [Op.gt]: lastId
                },
                groupID: groupId

            }
        })
        console.log(userMessages.length)

        res.status(200).json({ message: "User Messages retrieved", messages: userMessages, status: true })
    } catch (error) {

        res.status(500).json({ message: error, status: false })
    }
}

//Getting the username from user-id as parameter
var getUsername = async (req, res, next) => {

    try {
        const { userId } = req.params;
        if (userId == req.user.id) {
            res.status(200).json({ username: "You", status: true })
        }
        else {
            UserTB.findOne({
                where: {
                    id: userId
                }
            }).then(async result => {
                res.status(200).json({ username: result.username, status: true })
            }).catch(async error => {
                res.status(500).json({ message: error, status: false })
            })
        }
    } catch (error) {
        res.status(500).json({ message: error, status: false })
    }
}

//Active username
var getActiveUsers = async (req, res, next) => {

    try {
        await UserTB.findOne({
            where: {
                id: req.user.id
            }
        }).then(async result => {

            res.status(200).json({ username: result.username, status: true })
        })
    } catch (error) {

        console.log(error)
    }
}

var getGroups = async (req, res, next) => {

    try {
        // console.log("userIDdddddddd", req.user.id)
        await UserTB.findAll({
            where: {
                id: req.user.id
            },
            include: groupTB
        }
        ).then(async result => {

            res.status(200).json({ groups: result, status: true })
        }).catch(async err => {

            console.log(err)
            res.status(500).json({ error: err, status: false })
        })
    } catch (error) {
        res.status(500).json({ message: error, status: false })
    }
}

var addGroup = async (req, res, next) => {

    try {
        const { groupName } = req.body;
        console.log("groupname", groupName)
        await groupTB.create({
            name: groupName,
        }).then(async result => {
            //Linking the tables user and groups
            let addUserGroup = await req.user.addGroup(result);
            if (addUserGroup.length < 1) {

                res.status(500).json({ Error: addUserGroup, status: false })
            }
            let adminEntry = await admin.create({
                status: true,
                userId: req.user.id,
                groupId: result.id
            })

            if (adminEntry.length < 1) {

                res.status(500).json({ Error: adminEntry, status: false })
            }

            res.status(201).json({ data: result, status: true })
        }).catch(async err => {

            res.status(500).json({ Error: err, status: false })
        })

    } catch (error) {
        res.status(500).json({ Error: error, status: false })
    }
}

//Get all the users
var getUsers = async (req, res, next) => {
    try {
        await UserTB.findAll().then(
            result => {
                res.status(200).json({ data: result, status: true })
            }
        )
    } catch (error) {
        res.status(500).json({ Error: error, status: false })
    }
}

//making entries in the request table
var userEntryForRequest = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { userInvited, PhoneNumber, Email, groupID } = req.body;
        console.log("inside user Request", userInvited, PhoneNumber, Email, groupID)
        await UserTB.findOne({
            where: {
                username: userInvited,
                phonenumber: PhoneNumber,
                email: Email
            }
        }).then(result => {

            console.log("usernameidcheck", result.id, req.user.id);
            if (result.id == req.user.id) {
                throw new Error("User can't sent invite to himself!")
            } else {
                inviteRequests.create({
                    invitationBy: req.user.id,
                    userId: result.id,
                    groupId: groupID,
                    status: "pending"
                }, { transaction: t }).then(async insertedData => {
                    await t.commit();
                    res.status(201).json({ data: insertedData, status: true })
                    req.io.emit('pendingRequestCheck', { username: result.username });
                }).catch(async err => {
                    await t.rollback();
                    res.status(500).json({ Error: err, status: false })
                })
            }

        }).catch(async err => {
            await t.rollback();
            res.status(500).json({ Error: err, status: false })
        })
    } catch (error) {
        await t.rollback();
        res.status(500).json({ Error: error, status: false })
    }
}

var getRequestList = async (req, res, next) => {
    try {
        await inviteRequests.findAll({
            where: {
                userId: req.user.id
            },
            include: groupTB
        }).then(result => {
            res.status(200).json({ data: result, status: true })
        })
    } catch (error) {
        res.status(500).json({ Error: error, status: false })
    }
}

var updateGroups = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { groupID, invitedBy } = req.body;
        // console.log(groupID)
        await UserGroupsTB.create({
            userId: req.user.id,
            groupId: groupID
        }, { transaction: t }).then(
            result => {
                inviteRequests.update({
                    status: "accepted"
                },
                    {
                        where: {
                            invitationBy: invitedBy,
                            groupId: groupID,
                            userId: req.user.id
                        }
                    }, { transaction: t })

                res.status(201).json({ data: result, status: true })
            }
        )
        await t.commit();
    } catch (error) {
        await t.rollback();
        res.status(500).json({ Error: error, status: false })
    }
}

var getUsersInGroup = async (req, res, next) => {
    try {
        const { groupID } = req.params;
        await UserGroupsTB.findAll({
            where: {
                groupId: groupID
            }
        }).then(result => {
            res.status(201).json({ data: result, status: true })
        })

    } catch (error) {
        res.status(500).json({ Error: error, status: false })
    }
}

var makeUserAdmin = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { userid, groupID } = req.body;
        await admin.create({
            status: true,
            userId: userid,
            groupId: groupID
        }, { transaction: t }).then(async result => {
            await t.commit();
            res.status(201).json({ data: result, status: true })
        })
    } catch (error) {
        await t.rollback();
        res.status(500).json({ Error: error, status: false })
    }
}

var deleteUserFromGroup = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { userid, groupID } = req.body;
        UserGroupsTB.destroy({
            where: {
                userId: userid,
                groupId: groupID
            }
        }, { transaction: t }).then(async result => {
            await t.commit();
            res.status(200).json({ message: "User deleted from group", data: result, status: true })
            req.io.emit("deleteGroupChat", { deletedGpId: groupID, deleteduserid: userid });

        })
    } catch (error) {
        await t.rollback();
        res.status(500).json({ Error: error, status: false })
    }

}

var isadmin = async (req, res, next) => {
    try {
        let { userID, groupID } = req.params;
        console.log(userID)
        if (userID == "token") {
            console.log("check")
            userID = req.user.id;
        }
        console.log("userID", userID)
        admin.findOne({
            where: {
                userId: userID,
                groupId: groupID,
                status: true
            }
        }).then(result => {
            if (result == null) {
                res.status(200).json({ data: result, status: false })
            } else {
                res.status(200).json({ data: result, status: true })
            }

        })
    } catch (error) {
        res.status(500).json({ Error: error, status: false })
    }
}

var getId = async (req, res, next) => {
    try {
        res.status(200).json({ data: req.user, status: true })
    } catch (error) {
        res.status(500).json({ Error: error, status: false })
    }
}

var getFileUrl = async (req, res, next) => {
    try {
        const { fileID } = req.params;
        await fileUploads.findOne({
            where: {
                id: fileID
            }
        }).then(result => {
            res.status(200).json({ data: result.fileURL, status: true })
        })
    } catch (error) {
        res.status(500).json({ Error: error, status: false })
    }
}

module.exports = {
    getChatAppPage,
    sendMessages,
    getMessages,
    getUsername,
    getGroups,
    addGroup,
    getUsers,
    userEntryForRequest,
    getRequestList,
    updateGroups,
    getUsersInGroup,
    makeUserAdmin,
    deleteUserFromGroup,
    isadmin,
    getActiveUsers,
    getId,
    getFileUrl
}