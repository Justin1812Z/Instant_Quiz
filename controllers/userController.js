const userModel = require('../models/user');
const setModel = require('../models/sets');


exports.getLogin = (req, res) =>{
    res.render('./user/login');
    console.log(req.session);
};

exports.getSignup = (req, res) =>{
    res.render('./user/signup');
};

exports.signup = (req, res, next) =>{
    //let newUser = new User(req.body);
    let newUser = new userModel(req.body);
    console.log(newUser);
    newUser.save()
        .then(res.render('./user/signup', {newUser}))
        .catch(err => next(err));
    
};

exports.login = (req, res, next) =>{
    let username = req.body.username;
    let password = req.body.password;
    userModel.findOne({username: username})
    .then(user =>{
        if(!user){
            console.log('user does not exsist');
            res.redirect('/user/getLogin');
        }
        else{
            console.log('user exists');
            user.comparePassword(password)
            .then(result=>{
                if(result){
                    //successfull login
                    console.log(1);
                    req.session.user = user._id;
                    setModel.find({creator: user._id})
                    .then(sets=>{
                        res.render('user/profile', {user, sets});
                    })
                    .catch(err=>next(err));
                }
                else{
                    //wrong password
                    console.log(2);
                    res.redirect('/user/getLogin');
                }
            })
        }
    })
};

exports.getProfile = (req, res, next) =>{
    let id = req.session.user;
    userModel.findById(id)
    .then(user=>{
        setModel.find( {creator: id})
        .then(sets=>{
            res.render('user/profile', {user, sets});
        })
        .catch(err=>next(err));
    })
    .catch(err=>{
        res.redirect('/user/login');
        next(err);
    })
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err){
           return next(err);
        }
        else {
            res.redirect('/');  
            
       }
    });

 };