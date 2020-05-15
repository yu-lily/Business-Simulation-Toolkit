// ==UserScript==
// @name         Transport Manager
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Resassigns transports if current queue is inefficient
// @author       Lily Yu
// @match        https://usa.tycoononline.com/frame_index.php?page=transportFordon*
// @match        https://usa.tycoononline.com/frame_index.php?page=fordon*
// @match        https://usa.tycoononline.com/frame_index.php?page=transportStad*
// @match        https://usa.tycoononline.com/frame_index.php?page=transport_tool
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
	
    const validCities = [ //Configurable by user
        "Cleveland",
        "Virginia Beach",
        "Orlando",
        //"Las Vegas",
        //"Omaha",
        "Ft Worth"
    ];
	
	let minTruckQueue = 90;
    let minTrailerQueue = 90;
    let minTrainQueue = 150;
    let minAirplaneQueue = 30;

    let transportMain = 'https://usa.tycoononline.com/frame_index.php?page=transportFordon';
    let individualTransport = 'https://usa.tycoononline.com/frame_index.php?page=fordon&fordonId=';
    let cityChange = 'https://usa.tycoononline.com/frame_index.php?page=transportStad';
    let minWait = 1000;
    let maxWait = 2000;
    let minBigWait = 300000;
    let maxBigWait = 600000;

    if (window.location.href == transportMain) {
        let transportList = Array.from(document.getElementsByClassName("tr_table1")).concat(Array.from(document.getElementsByClassName("tr_table2")));
        for (let transport of transportList) {
            let transportInfo = transport.textContent;
            let queueInfo = transportInfo.match(/Queued: (\d{1,3})/);
            if (queueInfo) { //Narrow down to vehicles in queue
                let queuePos = Number(queueInfo[1]);
                if (transportInfo.includes("Truck") && queuePos > minTruckQueue) {
                    setTimeout(function(){
                        transport.click()
                    }, Math.random() * (maxWait-minWait) + minWait);
                }
                if (transportInfo.includes("Trailer") && queuePos > minTrailerQueue) {
                    setTimeout(function(){
                        transport.click()
                    }, Math.random() * (maxWait-minWait) + minWait);
                }
                if (transportInfo.includes("Train") && queuePos > minTrainQueue) { //Only trains
                    setTimeout(function(){
                        transport.click()
                    }, Math.random() * (maxWait-minWait) + minWait);
                }
                if (transportInfo.includes("Airplane") && queuePos > minAirplaneQueue) {
                    setTimeout(function(){
                        transport.click()
                    }, Math.random() * (maxWait-minWait) + minWait);
                }
            }
        }
    } else if (window.location.href.includes(individualTransport)) {
        if (document.getElementById('changeCity').textContent.includes('->')) {
            setTimeout(function(){
                window.location.href = transportMain;
            }, Math.random() * (maxWait-minWait) + minWait);
            } else {
            setTimeout(function(){
            document.getElementById('changeCity').children[0].click();
        }, Math.random() * (maxWait-minWait) + minWait);
    }
    } else if (window.location.href.includes(cityChange)) {
        let citiesDropdown = document.getElementById('formitem');
        let bestCityValue;
        let cityFound = false;
        let lowestValidDistance = 9999;
        for (let city of citiesDropdown.children) {
            let fullCityInfo = city.textContent.split(' (');
            let cityName = fullCityInfo[0];
            let rawDistance = fullCityInfo[1];
            let distance;
            if (rawDistance) {
                distance = Number(fullCityInfo[1].match(/\d+/)[0]);
            } else {
                distance = 99999;
            }
            if (validCities.indexOf(cityName) >= 0 && distance < lowestValidDistance) {
                bestCityValue = city.index;
                lowestValidDistance = distance;
                cityFound = true;
            }
        }
        if (cityFound) {
            if (citiesDropdown.selectedIndex === bestCityValue) {
                setTimeout(function(){
                document.getElementsByClassName('submitknapp')[0].click();
                }, Math.random() * (maxWait-minWait) + minWait);
            } else {
                setTimeout(function(){
                document.getElementById('formitem').selectedIndex = bestCityValue;
                document.getElementById('formitem').form.submit();
                }, Math.random() * (maxWait-minWait) + minWait);
            }
        }
    }
    // First parse map, save cookies
    // Then loop through transports, select any with Queue: 50


    // Attempt to reassign if noqueue city within 1000m, if not save cookie to skip

    setTimeout(function(){
        window.location.href = transportMain;
    }, Math.random() * (maxBigWait-minBigWait) + minBigWait);
})();