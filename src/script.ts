import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { harFileResult, resultSchema } from './types';
const PuppeteerHar = require('puppeteer-har');

async function report() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const har = new PuppeteerHar(page);
    await har.start({ path: path.join(__dirname, './result.har') })

    await page.goto('https://play.joystream.org');

    await har.stop();
    await browser.close();
}


// report();

async function parseEntries() {
    let result: harFileResult = JSON.parse(fs.readFileSync(path.join(__dirname, './result.har')).toString())
    // console.log('result ', result.log.entries);
    console.log('something ', Object.keys(result.log))
    //compute metrics
    let returnValue: resultSchema = {
        timeTestWasRun: '',
        filesRequested: [], //array of object computing {distributor: '', responseTimeFromServer: 0, fileSize; 0, timeToRender: 0, responseTimeAfterLatencyHasBeenRemoved: 0, average}
        extraMetrics: {
            averageResponseTimeForSystem: 0,
            averageSpeedForDistributor: 0,
            averageResponseTimeForEachDistributorAfterLatency: 0,
            systemAverageSpeed: 0
        },
        systemResponseTimeAfterLatencyhasBeenRemoved: 0, //use this to compute averageResponseTimeForEachDistributorAfterLatency
        speedOfSystem: 0,
        waitTimeForEntries: 0
    }

    for (let i = 0; i < result.log.entries.length; i++) {
        const currrentEntry: any = result.log.entries[i]
        returnValue.filesRequested.push({
            distributor: currrentEntry.request.url,
            responseTimeFromServer: currrentEntry.timings.wait,
            fileSize: currrentEntry.response.content.size,
            timeToRender: currrentEntry.timings.receive,
            responseTimeAfterLatencyHasBeenRemoved: currrentEntry.time - currrentEntry.timings.wait,
        })

        returnValue.systemResponseTimeAfterLatencyhasBeenRemoved += (currrentEntry.time - currrentEntry.timings.wait)
        returnValue.speedOfSystem += currrentEntry.time
        returnValue.waitTimeForEntries += currrentEntry.timings.wait
    }

    returnValue.timeTestWasRun = `Day: ${new Date().toLocaleDateString()} , time: ${new Date().toLocaleTimeString()}`;
    returnValue.extraMetrics.averageResponseTimeForSystem = returnValue.waitTimeForEntries / result.log.entries.length
    returnValue.extraMetrics.averageSpeedForDistributor = returnValue.speedOfSystem / result.log.entries.length
    returnValue.extraMetrics.systemAverageSpeed = returnValue.speedOfSystem / result.log.entries.length
    returnValue.extraMetrics.averageResponseTimeForEachDistributorAfterLatency = returnValue.systemResponseTimeAfterLatencyhasBeenRemoved / result.log.entries.length

    console.log('return value ', returnValue)
}

async function runAll() {
    await report()
    await parseEntries()
}

runAll()