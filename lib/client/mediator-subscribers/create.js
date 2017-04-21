var _ = require('lodash');
var CONSTANTS = require('../../constants');
var messageClient = require('../message-client');


/**
 * Initialising a subscriber for creating a message.
 *
 * @param {object} messageEntityTopics
 *
 */
module.exports = function createMessageSubscriber(messageEntityTopics) {

  /**
   *
   * Handling the creation of a message
   *
   * @param {object} parameters
   * @param {object} parameters.messageToCreate   - The message item to create
   * @param {string/number} parameters.topicUid     - (Optional)  A unique ID to be used to publish completion / error topics.
   * @returns {*}
   */
  return function handleCreateMessageTopic(parameters) {
    var self = this;
    parameters = parameters || {};
    var messageCreateErrorTopic = messageEntityTopics.getTopic(CONSTANTS.TOPICS.CREATE, CONSTANTS.ERROR_PREFIX, parameters.topicUid);

    var messageToCreate = parameters.messageToCreate;

    //If no message is passed, can't create one
    if (!_.isPlainObject(messageToCreate)) {
      return self.mediator.publish(messageCreateErrorTopic, new Error("Invalid Data To Create A Message."));
    }

    messageClient(self.mediator).manager.create(messageToCreate)
    .then(function(createdMessage) {
      self.mediator.publish(messageEntityTopics.getTopic(CONSTANTS.TOPICS.CREATE, CONSTANTS.DONE_PREFIX, parameters.topicUid), createdMessage);
    }).catch(function(error) {
      self.mediator.publish(messageCreateErrorTopic, error);
    });
  };
};