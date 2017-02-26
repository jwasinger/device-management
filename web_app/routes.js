var express = require('express');

var router = express.Router();

router.get('/dashboard', function(req, res) {
  res.render('index.html');
});

router.get('/', function(req, res) {
  res.render('index.html');
});

module.exports = router;
