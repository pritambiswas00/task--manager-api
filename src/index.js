const express = require('express')
require('./database/mongoose')
const User = require('./models/users')
const Tasks = require('./models/tasks')
const userRoute = require('./routers/users')
const tasksRoute = require('./routers/tasks');

const app = express()

const port = process.env.PORT

// app.use((req,res,next)=>{


app.use(express.json())
app.use(userRoute);
app.use(tasksRoute);









app.listen(port, ()=>{
    console.log('Server is up '+ port)
})
