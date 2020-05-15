// ==UserScript==
// @name         Market Watcher
// @version      1.0
// @description  Watches the market, and automatically buys if desired goods are available
// @author       Lily Yu
// @match        https://usa.tycoononline.com/frame_index.php?page=ordersList*
// @match        https://usa.tycoononline.com/frame_index.php?page=marketSales*
// ==/UserScript==

(function() {
    'use strict';

    let warehouseCapacity = 19400; //User's warehouse capacity
    let minWait = 500
    let maxWait = 1000

    let goodsTable = { //User's desired goods and desired quantities
        'Flour': 4000,
        'Stone': 5000,
        'Wheat': 5000,
        'Wood': 800
    }

    let inputGoods = [
        'Flour',
        'Wheat',
        'Fresh fish',
        'Oil',
        'Stone',
        'Thread'
        ]
    let outputGoods = [
        'Bread',
        'Alcohol',
        'Frozen fish',
        'Plastic',
        'Gasoline',
        'Marble',
        'Clothes'
        ]

    let marketLink = 'https://usa.tycoononline.com/frame_index.php?page=marketSales'
    let successPage = 'https://usa.tycoononline.com/frame_index.php?page=ordersList'
    let goodsToID = {
        'Alcohol': 15,
        'Bread': 9,
        'Clothes': 22,
        'Cotton': 20,
        'Flour': 8,
        'Fresh fish': 2,
        'Frozen fish': 3,
        'Furniture': 6,
        'Gasoline': 18,
        'Marble': 13,
        'Newspapers': 14,
        'Oil': 16,
        'Paper': 11,
        'Pigs': 12,
        'Planks': 4,
        'Plastic': 17,
        'Sausages': 10,
        'Stone': 5,
        'Thread': 21,
        'Toys': 19,
        'Wheat': 7,
        'Wood': 1,
    }
    let IDToGoods = {};
    for (let key in goodsToID){
        IDToGoods[goodsToID[key]] = key;
    }
    let NUM_GOODS = 22
    function tagToNumber(tag){
        let element = document.getElementById(tag)
        if (element){
            return Number(element.textContent.replace(/,/g, ""))
        } else {
            return 0
        }
    }
    function checkGoodsBuy(id) {
        let goodsTag = 'goods' + id;
        let goods = tagToNumber(goodsTag);

        let wareTag = 'warehouse' + id;
        let ordersTag = 'orders' + id;
        let ware = tagToNumber(wareTag);
        let orders = tagToNumber(ordersTag);
        let owned = ware + orders;
        let cap = goodsTable[IDToGoods[id]];
        return (goods > 0 && owned < cap)
    }
    function checkGoodsCount(id) {
        let wareTag = 'warehouse' + id;
        let ordersTag = 'orders' + id;
        let ware = tagToNumber(wareTag);
        let orders = tagToNumber(ordersTag);
        let owned = ware + orders;
        let cap = goodsTable[IDToGoods[id]];
        let diff = (cap - owned) + 100
        if (diff > 0) {
            return Math.max(diff,0)
        }
    }
    function countWarehouse() {
        let total = 0
        let inputTotal = 0
        let outputTotal = 0
        for (let i = 1; i <= NUM_GOODS; i++){
            let id1 = 'warehouse' + i;
            let id2 = 'orders' + i;
            let warehouseNum = tagToNumber(id1);
            let ordersNum = tagToNumber(id2);
            total += warehouseNum;
            total += ordersNum;
            if (inputGoods.includes(IDToGoods[i])) {
            inputTotal += warehouseNum;
            inputTotal += ordersNum;
            }
            if (outputGoods.includes(IDToGoods[i])) {
            outputTotal += warehouseNum;
            outputTotal += ordersNum;
            }
        }
        let output_list = [inputTotal, outputTotal, total];
        console.log()
        return output_list;
    }
    function buy(ID, quantity) {
        let orderLink1 = '&orderstep=1&materialId=' + ID;
        let orderLink2 = '&materialId=' + ID + '&orderstep=2&page=marketSales&antal=' + quantity;
        let orderLink3 = '&materialId=' + ID + '&antal=' + quantity + '&page=marketSales&orderstep=3';
        if (window.location.href.includes('orderstep=2')){
            setTimeout(function(){
                window.location.href = marketLink + orderLink3;
            }, Math.random() * (maxWait-minWait) + minWait);
        } else if (window.location.href.includes('orderstep=1')){
            setTimeout(function(){
                window.location.href = marketLink + orderLink2;
            }, Math.random() * (maxWait-minWait) + minWait);
        } else {
            setTimeout(function(){
                window.location.href = marketLink + orderLink1;
            }, Math.random() * (maxWait-minWait) + minWait);
        }
    }
    if (window.location.href.includes(successPage)){
        sessionStorage.removeItem('amount');
        setTimeout(function(){
            window.location.href = marketLink;
        }, Math.random() * (maxWait-minWait) + minWait);
    }
    else if (!window.location.href.includes(marketLink)){
        window.location.href = marketLink;
        console.log('Going to market page');
    } else if (window.location.href == marketLink){
        let checks = 0;
        function checkGoods(){
            checks++;
            let totals = countWarehouse();
            let input = totals[0];
            let output = totals[1];
            let owned = totals[2];
            let statusString = 'Input: ' + input + '\nOutput: ' + output + '\nTotal: ' + owned + '\nChecks: ' + ('0000'+checks).slice(-4);
            let maxAmount = warehouseCapacity - owned;
            if (owned < warehouseCapacity){
                for (let key in goodsTable){
                    let goodsCookie = sessionStorage.getItem(key);
                    let currentTime = Date.now();
                    let warehouse_and_orders = tagToNumber('warehouse' + goodsToID[key]) + tagToNumber('orders' + goodsToID[key])
                    document.getElementById('limit' + goodsToID[key]).textContent = ('0000'+warehouse_and_orders).slice(-4) + ' / ' + ('0000'+goodsTable[key]).slice(-4)
                    if (goodsCookie) {
                        if (currentTime > goodsCookie) {
                            let goodsId = goodsToID[key];
                            if (checkGoodsBuy(goodsId)){
                                let amount = Math.min(maxAmount,checkGoodsCount(goodsId));
                                sessionStorage.setItem('amount', amount);
                                buy(goodsId,amount);
                            }
                        } else {

                            statusString += '\n' + key + ' TIMEOUT ' + Math.round((goodsCookie - currentTime)/1000);

                        }
                    } else {
                        sessionStorage.setItem(key, currentTime - 1);
                    }

                }
            } else {
                console.log("Warehouse full")
                statusString += '\n FULL';
            }
            document.getElementsByClassName('text9 header2')[0].innerHTML = statusString;
            if (document.getElementById('counter').textContent == 'Update this data automatically'){
                setTimeout(function(){
                    location.reload();
                }, Math.random() * 30000);
            }
        }
        checkGoods();
        let interval = setInterval(checkGoods, 1000);
    } else if (window.location.href.includes(marketLink)) {
        let currrentId = Number(window.location.href.match(/materialId=(\d\d|\d)/)[1])
        let savedAmount = sessionStorage.getItem('amount')
        sessionStorage.setItem(IDToGoods[currrentId], Date.now() + 60000);
        buy(currrentId, savedAmount);
    }

setTimeout(function(){
}, 1000);
})();