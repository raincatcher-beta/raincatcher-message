var ngModule;
try {
  ngModule = angular.module('wfm.message.directives');
} catch (e) {
  ngModule = angular.module('wfm.message.directives', []);
}

ngModule.run(['$templateCache', function ($templateCache) {
  $templateCache.put('wfm-template/message-detail.tpl.html',
    '<md-toolbar class="content-toolbar">\n' +
    '  <div class="md-toolbar-tools">\n' +
    '    <md-button ng-click="ctrl.closeMessage($event, ctrl.message)" hide-gt-sm class="md-icon-button">\n' +
    '      <md-icon aria-label="Close" md-font-set="material-icons">close</md-icon>\n' +
    '    </md-button>\n' +
    '    <h3>\n' +
    '     {{ctrl.message.subject}}\n' +
    '    </h3>\n' +
    '  </div>\n' +
    '</md-toolbar>\n' +
    '<div class="wfm-maincol-scroll">\n' +
    '  <div class="message" layout-padding layout-margin>\n' +
    '\n' +
    '    <div class="message-header">\n' +
    '      <div class="md-body-1">\n' +
    '        <span>From:</span> {{ctrl.message.sender.name}}\n' +
    '      </div>\n' +
    '      <div class="md-body-1">\n' +
    '        <span>To:</span> {{ctrl.message.receiver.name}}\n' +
    '      </div>\n' +
    '      <div class="md-body-1">\n' +
    '        <span>Status:</span> {{ctrl.message.status}}\n' +
    '      </div>\n' +
    '      <!--<div class="md-body-1 time-stamp">11:38 AM (3 hours ago)</div>-->\n' +
    '    </div>\n' +
    '\n' +
    '    <md-divider></md-divider>\n' +
    '\n' +
    '    <p class="md-body-1">{{ctrl.message.content}}</p>\n' +
    '  </div>\n' +
    '</div>\n' +
    '');
}]);
