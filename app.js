const express = require('express')
const morgan = require('morgan');
const app = express()
const flashcardRoutes = require('./routes/flashcardRoutes');
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
//no longer being used 
const {MongoClient} = require('mongodb');
const {getCollection} = require('./models/flashcards');
const {getUserCollection} = require('./models/user');



//configure app
let port = 8080
let url = 'mongodb+srv://G7:ITSC-4155@g7-project.pitrg9x.mongodb.net/G7?retryWrites=true&w=majority'
let host = 'localhost';
app.set('view engine', 'ejs');


//connect to mongoDB
mongoose.connect(url)
.then(()=>{
    app.listen(port, host, ()=>{
        console.log('server is running on port', port);
    })
})
.catch(err=>console.log(err.message));



//mount middleware
var store = new MongoDBStore({
    uri: 'mongodb+srv://G7:ITSC-4155@g7-project.pitrg9x.mongodb.net/G7?retryWrites=true&w=majority',
    collection: 'sessions'
  });

  app.use(require('express-session')({
    secret: 'This is a secret',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    resave: true,
    saveUninitialized: true
  }));


app.use((req, res, next) => {
    res.locals.user = req.session.user||null;
    next();
});


app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));


//set up routes
app.get('/', (req, res) =>{
    res.render('index');
})

app.use('/flashcards', flashcardRoutes);
app.use('/user', userRoutes);


app.use((req, res, next)=>{
    let err = new Error('The Server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next)=>{
    console.log(err.stack);
    if(!err.status)
    {
        err.status = 500;
        err.message = ("Internal Server Error");
    }
    res.status(err.status);
    res.render('error', {error: err});

});