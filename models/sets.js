const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const setSchema = new Schema({
    course: {type: String},
    instructor: {type: String},
    name: {type: String},
    creator: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('flashcard_sets', setSchema);