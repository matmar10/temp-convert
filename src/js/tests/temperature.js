
test("$.sL.weather.Unit", function() {
    // unitIdentifier, decimalPrecision, roundUp
    var unit = new $.sL.weather.Unit('F', 2, true);
    equal(unit.unitIdentifier(), 'F', "Unit set correctly");
    equal(unit.decimalPrecision(), 2, "Decimal precision set correctly");
    equal(unit.roundUp(), true, "Rounding preference set correctly");
});

test("$.sL.weather.Measurement", function() {
    // unitIdentifier, decimalPrecision, roundUp
    var unit = new $.sL.weather.Unit('F', 2, true);
    var measurement = new $.sL.weather.Measurement(100, unit);
    equal(measurement.value(), 100, "Value set correctly");
    deepEqual(measurement.unit(), unit, "Unit set correctly");

    var measurement = new $.sL.weather.Measurement(100, unit);
    var expectedProduct = new $.sL.weather.Measurement(123, unit);
    deepEqual(measurement.multiply(1.23), expectedProduct, "Multiply works OK");

    var measurement = new $.sL.weather.Measurement(100, unit);
    var quotient = new $.sL.weather.Measurement(10, unit);
    deepEqual(measurement.divide(10), quotient, "Divide works OK");

    var measurement = new $.sL.weather.Measurement(100, unit);
    var sum = new $.sL.weather.Measurement(123, unit);
    deepEqual(measurement.add(23), sum, "Add works OK");

    var measurement = new $.sL.weather.Measurement(100, unit);
    var difference = new $.sL.weather.Measurement(77, unit);
    deepEqual(measurement.subtract(23), difference, "Subtract works OK");
});

test("$.sL.weather.UnitPair", function() {

    // unitIdentifier, decimalPrecision, roundUp
    var unit1 = new $.sL.weather.Unit('F', 5, true);
    var unit2 = new $.sL.weather.Unit('C', 5, true);

    var pair = new $.sL.weather.UnitPair(unit1, unit2, function() {});
    equal(pair.fromUnit(), unit1, "Set fromUnit OK");
    equal(pair.toUnit(), unit2, "Set toUnit OK");

    var conversion = new $.sL.weather.UnitPair(unit1, unit2, function(weatherMeasurement) {
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
    });

    var measurement = new $.sL.weather.Measurement(32, unit1);
    var result = conversion.convert(measurement);
    equal(result.value(), 0, "Convert 32F to C");

    var measurement2 = new $.sL.weather.Measurement(0, unit2);
    var result2 = conversion.convert(measurement2);
    equal(result2.value(), 32, "Convert 0C to 23F");

    var measurement3 = new $.sL.weather.Measurement(123, unit1);
    var result3 = conversion.convert(measurement3);
    equal(result3.value(), 50.55556, "Convert 123F to C");

    var measurement4 = new $.sL.weather.Measurement(273.15, unit2);
    var result4 = conversion.convert(measurement4);
    equal(result4.value(), 523.67, "Convert 273.15C to F");


});


test("$().temperatureConverter()", function() {

    var $input = $('#source_temperature_input'),
        $submit = $('#temperature_convert_form_submit_button'),
        $clear = $('#temperature_convert_form_clear_button'),
        $output = $('#temperature_convert_result .alert-success h3');

    $input.val('32 degrees F');
    $submit.click();
    equal($output.text(), "32F = 0C");

    $input.val('0 degrees C');
    $submit.click();
    equal($output.text(), "0C = 32F");

    $input.val('123 Fahrenheit');
    $submit.click();
    equal($output.text(), "123F = 50.55556C");


    $input.val('123 C');
    $submit.click();
    equal($output.text(), "123C = 253.4F");

    $input.val('100 degrees Celsius');
    $submit.click();
    equal($output.text(), "100C = 212F");

    $clear.click();
    equal($input.val(), '');

});