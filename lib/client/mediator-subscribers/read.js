var CONSTANTS = require('../../constants');
var messageClient = require('../message-client');

/**
 * Initialsing a subscriber for reading messages.
 *
 * @param {object} messageEntityTopics
 *
 */
module.exports = function readMessageSubscriber(messageEntityTopics) {


  /**
   *
   * Handling the reading of a single message
   *
   * @param {object} parameters
   * @param {string} parameters.id - The ID of the message to read.
   * @param {string/number} parameters.topicUid     - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  return function handleReadMessagesTopic(parameters) {
    var self = this;
    parameters = parameters || {};

    var messageReadErrorTopic = messageEntityTopics.getTopic(CONSTANTS.TOPICS.READ, CONSTANTS.ERROR_PREFIX, parameters.topicUid);

    var messageReadDoneTopic = messageEntityTopics.getTopic(CONSTANTS.TOPICS.READ, CONSTANTS.DONE_PREFIX, parameters.topicUid);

    //If there is no ID, then we can't read the message.
    if (!parameters.id) {
      return self.mediator.publish(messageReadErrorTopic, new Error("Expected An ID When Reading A Message"));
    }

    messageClient(self.mediator).manager.read(parameters.id)
    .then(function(message) {
      self.mediator.publish(messageReadDoneTopic, message);
    }).catch(function(error) {
      self.mediator.publish(messageReadErrorTopic, error);
    });
  };

};