const express=require("express");
const path=require("path");
const router=express.Router();
const mongoose=require("mongoose");
const bcrypt=require("bcrypt")

router.use(express.urlencoded({extended:true}))


//connecting mongodb
mongoose.connect("mongodb://127.0.0.1:27017/profile").then(console.log("done"));
const userschema=new mongoose.Schema({
    username:String,
    email:String,
    password:String,
});
//creating model
const usermodel=new mongoose.model("user",userschema)


//middleware setting
function signin(req,res,next){
    if(req.session.isAuth){
        next();
    }
    else{
        res.redirect("/")
    }
}

// signin data collection
router.post("/signin",async(req,res)=>{
    const emailexist=await usermodel.findOne({
      email:req.body.email  
    });
    if(emailexist){
        res.render("signin",{emailexist:"email already exist"});
    }
    else{
        const hashedpassword=await bcrypt.hash(req.body.password,10)
        const {username,email}=req.body;
        await usermodel.insertMany([
            {username:username,email:email,password:hashedpassword}
        ]);
        res.redirect("/")
    }
})



//login data process

router.post("/login",async(req,res)=>{
    try{
        const data=await usermodel.findOne({
            username:req.body.username
        });
        const passwordmatch=await bcrypt.compare(req.body.password,data.password);

        if(passwordmatch){
            req.session.username=req.body.username;
            req.session.isAuth=true;
            res.redirect("/home")
        }
        else{
            res.render("login",{perror:"Invalid password"})
        }
    }
    catch{
        res.render("login",{unerror:"Invalid username"})
    }
})



//login page
router.get("/",async(req,res)=>{
    if(req.session.isAuth){
        res.redirect("/home")
    }
    else{
    res.render("login")
    }
})

//signin page
router.get("/signin",(req,res)=>{
    if(req.session.isAuth){
        res.redirect("/home")
    }
    else{
    res.render("signin")
    }
})

//home page
router.get("/home",(req,res)=>{
    if(req.session.isAuth){
        res.render("home")
    }
    else{
    res.redirect("/")
    }
})

//logout
router.get("/logout",(req,res)=>{
    req.session.isAuth=false;
    req.session.destroy();
    res.redirect("/")

})



module.exports={router,usermodel}