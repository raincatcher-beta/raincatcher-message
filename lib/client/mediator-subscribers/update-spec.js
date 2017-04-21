var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../constants');
var expect = chai.expect;

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');


describe("Message Update Mediator Topic", function() {

  var mockMessageToUpdate = {
    id: "messageidtoupdate",
    name: "This is a mock Work Order"
  };

  var expectedUpdatedMessage =  _.defaults({name: "Updated Message"}, mockMessageToUpdate);

  var topicUid = 'testtopicuid1';

  var updateTopic = "wfm:messages:update";
  var doneUpdateTopic = "done:wfm:messages:update:testtopicuid1";
  var errorUpdateTopic = "error:wfm:messages:update:testtopicuid1";

  var syncUpdateTopic = "wfm:sync:messages:update";
  var doneSyncUpdateTopic = "done:wfm:sync:messages:update";
  var errorSyncUpdateTopic = "error:wfm:sync:messages:update";

  var messageSubscribers = new MediatorTopicUtility(mediator);
  messageSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.MESSAGE_ENTITY_NAME);

  beforeEach(function() {
    this.subscribers = {};
    messageSubscribers.on(CONSTANTS.TOPICS.UPDATE, require('./update')(messageSubscribers));
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    messageSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to update a message', function() {
    this.subscribers[syncUpdateTopic] = mediator.subscribe(syncUpdateTopic, function(parameters) {
      expect(parameters.itemToUpdate).to.deep.equal(mockMessageToUpdate);
      expect(parameters.topicUid).to.be.a('string');

      mediator.publish(doneSyncUpdateTopic + ":" + parameters.topicUid, expectedUpdatedMessage);
    });

    var donePromise = mediator.promise(doneUpdateTopic);

    mediator.publish(updateTopic, {
      messageToUpdate: mockMessageToUpdate,
      topicUid: topicUid
    });

    return donePromise.then(function(updatedMessage) {
      expect(updatedMessage).to.deep.equal(expectedUpdatedMessage);
    });
  });

  it('should publish an error if there is no object to update', function() {
    var errorPromise = mediator.promise(errorUpdateTopic);

    mediator.publish(updateTopic, {
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Invalid Data");
    });
  });

  it('should publish an error if there is no message id', function() {
    var errorPromise = mediator.promise(errorUpdateTopic);

    mediator.publish(updateTopic, {
      messageToUpdate: {},
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Invalid Data");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");

    this.subscribers[syncUpdateTopic] = mediator.subscribe(syncUpdateTopic, function(parameters) {
      expect(parameters.itemToUpdate).to.deep.equal(mockMessageToUpdate);
      expect(parameters.topicUid).to.be.a('string');

      mediator.publish(errorSyncUpdateTopic + ":" + parameters.topicUid, expectedError);
    });

    var errorPromise = mediator.promise(errorUpdateTopic);

    mediator.publish(updateTopic, {
      messageToUpdate: mockMessageToUpdate,
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});