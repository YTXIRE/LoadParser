const csv =                 require('fast-csv');
const fs =                  require('fs');
const XlsxStreamWriter =    require("xlsx-stream-writer");
const xlsx =                new XlsxStreamWriter();
const reducer =             (accumulator, currentValue) => Number(accumulator)+ Number(currentValue);

function parse(pathFile) {
    let dataCSV =           [];
    let referenceCSV =      [];
    let ref =               [];
    let dataResult =        [];
    let refer =             [];
    let refData =           [];

    fs.createReadStream(pathFile.files[0].path)
        .pipe(csv())
        .on('data', function (data) {
            dataCSV.push([data[1], data[2]]);
        })
        .on('end', () => {
            if(localStorage.getItem('settingsPath')  === null) {

                for(i = 0; i < dataCSV.length; i++) {
                    let property = dataCSV[i];
                    if(ref[property[1]]) {
                        ref[property[1]].push(property[0]);
                    } else {
                        ref[property[1]] = [property[0]];
                    }
                    ref[property[1]].sort();
                }

                referenceCSV.length = 0;
                fs.createReadStream(pathFile.files[0].path)
                    .pipe(csv())
                    .on('data', function(data)  {
                        referenceCSV.push([data[2], data[1]]);
                    })
                    .on('end', function () {
                        refer = Object.keys(ref).map(function (key) {
                            return [key, ref[key]];
                        });

                        for (i = 0; i < refer.length; i++) {
                            ref[refer[i][0]].splice(0, 10);
                            ref[refer[i][0]].splice(ref[refer[i][0]].length - 10, 10);
                            ref[refer[i][0]] = ref[refer[i][0]].reduce(reducer);
                            ref[refer[i][0]] = Math.round((ref[refer[i][0]] / 80) * 1.2);
                        }

                        ref = Object.keys(ref).map(function (key) {
                            return [key, ref[key]];
                        });

                        ref = ref.sort();
                        let pathDataFolder = localStorage.getItem('dataFolder') + "\\reference.csv";

                        fs.unlink(pathDataFolder, err => {});

                        for (i = 0; i < ref.length; i++) {
                            fs.appendFile(pathDataFolder, ref[i][1] + ', "' + ref[i][0] + '"\n', (err) => {
                            });
                        }
                        localStorage.setItem('settingsPath', pathDataFolder);
                        alert('Расчет эталонных значений закончен.');
                    })
            }else {
                referenceCSV.length = 0;
                fs.createReadStream(localStorage.getItem('settingsPath'))
                    .pipe(csv())
                    .on('data', function (data) {
                        referenceCSV.push([data[0], data[1]]);
                    })
                    .on('end', () => {
                        if (JSON.parse(localStorage.getItem('CheckedSwith'))) {

                            for(i = 0; i < dataCSV.length; i++) {
                                let property = dataCSV[i];
                                if(ref[property[1]]) {
                                    ref[property[1]].push(property[0]);
                                } else {
                                    ref[property[1]] = [property[0]];
                                }
                                ref[property[1]].sort();
                            }

                            for (let i = 0; i < referenceCSV.length; i++) {
                                ref[referenceCSV[i][1]].splice(0, 4);
                                ref[referenceCSV[i][1]].splice(ref[referenceCSV[i][1]].length - 4, 4);
                                ref[referenceCSV[i][1]] = ref[referenceCSV[i][1]].reduce(reducer);
                                ref[referenceCSV[i][1]] = Math.round(ref[referenceCSV[i][1]] / 12);
                            }

                            for (i = 0; i < referenceCSV.length; i++) {
                                if (Number(referenceCSV[i][0]) + 10 > Number(ref[referenceCSV[i][1]])) {
                                    dataResult[i] = [referenceCSV[i][1], Number(referenceCSV[i][0]), Number(ref[referenceCSV[i][1]]), 'Прошел'];
                                } else {
                                    dataResult[i] = [referenceCSV[i][1], Number(referenceCSV[i][0]), Number(ref[referenceCSV[i][1]]), 'Не прошел'];
                                }
                            }

                            dataResult.unshift(['Наименование', 'Эталонное значение', 'Текущее значение', 'Сравнение с эталоном']);

                            let pathDataFolder = localStorage.getItem('dataFolder') + "\\result.xlsx";
                            xlsx.addRows(dataResult);
                            xlsx.getFile().then(buffer => {
                                fs.writeFileSync(pathDataFolder, buffer);
                            });
                            alert('Расчет данных закончен.');
                        } else {
                            for(i = 0; i < dataCSV.length; i++) {
                                let property = dataCSV[i];
                                if(ref[property[1]]) {
                                    ref[property[1]].push(property[0]);
                                } else {
                                    ref[property[1]] = [property[0]];
                                }
                                ref[property[1]].sort();
                            }

                            for(i = 0; i < referenceCSV.length; i++) {
                                let property = referenceCSV[i];
                                if(refData[property[1]]) {
                                    refData[property[1]].push(property[0]);
                                } else {
                                    refData[property[1]] = [property[0]];
                                }
                                refData[property[1]].sort();
                            }

                            for(var key in ref) {
                                if(!refData.hasOwnProperty(key)) {
                                    refData[key] = ref[key];
                                    refData[key].splice(0, 10);
                                    refData[key].splice(refData[key].length - 10, 10);
                                    refData[key] = refData[key].reduce(reducer);
                                    refData[key] = [Math.round((refData[key] / 80) * 1.2)];
                                }
                            }

                            refData = Object.keys(refData).map(function (key) {
                                return [key, refData[key]];
                            });

                            refData = refData.sort();

                            let pathDataFolder = localStorage.getItem('dataFolder') + "\\reference.csv";

                            fs.unlink(pathDataFolder, err => {});

                            for (i = 0; i < refData.length; i++) {
                                fs.appendFileSync(pathDataFolder, refData[i][1][0] + ', "' + refData[i][0] + '"\n', (err) => {});
                            }
                            alert('Расчет эталонных значений закончен.');
                        }
                    });
            }
        });

    dataCSV.length =        0;
    referenceCSV.length =   0;
    ref.length =            0;
    dataResult.length =     0;
    refer.length =          0;
}