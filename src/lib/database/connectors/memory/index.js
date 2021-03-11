/* istanbul ignore file */

const Ajv = require("ajv");
const uuid = require("uuid");
const ajv = new Ajv();
const dataTemplate = require("../template");

function InMemoryDatabaseConnector({console}) {
    const data = Object.assign({}, dataTemplate);
    this._schemaValidators = {
        "user_roles": require("../json/schemas/user-roles.json"),
        "user_credentials": require("../json/schemas/user-credentials.json"),
        "users": require("../json/schemas/users.json"),
    };


    /**
     * Add a document to the database.
     * @params {Object} doc - an instance of an entity DTO containing data to store
     * @params {String} collection - name of collection to add to.
     * @returns {Object}
     */

    this.add = async function({doc, collection}) {

        if (typeof(doc) !== "object") {
            throw new Error(`Record should be of type [Object] but is ${typeof(doc)} instead.`);
        }

        if (!Object.keys(this._schemaValidators).includes(collection)) {
            throw new Error(`JSONDatabaseConnectorError.AddError: collection (${collection}) does not exist`);
        }

        try {
            const record = doc.value();
            const validate = ajv.compile(this._schemaValidators[collection]);
            
            if (!validate(record)) {
                throw new Error(`ValidationError.SchemaError: ${collection} ${JSON.stringify(validate.errors, null, 2)}`); 
            }

            data[collection][record.id] = record;             
            return [record];
            
        } catch(e) {
            console.error(`JSONDatabaseConnectorError: ${e.message}`);
        }
    }

    /**
     * Update a document in the database by id 
     * @params {String} id - id of the document in the database
     * @params {Object} doc - an instance of an entity DTO containing data to store
     * @params {String} collection - collection to update 
     * @returns {Object}
     */

    this.updateOne = async function({doc, collection}) {
        const id = doc.value().id;

        if (typeof(doc) !== "object") {
            throw new Error(`Record should be of type [Object] but is ${typeof(doc)} instead.`);
        }

        if (!id) {
            throw new Error(`JSONDatabaseConnectorError.UpdateError: record id CANNOT be falsy`);
        }

        if (!Object.keys(this._schemaValidators).includes(collection)) {
            throw new Error(`JSONDatabaseConnectorError.UpdateError: collection (${collection}) does not exist`);
        }

        if (!data[collection][id]) {
            console.info(`JSONDatabaseConnector.UpdateError: Could NOT find ${collection}.${id}`);
            return [];
        }

        try {
            const validate = ajv.compile(this._schemaValidators[collection]);   
            const record = Object.assign(doc.value(), {
                lastModified: new Date().toISOString()
            });

            if (!validate(record)) {
                throw new Error(`ValidationError.SchemaError: ${collection} ${JSON.stringify(validate.errors, null, 2)}`); 
            }
            
            data[collection][id] = record;
            return [record];

        } catch(e) {
            console.error("JSONDatabaseConnectorError:", e);
        }
    }


    /**
     * Add a document to the database with a user-defined ID
     * @params {String} id - id of the document to create in the database
     * @params {Object} doc - an instance of an entity DTO containg data to store
     * @params {String} collection - collection to update 
     * @returns {Object}
     */

    this.putOne = async function({doc, collection}) {
        const id = doc.value().id;

        if (typeof(doc) !== "object") {
            throw new Error(`Record SHOULD be of type [Object] but is ${typeof(doc)} instead.`);
        }

        if (!id) {
            throw new Error("JSONDatabaseConnectorError.PutError: Record id CANNOT be falsy");
        }

        if (!Object.keys(this._schemaValidators).includes(collection)) {
            throw new Error(`JSONDatabaseConnectorError.PutError: Collection (${collection}) does NOT exist`)
        }

        try {
            const validate = ajv.compile(this._schemaValidators[collection]);
            const record = doc.value();

            if (!validate(record)) {
                throw new Error(`ValidationError.SchemaError: (${collection}) ${JSON.stringify(validate.errors, null, 2)}`); 
            }
            
            data[collection][id] = record;
            return [record];
        } catch(e) {
            console.error(`JSONDatabaseConnectorError: ${e.message}`);
        }
    }


    /**
     * Remove a document from a collection BY ID ONLY.
     * @params {String} id - Id of the document in the database.
     * @params {String} collection - Collection to from from. 
     * @returns {Object}
     */

    this.removeOne = async function(id, collection) {
        try {
            delete data[collection][id];            
            return [];
            
        } catch(e) {
            console.error(e);
        }
    }

    /**
     * Find all documents in a collection.
     * @params {String} collection - Collection to pull from. 
     * @returns {Object}
     */

    this.findAll = async function(collection) {
        try {
            return Object.values(data[collection]);
        } catch(e) {
           console.error(e);
        }
    }

    /**
     * Find a document in a collection by id
     * @params {String} id - id of the document 
     * @params {String} collection - collection to pull from
     * @returns {Object}
     */

    this.findOne = async function({id, collection}) {
        if (!Object.keys(this._schemaValidators).includes(collection)) {
            throw new Error(`JSONDatabaseConnectorError.FindOneError: Collection (${collection}) does not exist`);
        }

        if (!id) {
            throw new Error(`JSONDatabaseConnectorError.FindOneError: record id CANNOT be falsy`);
        }

        try {
            
            if (!data[collection][id]) {
                console.info(`JSONDatabaseConnector.UpdateError: Could NOT find ${collection}.${id}`);
                return [];
            }
            
            return [data[collection][id]];
            
        } catch(e) {
           console.error(e);
        }
    }

    /**
     * Drop a collection from the database.
     * @params {String} collection - collection to drop. 
     * @returns
     */

    this.drop = async function(collection) {
        delete dataFile[collection];
        return [];
    }
    
    /**
     * Closes an existing connection to the database.
     * This implementation does nothing as there is no database server connection.
     * @returns
     */
    this.close = function() {
        return [];
    }

}

module.exports = InMemoryDatabaseConnector;