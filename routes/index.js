var express = require('express');
var router = express.Router();
var {UserKeyPair} = require('../crypto/crypto');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'title' });
});

module.exports = router;
