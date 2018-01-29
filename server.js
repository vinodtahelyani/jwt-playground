const mongoose = require('mongoose');
const config = require('./config');
const express = require('express');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const user = require('./models/user');
var _ = require('lodash');

var app = express();
var port =  process.env.PORT || 3000;
mongoose.connect(config.database,()=>{
    console.log('connnected to db successfully');
});
app.set('superSecret',config.secret);

// use body parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// use morgan
app.use(morgan('dev'));

// routes
app.get('/',(req,res)=>{
    res.send(`Hello! The API is at <a href="http://localhost:3000/api">http://localhost:` + port + '/api</a>');
});

app.get('/setup',(req,res)=>{
    var vin = new user({
        email:'vinodtahalyawlaaawni2@gmail.com',
        password:'123###pweeeee',
        admin:true
    });
    vin.save().then((doc)=>{
        res.status(200).send(doc);
    }).catch((err)=>{
        res.send(err.message);
    });
})

// aPI Routes

var apiRoutes = express.Router();

apiRoutes.get('/',(req,res)=>{
    res.json({message:'Welcome to the coolest api on this planet'});
});

// authentication
apiRoutes.post('/authenticate',(req,res)=>{
    console.log(req.body.email);
    user.findOne({"email":req.body.email}).then((doc)=>{
        var pass = req.body.password;
        if(doc === null)return res.status(400).send({'message':'invalid email'});
        if(doc.password.trim() != pass.trim()){
            return res.status(401).send(doc.password + req.body.password );            
        }else{
            const payload = {
                admin:doc.admin
            }
            var token = jwt.sign(payload,app.get('superSecret'),{
                expiresIn:'1d'
            });
            res.status(200).json({
                success:true,
                message:'Enjoy your token',
                token:token
            });

        }
    }).catch((err)=>{
        res.status(400).send('something went wrong');
    });
});

apiRoutes.use((req,res,next)=>{
    var token = req.body.token || req.headers['x-access-token'];
    if(token){
        jwt.verify(token,app.get('superSecret'),(err,decoded)=>{
            if(err){
                res.send({ success: false, message: err.message });
            }else{
                req.decoded = decoded;    
                next();
            }
        });
    }else{
        return res.status(403).send({
            success:false,
            message:'No token provided'
        });
    }
    
});


apiRoutes.get('/user',(req,res)=>{
    user.find({},{'password':0}).then((doc)=>{
        console.log(doc[0]);
        res.json(doc);
    }).catch((e)=>{
        res.send(e.message);
    });
});

app.use('/api',apiRoutes);

var apiRoutes2 = express.Router();
apiRoutes2.get('/new',(req,res)=>{
    res.send('this is newly created route');
});

app.use('/api2',apiRoutes2);

app.listen(port,()=>{
    console.log('listening to port 3000');
});