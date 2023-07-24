const express= require('express')
const signUpController= require('../controller/signUpController')
const router=express.Router();

router.get('/signup',signUpController.getSignUpPage);
router.post('/signup',signUpController.signUp);
module.exports=router;