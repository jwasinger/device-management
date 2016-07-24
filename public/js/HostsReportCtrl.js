angular.module('app.hostsReportCtrl', ['hosts'])
.controller('HostsReportCtrl', ['$scope', 'hostsService', function($scope, hostsService) {
	$scope.promise = hostsService.GetGarbageData().then(function(data) {
		$scope.data = data;
	});
}]);
