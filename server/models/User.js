import mongoose, { Schema } from 'mongoose'; 

// Model name
const modelName = 'User';

/* 
 * --------------------------- Schema Types ---------------------------
 *
 * All:
 * required, default, select, validate, get, set, alias, index, unique, sparse
 * 
 * String:
 * lowercase, uppercase, trim, match, enum, minlength, maxlength
 * 
 * Number: 
 * min, max
 * 
 * Date:
 * min, max 
 */

// Define schema
const schema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        match: /^[\w]{3,20}$/
    },
    password: {
        type: String,
        required: true,
        match: /^.{8,20}$/
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    }
});

// Define static/instance methods through schema.statics/schema.methods
schema.statics.findByUsername = function(username, cb) {
    return this.find({username: new RegExp(username, 'i')}, cb);
}

// Export User model
export default mongoose.model(modelName, schema);