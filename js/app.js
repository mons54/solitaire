(function () {

	'use strict';

	var app = angular.module('app', [
		'ngRoute',
	    'controllers',
	    'directives',
	]);

	app.config(function ($routeProvider) {
	    $routeProvider.
	    when('/', {
	        templateUrl: 'partials/main.html',
	        controller: 'mainCtrl'
	    }).
	    otherwise({
	        redirectTo: '/'
	    });
	});

	var controllers = angular.module('controllers', []);

	controllers.controller('mainCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {
		$scope.cards = {
			value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
			color: [1, 2, 3, 4]
		};

		$scope.game = [];

		angular.forEach($scope.cards.color, function(color) {
			angular.forEach($scope.cards.value, function(value) {
				$scope.game.push({
					color: color,
					value: value
				});
			});
		});

		shuffle($scope.game);

		$scope.piles = {};

		for (var i = 1; i <= 7; i++) {
			var cards = $scope.game.splice(0, i);
			cards[cards.length - 1].display = true;
			$scope.piles[i] = cards;
		}

		$scope.isLastCard = function (cards, key) {
			return (cards.length - 1) == key;
		};

		$scope.pick = [];

		$scope.savedCards = {
			1: [],
			2: [],
			3: [],
			4: []
		};

		$scope.addPickCard = function () {
			if ($scope.game.length == 0) {
				$scope.game = $scope.pick;
			} else {
				var card = $scope.game.splice(0, 1);
				$scope.pick.push(card[0]);
			}
		};

		$scope.dropSavedCard = function (savedCard) {
			var data = $scope.dragEl.data(),
				card = getDragCard(data),
				lastCard = $scope.getLastElm(savedCard),
				checkCardValue = lastCard ? lastCard.value + 1 : 1,
				checkCardColor = lastCard ? lastCard.color : card.color;

			if (checkCardValue == card.value && checkCardColor == card.color) {
				dragCard(savedCard, data);
				$scope.$apply();
			}
		};

		$scope.dropPile = function (pile) {
			var data = $scope.dragEl.data(),
				card = getDragCard(data),
				lastCard = $scope.getLastElm(pile);

			if (!lastCard || (lastCard.color % 2 != card.color % 2 && lastCard.value - 1 == card.value)) {
				dragCard(pile, data);
			}
		};

		$scope.getLastElm = function (array) {
			return array[array.length - 1] ? array[array.length - 1] : null;
		};

		function getDragCard(data) {
			return data.pick ? $scope.pick[$scope.pick.length - 1] : $scope.piles[data.pileIndex][data.cardIndex];
		}

		function dragCard (array, data) {
			var cards = data.pick ? $scope.pick.splice($scope.pick.length - 1, 1) : $scope.piles[data.pileIndex].splice(data.cardIndex, $scope.piles[data.pileIndex].length - data.cardIndex + 1);
			angular.forEach(cards, function (card) {
				card.display = true;
				array.push(card);
			});
			if (data.pileIndex) {
				var pile = $scope.piles[data.pileIndex];
				if ($scope.getLastElm(pile)) {
					pile[pile.length - 1].display = true;
				}
			}
			$scope.$apply();
		}

		$rootScope.$on('dragStart', function (event, el) {
			var cards = el.parent().find('.card'),
				hide = false;
			angular.forEach(cards, function (card) {
				if (hide) {
					$(card).addClass('hide');
				}
				if ($(card).attr('id') == el.attr('id')) {
					hide = true;
				}
			});
			el.addClass('drag');
			$scope.dragEl = el;
		});

		$rootScope.$on('dragEnd', function (event, el) {
			$scope.dragEl = null;
			el.parent().find('.card').removeClass('hide');
			el.removeClass('drag');
		});

	}]);

	function shuffle(o) {
    	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    	return o;
	}

	var module;

	try {
	    module = angular.module('lvl.services');
	} catch (e) {
	    module  = angular.module('lvl.services', []);
	}

	module.factory('uuid', function () {
	    var svc = {
	        _new: function() {
	            function _p8(s) {
	                var p = (Math.random().toString(16)+"000000000").substr(2,8);
	                return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
	            }
	            return _p8() + _p8(true) + _p8(true) + _p8();
	        },

	        empty: function() {
	          return '00000000-0000-0000-0000-000000000000';
	        }
	    };

	    return svc;
	});

	var directives = angular.module('directives', ['lvl.services']);

	directives.directive('lvlDraggable', function ($rootScope, uuid) {
		return {
			restrict: 'AE',
			link: function (scope, el, attrs, controller) {

				if (!attrs.lvlDraggable) {
					return;
				}

				angular.element(el).attr('draggable', 'true');

				var id = angular.element(el).attr('id');

				if (!id) {
					id = uuid._new();
					angular.element(el).attr('id', id);
				}

				el.bind('dragstart', function (e) {
					e.originalEvent.dataTransfer.setData('id', id);
					$rootScope.$emit('LVL-DRAG-START');
					$rootScope.$emit('dragStart', el);
				});

				el.bind('dragend', function (e) {
					$rootScope.$emit('LVL-DRAG-END');
					$rootScope.$emit('dragEnd', el);
				});
			}
		};
	});

	directives.directive('lvlDropTarget', function ($rootScope, uuid) {
		return {
			restrict: 'AE',
			scope: {
				onDrop: '&'
			},
			link: function (scope, el, attrs, controller) {
				var id = angular.element(el).attr('id');

				if (!id) {
					id = uuid._new();
					angular.element(el).attr('id', id);
				}

				el.bind('dragover', function (e) {

					if (e.preventDefault) {
						e.preventDefault();
					}

					e.originalEvent.dataTransfer.dropEffect = 'move';

					return false;
				});

				el.bind('dragenter', function(e) {
					angular.element(e.target).addClass('lvl-over');
				});

				el.bind('dragleave', function (e) {
					angular.element(e.target).removeClass('lvl-over');
				});

				el.bind('drop', function (e) {
					if (e.preventDefault) {
						e.preventDefault();
					}

					if (e.stopPropogation) {
						e.stopPropogation();
					}

					var data = e.originalEvent.dataTransfer.getData('id'),
						dest = document.getElementById(id),
						src = document.getElementById(data);

					scope.onDrop({
						dragEl: src,
						dropEl: dest
					});
				});

				$rootScope.$on('LVL-DRAG-START', function () {
					var el = document.getElementById(id);
					angular.element(el).addClass('lvl-target');
				});

				$rootScope.$on('LVL-DRAG-END', function () {
					var el = document.getElementById(id);
					angular.element(el).removeClass('lvl-target');
					angular.element(el).removeClass('lvl-over');
				});
			}
		};
	});

})();
