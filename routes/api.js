'use strict';

var mongoose = require('mongoose');
var xhr = require('xmlhttprequest').XMLHttpRequest;

module.exports = function (app) {
  
  mongoose.connect(process.env.DB, { useNewUrlParser: true });

  const SchemaPH6 = new mongoose.Schema({
      search: String,
      date: String
    });
  const ModelPH6 = mongoose.model('ModelPH6', SchemaPH6);
  
  /*ModelPH6.remove({}, (err) => {
    if (err) console.log('Error reading database!')
  });*/
  
  app.route('/api/search/:params')
    .get(function(req, res) {
    
      var address = 'https://www.googleapis.com/customsearch/v1?key=' + process.env.API_KEY + '&cx=' + process.env.SEARCH_ENGINE_ID + '&q=' + req.params.params;
      if (req.query.offset) address += '&start=' + (req.query.offset - 1) * 10 + '&num=10';
    
      var request = new xhr();
        request.open("GET", address, true);
        request.send();
        request.onload=function(){
          var response = JSON.parse(request.responseText);
          if (response.error) res.send('Error requesting!')
          else {
            var answer = [];
            response.items.forEach(e => {
              answer.push(
                {
                  imageURL: e.pagemap.cse_image[0]['src'],
                  altText: e.pagemap.metatags[0]['og:title'],
                  pageURL: e.link
                }
              );
            });
            
            res.json(answer);
            
            var search = new ModelPH6({
              search: req.params.params,
              date: new Date()
            });

            search.save((err, data) => {
              if (err) console.log('Error saving to database!')
              else {
                
              };
            }); // '.save'
            
          }; // 'else'
          
        }; // '.onload'
    
    }); // '.get'
  
  app.route('/api/search_history')
    .get(function(req, res) {
      ModelPH6.find({}, (err, data) => {
        if (err) console.log('Error reading database!')
        else {
          var answer = [];
          data.forEach(e => {
            answer.push(
              {
                term: e.search,
                date: e.date
              }
            )
          })
          res.json(answer);
        }
      })
  })

}; // 'module.exports'
