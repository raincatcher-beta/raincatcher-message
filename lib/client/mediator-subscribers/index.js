var _ = require('lodash');
var topicHandlers = {
  create: require('./create'),
  update: require('./update'),
  remove: require('./remove'),
  list: require('./list'),
  read: require('./read')
};
var CONSTANTS = require('../../constants');

var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');

var messageSubscribers;

module.exports = {
  /**
   * Initialisation of all the topics that this module is interested in.
   * @param mediator
   * @returns {Topics|exports|module.exports|*}
   */
  init: function(mediator) {

    //If there is already a set of subscribers set up, then don't subscribe again.
    if (messageSubscribers) {
      return messageSubscribers;
    }

    messageSubscribers = new MediatorTopicUtility(mediator);
    messageSubscribers.prefix(CONSTANTS.TOPIC_PREFIX).entity(CONSTANTS.MESSAGE_ENTITY_NAME);

    //Setting up subscribers to the message topics.
    _.each(CONSTANTS.TOPICS, function(topicName) {
      if (topicHandlers[topicName]) {
        messageSubscribers.on(topicName, topicHandlers[topicName](messageSubscribers));
      }
    });

    return messageSubscribers;
  },
  tearDown: function() {
    if (messageSubscribers) {
      messageSubscribers.unsubscribeAll();
    }
  }
};