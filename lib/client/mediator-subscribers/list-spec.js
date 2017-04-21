var mediator = require("fh-wfm-mediator/lib/mediator");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../constants');
var expect = chai.expect;

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');

describe("Message List Mediator Topic", function() {

  var mockMessage = {
    id: "messageid",
    name: "This is a mock Work Order"
  };

  var messages = [_.clone(mockMessage), _.clone(mockMessage)];

  var listTopic = "wfm:messages:list";
  var doneListTopic = "done:wfm:messages:list";
  var errorListTopic = "error:wfm:messages:list";

  var syncListTopic = "wfm:sync:messages:list";
  var doneSyncListTopic = "done:wfm:sync:messages:list";
  var errorSyncListTopic = "error:wfm:sync:messages:list";

  var messageSubscribers = new MediatorTopicUtility(mediator);
  messageSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.MESSAGE_ENTITY_NAME);

  beforeEach(function() {
    this.subscribers = {};
    messageSubscribers.on(CONSTANTS.TOPICS.LIST, require('./list')(messageSubscribers));
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    messageSubscribers.unsubscribeAll();
  });

  it('should use the sync topics to list messages', function() {
    this.subscribers[syncListTopic] = mediator.subscribe(syncListTopic, function() {
      mediator.publish(doneSyncListTopic, messages);
    });

    var donePromise = mediator.promise(doneListTopic);

    mediator.publish(listTopic);

    return donePromise.then(function(arrayOfMessages) {
      expect(arrayOfMessages).to.deep.equal(messages);
    });
  });

  it('should handle an error from the sync create topic', function() {
    var expectedError = new Error("Error performing sync operation");
    this.subscribers[syncListTopic] = mediator.subscribe(syncListTopic, function() {
      mediator.publish(errorSyncListTopic, expectedError);
    });

    var errorPromise = mediator.promise(errorListTopic);

    mediator.publish(listTopic);

    return errorPromise.then(function(error) {
      expect(error).to.deep.equal(expectedError);
    });
  });
});