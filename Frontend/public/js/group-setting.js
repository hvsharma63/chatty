$(function(){
    var grpName = localStorage.getItem('groupName');
    var grpImage = localStorage.getItem('groupImage');
    var token = localStorage.getItem('token');
    $('.group-name').html(grpName);
    $('#gname').attr("value",grpName);
    
    var grpNameObj = {
        grpName : localStorage.getItem('groupName')
    };

    //Get Group Data
    $.ajax({
        async: true,
        crossDomain: true,
        type : "POST",
        url : "http://localhost:3000/getGroupData",
        "headers": {
            "authorization": token,
            "cache-control": "no-cache",               
        },
        contentType : "application/JSON",   
        data : JSON.stringify(grpNameObj) 
    }).done(function(res){
        $('.memberCount').html(res.group_members.length);
        var admin = [];  
        for(var i=0; i<res.group_members.length; i++){
            admin.push(res.group_members[i].members);
            if(res.group_members[i].admin == false){
                if(res.group_members[i].members == localStorage.getItem('loggedUserName')){
                    $('.hide1').css("display","none");
                }
            }
        }
        var adminObj = {
            admin : admin
        };

        //Nested AJAX call for getting admin data
        $.ajax({
            async: true,
            crossDomain: true,
            type : "POST",
            url : "http://localhost:3000/getMembersData",
            "headers": {
                "authorization": token,
                "cache-control": "no-cache",               
            },
            contentType : "application/JSON",   
            data : JSON.stringify(adminObj) 
        }).done(function(membersData){
            for( var j = 0; j < res.group_members.length; j++ ) {
                for(var m=0; m<membersData.length; m++){
                    if( res.group_members[j].members ==  membersData[m].username){
                        if(res.group_members[j].admin == true){
                            adminDetails = '<li class="" style="list-style:none;padding-top:20px; padding-bootom:20px; margin-left:-40px;" id="x'+m+'"><div class="row custom-row"><div class="img_cont"><img src="'+membersData[m].img_upload+'" class="rounded-circle user_img"></div><div class="user_info" style="margin-left:120px;"><span class="hy" id="x'+m+'">'+membersData[m].username+'</span></div></div></li>';

                            $(".adminList").append(adminDetails);  
                            
                            if(res.group_members[j].members == localStorage.getItem('loggedUserName')){
                                
                                memberDetails = '<li class="" style="list-style:none;padding-top:20px; padding-bootom:20px; margin-left:-40px;" id="x'+m+'"><div class="row custom-row"><div class="img_cont"><img src="'+membersData[m].img_upload+'" class="rounded-circle user_img"></div><div class="user_info" style="margin-left:120px;"><span class="hy" id="x'+m+'">You</span></div></div></li>';
                                
                                $(".memberList").append(memberDetails);   
                            }
                            else{
                                memberDetails = '<li class="" style="list-style:none;padding-top:20px; padding-bootom:20px; margin-left:-40px;" id="x'+m+'"><div class="row custom-row"><div class="img_cont"><img src="'+membersData[m].img_upload+'" class="rounded-circle user_img"></div><div class="user_info" style="margin-left:120px;"><span class="hy" id="x'+m+'">'+membersData[m].username+'</span></div></div></li>';
                                
                                $(".memberList").append(memberDetails);   
                            }
                        } else{
                            
                            if(res.group_members[j].members == localStorage.getItem('loggedUserName')){
                                memberDetails = '<li class="" style="list-style:none;padding-top:20px; padding-bootom:20px; margin-left:-40px;" id="x'+m+'"><div class="row custom-row"><div class="img_cont"><img src="'+membersData[m].img_upload+'" class="rounded-circle user_img"></div><div class="user_info" style="margin-left:120px;"><span class="hy" id="x'+m+'">You</span></div></li>';
                                
                                $(".memberList").append(memberDetails);
                            } else{
                                
                                memberDetails = '<li class="" style="list-style:none;padding-top:20px; padding-bootom:20px; margin-left:-40px;" id="x'+m+'"><div class="row custom-row"><div class="img_cont"><img src="'+membersData[m].img_upload+'" class="rounded-circle user_img"></div><div class="user_info" style="margin-left:120px;"><span class="hy" id="x'+i+'">'+membersData[m].username+'</span></div><div class="round forRemove" style="margin-left:630px; margin-top:-22px;"><input type="checkbox" value='+membersData[m].username+' class="removeFromGroup" id="checkbox'+m+'"/><label for="checkbox'+m+'" name="checkbox'+m+'"></label></li>';
                                
                                $(".memberList").append(memberDetails);
                            }
                        } 
                    }
                }
            }
        }).fail(function(e, s, t){

        });
    }).fail(function(){
    });

    //Update Group Data
    $("#groupUpdateForm").click(function(e){
        var filepath = $("#fileupload").val();
        var filename = filepath.replace(/^.*(\\|\/|\:)/, '');

        if(filename != ''){
            localStorage.setItem('groupImage', 'http://localhost:3000/assets/'+filename);
        }

        //Obj
        var formData = {
            oldGrpName : localStorage.getItem('groupName'),
            grpName : $('#gname').val(),
            img_name : filename,
            img : $('#imagecrop1').val()
        };

        $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/updateGroupData',
            "headers": {
                "authorization": token,
                "cache-control": "no-cache",               
            },
            "mimeType": "multipart/form-data",
            data: JSON.stringify(formData), 
            contentType : "application/JSON",
            "processData": false,
        }).done(function(res){
            $('.profile-group-img').attr('src', 'http://localhost:3000/assets/'+filename);
        }).fail(function(e, s, t){
            console.log(e);
        });
    });
});