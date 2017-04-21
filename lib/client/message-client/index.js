var q = require('q');
var _ = require('lodash');
var shortid = require('shortid');
var CONSTANTS = require('../../constants');
var config = require('../../config');
var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');
var mediator, manager, messageSyncSubscribers;

/**
 *
 * Getting Promises for done and error topics.
 *
 * @param doneTopicPromise  - A promise for the done topic.
 * @param errorTopicPromise - A promise for the error topic.
 * @returns {*}
 */
function getTopicPromises(doneTopicPromise, errorTopicPromise) {
  var deferred = q.defer();

  doneTopicPromise.then(function(createdMessage) {
    deferred.resolve(createdMessage);
  });

  errorTopicPromise.then(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}


/**
 *
 * Creating a new message.
 *
 * @param {object} messageToCreate - The Message to create.
 */
function create(messageToCreate) {

  //Creating a unique channel to get the response
  var topicUid = shortid.generate();

  var topicParams = {topicUid: topicUid, itemToCreate: messageToCreate};

  var donePromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.CREATE, CONSTANTS.DONE_PREFIX, topicUid));

  var errorPromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.CREATE, CONSTANTS.ERROR_PREFIX, topicUid));

  mediator.publish(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.CREATE), topicParams);

  return getTopicPromises(donePromise, errorPromise);
}

/**
 *
 * Updating an existing message.
 *
 * @param {object} messageToUpdate - The message to update
 * @param {string} messageToUpdate.id - The ID of the message to update
 */
function update(messageToUpdate) {
  var topicParams = {topicUid: messageToUpdate.id, itemToUpdate: messageToUpdate};

  var donePromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.UPDATE, CONSTANTS.DONE_PREFIX, topicParams.topicUid));

  var errorPromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.UPDATE, CONSTANTS.ERROR_PREFIX, topicParams.topicUid));

  mediator.publish(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.UPDATE), topicParams);

  return getTopicPromises(donePromise, errorPromise);
}

/***
 *
 * Reading a single message.
 *
 * @param {string} messageId - The ID of the message to read
 */
function read(messageId) {
  var donePromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.READ, CONSTANTS.DONE_PREFIX, messageId));

  var errorPromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.READ, CONSTANTS.ERROR_PREFIX, messageId));

  mediator.publish(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.READ), {id: messageId, topicUid: messageId});

  return getTopicPromises(donePromise, errorPromise);
}

/**
 * Listing All Messages
 */
function list() {
  var donePromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.LIST, CONSTANTS.DONE_PREFIX));

  var errorPromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.LIST, CONSTANTS.ERROR_PREFIX));

  mediator.publish(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.LIST));

  return getTopicPromises(donePromise, errorPromise);
}

/**
 *
 * Removing a workororder using the sync topics
 *
 * @param {object} messageToRemove
 * @param {string} messageToRemove.id - The ID of the workoroder to remove
 */
function remove(messageToRemove) {

  var donePromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.REMOVE, CONSTANTS.DONE_PREFIX, messageToRemove.id));

  var errorPromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.REMOVE, CONSTANTS.ERROR_PREFIX, messageToRemove.id));

  mediator.publish(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.REMOVE),  {id: messageToRemove.id, topicUid: messageToRemove.id});

  return getTopicPromises(donePromise, errorPromise);
}

/**
 * Starting the synchronisation process for messages.
 */
function start() {

  var donePromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.START, CONSTANTS.DONE_PREFIX));

  var errorPromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.START, CONSTANTS.ERROR_PREFIX));

  mediator.publish(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.START));

  return getTopicPromises(donePromise, errorPromise);
}

/**
 * Stopping the synchronisation process for messages.
 */
function stop() {
  var donePromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.STOP, CONSTANTS.DONE_PREFIX));

  var errorPromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.STOP, CONSTANTS.ERROR_PREFIX));

  mediator.publish(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.STOP));

  return getTopicPromises(donePromise, errorPromise);
}

/**
 * Forcing the messages to sync to the remote store.
 */
function forceSync() {
  var donePromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.FORCE_SYNC, CONSTANTS.DONE_PREFIX));

  var errorPromise = mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.FORCE_SYNC, CONSTANTS.ERROR_PREFIX));

  mediator.publish(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.FORCE_SYNC));

  return getTopicPromises(donePromise, errorPromise);
}

/**
 * Safe stop forces a synchronisation to the remote server and then stops the synchronisation process.
 * @returns {Promise}
 */
function safeStop() {
  return forceSync().then(stop);
}


/**
 * Waiting for the synchronisation process to complete to the remote cluster.
 */
function waitForSync() {
  return mediator.promise(messageSyncSubscribers.getTopic(CONSTANTS.TOPICS.SYNC_COMPLETE));
}

function ManagerWrapper(_manager) {
  this.manager = _manager;
  var self = this;

  var methodNames = ['create', 'read', 'update', 'delete', 'list', 'start', 'stop', 'safeStop', 'forceSync', 'waitForSync'];
  methodNames.forEach(function(methodName) {
    self[methodName] = function() {
      return q.when(self.manager[methodName].apply(self.manager, arguments));
    };
  });
}


/**
 *
 * Initialising the message-client with a mediator.
 *
 * @param _mediator
 * @returns {ManagerWrapper|*}
 */
module.exports = function(_mediator) {

  //If there is already a manager, use this
  if (manager) {
    return manager;
  }

  mediator = _mediator;

  messageSyncSubscribers = new MediatorTopicUtility(mediator);
  messageSyncSubscribers.prefix(CONSTANTS.SYNC_TOPIC_PREFIX).entity(config.datasetId);

  manager = new ManagerWrapper({
    create: create,
    update: update,
    list: list,
    delete: remove,
    start: start,
    stop: stop,
    read: read,
    safeStop: safeStop,
    forceSync: forceSync,
    publishRecordDeltaReceived: _.noop,
    waitForSync: waitForSync,
    datasetId: config.datasetId
  });

  return manager;
};