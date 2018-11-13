# geo-express-angular

This project builds on ExpressJS and Angular 6. I created this to discover more about code scaffolding and ES6 modules.

## Setup

Install dependencies with `npm install`.

In the root directory, copy contents from `.example.env` file into a new `.env` file and change values if necessary.

## Running the server

Run `npm start` to start the server. The script does the following:

- Calls `ng build` to compile the Angular source code to the dist folder so that the files can be served by ExpressJS.

- Takes care of using babel to compile ES6 code before running it - this makes the ES6 import/export syntax usable.

- Uses nodemon to monitor files - The server will automatically reload if you change any of the server-side source files.

## Code scaffolding

The geo CLI is built on NodeJS. Commands are generally in this format: `node geo <Command> [options]`.

### node geo create-controller \<ControllerName\> [options]

#### Example:
`node geo create-controller UserController -m`

#### Description:
Generates a new controller. Naming convention is singular form of the object suffixed with "Controller", for example `UserController`.

#### Available options:
- `-m`, creates a model along with the controller. It takes the controller's name without the word "Controller" to generate the model name. 

- `-me`, does the same thing as `-m` flag but generates a model with example methods.

- `-f` or `--force`, forces the files to be generated even if the files already exist.


### node geo create-model \<ModelName\> [options]

#### Example:
`node geo create-model User -c -e`

#### Description:
Generates a new model. Naming convention is singular form of the object, for example `User`.

#### Available options:

- `-c`, creates a controller along with model. It takes the model's name and concatenates the word "Controller" to generate the controller name.

- `-e`, creates the model with example methods.

- `-f` or `--force`, forces the files to be generated even if the files already exist.


### node geo create-middleware \<MiddlewareName\>

#### Example:
`node geo create-middleware ValidateUserEmail`

#### Description:
Generates a new model and registers a name for it in `server/config/middlewares.js` file.

The default name is the name of the middleware, but the name can be changed in the file.

The name is used to register middleware for routes in `server/routes/routes.js` file.

#### Available options:

- `--name <ReferenceName>`, specify the name to use to refer to when registering middleware for routes.
- `-f` or `--force`, forces the file to be generated even if the file already exists. Will not re-register the middleware in the config file.