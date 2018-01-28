var mongoose = require('mongoose');
// var {Schema} = require('mongoose');
var validator = require('validator');

var isGoodPassword = (str)=>{
    if(str.length <8)return false;
    if(str.match(/\s/g) != null)return false;
    if(str.match(/[0-9]/g) === null)return false;
    if(str.match(/[^a-zA-Z0-9]/g) === null)return false;
    return true;
};

var UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        minlength:8,
        trim:true,
        unique:true,
        validate:{
            validator:validator.isEmail,
            message:'{VALUE} is not an email'
        }
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        validate:{
            validator: isGoodPassword,
            message: 'not so good'
        }
    },
    admin:{
        type:Boolean
    }
});

module.exports = mongoose.model('user',UserSchema);