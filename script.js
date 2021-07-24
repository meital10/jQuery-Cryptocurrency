$(document).ready(function () {
    let selectedCoinsArray = [];
    // -------------------------------------------------------------------------------------------

    // api call function+event

    $.get('https://api.coingecko.com/api/v3/coins').then(
        data => {
            drawCoins(data);
            $('#homeTab').click(function () {
                drawCoins(data);
                console.log(data);
            });
        });

    function drawCoins(data) {
        $('#cardsContainer').empty();
        for (let i = 0; i < data.length; i++) {
            $('#cardsContainer').append(`<div class="card col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3">
        <div class="card-body id="cardBody">
        <label class="switch"><input type="checkbox" class="checkBox" id="${data[i].symbol}">
                <span class="slider round"></span></label>
            <h5 class="card-title" id="coinSymbol">${data[i].symbol.toUpperCase()}</h5>
            <p class="card-text">${data[i].name}</p>
            <p>
                <a class="btn btn-primary" data-toggle="collapse" href="#moreInfo-${data[i].id}" >
                    More Info
                </a>
            </p>
            <div class="collapse" id="moreInfo-${data[i].id}">
                <div class="card card-body" id="coinInfo${i}">
                <div class="spinner-grow spinner-grow-sm" id="spinner${i}" role="status">
                <span class="sr-only">Loading...</span>
                </div>
                
                </div>
            </div>
            
          </div>
        </div>`)

            // event change for choosing coins
            $(`#${data[i].symbol}`).change(function () {
                console.log(`#${data[i].symbol}`);

                if (!document.querySelector(`#${data[i].symbol}`).checked) {
                    this.checked;
                    console.log('uncheck');
                    selectedCoinsArray = selectedCoinsArray.filter(e => e !== data[i].symbol);
                }

                else {

                    this.checked = true;
                    if (selectedCoinsArray.length < 5 && !selectedCoinsArray.includes(data[i].symbol)) {
                        selectedCoinsArray.push(data[i].symbol)
                    }
                    else {

                        this.checked = false;
                        drawModal(selectedCoinsArray);
                        $('#selectedCoinsModal').modal('show');
                    }
                    console.log('check');
                }
                console.log(selectedCoinsArray);

            })

            // event for getting coins data when clicking more info button
            $(`#moreInfo-${data[i].id}`).on('show.bs.collapse', function (e) {
                // console.log(data[i].id);
                coinName = data[i].id
                let coinInfoApi = $.get(`https://api.coingecko.com/api/v3/coins/${data[i].id}`);
                coinInfoApi.then(function (data) {
                    $(`#spinner${i}`).toggle();
                    $(`#coinInfo${i}`).empty();
                    $(`#coinInfo${i}`, e.target).append(`<p class= "card-img-top"><img src = ${data.image.large} width = "25px"</p>`);
                    $(`#coinInfo${i}`, e.target).append(`<pre class="card-text">USD    &dollar;${data.market_data.current_price.usd}</pre>`)
                        .append(`<pre class="card-text">EUR    &euro;${data.market_data.current_price.eur}</pre>`)
                        .append(`<pre class="card-text">ILS    &#8362;${data.market_data.current_price.ils}</pre>`);

                    // local storage
                    let selectedCoinJson = window.localStorage.getItem(coinName);

                    if (selectedCoinJson + 12000 > new Date().getTime()) {

                        coinInfoJson = JSON.parse(selectedCoinJson);

                    }
                    else {
                        coinInfoApi.then(function (coinData) {
                            let coinInfo = {
                                usd: coinData.market_data.current_price.usd,
                                euro: coinData.market_data.current_price.eur,
                                ils: coinData.market_data.current_price.ils,
                                image: coinData.image.large,

                            }
                            // console.log(coinInfo)
                            let storage = [{ time: new Date().getTime() }, (coinInfo)];
                            window.localStorage.setItem(coinName, JSON.stringify(storage))
                        })
                    }

                })
            })

        }
    }


    // // // draw modal function with the selected 5 coins
    function drawModal(selectedCoinsArray) {
        $('#modalBody').empty();
        for (let i = 0; i < selectedCoinsArray.length; i++) {
            $('#modalBody').append(`<div class="modalDiv col-12">
            <label class="switch" id=${ selectedCoinsArray[i]}>
            <input type="checkbox" checked class= "checkBox ${ selectedCoinsArray[i]}"  id="${selectedCoinsArray[i]}">
            <span class="slider round"></span></label>
            <p class="symbolCoinModal">${(selectedCoinsArray[i]).toUpperCase()})</p>
            </div>`);

            $(`#${selectedCoinsArray[i]}`).change(function () {
                $('#selectedCoinsModal').modal('hide');
                let arr = selectedCoinsArray[i];
                // console.log(arr);
                selectedCoinsArray.splice(i, 1);
                // console.log(selectedCoinsArray);
                document.getElementById(arr).checked = false;
            })
        }
    }

    // event key up for search coins
    $("#search").on("keyup", function () {
        let value = $(this).val().toLowerCase();
        $('.card').filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });


    // -----------------------------------------------------
    // chart
    $('#nav-live-tab').click(function () {
        selectedCoinsValue(selectedCoinsArray);
        if (selectedCoinsArray.length !== 0) {
            $('#chartTitle').hide();
            $('#chartContainer').show();
        }
        else {
            $('#chartContainer').hide();
            $('#chartTitle').show();
        }

    })

    function selectedCoinsValue(selectedCoinsArray) {
        let a = [];
        let b = [];
        let c = [];
        let d = [];
        let e = [];

        let dataUpdate = setInterval(function () {
            $.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoinsArray},&tsyms=USD`,
                function (data) {

                    let dataLength = Object.values(data).length;
                    let coinData1 = Object.values(data)[0];
                    let coinArr1 = Object.values(coinData1)[0];

                    a.push(coinArr1)

                    if (dataLength == 11) {

                        a.data.shift()
                        b.data.shift()
                        c.data.shift()
                        d.data.shift()
                        e.data.shift()
                    }

                    if (dataLength >= 2) {
                        let coinData2 = Object.values(data)[1];
                        let coinArr2 = Object.values(coinData2)[0];
                        b.push(coinArr2)
                    }

                    if (dataLength >= 3) {
                        let coinData3 = Object.values(data)[2];
                        let coinArr3 = Object.values(coinData3)[0];
                        c.push(coinArr3)
                    }

                    if (dataLength >= 4) {
                        let coinData4 = Object.values(data)[3];
                        let coinArr4 = Object.values(coinData4)[0];
                        d.push(coinArr4)
                    }

                    if (dataLength >= 5) {
                        let coinData5 = Object.values(data)[4];
                        let coinArr5 = Object.values(coinData5)[0];
                        e.push(coinArr5)
                    }
                    // console.log(selectedCoinsArray);
                    drawChart(a, b, c, d, e);
                })

        }, 2000);

        $('#homeTab, #nav-about').click(function () {

            clearInterval(dataUpdate);

        })
    }

    function drawChart(coinArr1, coinArr2, coinArr3, coinArr4, coinArr5) {

        Highcharts.chart('chartContainer', {

            chart: {
                type: 'line',
                marginRight: 10,
                backgroundColor: '#f1f8d1',

            },

            time: {
                timezone: 'Israel/Tel_Aviv'
            },

            title: {
                text: 'Live crypto currency prices'
            },

            subtitle: {
                text: 'Source: coingecko.com'
            },

            accessibility: {
                announceNewData: {
                    enabled: true,
                    minAnnounceInterval: 15000,
                    announcementFormatter: function (newPoint) {
                        if (newPoint) {
                            return 'New point added. Value: ' + newPoint.y, newPoint.x;

                        }
                        return false;
                    }
                }
            },

            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },

            yAxis: {
                title: {
                    text: 'Coin Value'
                }
            },

            toolTip: {
                headerFormat: '<b>{series.name}</b><br/>',
                pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
            },

            legend: {

                cursor: "pointer",
                verticalAlign: "top",
                fontSize: 15,
                fontColor: `#334466`,
                fontFamily: 'Montserrat',
                prefix: '$',

            },
            exporting: {
                enabled: false
            },

            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    pointStart: 1
                }
            },

            series: [{

                name: selectedCoinsArray[0],
                data: coinArr1
            }, {
                name: selectedCoinsArray[1],
                data: coinArr2
            }, {
                name: selectedCoinsArray[2],
                data: coinArr3
            }, {
                name: selectedCoinsArray[3],
                data: coinArr4
            }, {
                name: selectedCoinsArray[4],
                data: coinArr5

            }],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }

        });
    }

});