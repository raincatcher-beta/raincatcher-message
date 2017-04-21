var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../constants');

var expect = chai.expect;

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');

describe("Message Create Mediator Topic", function() {

  var mockMessageToCreate = {
    name: "This is a mock Work Order"
  };

  var expectedCreatedMessage =  _.extend({_localuid: "createdMessageLocalId"}, mockMessageToCreate);

  var topicUid = 'testtopicuid1';

  var createTopic = "wfm:messages:create";
  var doneCreateTopic = "done:wfm:messages:create:testtopicuid1";
  var errorCreateTopic = "error:wfm:messages:create:testtopicuid1";

  var syncCreateTopic = "wfm:sync:messages:create";
  var doneSyncCreateTopic = "done:wfm:sync:messages:create";
  var errorSyncCreateTopic = "error:wfm:sync:messages:create";

  var messageSubscribers = new MediatorTopicUtility(mediator);
  messageSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.MESSAGE_ENTITY_NAME);

  beforeEach(function() {
    this.subscribers = {};
    messageSubscribers.on(CONSTANTS.TOPICS.CREATE, require('./create')(messageSubscribers));
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    messageSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to create a message', function() {
    this.subscribers[syncCreateTopic] = mediator.subscribe(syncCreateTopic, function(parameters) {
      expect(parameters.itemToCreate).to.deep.equal(mockMessageToCreate);
      expect(parameters.topicUid).to.be.a('string');

      mediator.publish(doneSyncCreateTopic + ":" + parameters.topicUid, expectedCreatedMessage);
    });

    var donePromise = mediator.promise(doneCreateTopic);

    mediator.publish(createTopic, {
      messageToCreate: mockMessageToCreate,
      topicUid: topicUid
    });

    return donePromise.then(function(createdMessage) {
      expect(createdMessage).to.deep.equal(expectedCreatedMessage);
    });
  });

  it('should publish an error if there is no object to update', function() {
    var errorPromise = mediator.promise(errorCreateTopic);

    mediator.publish(createTopic, {
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error.message).to.have.string("Invalid Data");
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");
    this.subscribers[syncCreateTopic] = mediator.subscribe(syncCreateTopic, function(parameters) {
      expect(parameters.itemToCreate).to.deep.equal(mockMessageToCreate);
      expect(parameters.topicUid).to.be.a('string');

      mediator.publish(errorSyncCreateTopic + ":" + parameters.topicUid, expectedError);
    });

    var errorPromise = mediator.promise(errorCreateTopic);

    mediator.publish(createTopic, {
      messageToCreate: mockMessageToCreate,
      topicUid: topicUid
    });

    return errorPromise.then(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});