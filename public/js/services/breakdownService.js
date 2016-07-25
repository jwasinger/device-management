var amt = 10;

function retrieveRandElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function genGarbageData(amt) {
  var result = [];	
	for(var i = 0; i < values.length; i++) {
		result.push({
			key: retrieveRandElement(values),
			value: Math.random() * 10
		});
	}
}

angular.module('breakdown', [])
  .factory('breakdownService', ['$http', '$document', '$q', '$rootScope',
    function($http, $document, $q, $rootScope) {
			return {
				GetGarbageData: function() {
					return $q.when(genGarbageData())					
				}
			}
		}]);
