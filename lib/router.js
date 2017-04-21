'use strict';

var express = require('express'),
  config = require('./config');

//This is probably not needed anymore after using sync service
function initRouter(mediator) {
  var router = express.Router();

  router.route('/').get(function(req, res) {
    mediator.once('done:messages:load', function(data) {
      res.json(data);
    });
    mediator.publish('messages:load');
  });
  router.route('/:id').get(function(req, res) {
    var messageId = req.params.id;
    mediator.once('done:message:load:' + messageId, function(data) {
      res.json(data);
    });
    mediator.publish('message:load', messageId);
  });
  router.route('/:id').put(function(req, res) {
    var messageId = req.params.id;
    var message = req.body;
    // console.log('req.body', req.body);
    mediator.once('done:message:save:' + messageId, function(savedmessage) {
      res.json(savedmessage);
    });
    mediator.publish('message:save', message);
  });
  router.route('/').post(function(req, res) {
    var ts = new Date().getTime();  // TODO: replace this with a proper uniqe (eg. a cuid)
    var message = req.body;
    message.createdTs = ts;
    mediator.once('done:message:create:' + ts, function(createdmessage) {
      res.json(createdmessage);
    });
    mediator.publish('message:create', message);
  });

  return router;
}

module.exports = function(mediator, app) {
  var router = initRouter(mediator);
  app.use(config.apiPath, router);
};
