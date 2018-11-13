const fs = require('fs');
require('dotenv').config(); // Get folder paths from .env file

/*
 * Get command line arguments from process.argv, an array containing arguments to the console
 * [0] => node
 * [1] => geo
 * [2]...[n] => other arguments
 */

const command = process.argv[2];

if(command === 'create-controller') {
    const controllerName = process.argv[3];
    createController(controllerName);

    // Check if there is argument starting with '-m'. If there is, generate Model as well.
    if(hasArgument('^-m')) {
        const modelName = controllerName.split('Controller')[0];

        // Check if argument has 'e' flag. If yes, generate example methods with model
        const argument = getArgument('^-m');
        const withExampleMethods = /[e]/.test(argument);

        createModel(modelName, withExampleMethods ? true : false);
    }

}
else if(command === 'create-model') {

    const modelName = process.argv[3];

    // Check if there is '-e' argument. If there is, generate example methods
    createModel(modelName, hasArgument('-e') ? true : false);

    // Check if there is -c argument. If there is, generate controller as well
    hasArgument('-c') ? createController(`${modelName}Controller`) : '';
}
else if(command === 'create-middleware') {

    // Create middleware file
    const middlewareName = process.argv[3];
    createMiddleware(middlewareName);
}
else {
    showHelp();
}

/*
 * Creates an registers a middleware
 */
function createMiddleware(name) {

    const filePath = `${process.env.PATH_TO_MIDDLEWARES}/${name}.js`;

    // If has -f or --force flag, force the file to be replaced
    if(!hasArgument('-f') && !hasArgument('--force')) {
        checkFileExists(filePath);
    }

    let registeredMiddlewares = require('./server/config/middlewares');

    fs.writeFile(filePath,
`module.exports = (req, res, next) => {
    
    next();
}`,
    err => { if(err) throw err; console.log(`Generated middleware: ${name}`); });

    let newData = 'module.exports = {\n';

    let middlewareNames = Object.keys(registeredMiddlewares);

    let alreadyRegistered = false;

    for(let i = 0; i < middlewareNames.length; i++) {
        let middlewareFileName = registeredMiddlewares[middlewareNames[i]];

        // Check if middleware is already registered
        if(middlewareFileName === `${name}.js`) {
            alreadyRegistered = true;
            break;
        }

        newData += `\t'${middlewareNames[i]}': '${middlewareFileName}',\n`;
    }

    let middlewareName = name;
    let argumentIndex = getArgumentIndex('--name');

    if(argumentIndex) {
        middlewareName = process.argv[argumentIndex + 1];
    }

    // Append the new middleware
    newData += `\t'${middlewareName}': '${name}.js'\n`;
    
    newData += '}';

    if(!alreadyRegistered) {
        fs.writeFile('./server/config/middlewares.js', newData, err => { if(err) throw err; console.log(`Selector: ${middlewareName}`); });
    }
}


/*
 * Creates a controller
 *
 * @param name Controller name
 */
function createController(name) {
    
    const filePath = `${process.env.PATH_TO_CONTROLLERS}/${name}.js`;

    // If has -f or --force flag, force the file to be replaced
    if(!hasArgument('-f') && !hasArgument('--force')) {
        checkFileExists(filePath);
    }

    fs.writeFile(filePath,
`import BaseController from './BaseController'; 

class ${name} extends BaseController  
{ 
    constructor() {super()};  
 
    /* 
     * Controller methods go here.
     */ 
 
    index(req, res) { 

    }
} 
 
// Export instance of ${name}
module.exports = new ${name}(); 
`,
    err => {
        if(err) throw err;
        console.log(`Generated controller: ${name}`); 
    });
}

/*
 * Creates a model
 *
 * @param name Model name
 * @param withExampleMethods Specify whether example methods should be generated, defaults to false
 */
function createModel(name, withExampleMethods = false) {

    const filePath = `${process.env.PATH_TO_MODELS}/${name}.js`;

    // If has -f or --force flag, force the file to be replaced
    if(!hasArgument('-f') && !hasArgument('--force')) {
        checkFileExists(filePath);
    }

    fs.writeFile(filePath,
`import mongoose, { Schema } from 'mongoose'; 

// Model name
const modelName = '${name}';

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

});

// Define static/instance methods through schema.statics/schema.methods here
${withExampleMethods ?
`
// Function accepts any number of arguments but final argument should always be callback
schema.methods.getByName = function(name, cb) {
    this.model.find({name: name}, cb);
}

// Static version
schema.statics.getByName = function(name, cb) {
    this.find({name: name}, cb);
}`: ''}

// Export ${name} model
export default mongoose.model(modelName, schema);`,
        err => {
            if(err) throw err;
            console.log(`Generated model: ${name}`);
        });
}

/*
 * Displays list of available commands
 */
function showHelp() {
    console.log(
`Commands:
create-controller <ControllerName> [-m[e] -f]: Create a new controller
create-model <ModelName> [-c -f -e]: Create a new model
create-middleware <MiddlewareName> [-f --name <ReferenceName>]: Creates a middleware
`)
}

// Helper functions

/*
 * Checks through process.argv to see if the specified argument has been supplied
 *
 * @param arg The argument to check for
 * 
 * @return The index in process.argv array that holds the specified argument. If not found, returns 0
 */
function hasArgument(regexString) {
    for(let argument of process.argv) {
        let pattern = new RegExp(regexString, 'i');
        if(pattern.test(argument)) return true;
    }
    return false;
}

/*
 * Checks through process.argv to get back argument using regex
 *
 * @param regexString The regex to use
 * 
 * @return Full argument that matches the regular expression. If not found, returns an empty string
 */
function getArgument(regexString, ignoreCaseSensitivity = true) {
    for(let argument of process.argv) {
        const pattern = new RegExp(regexString, ignoreCaseSensitivity ? 'i' : '');
        if(pattern.test(argument)) return argument;
    }
    return '';
} 


/*
 * A different variation of hasArgument helper function.
 * This function returns the index of the argument found. Can be used in any situation hasArgument is used.
 *
 * @param arg The argument to check for
 * 
 * @return The index in process.argv array that holds the specified argument. If not found, returns 0
 */
function getArgumentIndex(regexString, ignoreCaseSensitivity = true) {
    for(let index = 2; index < process.argv.length; index++) {
        const argument = process.argv[index];
        const pattern = new RegExp(regexString, ignoreCaseSensitivity ? 'i' : '');
        if(pattern.test(argument)) return index;
    }

    return 0;
}

/*
 * Check if file exists. If it does, it throws an error
 *
 * @param filePath file path to check
 */

function checkFileExists(filePath, errorMsg = null) {
    
    if(!errorMsg) {
        errorMsg = `${filePath} already exists.`;
    }
    
    if(fs.existsSync(filePath)) {
        throw new Error(errorMsg);
    }
} 