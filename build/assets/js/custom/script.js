"use strict";
/* Adding prototypes on Array object - START */

/* Adding min, avg & max as prototype of Array so that it will be directly accessable on marks array. */
Array.prototype.min = function () {
    return (!isFinite(Math.min.apply(Math, this)) ? 0 : Math.min.apply(Math, this));
};

Array.prototype.avg = function () {
    var sum = this.reduce(function (a, b) {
        return a + b;
    }, 0);
    return sum === 0 ? 0 : parseFloat(sum / this.length).toFixed(2);
};

Array.prototype.max = function () {
    return (!isFinite(Math.max.apply(Math, this)) ? 0 : Math.max.apply(Math, this));
};

/* Adding prototypes on Array object - END */

/* Angular App initialization */
var appRC = angular.module("appReportCard", []);

/* Factory to create Result object by using it's constructor function. */
appRC.factory("factResult", function () {

    function Result() {};

    Result.prototype.toggle = function () {
        this.isSelected = !this.isSelected;
        this.isPassed = this.marks < 65 ? false : true;
    };

    return function (defaults) {
        var result = new Result();
        result.id = defaults.id;
        result.name = defaults.name || 'N/A';
        result.marks = parseInt(defaults.marks, 10) || 0;
        result.isPassed = defaults.marks < 65 ? false : true;
        return result;
    };
})

/* Factory used to persist the data at localstorage and serve it back. */
appRC.factory("factResultStorage", ["$http", "factResult", function ($http, factResult) {

    var storage = window.localStorage;
    var maxResultId = 0;

    if (!storage.length) {
        var staticData = getStaticData();
        if (staticData.length) {
            staticData.map(function (item) {
                storage.setItem(item.id, JSON.stringify(item));
            });
        }
    } else {
        // Do nothing.
    }

    function getAllResult() {
        var result = [];
        for (var i = 0; i < storage.length; i++) {
            var key = storage.key(i);
            var resultId = parseInt(key, 10);
            if (resultId > maxResultId)
                maxResultId = resultId;
            var value = storage.getItem(key);
            var resultObjData = angular.fromJson(value);
            result.push(factResult(resultObjData));
        }
        return result;
    };

    function saveResult(result) {
        if (!result.id)
            result.id = ++maxResultId;
        storage.setItem(result.id, angular.toJson(result));
    };

    function editResult(result) {
        storage.setItem(result.id, angular.toJson(result));
    };

    return {
        getAll: getAllResult,
        save: saveResult,
        edit: editResult
    };

}]);

/* Factory used to persist the data at localstorage and serve it back. */
appRC.factory("factCalculate", ["factResultStorage", function (factResultStorage) {

    return function (results) {
        var marks = [];

        results.map(function (result) {
            marks.push(result.marks);
        });

        return {
            min: marks.min(),
            avg: marks.avg(),
            max: marks.max()
        };
    };
}])

/* Controller should be used only for
    1. Set up the initial state of the $scope object.
    2. Add behavior to the $scope object.
*/
appRC.controller("ctrlReportCard", ["$scope", "factResult", "factResultStorage", "factCalculate", function ($scope, factResult, factResultStorage, factCalculate) {

    /*************** Set up the initial state of the $scope object. - START ****************/

    
    $scope.results = factResultStorage.getAll();
    $scope.messageClass = 'visuallyhidden';
    setMarksSummary();

    $scope.templateUrl = "'templates/display-record.html'";
    $scope.getTemplate = function (result) {
        if (result.isSelected)
            return "./templates/edit-record.html";
        else
            return "./templates/display-record.html";
    };

    /*************** Set up the initial state of the $scope object. - END ****************/


    /*************** Add behavior to the $scope object. - START ****************/

    $scope.addNewResult = function (newName, newMarks) {
        if (newName && newMarks) {
            var newResult = factResult({
                name: newName,
                marks: parseInt(newMarks, 10)
            });
            factResultStorage.save(newResult);
            $scope.results.push(newResult);
            setMessage("col-md-12 col-sm-12 col-xs-12 alert alert-success", "Record have been saved successfully.");
            clear();
            setMarksSummary();
        } else {
            setMessage("col-md-12 col-sm-12 col-xs-12 alert alert-danger", "Please enter name and marks.");
        }
    };

    $scope.editResult = function (result) {
        result.toggle();
    };

    $scope.saveEditedResult = function (result) {
        result.toggle();
        factResultStorage.edit(result);
        setMarksSummary();
    };

    function clear() {
        $scope.name = '';
        $scope.marks = '';
    };

    function setMessage(className, message) {
        $('#message').fadeIn();
        $scope.messageClass = className;
        $scope.message = message;
        setTimeout(function () {
            $('#message').fadeOut();
        }, 2000);
    };

    function setMarksSummary() {
        var marks = factCalculate($scope.results);
        if (marks) {
            $scope.minimum = marks.min;
            $scope.average = marks.avg;
            $scope.maximum = marks.max;
        } else {
            // Log error.
        }
    };

    /*************** Add behavior to the $scope object. - START ****************/
}]);

/* Static data */
function getStaticData() {
    return [
        {
            id: 1,
            name: "John Will",
            marks: 70
        }, 
        {
            id: 2,
            name: "Anand Dev",
            marks: 60
        }, 
        {
            id: 3,
            name: "William Tan",
            marks: 80
        }
    ]
};