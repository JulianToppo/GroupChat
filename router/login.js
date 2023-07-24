const express= require('express')
const loginController= require('../controller/loginController')
const router=express.Router();

router.get('/',loginController.getLoginPage);
router.post('/login',loginController.submitLoginForm);

module.exports=router;