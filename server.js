const { dhis2 } = require('./dhis2');
const fs = require('fs');
const csv = require('csv-parser');

const run = () => {

    // Read data.csv row by row
    const datas = [];
    fs.createReadStream('./data.csv').pipe(csv()).on('data', (row) => {
        // ADD row to datas array
        datas.push(row);
    }).on('end', async () => {
        const date = new Date();
        for (let index = 0; index < datas.length; index++) {
            const row = datas[index];
            try {
                // Get trackedEntityInstance from server
                const trackedEntityInstance = await dhis2.get(`/trackedEntityInstances/${row.tei}.json`);
                const content = trackedEntityInstance.data;

                // do update
                if ((content.attributes.filter(c => c.attribute === row.attribute)[0].value === 'Autre' ||
                    content.attributes.filter(c => c.attribute === row.attribute)[0].value === 'Autres')) {

                    content.attributes.filter(c => c.attribute === row.attribute)[0].value = row.value;

                    // push to server
                    await dhis2.put(`/trackedEntityInstances/${row.tei}`, JSON.stringify(content));
                    fs.writeFile(`./logs/logs_${date.getFullYear()}${date.getMonth()}${date.getDate()}.log`, `${row.tei} OK\n`, { flag: 'a+' }, err => { })

                } else {
                    fs.writeFile(`./logs/logs_${date.getFullYear()}${date.getMonth()}${date.getDate()}.log`, `${row.tei} ALREADY TRAITED\n`, { flag: 'a+' }, err => { })
                }

            } catch (error) {
                console.log(error);
                fs.writeFile(`./logs/logs_${date.getFullYear()}${date.getMonth()}${date.getDate()}.log`, `${row.tei} NOT OK\n`, { flag: 'a+' }, err => { })
            }
        }

        console.log("END");
        process.exit(0)
    })
}

run();

