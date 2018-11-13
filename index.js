import Dotenv from 'dotenv';
import path from 'path';
import Express from 'express';
import ejs from 'ejs';
import mongoose from 'mongoose';
import Router from './server/modules/Router';
import webRoutes from './server/routes/web';
import apiRoutes from './server/routes/api';

Dotenv.config();

/*
 * Configure MongoDB
 */

// Connect to MongoDB
const connOptions = {
    useNewUrlParser: true
};

if(process.env.USING_MONGO_DB === 'yes') {
    mongoose.connect(process.env.MONGODB_URL, connOptions)
    .catch(reason => {
        console.log('Failed to connect to MongoDB');
        console.log(reason);
    });
}

// Upon opening connection to MongoDB
const conn = mongoose.connection;

conn.on('open', () => {
    console.log('Connected to MongoDB');
});

/*
* Configure expressJS server
*/

const app = Express();

// Specify root folder to serve static assets
app.use(Express.static(process.env.PUBLIC_PATH));

// Set view engine to use
app.set('view engine', process.env.VIEW_ENGINE);

// Views to be found in server folder
app.set('views', path.join(__dirname, '/server/views'));

// Configure ejs
ejs.delimiter = process.env.TEMPLATE_DELIMITER;

// Initialise Router and define routes
Router.init(app, conn)
    .routeWeb(webRoutes)
    .routeApi(apiRoutes)
    .catchGetRequests((req,res) => res.redirect('/')); // Catch all remaining routes to redirect to /

// Start ExpressJS server
const port = process.env.SERVER_PORT || 8000;

app.listen(port, () => {

    console.log(`Express app listening on port ${port}`);
});
