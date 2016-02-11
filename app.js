var express        = require('express');
var path           = require('path');
var bodyParser     = require('body-parser');
var expressLayouts = require('express-ejs-layouts');
var app            = express();

//App settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

var Animal = require('./models/animal');
var Farm   = require('./models/farm');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/farm-manager');

Farm.find(function(err, farms) {
  if(err) console.log(err)
  app.locals.farms = farms;
})

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressLayouts);

//Serve js & css files from a public folder
app.use(express.static(__dirname + '/public'));

// ############ YOU CAN ADD YOUR ROUTES BELOW HERE
// INDEX
app.get("/", function(req, res){
  Animal.find(function(err, animals) {
    if(err) console.log(err)
    res.render('index', { animals: animals });
  })
});

//CREATE
app.post("/", function(req, res){
   req.body.vetReport = { health:req.body.health, outlook:req.body.outlook };
   var newAnimal = new Animal(req.body);
   newAnimal.save(function(err, animal){
     if(err) console.log(err);
     console.log("New animal created");
     //Add it to the selected farm
     Farm.findById(req.body.farm_id, function(err, farm){
        if(err) console.log(err);
        farm.addAnimal(animal);
        farm.save(function(err){
          if(err) console.log(err);
          res.redirect("/");
        })       
     })
   })
})

//SHOW
app.get("/:id", function(req, res){
  Animal.findById(req.params.id, function(err, animal){
    if(err) console.log(err);
    res.render('show', { animal: animal })    
  })
})

//EDIT
app.get("/:id/edit", function(req, res){
  Animal.findById(req.params.id, function(err, animal){
    if(err) console.log(err);
    res.render('edit', { animal: animal })    
  })
})

//UPDATE
app.post('/:id', function(req, res){
  req.body.vetReport = { health:req.body.health, outlook:req.body.outlook };
  Animal.findByIdAndUpdate(req.body._id, req.body, function(err, animal){
    if(err) console.log(err);
    res.redirect("/");
  })
})

//DELETE
app.post('/:id/delete', function(req, res){
  Animal.findByIdAndRemove(req.params.id, function(err) {
    if (err) console.log(err);
    res.redirect("/");
  });
})



app.listen(3000, function(){
  console.log("Welcome to the Farm Manager");
});
