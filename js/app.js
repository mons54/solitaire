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
			if (!$scope.dragEl) {
				return;
			}
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
			$scope.dragEl = el;

			if (!el.parent) {
				return
			}

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
		});

		$rootScope.$on('dragStop', function (event, el) {
			$scope.dragEl = null;
			if (!el.parent) {
				return
			}
			el.parent().find('.card').removeClass('hide');
		});

	}]);

	function shuffle(o) {
    	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    	return o;
	}

	function uid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	};

	var directives = angular.module('directives', []);

	directives.directive('draggable', function ($rootScope) {
		return {
			restrict: 'A',
			link: function (scope, el, attrs, controller) {

				angular.element(el).attr('id', uid);

				el.draggable({
					revert: true,
					revertDuration: 0,
        			start: function(event, ui) {
        				if (!el.attr('draggable')) {
        					return false;
        				}
        				$rootScope.$emit('dragStart', el);
        			},
        			stop: function(event, ui ) {
        				$rootScope.$emit('dragStop', el);
        			}
    			});
			}
		};
	});

	directives.directive('droppable', function ($rootScope) {
		return {
			restrict: 'A',
			scope: {
				onDrop: '&'
			},
			link: function (scope, el, attrs, controller) {

				angular.element(el).attr('id', uid);

				el.droppable({
					drop: function(event, ui) {
						scope.onDrop({
							dragEl: ui,
							dropEl: el
						});
						$rootScope.$emit('dragStop', ui);
					}
				});
			}
		};
	});

})();
