// Cloudinary post URL
//var cloudinaryPostUrl = "https://api.cloudinary.com/v1_1/beida-ugym/image/upload";
//var presetName = "llftctau"

// 改為 Cloudinary beida-challenge 帳號
//var cloudinaryPostUrl = "https://api.cloudinary.com/v1_1/beida-challenge/image/upload";
//var presetName = "ntb4ppf4"

// 改為使用 Imgur BeiDa-Challenge 帳號
var bearerId = "Bearer 5130399359e4fe9be958edd10450a8763df34277";
var clientId = "Client-ID e113d4b4cf3d463";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyC8XdbhwMkdyC5N3Nit3NRcIBKbjWEqjww",
  authDomain: "ugym-beida.firebaseapp.com",
  databaseURL: "https://ugym-beida.firebaseio.com",
  projectId: "ugym-beida",
  storageBucket: "ugym-beida.appspot.com",
  messagingSenderId: "1054766854677",
  appId: "1:1054766854677:web:56615d24634c799334941c",
  measurementId: "G-7V4C3BW5VL"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// analytic 功能先不用
//firebase.analytics();

var database = firebase.database();

var isLogin = false;
firebase.auth().onAuthStateChanged(function (user) {
  console.log(user);

  if (user == null) {
    // not login
    console.log("no login");
    $("#loginStatus").text("請登入來寫入資料庫");
    $("#logToggle").text("登入");
    isLogin = false;
    $("#memberMangementBtn").attr("disabled", true);
    $("#addChallengeBtn").attr("disabled", true);
    
    //以下三行不知為何沒作用
//    $("#challengeDueBtn").attr("disabled", true);    
//    $("#challengeDetailBtn").attr("disabled", true);        
//    $("#challengeDeleteBtn").attr("disabled", true); 
    
//    var aaa = $('#challengeTable').DataTable();
//    console.log(aaa);
//    aaa.buttons.disable();    
    
  } else {
    // login
    console.log(user.email);
    $("#loginStatus").text("Hello " + user.email);
    $("#logToggle").text("登出");
    isLogin = true;
    $("#memberMangementBtn").attr("disabled", false);
    $("#addChallengeBtn").attr("disabled", false);
    
    //以下三行不知為何沒作用    
//    $("#challengeDueBtn").attr("disabled", false);    
//    $("#challengeDetailBtn").attr("disabled", false);        
//    $("#challengeDeleteBtn").attr("disabled", false);     
  }
});

function readFromDB() {
  console.log("Read Database");

  $.loading.start('Loading data');

  var toRead = 4;
  var readTimes = 0;
  firebase.database().ref('users/三峽運動中心/挑戰賽').once('value').then(function (snapshot) {
    console.log("data read done");
    readTimes++;
    var result = snapshot.val();
    challengeData = JSON.parse(result.現在挑戰賽);
    challengeHistory = JSON.parse(result.過去挑戰賽);

    if (challengeData.length>0) {
      var tmp1 = challengeData[challengeData.length - 1][0];
      var tmp2 = parseInt(tmp1.substr(1, 4));
    } else tmp2 = 0;

    if (challengeHistory.length>0) {    
      var tmp3 = challengeHistory[challengeHistory.length - 1][0];
      var tmp4 = parseInt(tmp3.substr(1, 4));  
    } else tmp4 = 0;
 
    challengeNum = (tmp4 > tmp2)? tmp4:tmp2;
    
    //console.log(challengeNum);

    refreshCourse();

    if (readTimes == toRead) $.loading.end();
  });

  firebase.database().ref('users/三峽運動中心/客戶管理').once('value').then(function (snapshot) {
    console.log("member read done");
    readTimes++;
    var result = snapshot.val();
    memberData = JSON.parse(result.會員資料);

    if (readTimes == toRead) $.loading.end();
  });

  firebase.database().ref('users/三峽運動中心/挑戰賽管理').once('value').then(function (snapshot) {
    console.log("challenge read done");
    readTimes++;
    var result = snapshot.val();
    console.log()
    challengeMember = JSON.parse(result.挑戰賽會員);

    if (readTimes == toRead) $.loading.end();
  });
  
  firebase.database().ref('users/三峽運動中心/教練管理').once('value').then(function (snapshot) {
    console.log("Coach read done");
    readTimes++;
    var result = snapshot.val();
    coachSet = JSON.parse(result.老師資料);

    if (readTimes == toRead) $.loading.end();
  });  
  
  //challengeMemberSet = [ ["姓名", "aaa", "bbb"] ];

}

function readMemberfromDB() {
  console.log("Read memberData Database");  
  
  var toRead = 1;
  var readTimes = 0;  
  
  $.loading.start('Loading data')
  firebase.database().ref('users/三峽運動中心/客戶管理').once('value').then(function (snapshot) {
    console.log("member read done");
    readTimes++;
    var result = snapshot.val();
    memberData = JSON.parse(result.會員資料);

    if (readTimes == toRead) $.loading.end();
    
    // 更新客戶表格
//    var memberTable = $('#memberTable').DataTable();
//    memberTable.clear().draw();
//    memberTable.rows.add(memberData);
//    memberTable.draw();
    
    
  });  
}