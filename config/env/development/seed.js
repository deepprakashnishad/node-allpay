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
    },],
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
    Merchant:[{
        name: 'Merchant 1',
        website: "https://merchant-example1.com",
        status: 'ACTIVE'
    }, {
        name: 'Merchant 2',
        website: "https://merchant-example2.com",
        status: 'ACTIVE'
    }, {
        name: 'Merchant 3',
        website: "https://merchant-example3.com",
        status: 'ACTIVE'
    }, {
        name: 'Merchant 4',
        website: "https://merchant-example4.com",
        status: 'ACTIVE'
    }],
    PaymentGateway:[{
        name: 'Cashfree',
        status: 'ACTIVE',
        apikey: 'asdsadsadsadasd',
        apisecret: 'lskdmflsdkflkasdfsadfdsa',
        comments: ''
    }, {
        name: 'RazorPay',
        status: 'ACTIVE',
        apikey: 'asdsadsadsadasd',
        apisecret: 'lskdmflsdkflkasdfsadfdsa',
        comments: ''
    }, {
        name: 'Paytm',
        status: 'ACTIVE',
        apikey: 'asdsadsadsadasd',
        apisecret: 'lskdmflsdkflkasdfsadfdsa',
        comments: ''
    }, {
        name: 'PhonePe',
        status: 'ACTIVE',
        apikey: 'asdsadsadsadasd',
        apisecret: 'lskdmflsdkflkasdfsadfdsa',
        comments: ''
    }],
};