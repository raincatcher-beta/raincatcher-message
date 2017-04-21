var CONSTANTS = require('../../constants');
var messageClient = require('../message-client');

/**
 * Initialsing a subscriber for Listing messages.
 *
 * @param {object} messageEntityTopics
 *
 */
module.exports = function listMessageSubscriber(messageEntityTopics) {

  /**
   *
   * Handling the listing of messages
   *
   * @param {object} parameters
   * @param {string/number} parameters.topicUid  - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  return function handleListMessagesTopic(parameters) {
    var self = this;
    parameters = parameters || {};
    var messageListErrorTopic = messageEntityTopics.getTopic(CONSTANTS.TOPICS.LIST, CONSTANTS.ERROR_PREFIX, parameters.topicUid);

    var messageListDoneTopic = messageEntityTopics.getTopic(CONSTANTS.TOPICS.LIST, CONSTANTS.DONE_PREFIX, parameters.topicUid);

    messageClient(self.mediator).manager.list()
    .then(function(arrayOfMessages) {
      self.mediator.publish(messageListDoneTopic, arrayOfMessages);
    }).catch(function(error) {
      self.mediator.publish(messageListErrorTopic, error);
    });
  };
};