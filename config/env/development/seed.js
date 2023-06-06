module.exports = {
    seed: true,
    Permission: [{
        permission: 'CREATE_ROLE'
    }, {
        permission: 'UPDATE_ROLE'
    }, {
        permission: 'DELETE_ROLE'
    }, {
        permission: 'GET_ROLE'
    }, {
        permission: 'ASSIGN_ROLE_TO_USER'
    }, {
        permission: 'REMOVE_PERMISSION_FROM_USER'
    }, {
        permission: 'ASSIGN_PERMISSION_TO_USER'
    }, {
        permission: 'CREATE_PERMISSION'
    }, {
        permission: 'UPDATE_PERMISSION'
    }, {
        permission: 'DELETE_PERMISSION'
    }, {
        permission: 'GET_PERMISSION'
    }, {
        permission: 'GET_PERSON'
    },{
        permission: 'DELETE_PERSON'
    },{
        permission: 'CREATE_PERSON'
    },{
        permission: 'UPDATE_PERSON'
    },{
        permission: 'APPROVE_REGISTRATION'
    },{
        permission: 'APPROVE_WITHDRAWL_REQUEST'
    }],
    Role: [{
        name: 'ADMIN'
    }, {
        name: 'AGENT'
    }, {
        name: 'GUEST'
    }],

    Person:[{
        n: 'Administrator',
        e: 'admin@ournetwork.com',
        m:'+917007788122'
    }],
};