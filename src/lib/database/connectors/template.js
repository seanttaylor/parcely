//Basic structure for JSON file or in-memory document database implementation

module.exports = {
    "users": {
        "e98417a8-d912-44e0-8d37-abe712ca840f": {
            "id": "e98417a8-d912-44e0-8d37-abe712ca840f",
            "handle": "@tstark",
            "emailAddress": "tstark@avengers.io",
            "phoneNumber": "12125552424",
            "firstName": "Tony",
            "lastName": "Stark",
            "createdDate": "2020-09-26T23:08:27.645Z",
            "lastModified": null,
            "followerCount": 1
        },
        "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09": {
            "id": "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09",
            "handle": "@thor",
            "emailAddress": "thor@avengers.io",
            "phoneNumber": "12125552020",
            "firstName": "Thor",
            "lastName": "Odinson",
            "createdDate": "2020-09-26T23:08:27.645Z",
            "lastModified": null,
            "followerCount": 0
        }
    },
    "user_roles": {
        "e98417a8-d912-44e0-8d37-abe712ca840f": {
            "id": "e98417a8-d912-44e0-8d37-abe712ca840f",
            "role": "admin",
            "createdDate": "2020-09-26T23:08:27.645Z",
            "lastModified": null
        },
        "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09": {
            "id": "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09",
            "role": "user",
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
            "password": "$2y$10$JGt.9x9ZOOZ7//S5fSRo7uKOck96G3Nz18aZ7oZ9pGqD8z7pPbR7O",
            "emailAddress": "thor@avengers.io",
            "createdDate": "2020-09-26T23:08:27.645Z",
            "lastModified": null
        }
    }
}