require('dotenv').config()
const express = require ('express')
const app = express()
const connectDB = require('./config/db')
const User = require('./models/User')
const  Category = require('./model/Category')
app.get('/',(req,res)=>{
    res.send('Apoorv')
})

connectDB()

app.listen(3000,()=>{
    console.log("server is working on 3000 port");
    
})

