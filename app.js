const express=require("express");
const app=express();
const {router}=require("./src/router")
const session=require("express-session")
const nocache=require("nocache")
const {admin}=require("./src/admin")



//session calling
app.use(nocache());
app.use(session({
    secret:"your-secret-key",
    resave:false,
    saveUninitialized:true
}))

//router connect
app.use("/",router)
app.use("/admin",admin)



//view engine
app.set("view engine","ejs")



//host
app.listen(4000,()=>{
    console.log("connected to http://localhost:4000")
})
