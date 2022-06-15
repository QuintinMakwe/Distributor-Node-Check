export interface singleDistributorType {
    distributor: string,
    responseTimeFromServer: number,
    fileSize: number,
    timeToRender: number,
    responseTimeAfterLatencyHasBeenRemoved: number
}

export interface dynamicObj {
    [key: string]: string | number
}

export interface harFileResult {
    log: {
        version: string,
        creator: {
            [key: string]: string | number | dynamicObj
        },
        pages: Array<{ [key: string]: string | number | dynamicObj }>,
        entries: Array<{ [key: string]: string | number | dynamicObj }>
    },

}

export interface resultSchema {
    timeTestWasRun: string,
    filesRequested: Array<singleDistributorType>,
    extraMetrics: {
        averageResponseTimeForSystem: number,
        averageSpeedForDistributor: number,
        averageResponseTimeForEachDistributorAfterLatency: number,
        systemAverageSpeed: number
    },
    systemResponseTimeAfterLatencyhasBeenRemoved: number,
    speedOfSystem: number,
    waitTimeForEntries: number
}