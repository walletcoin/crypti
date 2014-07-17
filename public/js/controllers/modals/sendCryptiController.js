webApp.controller('sendCryptiController', ["$scope", "sendCryptiModal", "$http", "userService", function ($scope, sendCryptiModal, $http, userService) {
    $scope.accountValid = true;
    $scope.fromServer = "";
    $scope.maxlength = 8;
    $scope.onlyNumbers = /^-?\d*(\.\d+)?$/;

    Number.prototype.roundTo = function( digitsCount ){
        var digitsCount = typeof digitsCount !== 'undefined' ? digitsCount : 2;
        var s = String(this);
        if (s.indexOf('e') < 0) {
            var e = s.indexOf('.');
            if (e == -1) return this;
            var c = s.length - e - 1;
            if (c < digitsCount) digitsCount = c;
            var e1 = e + 1 + digitsCount;
            var d = Number(s.substr(0, e) + s.substr(e + 1, digitsCount));
            if (s[e1] > 4) d += 1;
            d /= Math.pow(10, digitsCount);
            return d.valueOf();
        } else {
            return this.toFixed(digitsCount);
        }
    }

    Math.roundTo = function( number ,digitsCount){
        number = Number(number);
        return number.roundTo(digitsCount).valueOf();
    }

    $scope.close = function () {
        if ($scope.destroy) {
            $scope.destroy();
        }

        sendCryptiModal.deactivate();
    }

    $scope.moreThanEightDigits = function(number) {
        if (number.indexOf(".") < 0) {
            return false;
        }
        else{
            if(number.split('.')[1].length > 8){
                return true;
            }
            else{
                return false;
            }
        }
    }

    $scope.recalculateFee = function ($event) {
        if (!$scope.amount || isNaN(parseFloat($scope.amount))) {
            $scope.fee = "";
        } else {
            if ($scope.amount.indexOf('.') >= 0) {
                var strs = $scope.amount.split('.');
                $scope.maxlength = strs[0].length + 9;
                console.log($scope.maxlength);
            }
            // calculate fee.
            var fee = ($scope.amount / 100 * $scope.currentFee).roundTo(8);

            if ($scope.amount == 0) {
                fee = 0;
            } else if (parseFloat(fee) == 0) {
                fee = "0.00000001";

            }

            $scope.fee = fee;
        }

        /*
        if (!$scope.amount) {
            $scope.fee = "";
            return;
        }

        if($scope.moreThanEightDigits(parseFloat($scope.amount))){
            console.log('fee');
            $scope.amount = parseFloat($scope.amount).roundTo(8).toString();
            console.log($scope.amount);
        }
        if($scope.currentFee){
            var fee = $scope.amount * $scope.currentFee * 0.01;
        }


        $scope.fee = fee.roundTo(8);
        */
    }


    $scope.accountChanged = function (e) {
        var string = $scope.to;

        if (!string) {
            return;
        }

        if(string[string.length - 1] == "D" || string[string.length - 1] == "C"){
            var isnum = /^\d+$/.test(string.substring(0,string.length-1));
            if(isnum && string.length-1>=1 && string.length-1<=20){
                $scope.accountValid = true;
            }
            else{
                $scope.accountValid = false;
            }
        }
        else{
            $scope.accountValid = false;
        }
    }

    $scope.moreThanEightDigits = function (number) {
        if (number.toString().indexOf(".") < 0) {
            return false;
        }
        else{
            if(number.toString().split('.')[1].length>8){
                return true;
            }
            else{
                return false;
            }
        }
    }

    $scope.getCurrentFee = function () {
        $http.get("/api/getCurrentFee", { params : { accountId : userService.address }})
            .then(function (resp) {
                $scope.currentFee = resp.data.currentFee;
            });
    }

    $scope.sendCrypti = function () {
        $scope.amountError = parseFloat($scope.fee) + parseFloat($scope.amount) > $scope.totalBalance;

        if (!$scope.amountError) {
            $http.post("/api/sendMoney", {
                secretPharse: $scope.secretPhrase,
                amount: $scope.amount,
                recepient: $scope.to,
                accountAddress: userService.address,
                fee: $scope.fee
            }).then(function (resp) {
                if (resp.data.error == "Invalid passphrase, check your passphrase please" || resp.data.error == "Invalid merchant address, check it again please") {
                    $scope.fromServer = resp.data.error;
                }
                else {
                    if ($scope.destroy) {
                        $scope.destroy();
                    }

                    sendCryptiModal.deactivate();
                }
            });
        }
    }
    $scope.getCurrentFee();
}]);