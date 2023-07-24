const path= require('path')
const user= require('../model/user')
const bcrypt=require('bcryptjs')

var getSignUpPage =  async (req,res,next)=>{
    try {
        res.sendFile(path.join(__dirname,"..","views","signup.html"));
    } catch (error) {
        console.log(error);
    }
}

var signUp= async(req,res,next)=>{
    try {
        let {username,email,password,phonenumber}= req.body;
            let saltrounds=10;
            let hashedPassword=await bcrypt.hash(password,saltrounds);
            const data=await user.create({
                username:username,
                email:email,
                password:hashedPassword,
                phonenumber:phonenumber

            })

            res.status(201).json({message:"New User Created",success:true})
    } catch (error) {
        res.status(500).json({Error:error,success:false})
    }
}

module.exports={
    getSignUpPage,
    signUp
}