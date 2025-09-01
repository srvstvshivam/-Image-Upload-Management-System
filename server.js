import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import multer from 'multer'

const app = express();
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: 'dzwbk29is',
    api_key: '433275784131842',
    api_secret: 'KN-sXMmQTAhvhxkCPnBjcUXIYlQ'
});


app.use(express.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://Shivam:shivam12@cluster.fg12tqg.mongodb.net/", {
    dbname: "NodeJS_Mastery_course",
  }).then(() => {
    console.log("Connected to MongoDB");
  }).catch((err)=>{
    console.log(err);
});


app.get("/",(req,res)=>{
    res.render("index.ejs",{url: null});
})


const storage = multer.diskStorage({
    destination:"./public/uploads",
    filename:function(req,file,cb){
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null,file.fieldname + '-' + uniqueSuffix);
    }
});
const upload = multer({storage:storage});

const imageSchema = new mongoose.Schema({
    filename:String,
    public_id:String,
    imgUrl:String
})
const File = mongoose.model("cloudianry",imageSchema);

app.post("/upload",upload.single("image"),async (req,res)=>{
    try{
        const result = await cloudinary.uploader.upload(req.file.path);
        console.log(result);
// saving the file in mongodb
        const db = await File.create({
            filename:req.file.filename,
            public_id:result.public_id,
            imgUrl:result.secure_url
        })

        res.render("index.ejs",{url:result.secure_url});
    }catch(err){
        console.log(err);
        res.send("Something went wrong");
    }   
})


















const port = 3000;
app.listen(port,()=>{
    console.log (`sever is running on http://localhost:${port}`);
})