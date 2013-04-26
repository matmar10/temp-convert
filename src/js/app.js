(function($) {


    $.sL = $.sL || {}; // namespace
    $.sL.weather = $.sL.weather || {}; // namespace to add additional weather widgets

    $.sL.weather.Unit = function(unitIdentifier, decimalPrecision, roundUp) {

        var context = this,
            _unit = unitIdentifier, // compared when converting
            _decimalPrecision = decimalPrecision || 2, // default to two decimal places
            _roundUp = roundUp || true; // default to true

        this.unitIdentifier = function(unit) {
            if('undefined' === $.type(unit)) {
                return _unit;
            }
            _unit = unit;
            return context; // for chaining
        };

        this.decimalPrecision = function(decimalPrecision) {
            if('undefined' === $.type(decimalPrecision)) {
                return _decimalPrecision;
            }
            _decimalPrecision = decimalPrecision;
            return context; // for chaining
        };

        this.roundUp = function(roundUp) {
            if('undefined' === $.type(roundUp)) {
                return _roundUp;
            }
            _roundUp = roundUp;
            return context; // for chaining
        };

        this.equals = function(unit) {
            return _unit === unit.unitIdentifier();
        };
    };

    $.sL.weather.Measurement = function(value, unit) {
        var context = this,
            _value = null,
            _unit = unit,
            _scale = Math.pow(10, _unit.decimalPrecision());

        function _round(value) {
            return (_unit.roundUp()) ? Math.round(value) : Math.floor(value);
        }

        function _clone(value) {
            return new $.sL.weather.Measurement(
                value,
                _unit
            );
        }

        this.value = function(value) {
            if('undefined' === $.type(value)) {
                return _value / _scale;
            }
            _value = _round(value * _scale);
            return context; // for chaining
        };

        this.unit = function(unit) {
            if('undefined' === $.type(unit)) {
                return _unit;
            }
            _unit = unit;
            return context; // for chaining
        };

        this.multiply = function(multiplier) {
            var scaledResult = _round(_value * multiplier),
                result = scaledResult / _scale;
            return _clone(result);
        };

        this.divide = function(divisor) {
            var scaledResult = _round(_value / divisor),
                result = scaledResult / _scale;
            return _clone(result);
        };

        this.add = function(addend) {
            var result = context.value() + addend;
            return _clone(result);
        };

        this.subtract = function(subtrahend) {
            var result = context.value() - subtrahend;
            return _clone(result);
        };

        // set the value based on scaling
        this.value(value);
    };

    $.sL.weather.UnitPair = function(fromUnit, toUnit, conversionCallback) {

        var context = this,
            _fromUnit = fromUnit,
            _toUnit = toUnit;

        this.fromUnit = function(fromUnit) {
            if('undefined' === $.type(fromUnit)) {
                return _fromUnit;
            }
            _fromUnit = fromUnit;
            return context; // for chaining
        };

        this.toUnit = function(toUnit) {
            if('undefined' === $.type(toUnit)) {
                return _toUnit;
            }
            _toUnit = toUnit;
            return context; // for chaining
        };

        this.conversionCallback = conversionCallback || function() {
            throw "No conversionCallback specified for UnitPair";
        };

        this.convert = function(weatherMeasurement) {
            return context.conversionCallback.call(context, weatherMeasurement);
        };
    };

    $.sL.weather.MeasurementParser = function(unitKeywords) {

        var context = this,
            _unitKeywords = unitKeywords || {};

        this.unitKeywords = function(argument1, argument2) {

            if('undefined' === $.type(argument1)) {
                return _unitKeywords;
            }

            if('object' === $.type(argument1)) {
                _unitKeywords = $.extend(true, _unitKeywords, argument1);
                return context; // allow chaining
            }

            if('undefined' !== $.type(argument1) && 'undefined' !== $.type(argument2)) {
                _unitKeywords[argument1] = argument2;
            }

            throw "Invalid arguments: expected argument1 as object or argument1 as key and argument2 as value.";
        };

        this.parse = function(input) {
            throw "You must implement method 'parse' in your implementation of WeatherMeasurementParser.";
        };

    };


    // sub-namespace for temperature
    $.sL.weather.temp = {};

    $.sL.weather.temp.defaults = {
        elements: {
            input: "#source_temperature_input",
            clearButton: "#temperature_convert_form_clear_button",
            submitButton: "#temperature_convert_form_submit_button",
            outputContainer: "#temperature_convert_result .alert-success",
            outputText: "#temperature_convert_result .alert-success h3 .output",
            errorContainer: "#temperature_convert_result .alert-error",
            errorText: "#temperature_convert_result .alert-error strong"
        },
        messages: {
            blankInput: "Error: please enter a source temperature."
        },
        // outputFormat: "%(fromValue)s&deg;%(fromUnit)s = %(toValue)s&deg;%(toUnit)s",
        outputFormat: "%(fromValue)s%(fromUnit)s = %(toValue)s%(toUnit)s", // use simpler format to get unit test working easily
        // order is deterministic
        unitKeywords: {
            "Celsius": "C",
            "C": "C",
            "degrees": "&deg;",
            "deg": "&deg;",
            "&deg;": "",
            "Fahrenheit": "F",
            "F": "F"
        },
        roundUp: true,
        decimalPrecision: 5
    };

    $.fn.temperatureConverter = function(options) {

            // build local instance options
        var o = $.extend(true, {}, $.sL.weather.temp.defaults, options),

            // element cache; avoid re-selecting commonly used elements
            $elementCache = {},

            // unitIdentifier, decimalPrecision, roundUp
            fahrenheit = new $.sL.weather.Unit('F', o.decimalPrecision, o.roundUp),
            celsius = new $.sL.weather.Unit('C', o.decimalPrecision, o.roundUp),
            conversion = new $.sL.weather.UnitPair(fahrenheit, celsius, function(weatherMeasurement) {
                if(weatherMeasurement.unit().equals(this.fromUnit())) {
                    var a = weatherMeasurement.subtract(32),
                        b = a.divide(1.8);
                    return new $.sL.weather.Measurement(b.value(), this.toUnit());
                }

                if(weatherMeasurement.unit().equals(this.toUnit())) {
                    var a = weatherMeasurement.multiply(1.8),
                        b = a.add(32);
                    return new $.sL.weather.Measurement(b.value(), this.fromUnit());
                }
                throw "Unit type mismatch.";
            }),
            weatherParser = new $.sL.weather.MeasurementParser(o.unitKeywords);

            weatherParser.parse = function(input) {
                var matchedUnits = [],
                    strippedValue = input.replace(/\s+/g, ''), // remove whitespace
                    unit = null,
                    theMeasurement = null;

                $.each(o.unitKeywords, function(unitKeyword, unit) {
                    var pattern = new RegExp(unitKeyword, 'i');
                    strippedValue = strippedValue.replace(unitKeyword, '');
                    if(input.match(pattern)) {
                        matchedUnits.push(unit);
                    }
                });

                if(-1 !== $.inArray("C", matchedUnits)) {
                    unit = new $.sL.weather.Unit("C", o.decimalPrecision, o.roundUp);
                } else {
                    if(-1 !== $.inArray("F", matchedUnits)) {
                        unit = new $.sL.weather.Unit("F", o.decimalPrecision, o.roundUp);
                    } else {
                        throw "ParseError: could not determine unit from input '" + input + "' (expected Fahrenheit or Celsius).";
                    }
                }

                // could not parse
                if(isNaN(strippedValue)) {
                    throw "ParseError: could not extract a numeric value from input '" + input + "'.";
                }

                return new $.sL.weather.Measurement(strippedValue, unit);
            };

        // build element cache
        $.each(o.elements, function(cachedElementName, elementSelector) {
            $elementCache[cachedElementName] = $(elementSelector);
        });

        $elementCache.clearButton.bind('click', function(eventObject) {
            eventObject.preventDefault();
            $elementCache.input.val('');

            $elementCache.errorText.html('');
            $elementCache.errorContainer.hide();

            $elementCache.outputText.html('');
            $elementCache.outputContainer.hide();
        });

        $elementCache.submitButton.bind('click', function(eventObject) {
            eventObject.preventDefault();

            $elementCache.errorContainer.hide();
            $elementCache.outputContainer.hide();

            var value = $elementCache.input.val(),
                sourceTemperature = null,
                resultTemperature = null,
                outputParts = null,
                formattedOutput = null;

            if('' === value) {
                $elementCache.errorText.text(o.messages.blankInput);
                $elementCache.errorContainer.show();
                return;
            }

            try {
                sourceTemperature = weatherParser.parse(value);
            } catch(error) {
                $elementCache.errorText.text(error);
                $elementCache.errorContainer.show();
                return;
            }

            resultTemperature = conversion.convert(sourceTemperature);

            outputParts = {
                fromValue: sourceTemperature.value(),
                fromUnit: sourceTemperature.unit().unitIdentifier(),
                toValue: resultTemperature.value(),
                toUnit: resultTemperature.unit().unitIdentifier()
            };

            formattedOutput = sprintf(o.outputFormat, outputParts);
            $elementCache.outputText.html(formattedOutput);
            $elementCache.outputContainer.show();
        });

        return this.each(function() {

        });
    };

})(jQuery);