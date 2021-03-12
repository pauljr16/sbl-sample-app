let user=[];

const filters={
    searchText:'',
    hideCompleted: false
}

$('.search-user').on('input',()=>{
    filters.searchText=$('.search-user').val();
    creatList(user, filters);
    //console.log($('.search-user').val());
})

//save data
const renderLingayen=function(){
    db.collection('user').get().then(data=>{
        data.docs.forEach(element=>{
            const singledata=element.data();
            user.push(singledata);
            //console.log(element.data());
        });
        creatList(user, filters);
        /*user.forEach(element=>{
            $('.user').append('<p>'+element.name+'</p>');
        })*/
    });
}

//display all user data on the browser
const creatList=function(user, filters){
    const filtersUser = $.grep(user, element=>{
        return element.name.toUpperCase().includes(filters.searchText.toUpperCase());
    })
    $('.user').empty();
    filtersUser.forEach(element=>{
        let divElement=$('<div>');
        let buttonElement=$('<button>');
        buttonElement.text('X');
        buttonElement.on('click',()=>{
            deleteUser(element)
        })
        divElement.append('<span>'+element.name+'</span>');
        divElement.append(buttonElement);
        $('.user').append(divElement);
    })
}
//for editing 
/*const toggleUser=function(element){
    const new_user = {
        id: element.id,
        isCompleted: !element.isCompleted,
        name: element.name
    }
    db.collection('user').doc(element.id).update(new_user).then(()=>{
        console.log("updated");
        element.isCompleted=!element.isCompleted;
        creatList(user, filters);
    }).catch(error=>{
        console.log("error", error);
    })
}*/

//delete data on the list
const deleteUser=function(element){
    db.collection('user').doc(element.id).delete().then(()=>{
        console.log('deleted');   
        const userindex=user.findIndex(users=>users.id===element.id);
        if(userindex!=-1){
            user.splice(userindex, 1);
            creatList(user, filters);
        }});
    /*const userindex=user.findIndex(users=>users.id===element.id);
    if(userindex!=-1){
        user.splice(userindex, 1);
        creatList(user, filters);
    }*/ 
};

$('.submit-user').click((event)=>{
    //prepare data
    event.preventDefault();
    const id = uuidv4();
    const users={
        name: $('.new-user').val(),
        isCompleted: false,
        id: id
    } 
    //add data to database
    db.collection('user').doc(id).set(users).then(()=>{
        console.log('user added');
        $('.new-user').val('');
        user.push(users);
        creatList(user, filters);
    }).catch(error=>{
        console.log('error', e);
    })
    /*user.push(users);
    creatList(user, filters);*/
});

$('.hidecompleted').change(()=>{
    if($('.hidecompleted').prop('checked')){
        hideCompleted(user, filters);
    }else{
        creatList(user,filters);
    }
})

const hideCompleted = function (user, filters){
    const filteredUser = $.grep(user, (element)=>{
        if(element.isCompleted == filters.hideCompleted){
            return element;
        }
    })
    creatList(filteredUser,filters);
}

renderLingayen();