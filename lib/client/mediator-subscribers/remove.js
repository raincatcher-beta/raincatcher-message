var CONSTANTS = require('../../constants');
var messageClient = require('../message-client');

/**
 * Initialsing a subscriber for removing messages.
 *
 * @param {object} messageEntityTopics
 *
 */
module.exports = function removeMessageSubscriber(messageEntityTopics) {


  /**
   *
   * Handling the removal of a single message
   *
   * @param {object} parameters
   * @param {string} parameters.id - The ID of the message to remove.
   * @param {string/number} parameters.topicUid     - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  return function handleRemoveMessage(parameters) {
    var self = this;
    parameters = parameters || {};
    var messageRemoveErrorTopic = messageEntityTopics.getTopic(CONSTANTS.TOPICS.REMOVE, CONSTANTS.ERROR_PREFIX, parameters.topicUid);

    var messageRemoveDoneTopic = messageEntityTopics.getTopic(CONSTANTS.TOPICS.REMOVE, CONSTANTS.DONE_PREFIX, parameters.topicUid);

    //If there is no ID, then we can't read the message.
    if (!parameters.id) {
      return self.mediator.publish(messageRemoveErrorTopic, new Error("Expected An ID When Removing A Message"));
    }

    messageClient(self.mediator).manager.delete({
      id: parameters.id
    })
    .then(function() {
      self.mediator.publish(messageRemoveDoneTopic);
    }).catch(function(error) {
      self.mediator.publish(messageRemoveErrorTopic, error);
    });
  };
};