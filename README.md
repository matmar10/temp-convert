
Sample Chat Window
=====================

Overview
--------
Parses a temperature input string and displays the conversion result

Features
--------
* All options are customizable in the initialization
* Allows for custom output format
* Uses specified decimal precision and integer math to avoid floating point funkiness
* Demonstrates sample unit tests

Installation
------------
1. Open index.html in your target browser
2. There is no step 2

Testing Notes
-------------
This demo has been tested on the following browsers using OSX version 10.6.8:
* Chrome 26.0.1410.65
* Firefox 20.0
* Safari 5.1.9

Basic unit test coverage has been added as a demonstration.

Coverage is in no way reflective of an appropriate level of test coverage for a
production oriented product.

General Notes
-------------
The design takes into consideration the problem statement of
> creating a class or set of methods/functions that provides a way to make future improvements
as the generic classes could be used for other weather measurement conversions.

Parsing has been greatly simplified and whichever unit is matched first "wins".

A better parsing implementation would take locale into account using a locale library.


Problem Statement
-----------------

From Kevin Rogers:

> A simple .html file with the code is all that is required.  He can either pass it through you or email me directly.
> 
> Programming Problem: 
> Create a simple GUI that will allow a person to convert a temperature in Celsius to Fahrenheit and back. 
>  
> Assume that the conversion is:  Celsius = (Fahrenheit – 32) / 1.8. 
>  
> The goal of this exercise is for the result to give us some confidence in your coding style and abilities.  To that end, creating a class or set of methods/functions that provides a way to make future improvements might be a good idea.  For example, supporting a general Temperature class that can handle the conversion now, and later other temperature stuff for the larger weather site.  Also there might be some helpers that allow for input and output that is not just a plain decimal number, e.g. 34F might be the input or the desired output, which is different from what would be used in the actual calculation.  Do not spend more than 1 hour or so on it, but if you can make sure it works, that is a plus.
> 

