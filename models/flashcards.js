const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const flashchardSchema = new Schema({
    setId: {type: String},
    setName: {type: String},
    question: {type: String},
    answer: {type: String},
});

module.exports = mongoose.model('Flashcards', flashchardSchema);