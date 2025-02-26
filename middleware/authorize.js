const setModel = require('../models/sets');
const cardModel = require('../models/flashcards');

exports.isSetCreator = (req, res, next) =>{
    let id = req.params.id;
    setModel.findById(id)
    .then(set=>{
        console.log(set.creator);
        console.log(req.session.user);
        if(set.creator.equals(req.session.user)){
            return next();
        }
        else{
            let err = new Error('You cannot edit a set you did not create');
            err.status = 401;
            return next(err);
        }
    })
    .catch(err => next(err))
}

exports.isCardCreator = (req, res, next) =>{
    let id = req.params.id;
    cardModel.findById(id)
    .then(card=>{
        if(!card){
            let err = new Error('Card with id ' + id + 'does not exist');
            err.status = 401;
            return next(err);
        }
        setModel.findById(card.setId)
        .then(set=>{
            if(!set){
                let err = new Error('set with id ' + set._id + 'does not exist');
                err.status = 401;
                return next(err);
            }
            if(set.creator.equals(req.session.user)){
                return next();
            }
            else{
                let err = new Error('You cannot edit a set you did not create');
                err.status = 401;
                return next(err);
            }
        })
        .catch(err=>next(err));
        
    })
    .catch(err =>next(err))
}

