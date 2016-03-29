#! /usr/bin/node

var express = require('express');
var path = require('path');
var nunjucks = require('nunjucks');
var router = require('./routes');
var express_app = express();

express_app.use('/public', express.static(path.join(__dirname, 'public')));
express_app.use(router);

//configure templates
nunjucks.configure(path.join(__dirname, './public/templates'), {
  autoescape: true,
  express: express_app
});

express_app.listen(9999, function() {
  console.log('server started');
});
