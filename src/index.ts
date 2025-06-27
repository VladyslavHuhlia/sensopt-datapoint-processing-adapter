import {ISqsMessage} from './types';
import { handleCreateDeviceEvents, handleDataPollEvents } from './event-handlers';

console.log('Loading current weather device adapter lambda function');

export const handler = async (events: any) => {
    // console.log('Received events:', JSON.stringify(events[0], null, 2));
    let event

    console.log(events)

    if (events?.Records) {
        console.log('Here for records')
        event = events.Records[0]
    } else if(Array.isArray(events)) {
        console.log('Here for array')
        event = events[0]
    } else {
        console.log('Here for object')
        event = events
    }

    let parsedBody
    let data

    if(event?.body) {
        parsedBody = JSON.parse(event.body)
        data = parsedBody.data
    } else {
        data = event
    }

    console.log(data.key)
    console.log(event?.messageId)

    let res

    switch (data.key) {
        case 'device-handler':
            res = await handleCreateDeviceEvents(data)
            break;
        case 'datapoint-handler':
            res = await handleDataPollEvents(data, event?.messageId)
            break;
    }

    return res;
};

// if (process.env.DEVELOPMENT_MODE) {
//     handler([
//         {
//             payload: {
//                 key: 'create-device',
//                 value: JSON.stringify({
//                     "device": {
//                         "id": "eb63465a-b263-4b46-9b69-ff13e35fb2d7",
//                         "userId": "019428b0-b5ad-721e-9c0d-7fc46973181c",
//                         "deviceTypeId": "019428bb-bcbd-7af6-94d9-e5c13fe06e72",
//                         "isActivated": true,
//                         "name": "Device1",
//                         "connection": {
//                             "lat": 37.201206,
//                             "serverAddress": "https://dev.talgil.com/api",
//                             "serial": 1780,
//                             "token": "1tvf1xtt1ri71juo1jr21ri71xtp1tvn1c3j1tvf1xtt1ri71juo1jr21ri71xtp1tvn"
//                         },
//                         "pollFrequency": 1234
//                     },
//                     "fcmTokens": ["32432432", "etertrete"]
//                 }),
//                 timestamp: 1734689610600,
//                 topic: 'talgil-weather-adapter',
//                 headers: [
//                     {
//                         key: "correlationId",
//                         value: "5435536563"
//                     }
//                 ],
//                 partition: 0,
//                 offset: 7
//             },
//         },
        // {
        //     payload: {
        //         key: 'poll-data',
        //         value: JSON.stringify({
        //             "sensors": [
        //                 { "name": "heatindex_f", "id": "16e63594-1c02-4337-a899-8907c861805c" },
        //                 {" name": "cloud", "id": "06ee32cf-df86-43da-b4ef-6dd4bc2a29be" }
        //             ],
        //             "connection": {
        //                 "lat": 37.201206,
        //                 "serverAddress": "http://api.weatherapi.com/v1/current.json",
        //                 "long": -3.739167,
        //                 "token": "6b48d6699c574b3ab02125717240612"
        //             },
        //             "deviceId": "eb63465a-b263-4b46-9b69-ff13e35fb2d7"
        //         }),
        //         timestamp: 1734689610600,
        //         topic: 'talgil-weather-adapter',
        //         partition: 0,
        //         offset: 7
        //     },
        // }
//     ]);
// }
