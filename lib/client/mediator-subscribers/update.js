var CONSTANTS = require('../../constants');
var _ = require('lodash');
var messageClient = require('../message-client');

/**
 * Initialsing a subscriber for updating a message.
 *
 * @param {object} messageEntityTopics
 *
 */
module.exports = function updateMessageSubscriber(messageEntityTopics) {

  /**
   *
   * Handling the update of a message
   *
   * @param {object} parameters
   * @param {object} parameters.messageToUpdate   - The message item to update
   * @param {string/number} parameters.topicUid     - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  return function handleUpdateTopic(parameters) {
    var self = this;
    parameters = parameters || {};
    var messageUpdateErrorTopic = messageEntityTopics.getTopic(CONSTANTS.TOPICS.UPDATE, CONSTANTS.ERROR_PREFIX, parameters.topicUid);

    var messageUpdateDoneTopic = messageEntityTopics.getTopic(CONSTANTS.TOPICS.UPDATE, CONSTANTS.DONE_PREFIX, parameters.topicUid);

    var messageToUpdate = parameters.messageToUpdate;

    //If no message is passed, can't update one. Also require the ID of the workorde to update it.
    if (!_.isPlainObject(messageToUpdate) || !messageToUpdate.id) {
      return self.mediator.publish(messageUpdateErrorTopic, new Error("Invalid Data To Update A Message."));
    }

    messageClient(self.mediator).manager.update(messageToUpdate)
    .then(function(updatedMessage) {
      self.mediator.publish(messageUpdateDoneTopic, updatedMessage);
    }).catch(function(error) {
      self.mediator.publish(messageUpdateErrorTopic, error);
    });
  };
};