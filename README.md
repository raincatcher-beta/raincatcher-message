# FeedHenry RainCatcher message [![Build Status](https://travis-ci.org/feedhenry-raincatcher/raincatcher-message.png)](https://travis-ci.org/feedhenry-raincatcher/raincatcher-message)

This module contains a message model representation and its related services :
- Backend services
- Frontend services
- Frontend UI templates

## Client-side usage

### Setup
This module is packaged in a CommonJS format, exporting the name of the Angular namespace.  The module can be included in an angular.js as follows:

```javascript
angular.module('app', [
, require('fh-wfm-message')
...
])
```

### Integration

#### Angular Service

This module publishes and subscribes to sync

A sync manager must first be initialized using the `messageSync.createManager()`.  This can be placed, for instance, in the `resolve` config of a `ui-router` controlled application.

```javascript
resolve: {
  messageManager: function(messageSync) {
    return messageSync.createManager();
  }
}
```
For a more complete example, please check the [demo portal app](https://github.com/feedhenry-raincatcher/raincatcher-demo-portal/blob/master/src/app/main.js).


#### `messageSync` API
These messageSync API methods all return Promises:

| messageSync method | Description |
| -------------------- | ----------- |
| `messageSync.manager.list` | list all messages |
| `messageSync.manager.create(message)` | create a message |
| `messageSync.manager.read(messageId)` | read a message |
| `messageSync.manager.update(message)` | update a message |
| `messageSync.manager.delete(message)` | delete a message |

### message directives

| Name | Attributes |
| ---- | ----------- |
| message-list | list, selectedModel |
| message-form | value, workers |
| message-detail | message |

### Topic Subscriptions

#### wfm:messages:create

##### Description

Creating a new Message

##### Example


```javascript
var parameters = {
  messageToCreate: {
    //A Valid JSON Object
  },
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:messages:create", parameters);
```

#### wfm:messages:read

##### Description

Read a single Message

##### Example


```javascript
var parameters = {
  id: "messageId",
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:messages:read", parameters);
```

#### wfm:messages:update

##### Description

Update a single Message

##### Example


```javascript
var parameters = {
  messageToUpdate: {
    ...
    id: "messageId"
    ...
  },
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:messages:update", parameters);
```


#### wfm:messages:remove

##### Description

Remove a single Message

##### Example


```javascript
var parameters = {
  id: "messageId",
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:messages:remove", parameters);
```


#### wfm:messages:list

##### Description

List All Messages

##### Example


```javascript
var parameters = {
  //Optional topic unique identifier.
  topicUid: "uniquetopicid"
}

mediator.publish("wfm:messages:list", parameters);
```


### Published Topics

The following topics are published by this module. Developers are free to implement these topics subscribers, or use a module that already has these subscribers implement (E.g. the [raincatcher-sync](https://github.com/feedhenry-raincatcher/raincatcher-sync) module).


| Topic         | Description           |
| ------------- |:-------------:| 
| wfm:sync:messages:create              |   Create a new item in the sync `messages` collection |
| wfm:sync:messages:update              |   Update an existing item in the sync `messages` collection |
| wfm:sync:messages:list              |   List all items in the sync `messages` collection |
| wfm:sync:messages:remove              |   Remove an existing item from the sync `messages` collection |
| wfm:sync:messages:read              |   Read a single item from the sync `messages` collection |
| wfm:sync:messages:start              |   Start the sync process for sync `messages` collection |
| wfm:sync:messages:stop              |   Stop the sync process for sync `messages` collection |
| wfm:sync:messages:force_sync        |   Force a sync cycle from client to cloud for sync `messages` collection |


### Topic Subscriptions

| Topic         | Description           |
| ------------- |:-------------:| 
| done:wfm:sync:messages:create        |   A message was created in the `messages` dataset |
| error:wfm:sync:messages:create        |   An error occurred when creating an item in the `messages` dataset. |
| done:wfm:sync:messages:update        |   A message was updated in the `messages` dataset |
| error:wfm:sync:messages:update        |   An error occurred when updating an item in the `messages` dataset. |
| done:wfm:sync:messages:list        |   A list of the items in the `messages` dataset completed |
| error:wfm:sync:messages:list        |   An error occurred when listing items in the `messages` dataset. |
| done:wfm:sync:messages:remove        |   A message was removed from the `messages` dataset |
| error:wfm:sync:messages:remove        |   An error occurred when removing an item in the `messages` dataset. |
| done:wfm:sync:messages:read        |   A item was read correctly from the `messages` dataset |
| error:wfm:sync:messages:read        |   An error occurred when reading an item in the `messages` dataset. |
| done:wfm:sync:messages:start        |   The sync process started for the `messages` dataset. |
| error:wfm:sync:messages:start        |   An error occurred when starting the `messages` dataset. |
| done:wfm:sync:messages:stop        |   The sync process stopped for the `messages` dataset. |
| error:wfm:sync:messages:stop        |   An error occurred when stopping the `messages` dataset sync process. |
| done:wfm:sync:messages:force_sync        |  A force sync process completed for the `messages` dataset. |
| error:wfm:sync:messages:force_sync        |   An error occurred when forcing the sync process for the `messages` dataset. |

## Usage in an express backend

### Setup
The server-side component of this RainCatcher module exports a function that takes express and mediator instances as parameters, as in:

```javascript
var express = require('express')
  , app = express()
  , mbaasExpress = mbaasApi.mbaasExpress()
  , mediator = require('fh-wfm-mediator/lib/mediator')
  ;

// configure the express app
...

// setup the wfm message sync server
require('fh-wfm-message/server')(mediator, app, mbaasExpress);

```

### Server side events
the module broadcasts, and listens for the following events

| Subscribes To | Responds with |
| ----------- | ------------- |
| `wfm:message:list` | `done:wfm:message:list` |
| `wfm:message:read` | `done:wfm:message:read` |
| `wfm:message:update` | `done:wfm:message:update` |
| `wfm:message:create` | `done:wfm:message:create` |

### Integration

Check this [demo cloud application](https://github.com/feedhenry-raincatcher/raincatcher-demo-cloud/blob/master/lib/app/message.js)

### message data structure example

```javascript

  {
    id: 1276001,
    receiverId: "156340",
    status: "unread",
    sender: {
      avatar:"https://s3.amazonaws.com/uifaces/faces/twitter/kolage/128.jpg",
      name:"Trever Smith"
    },
    subject: 'Adress change w41',
    content: 'hallo hallo'
  }

```
