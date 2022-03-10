const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
let lik = 0;
chai.use(chaiHttp);

suite('Functional Tests', function() {
    //Viewing one stock: GET request to /api/stock-prices/

  suite('Tests ', function () {

    test('Viewing one stock: GET request to /api/stock-prices/', function (done) {
      chai
        .request(server)
        .get('/api/stock-prices/?stock=GOOG')
        .end(function(err,res) {
          assert.equal(res.body['stockData']['stock'],'GOOG');
          done();
        })      
    })

    test('Viewing one stock and liking it: GET request to /api/stock-prices/', function (done) {
      chai
        .request(server)
        .get('/api/stock-prices/?stock=GOOG&like=true')
        .end(function(err,res) {
          assert.equal(res.body['stockData']['stock'],'GOOG');
          lik = res.body['stockData']['likes']
          assert.isAbove(res.body['stockData']['likes'],0);          
          done();
        })      
    })

    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function (done) {
      chai
        .request(server)
        .get('/api/stock-prices/?stock=GOOG&like=true')
        .end(function(err,res) {
          assert.equal(res.body['stockData']['stock'],'GOOG');
          assert.equal(res.body['stockData']['likes'],lik);          
          done();
        })      
    })

    test('Viewing two stocks: GET request to /api/stock-prices/', function (done) {
      chai
        .request(server)
        .get('/api/stock-prices?stock=GOOG&stock=MSFT')
        .end(function(err,res) {
          console.log(res.body)
          console.log(res.body['stockData'][0])
          assert.isObject(res.body,'stockData');
          assert.isArray(res.body['stockData'],['GOOG','MSFT']);
          assert.isAbove(res.body['stockData'][0]['rel_likes']**2,-1);
          assert.equal(res.body['stockData'][0]['rel_likes'],-res.body['stockData'][1]['rel_likes']); 
          done();
        })      
    })

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function (done) {
      chai
        .request(server)
        .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
        .end(function(err,res) {
          console.log(res.body)
          console.log(res.body['stockData'][0])
          assert.isObject(res.body,'stockData');
          assert.isArray(res.body['stockData'],['GOOG','MSFT']);
          assert.isAbove(res.body['stockData'][0]['rel_likes']**2,-1);
          assert.equal(res.body['stockData'][0]['rel_likes'],-res.body['stockData'][1]['rel_likes']); 
          done();
        })      
    })


  })
});
