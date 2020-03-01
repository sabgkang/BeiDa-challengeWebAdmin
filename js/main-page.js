function initMainPage() {
  $("#loginDiv").hide();
  $("#addChallenge").hide();
//  $("#coachTable").hide();
//  $("#challengeDetailDiv").hide();
  $("#newCoachInfo").hide();
  $("#memberDiv").hide();
  $("#addMemberInfo").hide();
  

  var challengeTable = $('#challengeTable').DataTable({
    order: [[ 0, "desc" ]],
    data: challengeData,
    pageLength: 8,
    lengthChange: false,
    deferRender: true,
    columns: [{ //title: "挑戰賽編號"
        className: "centerCell"
              },
      {
        //title: "挑戰賽內容", 不對中，對左
              },
      {
        //title: "有效期限"
        className: "centerCell"
              },

      {
        //title: "操作",
        data: null,
        defaultContent: "<button id='challengeDueBtn' class = 'dueButton to-edit'>到期</button> " +
          "<button id='challengeDetailBtn' class = 'detailButton to-edit'>詳細</button> " +
          "<button id='challengeDeleteBtn' class = 'deleteButton to-delete'>刪除</button>"
              }
            ]
  });

  $('#challengeTable tbody').on('click', '.dueButton', function () {
    console.log("Due is clicked");

    if (!isLogin) {
      alert("必須登入後才能修改");
      return 0;
    }
  
    var securityNum = Math.floor(Math.random()*8999+1000); 
    var securityStr = "確定要將挑戰賽過期!無法回復! 請輸入確認碼: " + String(securityNum);
    //console.log(prompt(securityStr));
    var confirmIt = prompt(securityStr) == securityNum;
    console.log("確認碼:", confirmIt);
    
    if (!confirmIt) {
      alert("確認碼輸入錯誤，不進行挑戰賽過期動作");
      return 0;     
    }
    
    var data = challengeTable.row($(this).parents('tr')).data();
    console.log("due:" + data[0]);

    challengeHistory.push(data);

    challengeData = challengeData.filter(function (value, index, arr) {
      return value[0] != data[0];
    });

    // 更新 challengeNum
    if (challengeData.length>0) {
      var tmp1 = challengeData[challengeData.length - 1][0];
      var tmp2 = parseInt(tmp1.substr(1, 4));
    } else tmp2 = 0;

    if (challengeHistory.length>0) {    
      var tmp3 = challengeHistory[challengeHistory.length - 1][0];
      var tmp4 = parseInt(tmp3.substr(1, 4));  
    } else tmp4 = 0;

    challengeNum = (tmp4 > tmp2)? tmp4:tmp2;

    // 更新 database
    database.ref('users/三峽運動中心/挑戰賽').set({
      現在挑戰賽: JSON.stringify(challengeData),
      過去挑戰賽: JSON.stringify(challengeHistory),
    }, function (error) {
      if (error) {
        //console.log(error);
        return 0;
      }
      console.log('Write to database successful');
    });

    challengeTable.clear().draw();
    challengeTable.rows.add(challengeData);
    challengeTable.draw();

    challengeHistoryTable.clear().draw();
    challengeHistoryTable.rows.add(challengeHistory);
    challengeHistoryTable.draw();

  });

  $('#challengeTable tbody').on('click', '.detailButton', function () {
    console.log("Detail is clicked");
    
    if (!isLogin) {
      alert("必須登入後才能查看");
      return 0;
    }    
    
    challengeMemberSet=[];

    $("#challengeTable").hide();
    $("#challengeHistoryTable").hide();
    $("#spacerBetweenTables").hide();

    //$(".dataTables_filter").hide();
    //$(".dataTables_info").hide();
    $('#challengeTable_filter').hide();
    $('#challengeTable_info').hide();
    $('#challengeTable_paginate').hide();
    $('#challengeHistoryTable_filter').hide();
    $('#challengeHistoryTable_info').hide();
    $('#challengeHistoryTable_paginate').hide();
    $("#addChallenge").hide();
    $("#inProgress").hide();
    $("#addChallengeBtn").hide();
    $("#refreshBtn").hide();

    $("#challengeMemberTable_filter").css({
      "font-size": "16px"
    });
    $("#challengeMemberTable_info").css({
      "font-size": "16px"
    });
    $("#challengeMemberTable_paginate").css({
      "font-size": "16px"
    });

    var data = challengeTable.row($(this).parents('tr')).data();
    //console.log("detail:" + data[0]);

    $("#challengeNumberDetail").text("挑戰賽頁面 - " + data[0] + " "+ data[1]);
    
    challengeNumber = data[0];
    var datePeriod = data[2].split("~"); 
    $("#challengeDetail").val(data[1]);
    $("#challengeStartDateDetail").val(datePeriod[0]);
    $("#challengeEndDateDetail").val(datePeriod[1]);    
    $("#challengeOtherDescDetail").val(data[3]);
    
    challengeData.forEach(function(item, index, array){
      if (item[0]==data[0]) {
        console.log("challenge matched");
        $("#挑戰賽圖片").attr("src", item[4]);
        securePicUrl = item[4];
      }
    });

    challengeMember.forEach(function (item, index, array) {
      if (item[0] == data[0]) {
        item.shift();

        var tmp1 = [];
        item.forEach(function (item1, index, array) {
          memberData.forEach(function (item2, index, array) {
            if (item1[4] == item2[3]) {
              tmp1 = item2;
            };
          });

          // Convert 
          var dataToAdd = tmp1.slice(0,1);

          dataToAdd.push(tmp1.slice(3,4)[0]);
          dataToAdd.push(item1[1], item1[2]);

          challengeMemberSet.push(dataToAdd);
        });

        item.unshift(data[0]);
      }
    });

    challengeMemberTable.clear().draw();
    challengeMemberTable.rows.add(challengeMemberSet);
    challengeMemberTable.draw();

    $("#challengeDetailDiv").show();

  });

  $("#challengeTable tbody").on('click', '.deleteButton', function () {
    // delete button
    console.log("delete:");
    if (!isLogin) {
      alert("必須登入後才能刪除");
      return 0;
    }
  
    var securityNum = Math.floor(Math.random()*8999+1000); 
    var securityStr = "確定要刪除此挑戰賽!無法回復! 請輸入確認碼: " + String(securityNum);
    //console.log(prompt(securityStr));
    var confirmIt = prompt(securityStr) == securityNum;
    console.log("確認碼:", confirmIt);
    
    if (!confirmIt) {
      alert("確認碼輸入錯誤，不進行挑戰賽刪除動作");
      return 0;     
    }    

    var data = challengeTable.row($(this).parents('tr')).data();
    

    //console.log("dddd");
    challengeData = challengeData.filter(function (value, index, arr) {
      return value[0] != data[0];
    });

    // 更新 challengeNum
    if (challengeData.length>0) {
      var tmp1 = challengeData[challengeData.length - 1][0];
      var tmp2 = parseInt(tmp1.substr(1, 4));
    } else tmp2 = 0;

    if (challengeHistory.length>0) {    
      var tmp3 = challengeHistory[challengeHistory.length - 1][0];
      var tmp4 = parseInt(tmp3.substr(1, 4));  
    } else tmp4 = 0;

    challengeNum = (tmp4 > tmp2)? tmp4:tmp2;

    // 更新 database
    database.ref('users/三峽運動中心/挑戰賽').set({
      現在挑戰賽: JSON.stringify(challengeData),
      過去挑戰賽: JSON.stringify(challengeHistory),
    }, function (error) {
      if (error) {
        //console.log(error);
        return 0;
      }
      console.log('Write to database successful');
    });

    challengeMember = challengeMember.filter(function (value, index, arr) {
      return value[0] != data[0];
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

    console.log(challengeData);
    challengeTable.clear().draw();
    challengeTable.rows.add(challengeData);
    challengeTable.draw();

  });

  var challengeHistoryTable = $('#challengeHistoryTable').DataTable({
    order: [[ 0, "desc" ]],
    data: challengeHistory,
    pageLength: 8,
    deferRender: true,
    lengthChange: false,
    columns: [{ //title: "挑戰賽編號"
        className: "centerCell"
              },
      {
        //title: "挑戰賽內容", 不對中，對左
              },
      {
        //title: "有效期限"
        className: "centerCell"
              },

      {
        //title: "操作",
        className: "centerCell",
        data: null,
        defaultContent: "<button class='copyButton to-edit' style='width: 150px'>複製新增挑戰賽</button>" 
              }              

            ]
  });
  
  $('#challengeHistoryTable tbody').on('click', '.copyButton', function () {
    console.log("Copy challenge");
    
    var data = challengeHistoryTable.row($(this).parents('tr')).data();     

    console.log(data);
    $("#challengeName").val(data[1]);
    //$("#challengeDate").val(data[2]);
    $("#challengeOtherDesc").val(data[3]);

    
    addChallenge();
      
  });

  var challengeMemberTable = $('#challengeMemberTable').DataTable({
    order: [[ 2, "desc" ]],
    data: challengeMemberSet,
    pageLength: 8,
    lengthChange: false,
    deferRender: true,
    columns: [{ //title: "客戶姓名"
        className: "centerCell"
              },
      { //title: "電話號碼"
        className: "centerCell"
              },
      {
        //title: "參加"
        className: "centerCell"
              },
      {
        //title: "確認"
        className: "centerCell"
              },
      {
        //title: "操作",
        className: "centerCell",
        data: null,
        defaultContent: "<button class = 'cancelUsingChallenge to-edit' style='width:80px'>取消參加</button> " 
                      + "<button class = 'confirmUsingChallenge to-edit' style='width:90px'>確認參加</button> "      
       
              }
            ]
  });
  
  $('#challengeMemberTable tbody').on('click', '.cancelUsingChallenge', function () {
    console.log("cancelUsingChallenge is clicked");
    
    var securityNum = Math.floor(Math.random()*8999+1000); 
    var securityStr = "確定取消挑戰賽，請輸入確認碼: " + String(securityNum);
    //console.log(prompt(securityStr));
    var confirmIt = prompt(securityStr) == securityNum;
    console.log("確認碼:", confirmIt);
    
    if (!confirmIt) {
      alert("確認碼輸入錯誤，不進行取消動作");
      return 0;     
    }
    

    //var data = challengeMemberTable.row($(this)).data();
    var data = challengeMemberTable.row($(this).parents('tr')).data();    
    //console.log(data[0]);
    
    var thisChallenge;
    var thisIndex;
    challengeMember.forEach(function(item, index, array) {
      //console.log(item[1][0]);
      if (item[0]== challengeNumber) {
        //console.log(item, data[0]);
        thisChallenge = item;
        thisIndex = index;
      }
    });
      
    //console.log(thisCourse, thisIndex, data[0]);
      
    var thisChallengeLength = thisChallenge.length;
    var thisI;
    for (var i = 0; i < thisChallengeLength; i++) {
      if (thisChallenge[i][4] == data[1]) { //比對用戶電話號碼
        //console.log(thisChallenge[i], thisIndex, i);
        thisI = i;
      };
    }   
    
    //console.log(challengeMember[thisIndex][thisI][0],challengeMember[thisIndex][thisI][1]);
    //challengeMember[thisIndex][thisI][1] = "未";
    challengeMember[thisIndex].splice(thisI, 1); //整個 ["小白","已","已確認","U002","09XXXXX222"] 都刪掉

    // Update challengeMemberSet 及其 Table  
    for (var i=0; i< challengeMemberSet.length; i++){
      //console.log(challengeMemberSet[i][0], data[0]);
      if (challengeMemberSet[i][0] == data[0]) { 
        //console.log("match");
        //challengeMemberSet[i][1] = "未";
        thisI = i;
      };
    };
    
    challengeMemberSet.splice(thisI, 1); //整個 ["小白","已","已確認","U002","09XXXXX222"] 都刪掉
    
    var table = $('#challengeMemberTable').DataTable();
    table.clear().draw();
    table.rows.add(challengeMemberSet);
    table.draw();    
    
    // Write challengeMember to database
    database.ref('users/三峽運動中心/挑戰賽管理').set({
      挑戰賽會員: JSON.stringify(challengeMember),
    }, function (error) {
      if (error) {
        //console.log(error);
        return 0;
      }
      console.log('Write to database successful');
    }); 
    
  });

  $('#challengeMemberTable tbody').on('click', '.confirmUsingChallenge', function () {
    console.log("confirmUsingChallenge is clicked");
    
    var securityNum = Math.floor(Math.random()*8999+1000); 
    var securityStr = "確定挑戰賽，請輸入確認碼: " + String(securityNum);
    //console.log(prompt(securityStr));
    var confirmIt = prompt(securityStr) == securityNum;
    console.log("確認碼:", confirmIt);
    
    if (!confirmIt) {
      alert("確認碼輸入錯誤，不進行確認動作");
      return 0;    
    }    

    //var data = challengeMemberTable.row($(this)).data();
    var data = challengeMemberTable.row($(this).parents('tr')).data();    
    //console.log(data[0]);
    
    var thisChallenge;
    var thisIndex;
    challengeMember.forEach(function(item, index, array) {
      //console.log(item[1][0]);
      if (item[0]== challengeNumber) {
        //console.log(item, data[0]);
        thisChallenge = item;
        thisIndex = index;
      }
    });
      
    //console.log(thisCourse, thisIndex, data[0]);
      
    var thisChallengeLength = thisChallenge.length;
    var thisI;
    for (var i = 0; i < thisChallengeLength; i++) {
      if (thisChallenge[i][4] == data[1]) {
        //console.log(thisChallenge[i], thisIndex, i);
        thisI = i;
      };
    }   
    
    //console.log(challengeMember[thisIndex][thisI][2]);
    challengeMember[thisIndex][thisI][2] = "已確認";

    // Update challengeMemberSet 及其 Table
    for (var i=0; i< challengeMemberSet.length; i++){
      //console.log(challengeMemberSet[i][0], data[0]);
      if (challengeMemberSet[i][0] == data[0]) {
        console.log("match");
        challengeMemberSet[i][3] = "已確認";
      };
    };
    
    var table = $('#challengeMemberTable').DataTable();
    table.clear().draw();
    table.rows.add(challengeMemberSet);
    table.draw();  
    
    // Write challengeMember to database
    database.ref('users/三峽運動中心/挑戰賽管理').set({
      挑戰賽會員: JSON.stringify(challengeMember),
    }, function (error) {
      if (error) {
        //console.log(error);
        return 0;
      }
      console.log('Write to database successful');
    });
    
  });  

  $("#challengeDetailDiv").hide();
  
//  $('#challengeMemberTable tbody').on('click', '.resetButton', function () {
//    var confirmIt = confirm("請確定要重置!");
//    if (!confirmIt) return 0;
//    
//    console.log("resetButton is clicked");
//
//    //var data = challengeMemberTable.row($(this)).data();
//    var data = challengeMemberTable.row($(this).parents('tr')).data();    
//    //console.log(data[0]);
//    
//    var thisCourse;
//    var thisIndex;
//    challengeMember.forEach(function(item, index, array) {
//      //console.log(item[1][0]);
//      if (item[0]== challengeNumber) {
//        //console.log(item, data[0]);
//        thisCourse = item;
//        thisIndex = index;
//      }
//    });
//      
//    //console.log(thisCourse, thisIndex, data[0]);
//      
//    var thisCourseLength = thisCourse.length;
//    var thisI;
//    for (var i = 0; i < thisCourseLength; i++) {
//      if (thisCourse[i][0] == data[0]) {
//        //console.log(thisCourse[i], thisIndex, i);
//        thisI = i;
//      };
//    }   
//    
//    //console.log(challengeMember[thisIndex][thisI][0],challengeMember[thisIndex][thisI][1]);
//    challengeMember[thisIndex][thisI][1] = "未繳費";
//    challengeMember[thisIndex][thisI][2] = "未簽到";
//
//    // Update challengeMemberSet 及其 Table  
//    for (var i=0; i< challengeMemberSet.length; i++){
//      //console.log(challengeMemberSet[i][0], data[0]);
//      if (challengeMemberSet[i][0] == data[0]) {
//        //console.log("match");
//        challengeMemberSet[i][5] = "未繳費";
//        challengeMemberSet[i][6] = "未簽到";
//      };
//    };
//    
//    var table = $('#challengeMemberTable').DataTable();
//    table.clear().draw();
//    table.rows.add(challengeMemberSet);
//    table.draw();    
//    
//    // Write challengeMember to database
//    database.ref('users/三峽運動中心/挑戰賽管理').set({
//      挑戰賽會員: JSON.stringify(challengeMember),
//    }, function (error) {
//      if (error) {
//        //console.log(error);
//        return 0;
//      }
//      console.log('Write to database successful');
//    });
//    
//  });
  
}



var coachList = $('#coachList').DataTable({
  data: coachSet,
  //ordering: false,
  pageLength: 14,
  lengthChange: false,
  deferRender: true,
  columns: [
    { //title: "老師姓名"
      className: "centerCell"
    },
    {
      //title: "性別"
      className: "centerCell"
    },
    {
      //title: "其他說明"
    }
  ]
});

$('#coachList tbody').on('click', 'tr', function () {
  console.log("coach is clicked");


  var data = coachList.row($(this)).data();
  console.log(data);
  $("#challengeName").val(data[0]);
  $("#addChallenge").show();
//  $("#coachTable").hide();

});