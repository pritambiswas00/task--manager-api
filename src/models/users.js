const mongoose = require('mongoose');
const validator = require('validator')

const Bycrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Tasks = require('./tasks')


const userschema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true, 
            
            validate(value){
                if(!(validator.isEmail(value))){
                        throw new Error('Please enter valid Email')
                }
            }
    
        },
        password:{
            type: String,
            required: true,
            minlength: 7,
            validate(value){
                if(value.toLowerCase().includes('password')){
                    throw new Error('Password can not contain password');
                }
    
            }
    
    
        },
        age:{
            type: Number,
            validate(value){
                if(value <0){
                    throw new Error('Age must be positive')
                }
    
            },
            trim: true,
            default: 0,
            lowercase: true
    
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }],
        avators: {
            type: Buffer
       }
    
    },{
        timestamps:true
    })

    userschema.virtual('tasks',{
        ref: 'Tasks',
        localField: '_id',
        foreignField: 'user'
    })
    userschema.methods.toJSON = function (){
        const user = this;
        const userData = user.toObject();
        delete userData.password;
        delete userData.tokens;
        return userData;
    }

userschema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token;
}
userschema.statics.checkingCredentials = async (email, password)=>{
           
    const user = await User.findOne({email: email});
    if(!user){
        throw new Error('Invalid! Could not find the user')
    }
    const isMatch = await Bycrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Invalid! Could not find the user')
    }
    return user
}

userschema.pre('save', async function(next){
    const user = this;

    if(user.isModified('password')){
        user.password = await Bycrypt.hash(user.password, 8)
    }


    next();
})


const User = mongoose.model('User', userschema);

module.exports = User;