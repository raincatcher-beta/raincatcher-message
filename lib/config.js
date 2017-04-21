'use strict';

module.exports = {
  apiHost: 'http://localhost:8080',
  apiPath: '/api/wfm/message',
  datasetId : 'messages',
  syncOptions : {
    "sync_frequency" : 5,
    "storage_strategy": "dom",
    "do_console_log": false
  },
  cloudTopicPrefix: 'wfm:cloud',
  cloudDataTopicPrefix: 'wfm:cloud:data'
};
