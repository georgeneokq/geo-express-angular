import formidable from 'formidable';

class BaseController
{
    constructor() {
        this.app;
        this.db;
    }

    // Return a new instance of IncomingForm everytime this.form is accessed
    get form() {
        return new formidable.IncomingForm();
    }

    init(expressInstance, dbConnection = null) {
        this.app = expressInstance;
        this.db = dbConnection;
    }
}

export default BaseController;