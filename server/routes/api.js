/*
 * Define routes for API
 */

export default [
    'get /users UserController@getUsers',
    'get /test UserController@test add-timestamp',
    'post /users UserController@saveUser add-timestamp'
];