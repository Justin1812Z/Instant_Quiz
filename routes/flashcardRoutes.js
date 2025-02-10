const express = require('express');
const controller = require('../controllers/flashcardController');
const router = express.Router();
const {isSetCreator, isCardCreator} = require('../middleware/authorize');


router.get('/', controller.cards);

//shows the set specified by id in flashcard form
router.get('/set/:id', controller.set)

router.get('/sets', controller.index);

router.get('/new', controller.new);

router.post('/newCard', controller.createCard);

router.get('/newSingleCard/:id', controller.getNewSingleCard);

router.post('/newSingleCard/:id',isSetCreator , controller.createSingleCard);

router.post('/', controller.createSet);

router.get('/sets/editSet/:id', controller.editSet);

router.post('/sets/editSet/:id', isSetCreator, controller.updateSet);

router.get('/sets/editCard/:id', controller.editCard);

router.post('/sets/editCard/:id', isCardCreator, controller.updateCard);

//get @/flashcards/sets/:Id shows the set specified by the id in a list form
router.get('/sets/:id', controller.showSetQs);

//delete the set and any cards associated with it
router.post('/deleteSet/:id', controller.deleteSet);

//delete specific card
router.post('/deleteCard/:id', controller.deleteCard)

router.post('/run-python', controller.runPython);

module.exports = router;