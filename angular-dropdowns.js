/*
* Author: Jake AuYeung
* Mail: jakeauyeung@Gmail.com
* Date: 2014-11-20
* ngDropdowns
* DropDowns directive for AngularJS
 */
'use strict';
var dd = angular.module('ngDropdowns', []);

dd.directive('dropdownSelect', ['DropdownService', '$window',
  function (DropdownService, $window) {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        dropdownSelect: '=',
        dropdownModel: '=',
        dropdownOnchange: '&'
      },

      controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
        $scope.labelField = $attrs.dropdownItemLabel || 'text';
        $scope.countField = $attrs.dropdownItemCount || 'text';

        DropdownService.register($element);

        this.select = function (selected) {
          if (selected !== $scope.dropdownModel) {
            angular.copy(selected, $scope.dropdownModel);
          }
          $scope.dropdownOnchange({
            selected: selected
          });
        };


        // Does not register touchstart events outside of directive scope
        var $clickEvent = ('click'||'touchstart' in $window);
        $element.bind($clickEvent, function (event) {
          event.stopPropagation();
          DropdownService.toggleActive($element, $scope.dropdownModel.name);
        });

        $scope.$on('$destroy', function () {
          DropdownService.unregister($element);
        });

        

      }],

      template: [
        '<div class="wrap-dd-select">',
          '<div class="nav-mask"></div>',
          '<span class="selected"><span class="selected-item">{{dropdownModel[labelField]}}</span><i class="sarrow"></i>',
          '<ul class="dropdown">',
            '<li ng-repeat="item in dropdownSelect"',
            ' class="dropdown-item"',
            ' dropdown-select-item="item"',
            ' dropdown-item-count="countField"',
            ' dropdown-item-label="labelField">',
            '</li>',
          '</ul>',
        '</div>'
      ].join('')
    };
  }
]);

dd.directive('dropdownSelectItem', [
  function () {
    return {
      require: '^dropdownSelect',
      replace: true,
      scope: {
        dropdownItemLabel: '=',
        dropdownItemCount: '=',
        dropdownSelectItem: '='
      },

      link: function (scope, element, attrs, dropdownSelectCtrl) {
        scope.selectItem = function () {
          if (scope.dropdownSelectItem.href) {
            return;
          }
          dropdownSelectCtrl.select(scope.dropdownSelectItem);
        };



      },

      template: [
        '<li ng-class="{divider: dropdownSelectItem.divider}">',
          '<a href="" class="dropdown-item"',
          ' ng-if="!dropdownSelectItem.divider"',
          ' ng-href="{{dropdownSelectItem.href}}"',
          ' ng-click="selectItem()">',
            '<i class="drop-list-text">{{dropdownSelectItem[dropdownItemLabel]}}</i>',
            '<span class="check icon-check"></span>',
            '<span class="num">{{dropdownSelectItem[dropdownItemCount]}}</span>',
          '</a>',
        '</li>'
      ].join('')
    };
  }
]);

dd.directive('dropdownMenu', ['$parse', '$compile', 'DropdownService', '$window',
  function ($parse, $compile, DropdownService, $window) {
    return {
      restrict: 'A',
      replace: false,
      scope: {
        dropdownMenu: '=',
        dropdownModel: '=',
        dropdownOnchange: '&'
      },

      controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
        $scope.labelField = $attrs.dropdownItemLabel || 'text';
        $scope.countField = $attrs.dropdownItemCount || 'text';

        // Does not register touchstart events outside of directive scope.
        var $clickEvent = ('click'||'touchstart'in $window);
        var $template = angular.element([
          '<ul class="dropdown">',
            '<li ng-repeat="item in dropdownMenu"',
            ' class="dropdown-item"',
            ' dropdown-item-label="labelField"',
            ' dropdown-item-count="countField"',
            ' dropdown-menu-item="item">',
            '</li>',
          '</ul>'
        ].join(''));
        // Attach this controller to the element's data
        $template.data('$dropdownMenuController', this);

        var tpl = $compile($template)($scope);
        var $wrap = angular.element('<div class="wrap-dd-menu"></div>');

        $element.replaceWith($wrap);
        $wrap.append($element);
        $wrap.append(tpl);

        DropdownService.register(tpl);

        this.select = function (selected) {
          if (selected !== $scope.dropdownModel) {
            angular.copy(selected, $scope.dropdownModel);
          }
          $scope.dropdownOnchange({
            selected: selected
          });
        };

        $element.bind($clickEvent, function (event) {
          event.stopPropagation();
          DropdownService.toggleActive(tpl);
        });

        $scope.$on('$destroy', function () {
          DropdownService.unregister(tpl);
        });
      }]
    };
  }
]);

dd.directive('dropdownMenuItem', [
  function () {
    return {
      require: '^dropdownMenu',
      replace: true,
      scope: {
        dropdownMenuItem: '=',
        dropdownItemLabel: '=',
        dropdownItemCount: '='
      },

      link: function (scope, element, attrs, dropdownMenuCtrl) {
        scope.selectItem = function () {
          if (scope.dropdownMenuItem.href) {
            return;
          }
          dropdownMenuCtrl.select(scope.dropdownMenuItem);
        };
      },

      template: [
        '<li ng-class="{divider: dropdownMenuItem.divider}">',
          '<a href="" class="dropdown-item"',
          ' ng-if="!dropdownMenuItem.divider"',
          ' ng-click="selectItem()">',
            '{{dropdownMenuItem[dropdownItemLabel]}}',
          '</a>',
        '</li>'
      ].join('')
    };
  }
]);

dd.factory('DropdownService', ['$document',
  function ($document) {
    var body = $document.find('body'),
        service = {},
        _dropdowns = [];


    body.bind('click', function () {
      angular.forEach(_dropdowns, function (el) {
        el.removeClass('active');
      });
    });

    service.register = function (ddEl) {
      _dropdowns.push(ddEl);
    };

    service.unregister = function (ddEl) {
      var index;
      index = _dropdowns.indexOf(ddEl);
      if (index > -1) {
        _dropdowns.splice(index, 1);
      }
    };

    service.toggleActive = function (ddEl, sessionStore) {
      $('.wrap-dd-select-city').removeClass('active');
      angular.forEach(_dropdowns, function (el) {
        if (el !== ddEl) {
          el.removeClass('active');
        }
      });

      var dropText = ddEl.find('i');
      angular.forEach(dropText, function(i,v) {
          var dropTextCell = $(i).text();
          if(sessionStore === dropTextCell) {
            $(i).parents('a').addClass('cur');
          } else {
            $(i).parents('a').removeClass('cur');
          }

      })

      ddEl.find('a').bind('click', function(event) {
        event.stopPropagation();
        ddEl.removeClass('active');
      })

      ddEl.toggleClass('active');
    };

    return service;
  }
]);
