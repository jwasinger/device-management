angular.module('app.hostsReportCtrl', ['hosts'])
.controller('HostsReportCtrl', ['$scope', 'hostsService', function($scope, hostsService) {
  $scope.selected = [];

  $scope.query = {
    order: 'hostname',
    limit: 5,
    page: 1
  };

	$scope.getGarbageData = function() {
		$scope.promise = hostsService.GetGarbageData($scope.query).then(function(data) {
			$scope.data = data;
		});
	}
}]);
