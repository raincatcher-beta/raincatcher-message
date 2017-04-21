'use strict';

var ngModule = angular.module('wfm.message.directives', ['wfm.core.mediator']);
module.exports = 'wfm.message.directives';

require('../../dist');

ngModule.directive('messageList', function($templateCache, mediator) {
  return {
    restrict: 'E'
  , template: $templateCache.get('wfm-template/message-list.tpl.html')
  , scope: {
    list : '=list',
    selectedModel: '='
  }
  , controller: function($scope) {
    var self = this;
    self.list = $scope.list;
    self.selected = $scope.selectedModel;
    self.selectMessage = function(event, message) {
      self.selectedMessageId = message.id;
      mediator.publish('wfm:message:selected', message);
      event.preventDefault();
      event.stopPropagation();
    };
    self.ismessageShown = function(message) {
      return self.shownmessage === message;
    };

    self.applyFilter = function(term) {
      term = term.toLowerCase();
      self.list = $scope.list.filter(function(message) {
        return String(message.sender.name).toLowerCase().indexOf(term) !== -1
            || String(message.subject).toLowerCase().indexOf(term) !== -1;
      });
    };
  }
  , controllerAs: 'ctrl'
  };
})

.directive('messageForm', function($templateCache, mediator) {
  return {
    restrict: 'E'
  , template: $templateCache.get('wfm-template/message-form.tpl.html')
  , scope: {
    message : '=value'
  , workers: '='
  }
  , controller: function($scope) {
    var self = this;
    self.model = angular.copy($scope.message);
    self.workers = $scope.workers;
    self.submitted = false;
    self.done = function(isValid) {
      self.submitted = true;
      self.model.receiver = JSON.parse(self.model.receiver);
      self.model.receiverId = self.model.receiver.id;
      self.model.status = "unread";
      if (isValid) {
        var messageToCreate = JSON.parse(angular.toJson(self.model)); //remove generated angular variables
        mediator.publish('wfm:message:created', messageToCreate);
      }
    };
  }
  , controllerAs: 'ctrl'
  };
})

.directive('messageDetail', function($templateCache, mediator) {
  return {
    restrict: 'E'
  , template: $templateCache.get('wfm-template/message-detail.tpl.html')
  , scope: {
    message : '=message'
  }
  , controller: function($scope) {
    var self = this;
    self.message = $scope.message;
    self.showSelectButton = !! $scope.$parent.messages;
    self.selectmessage = function(event, message) {
      mediator.publish('wfm:message:selected', message);
      event.preventDefault();
      event.stopPropagation();
    };
    self.closeMessage = function(event, message) {
      mediator.publish('wfm:message:close:' + message.id);
      event.preventDefault();
      event.stopPropagation();
    };
  }
  , controllerAs: 'ctrl'
  };
})
;
