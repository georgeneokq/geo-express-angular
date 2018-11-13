import BaseController from './BaseController'; 

class HomeController extends BaseController  
{ 
    constructor() {super()};  
 
    /* 
     * Controller methods go here.
     */ 
 
    index(req, res) { 
      res.sendFile('index.html');
    }
} 
 
// Export instance of HomeController
module.exports = new HomeController(); 
