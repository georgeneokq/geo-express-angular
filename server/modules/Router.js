import fs from 'fs';
import Config from '../config/routeconfig';
import middlewares from '../config/middlewares';

/*
 * -------------------------------------- OVERVIEW --------------------------------------
 * This class is used to allow the app the handle routing in an easier way (heavily influenced by Laravel)
 * It allows routing to controllers through the use of strings, like 'SomeController@someFunction'.
 * This removes the need for exporting and importing controllers and functions everytime new ones are added.
 *
 * --------------------------- DEFINING ROUTES & ERROR HANDLING ---------------------------
 * This class also separates the defining of routes of web and API, making it more organized.
 * API routes have an API prefix, by default the prefix is found in the server/config/config.js folder - which can be modified to suit preferences.
 * Routes defined have their paths checked and corrected in case of accidental defining of routes with additional slashes.
 * An error will be thrown immediately if a controller or controller's method does not exist.
 * 
 * ---------------------------------- USING THE ROUTER ---------------------------------
 * This file exports an instance of the Router instead of the class itself.
 * The Router class must hence be properly initialized using the init function instead of the constructor.
 */

class Router
{   
    constructor() {
        this.app; // Express instance to be shared throughout the class
        this.db; // DB connection to be passed to controllers
        this.loadedControllers = {};
        this.loadedMiddlewares = {};
    }

    /*
     * @param expressInstance Express instance
     * @param dbConnection Database connection
     */ 
    init(expressInstance, dbConnection = null) {
        this.app = expressInstance;
        this.db = dbConnection;
        return this;
    }

    /*
     * Registers routes for an array of routes, each item being a string following the format: <httpmethod> <routeURL> <controllermethod>
     * 
     * @param app Express instance 
     * @param routes Array of objects, each object should contain method, path and callback. Methods should use this class' static properties
     */
    route(routes, routePrefix = '') {

        // If init not called first, throw error
        if(!this.app) {
            throw new Error(`Router should be initialised with the init method, passing in an express app as its parameter.`);
        }

        for(let route of routes) {

            // Separated by whitespace: <httpmethod> <routeURL> <controllermethod>
            const inputArray = route.split(' ');
            const httpMethodInput = inputArray[0];
            const pathInput = inputArray[1];
            const callbackInput = inputArray[2];

            // Check that route is formatted correctly
            if(!httpMethodInput || !pathInput || !callbackInput) {
                throw new Error(`Make sure your routes are each separated by whitespace: <httpmethod> <routeURL> <controllermethod>`);
            }

            // Check that callbackInput is formed correctly using the controllerMethodDelimiter in routeConfig file
            if(!(new RegExp(Config.controllerMethodDelimiter).test(callbackInput))) {
                throw new Error(`Make sure that your controller method is specified in the format Controller${Config.controllerMethodDelimiter}Method`);
            }

            const path = `/${routePrefix}/${pathInput}`;

            // Use regex to ensure the formed path does not have duplicate forward slashes, for example: /api//users
            path = path.replace(/\/\/+/, '/');

            // Default format: ExampleController@getExampleData
            const callbackDefinition = callbackInput.split(Config.controllerMethodDelimiter);
            const controllerName = callbackDefinition[0];
            const method = callbackDefinition[1];
            const controllerPath =`${__dirname}/../controllers/${controllerName}.js`;

            // check that controller exists
            if(!fs.existsSync(controllerPath)) {
                throw new Error(`Error while parsing routes: ${controllerName} is not found in controllers folder.`);
            }

            let controller = this.loadedControllers[controllerName];

            // Check if controller is in loadedControllers object. If it's not, require it and push into the object
            if(!controller) {

                this.loadedControllers[controllerName] = require(controllerPath);
              
                controller = this.loadedControllers[controllerName];

                // Initialize the controller with express app instance and db connection
                controller.init(this.app, this.db);
            }

            let callback; // variable to store function object from controller

            // Check that the controller method exists
            if(typeof controller[method] !== 'function') {
                throw new Error(`Error while parsing routes: Method ${method} is not defined in ${controllerName}`);
            }
            else {
                // Pass in a callback that executes the controller method, or else 'this' keyword will be undefined in method
                callback = (req, res) => controller[method](req, res);
            }
        

            // Get middleware
            let routeMiddlewareNames = inputArray.slice(3); // Array of middleware names registered in config/middlewares.js
            let routeMiddlewares = [];

            // Load middlewares if any
            if(routeMiddlewareNames) {
                for(let name of routeMiddlewareNames) {
                    let middleware = this.loadedMiddlewares[name];

                    // If middleware has already been loaded before, push into routeMiddlewares
                    if(middleware) {
                        routeMiddlewares.push(middleware);
                    }
                    // If middleware hasnt been loaded before, check that the file exists
                    else {

                        let middlewarePath = `../middlewares/${middlewares[name]}`;
    
                        // Check if middleware exists: If yes, load the middleware. If not, throw an error.
                        if(fs.existsSync(`${__dirname}/${middlewarePath}`)) {
                            
                            middleware = require(middlewarePath);
                            routeMiddlewares.push(middleware);

                            // Cache middleware
                            this.loadedMiddlewares[name] = middleware;
    
                        } else {
                            throw new Error(`${middlewarePath} does not exist.`);
                        }
                    }

                }
            }

            const httpMethod = httpMethodInput.toLowerCase();

            switch(httpMethod) {

                case 'get':
                    this.app.get(path, routeMiddlewares, callback);
                    break;

                case 'post':
                    this.app.post(path, routeMiddlewares, callback);
                    break;
                    
                case 'put':
                    this.app.put(path, routeMiddlewares, callback);
                    break;

                case 'delete':
                    this.app.delete(path, routeMiddlewares, callback);
                    break;

                default:
                    throw new Error(`The "method" parameter should be either 'get', 'post', 'put' or 'delete'.`);
            }

        }

        return this;
    }

    /*
     * @param routes array of routes for serving web files
     */
    routeWeb(routes) {
        return this.route(routes);
    }

    /*
     * @param routes array of routes for accessing API
     */
    routeApi(routes) {
        const routePrefix = Config.apiPrefix;
        return this.route(routes, routePrefix);
    }

    /*
     * @param callback handler for all other routes that haven't been defined
     */
    catchGetRequests(callback) {
        this.app.get('*', callback);
    }

}

// Return singleton instance
const router = new Router();

export default router;

