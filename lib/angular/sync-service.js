'use strict';

var config = require('../config')
  , _ = require('lodash')
  ;

module.exports = 'wfm.message.sync';

var messageClient = require('../client/message-client');
var messagesMediatorSubscribers = require('../client/mediator-subscribers');

function wrapManager($q, $timeout, manager) {
  var wrappedManager = _.create(manager);
  wrappedManager.new = function() {
    var deferred = $q.defer();
    $timeout(function() {
      var message = {
        type: 'Message'
      , status: 'New'
      };
      deferred.resolve(message);
    }, 0);
    return deferred.promise;
  };

  return wrappedManager;
}

angular.module('wfm.message.sync', [])
.factory('messageSync', function($q, $timeout, mediator) {
  var messageSync = {};
  messageSync.createManager = function(queryParams) {
    if (messageSync.manager) {
      return $q.when(messageSync.manager);
    } else {
      messageSync.manager = wrapManager($q, $timeout, messageClient(mediator));

      messagesMediatorSubscribers.init(mediator);
      console.log('Sync is managing datasasdet:', config.datasetId, 'with filter: ', queryParams);
      return messageSync.manager;
    }
  };
  messageSync.removeManager = function() {
    if (messageSync.manager) {
      return messageSync.manager.safeStop()
      .then(function() {

        //Removing any message subscribers
        messagesMediatorSubscribers.tearDown();
        delete messageSync.manager;
      });
    }
  };
  return messageSync;
})
.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

