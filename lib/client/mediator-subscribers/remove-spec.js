var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../constants');
var expect = chai.expect;

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');

describe("Message Remove Mediator Topic", function() {

  var mockMessage = {
    id: "messageid",
    name: "This is a mock Work Order"
  };

  var removeTopic = "wfm:messages:remove";
  var doneRemoveTopic = "done:wfm:messages:remove:messageid";
  var errorRemoveTopic = "error:wfm:messages:remove";

  var syncRemoveTopic = "wfm:sync:messages:remove";
  var doneSyncRemoveTopic = "done:wfm:sync:messages:remove:messageid";
  var errorSyncRemoveTopic = "error:wfm:sync:messages:remove:messageid";

  var messageSubscribers = new MediatorTopicUtility(mediator);
  messageSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.MESSAGE_ENTITY_NAME);

  beforeEach(function() {
    this.subscribers = {};
    messageSubscribers.on(CONSTANTS.TOPICS.REMOVE, require('./remove')(messageSubscribers));
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    messageSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to remove a message', function() {
    this.subscribers[syncRemoveTopic] = mediator.subscribe(syncRemoveTopic, function(parameters) {
      expect(parameters.id).to.be.a('string');
      expect(parameters.topicUid).to.equal(mockMessage.id);

      mediator.publish(doneSyncRemoveTopic, mockMessage);
    });

    var donePromise = mediator.promise(doneRemoveTopic);

    mediator.publish(removeTopic, {id: mockMessage.id, topicUid: mockMessage.id});

    return donePromise;
  });

  it('should publish an error if there is no ID to remove', function() {
    var errorPromise = mediator.promise(errorRemoveTopic);

    mediator.publish(removeTopic);

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Expected An ID");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");
    this.subscribers[syncRemoveTopic] = mediator.subscribe(syncRemoveTopic, function(parameters) {
      expect(parameters.id).to.be.a('string');
      expect(parameters.topicUid).to.equal(mockMessage.id);

      mediator.publish(errorSyncRemoveTopic, expectedError);
    });

    var errorPromise = mediator.promise(errorRemoveTopic + ":" + mockMessage.id);

    mediator.publish(removeTopic, {id: mockMessage.id, topicUid: mockMessage.id});

    return errorPromise.then(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});