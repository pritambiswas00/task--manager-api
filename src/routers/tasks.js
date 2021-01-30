const express = require('express');
const Tasks = require('../models/tasks')
require('../database/mongoose');
const router = new express.Router();
const auth = require('../database/middleware/auth')

router.post('/tasks',auth,  async (req, res)=>{



    const tasks = new Tasks({
        ...req.body,
        user: req.user._id
    });
    try{

       await tasks.save();
       res.status(200).send(tasks);

    }catch(e){
        res.status(400).send(e)
    }



})





router.get('/tasks',auth,  async (req, res)=>{
    const sort = {}

    const match ={}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
       const parts = req.query.sortBy.split(':')
       sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
    await req.user.populate({
        path: 'tasks',
        match,
        options: {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
        }
    }).execPopulate()

        res.status(200).send(req.user.tasks);

    }catch(e){
        res.status(500).send(e)
    }

})

router.get('/tasks/:id',auth, async (req, res)=>{

    const _id = req.params.id;

    try{
        const searchTask = await Tasks.findOne({_id, user: req.user._id})
        if(!searchTask){
            return res.status(404).send()
        }
        res.status(200).send(searchTask);

    }catch(e){
        res.status(500).send(e)
    }

})


router.patch('/tasks/:id',auth, async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Tasks.findOne({_id:req.params.id, user: req.user._id})

       
       

        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch (e) {
        res.status(400).send("error asche ")
    }

})

router.delete('/tasks/:id',auth,  async (req, res)=>{


    try{
        const tasksFound = await Tasks.findOneAndDelete({_id: req.params.id, user: req.user._id});
        if(!tasksFound){
            return res.status(404).send("tasks could not found");
        }
        res.status(200).send(tasksFound);

    }catch(e){
        res.status(400).send(e)
    }

})

module.exports = router;

//  /home/pritam/mongodb/bin/mongod --dbpath=/home/pritam/mongodb-data