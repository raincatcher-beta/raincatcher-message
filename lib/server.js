'use strict';

var config = require('./config');
var shortid = require('shortid');

var MessageTopics = require('fh-wfm-mediator/lib/topics');

module.exports = function(mediator) {
  //Used for cloud data storage topics
  var messageCloudDataTopics = new MessageTopics(mediator);
  messageCloudDataTopics.prefix(config.cloudDataTopicPrefix).entity(config.datasetId);

  //Used for cloud topics
  var messageCloudTopics = new MessageTopics(mediator);
  messageCloudTopics.prefix(config.cloudTopicPrefix).entity(config.datasetId);

  /**
   * Subscribers to sync topics which publishes to a data storage topic, subscribed to by a storage module,
   * for CRUDL operations. Publishes the response received from the storage module back to sync
   */
  messageCloudTopics.on('create', function(messageToCreate, mediatorTopicIdentifier) {
    // Adds an id field required by the new simple store module to the message object that will be created
    messageToCreate.id = shortid.generate();

    messageCloudDataTopics.request('create', messageToCreate, {uid: messageToCreate.id})
      .then(function(createdmessage) {
        mediator.publish(messageCloudTopics.getTopic('create', 'done') + ':' + mediatorTopicIdentifier, createdmessage);
      });
  });

  messageCloudTopics.on('list', function() {
    return messageCloudDataTopics.request('list');
  });

  messageCloudTopics.on('update', function(messageToUpdate) {
    return messageCloudDataTopics.request('update', messageToUpdate, {uid: messageToUpdate.id});
  });

  messageCloudTopics.on('read', function(uid) {
    return messageCloudDataTopics.request('read', uid);
  });

  messageCloudTopics.on('delete', function(uid) {
    return messageCloudDataTopics.request('delete', uid);
  });
};
