function addChallenge() {
  console.log("addChallenge");

  if (!isLogin) {
    alert("必須登入後才能新增挑戰賽");
    return 0;
  }

  $("#challengeName").val("");  
  $("#").val("");
  $("#challengeOtherDesc").val("");
  $("#上傳訊息").text("圖片尚未選擇");
  $("#上傳挑戰賽圖片").attr("src", "");
  securePicUrl = "";
  
  //challengeNum++;
  $("#challengeNumber").text("新增挑戰賽 - C" + zeroFill(challengeNum+1, 4));

  $("#challengeTable").hide();
  $("#challengeHistoryTable").hide();
  $("#spacerBetweenTables").hide();

  $(".dataTables_filter").hide();
  $(".dataTables_info").hide();
  $('#challengeTable_paginate').hide();
  $('#challengeHistoryTable_paginate').hide();

  $("#addChallenge").show();


  $("#inProgress").hide();
  $("#addChallengeBtn").hide();
  $("#refreshBtn").hide();
  //      $("#addChallengeBtn").attr("disabled", true);
  //      $("#refreshBtn").attr("disabled", true);
}

function challengeConfirm() {
  console.log("challengeConfirm");

  if (!isLogin) {
    alert("必須登入後才能新增挑戰賽");
    return 0;
  }

  var startDate = new Date($("#challengeStartDate").val());
  var nextDate = new Date();
  //console.log(startDate);
  nextDate.setDate(startDate.getDate() - 7);
  var repeatTimes=$("#repeatN").val();
  //for (var i=0; i<repeatTimes; i++){
  for (var i=0; i<1; i++){
    challengeNum++;
    nextDate.setDate(nextDate.getDate() + 7);
    nextDateStr = nextDate.toLocaleDateString();
    nextDateStr = nextDateStr.replace(/\//g, "-");
    //console.log(challengeNum, nextDateStr);
    
    if(nextDate == "Invalid Date") {
      alert("有效期限日期錯誤");
      return 0;
    }
    
    var challengeNameTmp;
    challengeNameTmp = (repeatTimes>1)? $("#challengeName").val()+" ("+(i+1)+")":$("#challengeName").val();
    
    var dataToAdd = [
              "T" + zeroFill(challengeNum, 4),
              challengeNameTmp,
              //$("#challengeName").val(),
              //nextDateStr,
              $("#challengeStartDate").val()+"~"+$("#challengeEndDate").val(),
              $("#challengeOtherDesc").val(),
              securePicUrl,             
            ];

    console.log(dataToAdd);
    
    // 更新 local challengeData 及 challengeMember
    challengeData.push(dataToAdd);
    challengeMember.push(["T" + zeroFill(challengeNum, 4)]); //Fix bug:重複週期 新增挑戰賽 會只有增加最後一個挑戰賽 到 challengeMember
        
  }
  
  securePicUrl="";

  // 挑戰賽寫入資料庫
  database.ref('users/三峽運動中心/挑戰賽').set({
    現在挑戰賽: JSON.stringify(challengeData),
    過去挑戰賽: JSON.stringify(challengeHistory),
  }, function (error) {
    if (error) {
      console.log("Write to database error, revert challengeData back");
      challengeData.pop();
    }
    console.log('Write to database successful');
  });


  database.ref('users/三峽運動中心/挑戰賽管理').set({
    挑戰賽會員: JSON.stringify(challengeMember),
  }, function (error) {
    if (error) {
      //console.log(error);
      return 0;
    }
    console.log('Write to database successful');
  });

  // 更新挑戰賽表格
  var challengeTable = $('#challengeTable').DataTable();
  challengeTable.clear().draw();
  challengeTable.rows.add(challengeData);
  challengeTable.draw();

  $("#addChallenge").hide();
  $("#challengeTable").show();
  $("#spacerBetweenTables").show();
  $("#challengeHistoryTable").show();

  $(".dataTables_filter").show();
  $(".dataTables_info").show();
  $('#challengeTable_paginate').show();
  $('#challengeHistoryTable_paginate').show();

  $("#inProgress").show();
  $("#addChallengeBtn").show();
  $("#refreshBtn").show();
  //      $("#addChallengeBtn").attr("disabled", false);
  //      $("#refreshBtn").attr("disabled", false);      
}

function challengeCancel() {
  console.log("challengeCancel");
  //challengeNum--;
  $("#addChallenge").hide();
  $("#spacerBetweenTables").show();
  $("#challengeHistoryTable").show();
  $("#challengeTable").show();

  $(".dataTables_filter").show();
  $(".dataTables_info").show();
  $('#challengeTable_paginate').show();
  $('#challengeHistoryTable_paginate').show();

  $("#inProgress").show();
  $("#addChallengeBtn").show();
  $("#refreshBtn").show();
  //      $("#addChallengeBtn").attr("disabled", false);
  //      $("#refreshBtn").attr("disabled", false);       
}

function zeroFill(number, width) {
  width -= number.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
  }
  return number + ""; // always return a string
}

function refreshCourse() {
  console.log("Refresh Course");

  var challengeTable = $('#challengeTable').DataTable();
  challengeTable.clear().draw();
  challengeTable.rows.add(challengeData);
  challengeTable.draw();

  var challengeTable = $('#challengeHistoryTable').DataTable();
  challengeTable.clear().draw();
  challengeTable.rows.add(challengeHistory);
  challengeTable.draw();
}

function backToHome() {
  console.log("Refresh Course");

  $("#challengeDetailDiv").hide();

  $("#challengeTable").show();
  $("#challengeHistoryTable").show();
  $("#spacerBetweenTables").show();

  $(".dataTables_filter").show();
  $(".dataTables_info").show();
  $('#challengeTable_paginate').show();
  $('#challengeHistoryTable_paginate').show();
  $("#addChallenge").hide();
  $("#inProgress").show();
  $("#addChallengeBtn").show();
  $("#refreshBtn").show();
}

function challengeUpdate() {
  console.log("challengeUpdate");

  if (!isLogin) {
    alert("必須登入後才能更新挑戰賽");
    return 0;
  }

  var securityNum = Math.floor(Math.random()*8999+1000); 
  var securityStr = "確定要更新此挑戰賽，請輸入確認碼: " + String(securityNum);
  //console.log(prompt(securityStr));
  var confirmIt = prompt(securityStr) == securityNum;
  console.log("確認碼:", confirmIt);  

  if (!confirmIt) {
    alert("確認碼輸入錯誤，不進行更新動作");
    return 0;
  } else {
    var dataToReplace = [
      challengeNumber,
      $("#challengeDetail").val(),
      $("#challengeStartDateDetail").val()+"~"+$("#challengeEndDateDetail").val(),
      $("#challengeOtherDescDetail").val(),
      securePicUrl,
    ];

    //console.log(dataToReplace);
    
    // 尋找 challengeData 這筆資料，並取代
    for (var i =0; i< challengeData.length; i++){
      //console.log(challengeData[i][0]);
      if (challengeData[i][0]==challengeNumber) {
        challengeData[i] = dataToReplace;
        break;
      }
    }
        
    // 挑戰賽寫入資料庫
    database.ref('users/三峽運動中心/挑戰賽').set({
      現在挑戰賽: JSON.stringify(challengeData),
      過去挑戰賽: JSON.stringify(challengeHistory),
    }, function (error) {
      if (error) {
        console.log("Write to database error, revert challengeData back");
        challengeData.pop();
      }
      console.log('Write to database successful');
    });

    // 更新挑戰賽表格
    var challengeTable = $('#challengeTable').DataTable();
    challengeTable.clear().draw();
    challengeTable.rows.add(challengeData);
    challengeTable.draw();

    $("#challengeDetailDiv").hide();
    $("#challengeTable").show();
    $("#spacerBetweenTables").show();
    $("#challengeHistoryTable").show();

    $(".dataTables_filter").show();
    $(".dataTables_info").show();
    $('#challengeTable_paginate').show();
    $('#challengeHistoryTable_paginate').show();

    $("#inProgress").show();
    $("#addChallengeBtn").show();
    $("#refreshBtn").show();    

  }

}

function logInAndOut() {
  //  if (!isLogin) {
  //    $("#password").val("");
  //    $("#loginDiv").show();
  //  } else {
  //    firebase.auth().signOut();
  console.log(isLogin);
  if (!isLogin) {
    window.location.href = '0-login.html';
  } else {
    firebase.auth().signOut();
  }
}

//function signIn() {
//  //check email
//  if (!validateEmail($("#emailAddress").val())) {
//    $("#emailAddress").val("");
//    $("#emailAddress").attr("placeholder", "Email Address Error, try again!");
//    $("#emailAddress").css("background-color", "yellow");
//  } else {
//    $("#loginDiv").hide();
//    firebase.auth().signInWithEmailAndPassword($("#emailAddress").val(), $("#password").val()).catch(function (error) {
//      // Handle Errors here.
//      var errorCode = error.code;
//      var errorMessage = error.message;
//      alert("Login Error! Try again!")
//    });
//  }
//
//}

//function validateEmail(email) {
//  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//
//  return re.test(String(email).toLowerCase());
//}
//
//
//function signInAbort() {
//  $("#loginDiv").hide();
//}

//function addNewCoach() {
//  console.log("Query and Check coach");
//
//  var coachs = $('#coachList').DataTable();
//  coachs.clear().draw();
//  coachs.rows.add(coachSet);
//  coachs.draw();
//
//  $("#addChallenge").hide();
//  $("#coachTable").show();
//  $("#coachList_paginate").css({
//    "font-size": "16px"
//  });

//}



function memberManage() {
  console.log("客戶管理");

  if (!isLogin) {
    alert("必須登入後才能進行客戶管理");
    return 0;
  }

  window.location.href = '1-addMember.html';

  //  $("#memberDiv").show();
  //  var memberTable = $('#memberTable').DataTable();
  //  memberTable.clear().draw();
  //  memberTable.rows.add(memberData);
  //  memberTable.draw();
}

function closeMember() {
  console.log("關閉客戶管理");

  $("#memberDiv").hide();
}

function addMember() {
  console.log("新增客戶");

  $("#memberDiv").hide();
  $("#addMemberInfo").show();
}

function closeAddMember() {
  console.log("close addMemberInfo");
  $("#addMemberInfo").hide();
  $("#memberDiv").show();
}

function addMemberInfo() {
  console.log("確定新增會員");

  if (!isLogin) {
    alert("必須登入後才能進行新增客戶");
    return 0;
  }

  var dataToAdd = [
            $("#newMemberName").val(),
            $("#newMemberLINEId").val(),
            $("#newMemberGender").val(),
            $("#newMemberBirth").val(),
            $("#newMemberPhoneNum").val(),
            $("#newMemberIdNum").val(),
            $("#newMemberAssress").val(),
          ];

  //console.log(dataToAdd);

  // memberData 取回 完整的 LINE Id
  memberData.forEach(function(member, index, array){
    member[1]=memberLineId[index];
  });
  
  // 更新 local challengeData
  memberData.push(dataToAdd);


  // 客戶寫入資料庫
  database.ref('users/三峽運動中心/客戶管理').set({
    會員資料: JSON.stringify(memberData),
  }, function (error) {
    if (error) {
      console.log("Write to database error");
      challengeData.pop();
    }
    console.log('Write to database successful');
  });


  // 更新客戶表格  
  //  var memberTable = $('#memberTable').DataTable();
  //  memberTable.clear().draw();
  //  memberTable.rows.add(memberData);
  //  memberTable.draw();  
  //  
  //  $("#addMemberInfo").hide();
  //  $("#memberDiv").show(); 

}

// functions for Cloudinary
function readURL(input) {
  console.log("readURL");
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      console.log("aaa");
      $('#上傳挑戰賽圖片')
        .attr('src', e.target.result)
        .width(520)
        //.height(200);
      
      $("#上傳訊息").text("圖片尚未上傳");
      securePicUrl ="";
    };

    reader.readAsDataURL(input.files[0]);
  }
}

function readURL_detail(input) {
  console.log("readURL_detail");
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      console.log("bbb");
      $('#挑戰賽圖片')
        .attr('src', e.target.result)
        .width(520)
        //.height(200);
      
      $("#上傳訊息-詳細").text("圖片尚未上傳");
      securePicUrl ="";
    };

    reader.readAsDataURL(input.files[0]);
  }
}

function onProgress(){
  console.log(event.loaded, event.total);
} 

function onSuccess(){
  response = JSON.parse(this.responseText);
  
  securePicUrl = response.secure_url;
  
  if ( securePicUrl != undefined) {
    console.log("Success", securePicUrl);
    if ($("#上傳訊息").text() == "圖片上傳中 ...") $("#上傳訊息").text("圖片上傳成功");
    if ($("#上傳訊息-詳細").text() == "圖片上傳中 ...") $("#上傳訊息-詳細").text("圖片上傳成功");
  } else {
    alert("圖片上傳失敗");
    if ($("#上傳訊息").text() == "圖片上傳中 ...") $("#上傳訊息").text("圖片上傳失敗");
    if ($("#上傳訊息-詳細").text() == "圖片上傳中 ...") $("#上傳訊息-詳細").text("圖片上傳失敗");    
  }
}    
    
function uploadToCloudinary() {
  console.log("upload file to Cloudinary");
  
  var 需要上傳 = ($("#上傳訊息").text() == "圖片尚未上傳" );

  if ( !需要上傳 ){
    alert("圖片尚未選擇或圖片已上傳");
    return 0;
  }
  
  $("#上傳訊息").text("圖片上傳中 ...");
  
  var formElement =document.getElementById('picUpload')
  var dataToSend = new FormData(formElement)
  dataToSend.append("upload_preset",presetName);
  //console.log(dataToSend.getAll("upload_preset"));
  
  var xhr = new XMLHttpRequest();
  xhr.onprogress = onProgress;
  xhr.onload = onSuccess;
  xhr.open("post", cloudinaryPostUrl);
  console.log(dataToSend)
  xhr.send(dataToSend);
  
}

function updateToCloudinary() {
  console.log("update file to Cloudinary");
  
  var 需要上傳 = ($("#上傳訊息-詳細").text() == "圖片尚未上傳" );

  if ( !需要上傳 ){
    alert("圖片尚未選擇或圖片已上傳");
    return 0;
  }
  
  $("#上傳訊息-詳細").text("圖片上傳中 ...");
  
  var formElement =document.getElementById('picUpdate')
  var dataToSend = new FormData(formElement)
  dataToSend.append("upload_preset",presetName);
  //console.log(dataToSend.getAll("upload_preset"));
  
  var xhr = new XMLHttpRequest();
  xhr.onprogress = onProgress;
  xhr.onload = onSuccess;
  xhr.open("post", cloudinaryPostUrl);
  xhr.send(dataToSend);  
}

//======= Using Imgur ==============
function uploadToImgur() {
  console.log("upload file to Imgur");
  
  var 需要上傳 = ($("#上傳訊息").text() == "圖片尚未上傳" );

  if ( !需要上傳 ){
    alert("圖片尚未選擇或圖片已上傳");
    return 0;
  }
  
  $("#上傳訊息").text("圖片上傳中 ...");
  

  var myHeaders = new Headers();
  myHeaders.append("Authorization", bearerId);
  //myHeaders.append("Authorization", clientId);

  var selectedFile=$("#file-upload").get(0).files;
  console.log(selectedFile[0].size); // 可以查看檔案大小


  var formdata = new FormData();
  formdata.append("image", selectedFile[0]);

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
  };

  fetch("https://api.imgur.com/3/image", requestOptions)
  .then(response => response.text())
  .then(result => {
    var returnObj = JSON.parse(result);
    console.log(returnObj.data.link);

    securePicUrl = returnObj.data.link;

    if ( securePicUrl != undefined) {
      console.log("Success", securePicUrl);
      if ($("#上傳訊息").text() == "圖片上傳中 ...") $("#上傳訊息").text("圖片上傳成功");
      if ($("#上傳訊息-詳細").text() == "圖片上傳中 ...") $("#上傳訊息-詳細").text("圖片上傳成功");
    } else {
      alert("圖片上傳失敗");
      if ($("#上傳訊息").text() == "圖片上傳中 ...") $("#上傳訊息").text("圖片上傳失敗");
      if ($("#上傳訊息-詳細").text() == "圖片上傳中 ...") $("#上傳訊息-詳細").text("圖片上傳失敗");    
    }    
  })
  .catch(error => console.log('Upload to Imgur error', error));
  
}

function updateToImgur() {
  console.log("update file to Imgur");
  
  var 需要上傳 = ($("#上傳訊息-詳細").text() == "圖片尚未上傳" );

  if ( !需要上傳 ){
    alert("圖片尚未選擇或圖片已上傳");
    return 0;
  }
  
  $("#上傳訊息-詳細").text("圖片上傳中 ...");

  var myHeaders = new Headers();
  myHeaders.append("Authorization", bearerId);
  //myHeaders.append("Authorization", clientId);

  var selectedFile=$("#file-update").get(0).files;
  console.log(selectedFile[0].size); // 可以查看檔案大小


  var formdata = new FormData();
  formdata.append("image", selectedFile[0]);

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
  };

  fetch("https://api.imgur.com/3/image", requestOptions)
  .then(response => response.text())
  .then(result => {
    var returnObj = JSON.parse(result);
    console.log(returnObj.data.link);

    securePicUrl = returnObj.data.link;

    if ( securePicUrl != undefined) {
      console.log("Success", securePicUrl);
      if ($("#上傳訊息").text() == "圖片上傳中 ...") $("#上傳訊息").text("圖片上傳成功");
      if ($("#上傳訊息-詳細").text() == "圖片上傳中 ...") $("#上傳訊息-詳細").text("圖片上傳成功");
    } else {
      alert("圖片上傳失敗");
      if ($("#上傳訊息").text() == "圖片上傳中 ...") $("#上傳訊息").text("圖片上傳失敗");
      if ($("#上傳訊息-詳細").text() == "圖片上傳中 ...") $("#上傳訊息-詳細").text("圖片上傳失敗");    
    }    
  })
  .catch(error => console.log('Upload to Imgur error', error));
  
}