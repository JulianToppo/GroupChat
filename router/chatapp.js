const express= require('express')
const chatAppController= require('../controller/chatappController')
const authorization=require('../middlewares/authorization')
const fileUpload = require('express-fileupload');
const router=express.Router();

router.get('/chatapp',chatAppController.getChatAppPage);
router.post('/chatapp/sendmessage',authorization.authorizationUser,chatAppController.sendMessages);
router.get('/chatapp/getmessages/:lastId/:groupId',authorization.authorizationUser,chatAppController.getMessages);
router.get('/chatapp/getusername/:userId',authorization.authorizationUser,chatAppController.getUsername);
router.get('/chatapp/getusername/',authorization.authorizationUser,chatAppController.getActiveUsers);
router.get('/chatapp/getgroups',authorization.authorizationUser,chatAppController.getGroups);
router.post('/chatapp/addgroup',authorization.authorizationUser,chatAppController.addGroup);
router.get('/chatapp/getusers',authorization.authorizationUser,chatAppController.getUsers);
router.post('/chatapp/sendinvite',authorization.authorizationUser,chatAppController.userEntryForRequest);
router.get('/chatapp/getRequests',authorization.authorizationUser,chatAppController.getRequestList);
router.post('/chatapp/updateGroups',authorization.authorizationUser,chatAppController.updateGroups)
router.get('/chatapp/getGroupMembers/:groupID',authorization.authorizationUser,chatAppController.getUsersInGroup);
router.post('/chatapp/makeadmin',authorization.authorizationUser,chatAppController.makeUserAdmin);
router.post('/chatapp/deleteUserFromGroup',authorization.authorizationUser,chatAppController.deleteUserFromGroup);
router.get('/chatapp/isadmin/:userID/:groupID',authorization.authorizationUser,chatAppController.isadmin);
router.get('/chatapp/getid',authorization.authorizationUser,chatAppController.getId);
router.get('/chatapp/getfile/:fileID',authorization.authorizationUser,chatAppController.getFileUrl);

module.exports=router;