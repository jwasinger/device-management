angular.module('breakdown', ['hosts'])
  .factory('breakdownService', ['$http', '$document', '$q', '$rootScope', 'hostsService',
    function($http, $document, $q, $rootScope, hostsService) {
			function breakdown(hosts) {
				var breakdown = {}
				
				for(var i = 0; i < hosts.length; i++) {
					var keys = Object.keys(hosts[i])
					for(var j = 0; j < keys.length; j++) {
						var key_exists = breakdown[keys[j]]
						if (!key_exists) {
							breakdown[keys[j]] = {}
						}
						
						var occurance = breakdown[keys[j]][hosts[i][keys[j]]]
						if (!occurance) {
							breakdown[keys[j]][hosts[i][keys[j]]] = 1
						} else {
							breakdown[keys[j]][hosts[i][keys[j]]]++
						}
					}
				}
				return breakdown
			}

			var colors = [
				"#B6A430",
				"#FDEE8F",
				"#D5C355",
				"#938215",
				"#685A00",
				"#452A7D",
				"#8069AD",
				"#5D4391",
				"#301765",
				"#1C0747",
				"#217E54",
				"#63AF8C",
				"#3B936B",
				"#0E663E",
				"#004827"
			]

			function field_breakdown(field, hosts) {
				return Object.keys(hosts[field]).map(function(val, index, array) {
					//TODO Make sure all colors are unique
					return {
						key: val,
						value: hosts[field][val],
						color: colors[parseInt(Math.random() * colors.length)] 
					}
				})
			}

			return {
				GetGarbageData: function(query) {
					return $q(function(resolve, reject) {
						hostsService.GetGarbageData(query).then(function(data) {
							var data = field_breakdown("service", breakdown(data))
							resolve(data)
						})
					});
				}
			}
		}]);
