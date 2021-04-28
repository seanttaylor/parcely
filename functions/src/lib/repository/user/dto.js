/* istanbul ignore file */

const Ajv = require("ajv");
const ajv = new Ajv();
const userSchema = require("../../../schemas/user.json");
const userRoleSchema = require("../../../schemas/user-role.json");
const userCredentialsSchema = require("../../../schemas/user-credentials.json");
const userSchemaValidation = ajv.compile(userSchema);
const userRoleSchemaValidation = ajv.compile(userRoleSchema);
const userCredentialsSchemaValidation = ajv.compile(userCredentialsSchema);


/**
 * @typedef {Object} UserDTO
 * @property {String} id 
 * @property {String} emailAddress
 * @property {String} phoneNumber
 * @property {String} firstName
 * @property {String} lastName
 * @property {Boolean} isVerified
 * @property {String} createdDate  
 * @property {String|null} lastModified
 */

 /**
  * @param {String} id - uuid for a user
  * @param {String} emailAddress - email address for a user
  * @param {String} phoneNumber - phone number for a user
  * @param {String} firstName - user first name
  * @param {String} lastName - user last name
  * @param {String} createdDate - date a user was created
  * @param {Boolean} isVerified - indicates whether a user's account has been verified
  * @param {String|null} lastModified - date user was last modified
  * @returns {UserDTO}
  */

function UserDTO({id, emailAddress, phoneNumber, firstName, lastName, createdDate=new Date().toISOString(), lastModified=null, isVerified=false }) {
    const userData = {
      id,  
      emailAddress, 
      phoneNumber: String(phoneNumber),
      firstName, 
      lastName,
      isVerified,
      createdDate, 
      lastModified
    };
  
  if(!userSchemaValidation(userData)) {
    throw new Error(`UserDTOError/InvalidUserDTO => ${JSON.stringify(userSchemaValidation.errors, null, 2)}`);
  }

  this.value = function() {
    return userData;
  }

}


/**
 * @typedef {Object} UserRoleDTO
 * @property {String} id 
 * @property {String} role
 * @property {String} createdDate  
 * @property {String|null} lastModified
 */

 /**
  * @param {String} id - uuid for a user
  * @param {String} role - role for a user
  * @param {String} createdDate - date the role was created
  * @param {String|null} lastModified - data role was last modified
  * @returns {UserRoleDTO}
  */

 function UserRoleDTO({id, role="user", createdDate=new Date().toISOString(), lastModified=null}) {
    const userRoleData = {
        id,
        role,
        createdDate,
        lastModified
    };
  
  if(!userRoleSchemaValidation(userRoleData)) {
    throw new Error(`UserRoleDTOError/InvalidUserRoleDTO => ${JSON.stringify(userRoleSchemaValidation.errors, null, 2)}`);
  }

  this.value = function() {
    return userRoleData;
  }

}






/**
 * @typedef {Object} UserCredentialsDTO
 * @property {String} userId 
 * @property {String} emailAddress
 * @property {String[]} password
 * @property {String} createdDate  
 * @property {String|null} lastModified
 */

 /**
  * @param {String} id - uuid for a user
  * @param {String} emailAddress - email address for a user
  * @param {String} password - user password hash
  * @param {String} createdDate - date the user credential was created
  * @param {String|null} lastModified - date the user credential was last modified
  * @returns {UserCredentialsDTO}
  */

 function UserCredentialsDTO({id, emailAddress, password, createdDate=new Date().toISOString(), lastModified=null}) {
    const userCredentialData = {
        id: emailAddress,
        userId: id,
        emailAddress,
        password,
        createdDate,
        lastModified
    };
  
  if(!userCredentialsSchemaValidation(userCredentialData)) {
    throw new Error(`UserCredentialsDTOError/InvalidUserCredentialsDTO => ${JSON.stringify(userCredentialsSchemaValidation.errors, null, 2)}`);
  }

  this.value = function() {
    return userCredentialData;
  }

}



module.exports = {
    UserDTO, 
    UserRoleDTO, 
    UserCredentialsDTO
};