const mongoose = require('mongoose');
const validator = require('validator')


mongoose.connect(process.env.MONGODB_URL,{useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true})







// const firstTask = new Tasks({
//     description: 'do the work',
//     completed: true
// })

// me.save().then(()=>{
//     console.log(me)

// }).catch((error)=>{
//     console.log('Error', error)
// })

// firstTask.save().then(()=>{
//     console.log(firstTask)

// }).catch((error)=>{
//      console.log(error)
// })

