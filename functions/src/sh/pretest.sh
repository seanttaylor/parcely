#Run solely to keep thet firebase-functions package from producing a warning about missing environment variables when running tests locally via `npm test`
export GCLOUD_PROJECT=fakeProjectId
export FIREBASE_CONFIG=\''{"projectId": "fakeProjectId", "storageBucket": fakeProjectId.appspot.com}'\'