angular.module('app.breakdownCtrl', ['hosts', 'breakdown'])
.controller('BreakdownCtrl', ['$scope', 'breakdownService', function($scope, breakdownService) {
  $scope.selected = [];

  $scope.query = {
    order: 'hostname',
    limit: 5,
    page: 1
  };
	$scope.getGarbageData = function() {
		$scope.promise = breakdownService.GetGarbageData($scope.query).then(function(data) {
			$scope.data = data
		})
	}

	$scope.getGarbageData($scope.query);
}]);
