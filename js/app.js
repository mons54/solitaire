(function () {
	
	'use strict';

	var app = angular.module('app', [
		'ngRoute',
	    'controllers',
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

	controllers.controller('mainCtrl', ['$scope', function ($scope) {
		$scope.cards = {
			value: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
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
			$scope.piles[i] = $scope.game.splice(0, i);
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
				$scope.pickCard = null;
				$scope.game = $scope.pick;
			} else {
				var card = $scope.game.splice(0, 1);
				$scope.pickCard = card[0];
				$scope.pick.push($scope.pickCard);
			}
		};
		
	}]);

	function shuffle(o) {
    	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    	return o;
	}
})();