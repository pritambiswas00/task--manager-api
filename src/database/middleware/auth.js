const jwt = require('jsonwebtoken');
const User = require('../../models/users')



const auth = async (req, res, next)=>{
     try{
         const token = req.header('Authorization').replace('Bearer ', '')
         
         const decode = jwt.verify(token, process.env.JWT_SECRET)
        
         const usser = await User.findOne({_id: decode.id, 'tokens.token': token})
         
         if(!usser){
             throw new Error();
         }
         req.token = token;
         req.user = usser;
         next();

     }catch(error){
         res.status(401).send({error: "Please check for Authorization"});
     }
}


module.exports = auth;