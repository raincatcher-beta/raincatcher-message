var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../constants');
var expect = chai.expect;

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');

describe("Message Read Mediator Topic", function() {

  var mockMessage = {
    id: "messageid",
    name: "This is a mock Work Order"
  };

  var readTopic = "wfm:messages:read";
  var doneReadTopic = "done:wfm:messages:read:messageid";
  var errorReadTopic = "error:wfm:messages:read";

  var syncReadTopic = "wfm:sync:messages:read";
  var doneSyncReadTopic = "done:wfm:sync:messages:read:messageid";
  var errorSyncReadTopic = "error:wfm:sync:messages:read:messageid";

  var messageSubscribers = new MediatorTopicUtility(mediator);
  messageSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.MESSAGE_ENTITY_NAME);

  var readSubscribers = require('./read')(messageSubscribers);

  beforeEach(function() {
    this.subscribers = {};
    messageSubscribers.on(CONSTANTS.TOPICS.READ, readSubscribers);
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    messageSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to read message', function() {
    this.subscribers[syncReadTopic] = mediator.subscribe(syncReadTopic, function(parameters) {
      expect(parameters.id).to.be.a('string');
      expect(parameters.topicUid).to.equal(mockMessage.id);

      mediator.publish(doneSyncReadTopic, mockMessage);
    });

    var donePromise = mediator.promise(doneReadTopic);

    mediator.publish(readTopic, {id: mockMessage.id, topicUid: mockMessage.id});

    return donePromise.then(function(readMessage) {
      expect(readMessage).to.deep.equal(mockMessage);
    });
  });

  it('should publish an error if there is no ID to read', function() {
    var errorPromise = mediator.promise(errorReadTopic);

    mediator.publish(readTopic);

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Expected An ID");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");
    this.subscribers[syncReadTopic] = mediator.subscribe(syncReadTopic, function(parameters) {
      expect(parameters.id).to.be.a('string');
      expect(parameters.topicUid).to.equal(mockMessage.id);

      mediator.publish(errorSyncReadTopic, expectedError);
    });

    var errorPromise = mediator.promise(errorReadTopic + ":" + mockMessage.id);

    mediator.publish(readTopic, {id: mockMessage.id, topicUid: mockMessage.id});

    return errorPromise.then(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});