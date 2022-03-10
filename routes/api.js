'use strict';
const XMLHttpRequest = require('xhr2')
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI, { useUnifiedTopology: true }, { useNewUrlParser: true });

const Symbols = new mongoose.Schema({
  symbol: String,
  likes: Number,
  adress: Array
});

const symbols = mongoose.model('symbols', Symbols);

function createUser(arr) {
  let a = new symbols(arr);
  a.save(function (err) {
  if (err) return handleError(err);
  })
}

// createUser({symbol: 'first', likes:0})

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(function (req, res){
      console.log(req.query)
      req['headers']['x-forwarded-for'] = 0
      // Verify req
      if (req.query['stock'] == undefined){res.json('Invalid')}
      else{
        // view size of input
        let like = 0
        let stockData = []
        let cont = 0
        if (req.query['like'] == 'true'){like = 1}
        let st = [like].concat(JSON.parse(JSON.stringify(req.query['stock']).toLocaleUpperCase()))       
        // loop through input
        for (let i=1;i<st.length; i++){
          getJSON('https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/' + st[i]+ '/quote', 
          // Find the data of the stock
          function(err, data) {

            if (err) return err
            else{
              let d = st[0]
              // Find in the database the symbol
              symbols.findOne({symbol:st[i]})
                .exec((err,doc) => {
                  if (err) console.log(err)
                  if (doc == undefined){
                    if (st[0] < 1){
                    createUser({symbol:st[i],likes:0})                      
                    }
                    else{
                    createUser({symbol:st[i], likes:1, adress: [req['headers']['x-forwarded-for']] })                        
                    }

                  }
                  else{
                  d = doc['likes']

                  if (!doc['adress'].filter(e => {
                    e == req['headers']['x-forwarded-for']
                  }) || doc['adress'].length == 0){
                    if (doc['likes'] != undefined && st[0]>0){
                      d = doc['likes'] + st[0]
                      updateUser({symbol:st[i]},{"$set":{"likes": d, 'adress': doc['adress'].concat([req['headers']['x-forwarded-for']])}})
                    }
                  }                
                  }

              // Check price
              if (data['latestPrice'] == undefined){
                stockData.push({'likes': d})
              }
              else{
                stockData.push({'likes': d, 'stock':st[i], 'price': data['latestPrice'] })
              }
              cont++
                  
              // print value 
              if (cont >= st.length -1) {
                if (st.length == 2){
                  // res.json({'stockData':stockData[0]})
                  if (stockData[0]['stock'] == undefined){
                    res.json({'stockData':stockData[0]})
                  }
                  else{
                  res.json({'stockData':{'stock':stockData[0]['stock'], 'price':stockData[0]['price'], 'likes':stockData[0]['likes']}} )                                     }

                }
                else{
                  let rel_likes = 0;
                  if (stockData[0] != undefined && stockData[1] != undefined) {
                    rel_likes =  - stockData[0].likes + stockData[1].likes
                    delete stockData[0].likes
                    delete stockData[1].likes
                    res.json({'stockData':[Object.assign(stockData[0],{'rel_likes':parseInt(rel_likes)}),Object.assign(stockData[1],{'rel_likes':parseInt(-rel_likes)})]})
                  }
                }
              }
                })
 
            }
            });

        }

      }
    });
};

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

function updateUser(query, update){
  return symbols.findOneAndUpdate(query, update, {returnNewDocument: true, useFindAndModify:false})
  .then(updatedDocument => {return updatedDocument})
  .catch(err => console.error(`Failed to find and update document: ${err}`))
}

