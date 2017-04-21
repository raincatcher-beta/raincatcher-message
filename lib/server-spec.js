var express = require('express');
var chai = require('chai');
var expect = chai.expect;
var app = express();
var mockMbaasApi = {};


var CLOUD_TOPICS = {
  create: "wfm:cloud:messages:create",
  list: "wfm:cloud:messages:list",
  update: "wfm:cloud:messages:update",
  read: "wfm:cloud:messages:read",
  delete: "wfm:cloud:messages:delete"
};
var CLOUD_DATA_TOPICS = {
  create: "wfm:cloud:data:messages:create",
  list: "wfm:cloud:data:messages:list",
  update: "wfm:cloud:data:messages:update",
  read: "wfm:cloud:data:messages:read",
  delete: "wfm:cloud:data:messages:delete"
};
var DONE = 'done:';
var mediator = require('fh-wfm-mediator/lib/mediator.js');

/**
 * Set of unit tests for the sync topic subscribers
 */
describe('Cloud Message Sync', function() {
  var messageServer = require('./server.js');

  //Create
  it('should publish to done create cloud topic when the request to create a message has been completed', function() {
    var mockMessageCreate = {value: 'test-message-create'};
    var expectedMessageVal = 'test-message-create';
    var topicId = "testId";

    messageServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.create, function(createdMessage) {
      //Publish to done create data topic to fake message creation by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.create + ':' + createdMessage.id, createdMessage);
    });

    return mediator.request(CLOUD_TOPICS.create, [mockMessageCreate, topicId], {uid: topicId}).then(function(createdMessage) {
      expect(createdMessage, 'Created message received should not be null or undefined').to.exist;
      expect(createdMessage, 'Created message received should be an object').to.be.an('object');
      expect(createdMessage.value, 'Created message received should have the same value as the original object passed').to.equal(expectedMessageVal);
      expect(createdMessage.id, 'Created message received should have a generated string ID').to.be.a('string');
    });

  });

  //List
  it('should publish to done list cloud topic when the request to list a message has been completed', function() {
    var mockMessageArray = [{id: 'test-message-1', value:'test-message'},
        {id: 'test-message-2', value:'test-message'},
        {id: 'test-message-3', value:'test-message'}];
    var expectedMessageArray = [{id: 'test-message-1', value:'test-message'},
      {id: 'test-message-2', value:'test-message'},
      {id: 'test-message-3', value:'test-message'}];

    messageServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.list, function() {
      //Publish to done list data topic to fake getting the list of messages by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.list, mockMessageArray);
    });

    return mediator.request(CLOUD_TOPICS.list).then(function(listMessage) {
      expect(listMessage, 'List of messages received should not be null or undefined').to.exist;
      expect(listMessage, 'List of messages received should be an array').to.be.an('array');
      expect(listMessage, 'List of messages received should have the same value as the list of messages sent by the mock storage module').to.deep.equal(expectedMessageArray);
    });

  });

  // Update
  it('should publish to done update cloud topic when the request to update a message has been completed', function() {
    var mockMessageUpdate = {id:'testID', value: 'message-updated'};
    var expectedMessageUpdated = {id:'testID', value: 'message-updated'};

    messageServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.update, function(messageToUpdate) {
      //Publish to done update data topic to fake getting the update of messages by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.update + ':' + messageToUpdate.id, messageToUpdate);
    });

    return mediator.request(CLOUD_TOPICS.update, mockMessageUpdate, {uid: mockMessageUpdate.id}).then(function(updatedMessage) {
      expect(updatedMessage, 'Updated message received should not be null or undefined').to.exist;
      expect(updatedMessage, 'Updated message received should be an object').to.be.an('object');
      expect(updatedMessage, 'Updated message received should have the same value as the updated message sent by the mock storage module').to.deep.equal(expectedMessageUpdated);
    });
  });

  //Read
  it('should publish to done read cloud topic when the request to read a message has been completed', function() {
    var mockMessageRead = {id:'testID', value: 'message-read'};
    var expectedMessageRead = {id:'testID', value: 'message-read'};
    var uid = "testID";

    messageServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.read, function(uid) {
      //Publish to done read data topic to fake the reading of messages by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.read + ':' + uid, mockMessageRead);
    });

    return mediator.request(CLOUD_TOPICS.read, uid).then(function(readMessage) {
      expect(readMessage, 'Read message received should not be null or undefined').to.exist;
      expect(readMessage, 'Read message received should be an object').to.be.an('object');
      expect(readMessage, 'Read message received should have the same value as the read message sent by the mock storage module').to.deep.equal(expectedMessageRead);

    });
  });

  //Delete
  it('should publish to done delete cloud topic when the request to delete a message has been completed', function() {
    var mockMessageDelete = {id:'testID', value: 'message-deleted'};
    var expectedMessageDeleted = {id:'testID', value: 'message-deleted'};
    var uid = "testID";

    messageServer(mediator, app, mockMbaasApi);

    //Mock of the data topic subscriber in the storage module
    mediator.subscribe(CLOUD_DATA_TOPICS.delete, function(uid) {
      //Publish to done delete data topic to fake the deleteing of messages by storage module
      mediator.publish(DONE + CLOUD_DATA_TOPICS.delete + ':' + uid, mockMessageDelete);
    });

    return mediator.request(CLOUD_TOPICS.delete, uid).then(function(deletedMessage) {
      expect(deletedMessage, 'Deleted message received should not be null or undefined').to.exist;
      expect(deletedMessage, 'Deleted message received should be an object').to.be.an('object');
      expect(deletedMessage, 'Deleted message received should have the same value as the read message sent by the mock storage module').to.deep.equal(expectedMessageDeleted);
    });
  });

});
