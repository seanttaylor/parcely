/* istanbul ignore file */

/*Implements IUserRepository interface for connecting to a datastore
See interfaces/user-repository for method documentation*/

const { UserDTO } = require("./dto");


/**
 * @implements {IUserRepository}
 * @param {Object} databaseConnector - object with methods for connecting to a database 
 */

function UserRepository(databaseConnector) {
    /**
     * @param {UserDTO} userDTO - an instance of UserDTO
     * @param {UserRoleDTO} userRoleDTO - an instance of UserRoleDTO
     */
    this.create = async function({userDTO, userRoleDTO}) {
        const [record] = await databaseConnector.add({
            doc: userDTO, 
            collection: "users"
        });

        await databaseConnector.add({
            doc: userRoleDTO, 
            collection: "user_roles"
        });

        return { id: record.id, createdDate: record.createdDate };

    }

    /**
     * @param {UserCredentialsDTO} userCredentialsDTO - an instance of UserCredentialsDTO
     */
    this.createUserPassword = async function(userCredentialsDTO) {
        await databaseConnector.putOne({
            doc: userCredentialsDTO, 
            collection: "user_credentials"
        });
    }

    /**
     * @param {String} emailAddress - user email address 
     */
    this.getUserPassword = async function(emailAddress) {
        const [result] = await databaseConnector.findOne({id: emailAddress, collection: "user_credentials"});
        return result.password;
    }

    /**
     * @param {String} id - uuid for a user
     */
    this.findOneById = async function(id) {
        const result = await databaseConnector.findOne({id, collection: "users"});
        return result;
    }

    /**
     * @param {String} emailAddress - user email address 
     */
    this.findOneByEmail = async function(emailAddress) {
        //Remember: the result of a failed Array.find is `undefined`
        const result = await databaseConnector.findAll("users");
        const user = result.find((u)=> u.emailAddress === emailAddress);        
        return [ user || {} ];
    }


    this.findAll = async function() {
        const result = await databaseConnector.findAll("users");
        return result;
    }

    /**
     * @param {UserDTO} userDTO - an instance of UserDTO
     */
    this.editName = async function(userDTO) {
        const [record] = await databaseConnector.updateOne({
            doc: userDTO,
            collection: "users"
        });

        return { id: record.id, lastModified: record.lastModified };

    }

    /**
     * @param {UserDTO} userDTO - an instance of UserDTO
     */
    this.editPhoneNumber = async function(userDTO) {
        const [record] = await databaseConnector.updateOne({
            doc: userDTO,
            collection: "users"
        });

        return { lastModified: record.lastModified };
    }

    /**
     * @param {UserDTO} userDTO - an instance of UserDTO
     */
    this.editEmailAddress = async function(userDTO) {
        const [record] = await databaseConnector.updateOne({
            doc: userDTO,
            collection: "users"
        });

        return { lastModified: record.lastModified };
    }


    this.getUserRole = async function(currentUserId) {
        const [result] = await databaseConnector.findOne({
            id: currentUserId, 
            collection: "user_roles"
        });
        
        return result;
    }


    this.deleteUser = function(id) {
        return
    }
}

/*UserRepository*/

module.exports = UserRepository;