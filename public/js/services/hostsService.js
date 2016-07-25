angular.module('hosts', [])
  .factory('hostsService', ['$http', '$document', '$q', '$rootScope',
    function($http, $document, $q, $rootScope) {
			var hostnames = [
				"cbe102",
				"cbe103",
				"starDB419",
				"website_prod",
				"datacrunch1",
				"datacrunch2",
				"datacrunch3",
				"datacrunch4",
			];

			var ips = [
				"192.168.0.1",
				"255.102.230.1",
				"10.10.0.1",
				"241.111.1.0"
			];

			var services = [
				"UserDB",
				"WebServer",
				"DNS",
				"DataCrunch"
			];

			var statuses = [
				"Up",
				"Down",
				"Paused"
			];
			
			function retrieveRandElement(array) {
				return array[Math.floor(Math.random() * array.length)];
			}

			function genRandData() {
				return {
					hostname: retrieveRandElement(hostnames),
					ip: 			retrieveRandElement(ips),
					service: 	retrieveRandElement(services),
					status: 	retrieveRandElement(statuses),
					timestamp:'',
				}
			}

			function genGarbageData(query, amt) {
				var result = []
				for (var i = 0; i < amt; i++) {
					result.push(genRandData());
				}

				var beginning = (query.page - 1) * query.limit;
				var end = beginning + query.limit;
				return result.slice(beginning, end);
				/*
				return [
					{hostname:"foo", ip:"192.168.111.181", service:"Health Check", status:"Up", timestamp:"now"},
					{hostname:"foo", ip:"192.168.111.181", service:"Health Check", status:"Up", timestamp:"now"},
					{hostname:"foo", ip:"192.168.111.181", service:"Health Check", status:"Up", timestamp:"now"},
					{hostname:"foo", ip:"192.168.111.181", service:"Health Check", status:"Up", timestamp:"now"},
					{hostname:"foo", ip:"192.168.111.181", service:"Health Check", status:"Up", timestamp:"now"},
					{hostname:"foo", ip:"192.168.111.181", service:"Health Check", status:"Up", timestamp:"now"}];
				*/
			}

			return {
				GetGarbageData: function(query) {
					return $q.when(genGarbageData(query, 100));
				},
				GetData: function() {
					return
				}
			};

			/*
      var d = $q.defer();
      function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function() { d.resolve(window.d3); });
      }
      // Create a script tag with d3 as the source
      // and call our onScriptLoad callback when it
      // has been loaded
      var scriptTag = $document[0].createElement('script');
      scriptTag.type = 'text/javascript'; 
      scriptTag.async = true;
      scriptTag.src = 'http://d3js.org/d3.v3.min.js';
      scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') onScriptLoad();
      }
      scriptTag.onload = onScriptLoad;
 
      var s = $document[0].getElementsByTagName('body')[0];
      s.appendChild(scriptTag);
 
      return {
        d3: function() { return d.promise; }
      };
			*/
}]);
