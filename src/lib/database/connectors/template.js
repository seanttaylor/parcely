//Basic structure for JSON file or in-memory document database implementation

module.exports = {
    "users": {
        "e98417a8-d912-44e0-8d37-abe712ca840f": {
            "id": "e98417a8-d912-44e0-8d37-abe712ca840f",
            "emailAddress": "tstark@avengers.io",
            "phoneNumber": "12125552424",
            "firstName": "Tony",
            "lastName": "Stark",
            "createdDate": "2020-09-26T23:08:27.645Z",
            "lastModified": null
        },
        "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09": {
            "id": "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09",
            "emailAddress": "thor@avengers.io",
            "phoneNumber": "12125552020",
            "firstName": "Thor",
            "lastName": "Odinson",
            "createdDate": "2020-09-26T23:08:27.645Z",
            "lastModified": null
        },
        "5298b9ab-9493-4fee-bf7e-805e47bb5d42": {
            "id": "5298b9ab-9493-4fee-bf7e-805e47bb5d42",
            "emailAddress": "nfury@shield.gov",
            "phoneNumber": "12125552121",
            "firstName": "Nick",
            "lastName": "Fury",
            "createdDate": "2020-09-26T23:08:27.645Z",
            "lastModified": null
        }
    },
    "user_roles": {
        "e98417a8-d912-44e0-8d37-abe712ca840f": {
            "id": "e98417a8-d912-44e0-8d37-abe712ca840f",
            "role": "user",
            "createdDate": "2020-09-26T23:08:27.645Z",
            "lastModified": null
        },
        "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09": {
            "id": "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09",
            "role": "user",
            "createdDate": "2020-09-26T23:08:27.645Z",
            "lastModified": null
        },
        "5298b9ab-9493-4fee-bf7e-805e47bb5d42": {
            "id": "5298b9ab-9493-4fee-bf7e-805e47bb5d42",
            "role": "admin",
            "createdDate": "2020-09-26T23:08:27.645Z",
            "lastModified": null
        }
    },
    "user_credentials": {
        "tstark@avengers.io": {
            "userId": "e98417a8-d912-44e0-8d37-abe712ca840f",
            "password": "$2y$12$VMp52ykXPMUJoubKQ9H0ru9oGpkXR6Cxrq.s3ddh.si9zS4A6VekC",
            "emailAddress": "tstark@avengers.io",
            "createdDate": "2020-09-26T23:08:27.645Z",
            "lastModified": null
        },
        "thor@avengers.io": {
            "userId": "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09",
            "password": "$2y$12$VMp52ykXPMUJoubKQ9H0ru9oGpkXR6Cxrq.s3ddh.si9zS4A6VekC",
            "emailAddress": "thor@avengers.io",
            "createdDate": "2020-09-26T23:08:27.645Z",
            "lastModified": null
        },
        "nfury@shield.gov": {
            "userId": "5298b9ab-9493-4fee-bf7e-805e47bb5d42",
            "password": "$2y$12$VMp52ykXPMUJoubKQ9H0ru9oGpkXR6Cxrq.s3ddh.si9zS4A6VekC",
            "emailAddress": "nfury@shield.gov",
            "createdDate": "2020-09-26T23:08:27.645Z",
            "lastModified": null
        }
    },
    "crates": {
        "2055c145-7d3e-446c-a7ad-ae6aaf886335": {
            "id": "2055c145-7d3e-446c-a7ad-ae6aaf886335",
            "size": ["L"],
            "shipmentId": "172b101d-3d24-4172-8e9d-2c34beb9c07f",
            "merchantId": "e3634bd2-7cb4-45b7-a442-f38ee4ad008b",
            "recipientId": "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09",
            "createdDate": "2021-02-24T19:04:33.436344",
            "lastModified": "2021-01-24T17:45:36.230152",
            "lastPing": "2021-02-24T19:04:33.436344",
            "telemetry": {
                "temp": {
                    "degreesFahrenheit": null
                },
                "location": {
                    "coords": {
                        "lat": null,
                        "long": null
                    },
                    "zip": null
                },
                "sensors": {
                    "moisture": {
                        "thresholdExceeded": false
                    },
                    "thermometer": {
                        "thresholdExceeded": false
                    },
                    "photometer": {
                        "thresholdExceeded": false
                    }
                }
            }
        }
    },
    "merchants": {
        "dd8b20dd-1637-4396-bba5-bcd6d65e2d5d": {
            "id": "dd8b20dd-1637-4396-bba5-bcd6d65e2d5d",
            "userId": "e98417a8-d912-44e0-8d37-abe712ca840f",
            "name": "Tony's Pizza",
            "address": {
                "street": "120 Broadway",
                "state": "New York",
                "city": "NY",
                "zip": "10201"
            },
            "phoneNumber": "12125552424",
            "emailAddress": "tony@tonyspizza.biz",
            "plan": {
                "name": ["smallBusiness"],
                "startDate": "01/01/2021",
                "expiryDate": "01/01/2022",
                "status": [
                    "active"
                ],
                "autoRenew": true
            },
            "createdDate": "2021-02-24T17:45:36.230152",
            "lastModified": "2021-02-24T17:45:36.230152"
        }
    },
    "crate_shipments": {
        "d54cc57f-c32c-454a-a295-6481f126eb8b": {
            "id": "d54cc57f-c32c-454a-a295-6481f126eb8b",
            "crateId": "2055c145-7d3e-446c-a7ad-ae6aaf886335",
            "recipientId":  "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09", 
            "departureTimestamp": "2018-06-13T10:11:13+05:30",
            "departureZip": "11249-1005",
            "arrivalTimestamp": null,
            "arrivalZip": "40511-2345",
            "trackingNumber": "1Z54F78A0450293517",
            "originAddress": {
                "street": "1 Shire Road",
                "city": "Hobbiton",
                "state": "CA",
                "zip": "90000"
            },
            "destinationAddress": {
                "street": "1159 Drury Lane",
                "apartmentNumber": "7",
                "city": "StoryBrooke",
                "state": "NY",
                "zip": "11111"
            },
            "tripLengthMiles": "706.4",
            "status": ["complete"],
            "waypoints": [
                {
                    "timestamp": "2018-06-13T12:11:13+05:30",
                    "telemetry": {
                        "temp": {
                            "degreesFahrenheit": "68"
                        },
                        "location": {
                            "coords": {
                                "lat": "40.7128 N",
                                "long": "74.0060 W"
                            },
                            "zip": "40508-0000"
                        },
                        "sensors": {
                            "moisture": {
                                "thresholdExceeded": true
                            },
                            "thermometer": {
                                "thresholdExceeded": false
                            },
                            "photometer": {
                                "thresholdExceeded": false
                            }
                        }
                    }
                }
            ]
        }

    }
}