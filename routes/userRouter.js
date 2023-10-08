const userCtrl = require("../controllers/userCtrl");
const router = require("express").Router();

//     /api/user

router.route('/login').post(userCtrl.makeLogin);
router.route('/new-user').post(userCtrl.makeUser);
router.route('/').get(userCtrl.getUser);
router.route('/accessToken').get(userCtrl.accessToken);;
router.route("/refreshToken").get(userCtrl.refreshToken);
router.route('/login/success').get(userCtrl.loginSuccess);
router.route('/logout').post(userCtrl.logout);







module.exports = router;