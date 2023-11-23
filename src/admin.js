const express=require("express");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const admin=express.Router();
const {usermodel}=require("./router");


admin.use(express.urlencoded({extended:true}))

//connecting mongodb
mongoose.connect("mongodb://127.0.0.1:27017/profile").then(console.log("done"));
const userschema=new mongoose.Schema({
    username:String,
    password:String,
});
//creating model
const adminsModel=new mongoose.model("admin",userschema)


//authentication function
function adsignin(req, res, next) {
    if (req.session.isadAuth) {
      next();
    } else {
      res.redirect("/admin");
    }
  }

//admin router setting
admin.get("/",(req,res)=>{
    if(req.session.isadAuth){
        res.redirect("/admin/adminhome")
    }else{
    res.render("admin")
    }
})

// admin.get("/adminhome",(req,res)=>{
//     res.render("adminhome")
// })


//admin login
admin.post("/adminlogin",async(req,res)=>{
    try{
const data=await adminsModel.findOne({username:req.body.username});
        if(data.username==req.body.username){
            if(data.password==req.body.password){
            req.session.isadAuth=true;
            res.redirect("/admin/adminhome")
            }
            else{
                res.render("admin",{perror:"invalid password"})
            }
        }
    }
        catch {
            res.render("admin",{unerror:"invalid username"})
        }    
    
    
})        


//admin home 
admin.get("/adminhome",adsignin,async(req,res)=>{
    if(req.session.isadAuth){
        const data=await usermodel.find();
        
        res.render("adminhome",{users:data})
    }
    else{
        res.redirect("/admin")
    }
})


//admin add user router
admin.get("/adduser",adsignin,async(req,res)=>{
    if(req.session.isadAuth){
        res.render("adduser")
    }
    else{
        res.redirect("/admin")
    }
})

//admin adding user and submitting
admin.post("/addnewuser",adsignin,async(req,res)=>{
    if(req.session.isadAuth){
        const emailexist=await usermodel.findOne({email:req.body.email})
        if(emailexist){
            res.render("adduser",{emailexist:"Email already exist"})
        }
        else{
            const{username,email,password}=req.body;
            const hashedpassword=await bcrypt.hash(req.body.password,10)
            await usermodel.insertMany([{username:username,email:email,password:hashedpassword}])
            res.redirect("/admin/adminhome")
        }

    }
    else{
        res.redirect("/admin")
    }
})


//admin search
admin.post("/adminhome",adsignin, async (req, res) => {
    if (req.session.isadAuth) {
        const name = req.body.search;
        const data = await usermodel.find({ username: { $regex: new RegExp(name, 'i') } });
        res.render('adminhome', { users: data })
    } else {
        res.redirect('/admin')
    }
})




//admin update
admin.get('/update/:email', adsignin, async (req, res) => {
    if (req.session.isadAuth) {
        const useremail = req.params.email;
        const user = await usermodel.findOne({email: useremail })
        res.render("updateuser",{data: user })
    } else {
        res.redirect('/admin')
    }                                                                                                                                                           
})
  admin.post("/update/:email", adsignin, async (req, res) => {
    if (req.session.isadAuth) {
      const useremail = req.params.email;

      const emailexist=await usermodel.findOne({$and:[{email:req.body.email},{email:{$ne:useremail}}]})
      if(emailexist)
      {
        res.render("update",{emailsexist:"Email already exists"})
      }
      else
      {
      await usermodel.updateOne(
        { email: useremail },
        { username: req.body.name, email: req.body.email }
      )
      res.redirect("/admin/adminhome");
      }
    } 
    else
    {
      res.redirect("/admin");
    }
  });


//admin delete
admin.get("/delete/:email",adsignin,async(req,res)=>{
    if(req.session.isadAuth) {
        const userid = req.params.email;
        await usermodel.deleteOne({email:userid})
        res.redirect("/admin/adminhome");
    }
    else {
        res.redirect("/admin/adminhome")
    }

});

//admin logout
admin.get('/adminlogout',(req,res)=>{
    req.session.isadAuth=false;
    req.session.destroy();
    res.redirect('/admin')
})

module.exports={admin}