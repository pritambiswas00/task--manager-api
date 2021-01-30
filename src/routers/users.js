const express = require('express')
const User = require('../models/users')
const {sendWelcomeMessage, userDeleteAccount} = require('../emails/email')
require('../database/mongoose')
const auth = require('../database/middleware/auth');
const Tasks = require('../models/tasks');
const multer = require('multer');
const sharp = require('sharp');
const upload = multer({
    limits: {
      fileSize: 1000000
    },
    fileFilter(req,file, cb){
          if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
              return cb(new Error('Please upload a jpg or jpeg or png'))
          }
          cb(undefined, true)
    }
})

const router = new express.Router();

router.post('/users', async (req, res)=>{

    const users = new User(req.body)

    try{
        await users.save();
        const token = await users.generateAuthToken();
        const userData =users.toJSON();
        sendWelcomeMessage(users.email, users.name)
    
        res.status(200).send({ usersProfile: userData, token})

    }catch(e){
       res.status(500).send(e)

    }       
})


router.post('/users/login', async (req, res)=>{
         
         try{
             const userProfile = await User.checkingCredentials (req.body.email, req.body.password)
             
             const token = await userProfile.generateAuthToken()
             
             res.send({userProfile, token})
              
         }catch(e){
             res.status(500).send(e)
         }
})
router.post('/users/logout', auth, async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token=>{
              return token.token !=req.token
        })
        await req.user.save()
        res.send('You have successfully logged out')


    }catch(e){
        res.status(500).send(e);
    }
})
router.post('/users/logoutAll', auth, async (req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save();
        res.send('You have successfully logged out from every devices');
    }catch(e){
        res.status(500).send(e);
    }
})

router.get('/users/me',auth, async (req,res)=>{

      res.send(req.user);

})
///////////////////////////////////////////////////////////////
router.patch('/users/me', auth,async (req, res)=>{
    const  updateItems = ['name', 'password', 'email', 'age'];
    const providedItems = Object.keys(req.body);

     const isEligableForOperation = providedItems.every((items)=>{
                return updateItems.includes(items)
     }) 

     if(!isEligableForOperation){
         return res.status(404).send('Error invalid update');
     }
    

    try{
      //  const updateUser = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
     
      

      providedItems.forEach((update)=>{
          req.user[update] = req.body[update]

      })
      
          await req.user.save()
         res.status(202).send(req.user);

    }catch(e){
        res.status(400).send(e)
    }
})
/////////////////////////////////////////////////////////////////////
router.delete('/users/me', auth,  async (req, res)=>{


       try{
  
         await req.user.remove(req.user);
         userDeleteAccount(req.user.email, req.user.name)
         await Tasks.deleteMany({user: req.user._id})
        res.status(202).send("Your Account is Deleted.")
       }

        


    catch(e){
        res.status(500).send(e)
    }
})

router.post('/users/me/avators',auth, upload.single('avators'), async (req,res)=>{
    //req.user.avators = req.file.buffer
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avators = buffer
    await req.user.save()
    res.send('Profile picture has been uploaded');
},(error, req, res,next)=>{
    res.status(400).send({error:error.message});
})
router.delete('/users/me/avators',auth, async(req,res)=>{
           req.user.avators = undefined
           await req.user.save()
           res.status(200).send('Deleted profile picture')
    })
    router.get('/users/me/:id/avators', async(req,res)=>{
        try{
                const user= await User.findById(req.params.id)
                if(!user || !user.avators){
                     throw new Error()
                }
                res.set('Content-Type','image/png')
                res.send(user.avators)
        }catch(e){
            res.status(500).send("Sorry no profile forthe users")
        }
    })

module.exports = router;