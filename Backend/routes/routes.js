/*
    File Name : routes
    v1.0
    Description : It is for routing to post and get apis.
    Developed By : Ishan Bhatt
*/

var express = require('express');
var multer = require('multer');
var passport = require('../db/passport');
var googlePassport = require('../db/google.passport');
var config = require('../db/config');

//Middlewares
var verifySignUp = require('../middleware/verifySignUp');

//Controllers
var authController = require('../controller/auth.controller');
var reqController = require('../controller/req.controller');
var userController = require('../controller/user.controller');
var chatController = require('../controller/chat.controller');

var path = require('path');
var router = express.Router();

//All used varibles
var upload = multer({ dest: '../public' }) ;
var toUser;

//Stores data to database in userNews collection
router.post('/saveUserData', upload.single('file') , authController.signup);

//Authenticate User from login
router.post('/userAuthentication' ,authController.signin);

//Google Sign up
router.post('/saveGoogleData', authController.saveGoogleData);

//For API_Progress (Testing Only)
router.post('/apiProgress', authController.apiProgress);

//root route
router.get('/', authController.loginPage);

//Load footer script
router.get('/footerScript', (req, res) => {
    res.sendFile(path.resolve('footer.html'));
});

//Load signup.html
router.get('/registration', (req,res) => {
    res.sendFile(path.resolve('../Frontend/view/signup.html'));
});

//Get load users.html file
router.get('/users', authController.indexPage);

//Load profile.html file
router.get('/userProfile', userController.userProfile);

//Get Logged User Data 
router.post('/getLoggedUserData',passport.authenticate('jwt', ({session : false})), userController.getLoggedUserData);

//Get Logged User Data 
router.post('/checkToken',passport.authenticate('jwt', ({session : false})), authController.checkToken);

//Update User Data 
router.post('/updateUserData', passport.authenticate('jwt', ({session : false})), userController.updateUserData);

//Global Search
router.post('/globalSearch', passport.authenticate('jwt', ({session : false})), userController.globalSearch);

//Session destroy on logout
router.get('/logout', authController.signout);

//For showing all requested users
router.post('/getRequests', passport.authenticate('jwt', ({session : false})), reqController.getRequests);

//Show all requests to logged in user
router.get('/showAllRequests',  reqController.showAllReq);

//When user accpets the request
router.post('/acceptRequest', passport.authenticate('jwt', ({session : false})), reqController.acceptReq);

//When user rejects the request
router.post('/rejectRequest', passport.authenticate('jwt', ({session : false})), reqController.rejectReq); 

//For checking request status if pending/accepted/rejected 
router.post('/getRequestStatus', passport.authenticate('jwt', ({session : false})), reqController.getReqStatus);

//Get notification count using read_status 
router.post('/getNotificationCount', passport.authenticate('jwt', ({session : false})), reqController.notificationCount);

//Get users who are not friends of logged in user
router.get('/getAllUser', passport.authenticate('jwt', ({session : false})), userController.getNonFriends);

//Get user's friends from DB
router.get('/getFriends', passport.authenticate('jwt', ({session : false})), userController.getFriends);

//Show chat application page
router.get('/privateChat' , chatController.privateChatPage);

//Show chat messages from DB
router.post('/getChatHistory', passport.authenticate('jwt', ({session : false})), chatController.getMessages);

//Get all unread messages from DB
router.post('/getUnreadMessages', passport.authenticate('jwt', ({session : false})), chatController.getUnreadMessages);

//Store Group Details 
router.post('/createGroup', passport.authenticate('jwt', ({session : false})), chatController.createGroup);

//Load the group window
router.get('/gruopChat', chatController.groupChat);

//Get details of particular group 
router.post('/getGroupDetails', passport.authenticate('jwt', ({session : false})), chatController.getGroupDetails);

//Get user associated group list
router.get('/getGroupList', passport.authenticate('jwt', ({session : false})), chatController.getGroupList);

//Get Group Chat History
router.post('/getGroupChatHistory', passport.authenticate('jwt', ({session : false})), chatController.getGroupChatHistory);

//Add extra members to particular group
router.post('/addGroupMembers', passport.authenticate('jwt', ({session : false})), chatController.addGroupMembers);

//Remove Members 
router.post('/removeGroupMembers', passport.authenticate('jwt', ({session : false})), chatController.removeGroupMembers);

//Group Setting Page
router.get('/groupSetting', chatController.groupSetting);

//Get particular group data
router.post('/getGroupData', passport.authenticate('jwt', ({session : false})), chatController.getGroupData);

//updateGroupData
router.post('/updateGroupData', passport.authenticate('jwt', ({session : false})), chatController.updateGroupData);

//Get Particular group admin data from user table
router.post('/getMembersData', passport.authenticate('jwt', ({session : false})), chatController.getMembersData);

//Leave Group 
router.post('/leaveGroup', passport.authenticate('jwt', ({session : false})), chatController.leaveGroup);

//Update read_status in DB
router.post('/updateOnlineStatus', passport.authenticate('jwt', ({session : false})), chatController.updateOnlineStatus1);

//Update group online status = true
router.post('/updateGroupOnlieeStatus', passport.authenticate('jwt', ({session : false})), chatController.updateGroupOnlieeStatus);

//Update group online status = false
router.post('/updateGroupOfflineStatus', passport.authenticate('jwt', ({session : false})), chatController.updateGroupOfflineStatus);

//readChat
router.post('/readChat', passport.authenticate('jwt', ({session : false})), chatController.readChat);

//Get unread group messages 
router.post('/getGroupUnreadMessages', passport.authenticate('jwt', ({session : false})), chatController.getGroupUnreadMessages);

//Get details of friend whenever user click on particular li
router.post('/getFriendDetails', passport.authenticate('jwt', ({session : false})), chatController.getFriendDetails);

//Donwload Image 
router.post('/downloadImage', passport.authenticate('jwt', ({session : false})), chatController.donwloadImage);

//Video Call
router.get('/videoCall', chatController.videoCall)

//Exports Router to index.js
module.exports = router;
