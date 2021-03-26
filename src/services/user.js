const config = require("../../config");
const bcrypt = require("bcryptjs");
const {UserDTO, UserRoleDTO, UserCredentialsDTO} = require("../lib/repository/user/dto");
const uuid = require("uuid");
const {promisify} = require("util");
const SALT_ROUNDS = 10;
const hash = promisify(bcrypt.hash);
const passwordAndHashMatch = promisify(bcrypt.compare);

/**
* @typedef {Object} User
* @property {String} id - the uuid of the user
* @property {Object} _data - the user data
* @property {Object} _repo - the repository instance associated with this user
*/

/**
 * @param {Object} repo - the repo associated with this user
 * @param {UserDTO} userDTO - an instance of the UserDTO
 */

function User(repo, userDTO) {
    const dtoData = userDTO.value();
    
    this._data = dtoData;
    this._repo = repo;
    this.id = dtoData.id;
    
    this.toJSON = function() {
        return {
            id: this.id,
            createdDate: this._data.createdDate,
            lastModified: this._data.lastModified,
            data: {
                userId: this._data.id,
                firstName: this._data.firstName,
                lastName: this._data.lastName,
                emailAddress: this._data.emailAddress,
                isVerified: this._data.isVerified
            }
        };
    }


    /**
    Saves a new user to the data store
    @returns {String} - a uuid for the new user
    */
    this.save = async function() {
        const userDTO = new UserDTO(this._data);
        const userRoleDTO = new UserRoleDTO(this._data);
        const user = await this._repo.create({userDTO, userRoleDTO});
        
        return user.id;
    }

    /**
    Edit first_name and/or last_name on an existing user in the data store
    @param {String} firstName - updated first name
    @param {String} lastName - updated last name
    */
    this.editName = async function(doc) {
        const firstName =  doc.firstName || this._data.firstName;
        const lastName = doc.lastName || this._data.lastName;
        const userDTO = new UserDTO(Object.assign(this._data, {
            firstName,
            lastName
        }));

        await this._repo.editName(userDTO);
        this._data.firstName = firstName;
        this._data.lastName = lastName;
    }

    /**
    Edit phoneNumber property of an existing user in the data store.
    @param {Integer} phoneNumber - a telephone number
    */
    this.editPhoneNumber = async function(phoneNumber) {
        const userDTO = new UserDTO(Object.assign(this._data, {phoneNumber}));
        const {lastModified} = await this._repo.editPhoneNumber(userDTO);
        this._data.phoneNumber = phoneNumber;
        this._data.lastModified = lastModified;
    }
}


/**
* @typedef {Object} UserService
* @property {Object} _repo - the repository associated with this service
* @property {Object} _validator - the validator used to validate new posts
* @property {Object} _eventEmitter - the eventEmitter used to register/emit service events
*/

/**
 * 
 * @param {Object} repo - the repo associated with this service
 * @param {Object} validator - the validator used to validate a new user
 */

function UserService(repo, validator = new UserValidator()) {
    this._repo = repo;

    this.createUser = async function(doc) {
        const id = uuid.v4();
        const data = Object.assign({id}, doc);
        await validator.validate(this, doc);
        return new User(repo, new UserDTO(data)) ;
    }


    this.findUserById = async function(id) {
        const [user] = await this._repo.findOneById(id);
        return [new User(repo, new UserDTO(user))];
    }


    this.findUserByEmail = async function(emailAddress) {
        const userList = await this._repo.findOneByEmail(emailAddress);
        return userList.map((u) => new User(this._repo, new UserDTO(u)));
    }


    this.findAllUsers = async function() {
        const users = await this._repo.findAll();
        return users.map((u) => new User(repo, new UserDTO(u)));
    }


    this.deleteUser = function(id) {
        return this._repo.deleteUser(id);
    }


    this.userExists = async function(id) {
        const result = await this._repo.findOneById(id);
        return result.length === 1 && result[0]["id"] === id;
    }


    this.emailAddressExists = async function(emailAddress) {
        const result = await this._repo.findOneByEmail(emailAddress);
        return result.length === 1 && result[0]["emailAddress"] === emailAddress;
    }

    this.createUserPassword = async function({password, user}) {
        const passwordHash = await hash(password, SALT_ROUNDS);
        await this._repo.createUserPassword(new UserCredentialsDTO({
            password: passwordHash,
            ...user._data
        }));
    }
    
    
    this.isUserPasswordCorrect = async function({password, user}) {
        const storedUserPasswordHash = await this._repo.getUserPassword(user._data.emailAddress);
        const result = await passwordAndHashMatch(password, storedUserPasswordHash);        
        return result;
    } 
    
    
    this.getUserRole = async function(user) {
        const result = await this._repo.getUserRole(user.id);
        return result.role; 
    }
}


function UserValidator() {

    this.validate = async function(userService, userData) {
        if (userData === undefined || (Object.keys(userData).length === 0)) {
            throw new Error("UserDataEmpty");
        }

        if (!userData.emailAddress) {
            throw new Error("MissingOrInvalidEmail.Missing")
        }

        if (!userData.phoneNumber) {
            throw new Error("MissingOrInvalidPhone");
        }

        if (!userData.firstName) {
            throw new Error("MissingOrInvalidFirstName");
        }

        if (!userData.lastName) {
            throw new Error("MissingOrInvalidLastName");
        }

        const emailAddressRegex = new RegExp(config.users.emailAddressRegex);

        if (emailAddressRegex.test(userData.emailAddress) === false) {
            throw new Error("MissingOrInvalidEmail.Format");
        }

        const emailAddressExists = await userService.emailAddressExists(userData.emailAddress);
        if (emailAddressExists) {
            throw new Error("MissingOrInvalidEmail.EmailExists");
        }

    }

}

module.exports = { UserService, UserValidator };