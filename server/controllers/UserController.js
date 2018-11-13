import BaseController from './BaseController'; 
import formidable from 'formidable';
import User from '../models/User';

class UserController extends BaseController  
{ 
    constructor() {super()};  
 
    /* 
     * Controller methods go here.
     */ 
 
    getUsers(req, res) {
        User.find((err, result) => {
             res.json(result);
        });
    }

    test(req, res) {
        res.send(`${req.timestamp}`);
    }

    saveUser(req, res) {
      
      // User model defined for mongoose instance via this.db
      const User = this.db.model('User');

      // Get username, password, email from request fields
      const form = new formidable.IncomingForm();
      
      form.parse(req, (err, fields, files) => {

          let username = fields.username;
          let password = fields.password;
          let email = fields.email;

          // Check all mandatory fields
          if(!username || !password || !email) {
              return res.status(400).json({
                  message: 'Required data missing'
              });
          }

          // Create new User and save to database
          let user = new User({username: username, password: password, email: email});

          user.save(function(err, user) {

            if(err) {
                res.status(400).json({
                    message: 'Failed to save to DB'
                });
            }

              console.log('Saved to db:');
              console.log(user);

              // Send success response
              res.json({
                  message: 'Success!'
              });
          });
      });
   }
} 
 
// Export instance of UserController
module.exports = new UserController(); 
