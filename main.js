$(document).ready(() =>{
    console.log("ready")
    $('#login-form').submit(e => {
        e.preventDefault()
        login()
    })
    $('#register-form').submit(e => {
        e.preventDefault()
        register()
    })
    $('#plan-form').submit(e => {
        e.preventDefault()
        postPlan()
    })
    getProv()
    auth()
})

const SERVER = "http://localhost:3000/"

const auth = () =>{
    $('#register-block').hide();
    $('#plan-form-block').hide()
    $('#detail-card').hide()
    $('#edit-form-block').hide()
    if(!localStorage.access_token){
        $('#plan-block').hide()
        $('#top-btns').hide()
        $('#login-block').show()
    } else{
        $('#top-btns').show()
        $('#plan-block').show()
        $('#login-block').hide()
        getPlan()      
    }
}

const registerForm = () =>{
    $(`#register-block`).show();
    $(`#login-block`).hide();
}

const login = () => {
    console.log('login')
    $.ajax({
        type: "POST",
        url: SERVER+"login",
        data: {
            "email": $('#login-email').val(),
            "password": $('#login-password').val()
        }
    })
    .done(res => {
        localStorage.access_token = res.access_token
        auth()
    })
    .fail(err => {
        $('#login-error').text(err.responseJSON.message);
    })
}

const register = () => {
    console.log('register')
    $.ajax({
        type: "POST",
        url: SERVER+"register",
        data: {
            "email": $('#register-email').val(),
            "password": $('#register-password').val()
        }
    })
    .done(res => {
        auth()
    })
    .fail(err => {
        $('#register-error').text(err.responseJSON.message)
    })
}

const getPlan = () => {
    $('#plan-list').empty()
    $.ajax({
        type: "GET",
        url: SERVER+"travels",
        headers: {access_token: localStorage.access_token}
    })
    .done(res => {
        console.log(res)
        if (res.length == 0) {
            $('#noPlans').show()
            $('#plan-list').hide()
        } else {
            $('#noPlans').hide()
            $('#plan-list').show()
            res.forEach(el => {
            let date = new Date(el.travelDate)
            date = date.toDateString()
            $('#plan-list').append(`
            <div class="lg:m-4 shadow-md hover:shadow-lg hover:bg-gray-100 rounded-lg bg-white my-12 mx-8">
            <!-- Card Image -->
            <!-- Card Content -->
            <div class="p-4">
              <p class="text-justify">${date}</p>
              <h3 class="font-medium text-gray-600 text-lg my-2 uppercase">${el.travelDestinationProvince}</h3>
              <p class="text-justify">${el.travelDestinationCity}</p>
              <div class="mt-5">
                <a href="#" class="hover:bg-red-700 float-right rounded-full py-2 px-3 font-semibold hover:text-white bg-red-400 text-gray-100" onClick="delPlan(${el.id})">Delete</a>
                <a href="#" class="hover:bg-green-700 float-right rounded-full py-2 px-3 font-semibold hover:text-white bg-green-400 text-gray-100" onClick="editPage(${el.id})">Show/Edit</a>
                <br>
              </div>
            </div>
          </div>
                `)
            })
        }
    })
}

const delPass = (id) =>{
    $.ajax({
        type: "DELETE",
        url: SERVER+`passwords/${id}`,
        headers: {access_token: localStorage.access_token}
    })
    .done(res => {
        auth()
    })
    .fail(err => {console.log(err)})
}

const planPage = () =>{
    console.log("test")
    $('#plan-block').hide()
    $('#login-block').hide()
    $('#plan-form-block').show()
}

const postPlan = () => {
    $.ajax({
        type: "POST",
        url: SERVER+"travels",
        data: {
            "travelDestinationProvince":  $('#form-province').val(),
            "travelDestinationCity":  $('#form-city').val(),
            "travelDate":  $('#form-date').val(),
        },
        headers: {
            access_token: localStorage.access_token
        }
    }).done(res => {
        auth()
    })
    .fail(err => {
        $('#post-error').text(err.responseJSON.message)
    })
}

const logout = () => {
    localStorage.clear()
    auth()
}

const getProv = () =>{
    $(`#form-province`).empty()
    $(`#edit-province`).empty()
    $.ajax({
        type: "GET",
        url: SERVER + "province",
    }) .done(provinces => {
        console.log(provinces)
        provinces.provinsi.forEach(el => {
            $(`#form-province`).append(`
            <option value="${el.nama}">${el.nama}</option>
            `)
            $(`#edit-province`).append(`
            <option value="${el.nama}">${el.nama}</option>
            `)
        })
    })
}

const getCovid = () => {
    $(`#new-covid-data`).empty();
    $.ajax({
        type: "GET",
        url: SERVER + "covid/" + $("#form-province").val()
    }) .done(covid => {
        console.log(covid)
        if(covid){
            $(`#new-covid-data`).append(`
            <section>Jumlah kasus: ${covid.list_data.jumlah_kasus}</section>
            <section>Jumlah dirawat: ${covid.list_data.jumlah_dirawat}</section>
            <section>Jumlah meninggal: ${covid.list_data.jumlah_meninggal}</section>
            <section>Jumlah sembuh: ${covid.list_data.jumlah_sembuh}</section>
            `)
        } 
    })
}

const getDetails = (id) => {
    $('#detail-card').show()
    $('#plan-block').hide()
    $('#login-block').hide()
    $('#plan-form-block').hide()
    $.ajax({
        type: "GET",
        url: SERVER + "travels/" + id,
        headers: {
            access_token: localStorage.access_token
        }
    })
    .done(plan => {
        $(`#detail-holidays`).show()
        console.log(plan)
        let date = new Date(plan.travelDate.value)
        date = date.toDateString()
        $('#detail-date').text(`${date}, ${(plan.travelDate.holiday.holiday_name)? plan.travelDate.holiday.holiday_name: ""}`);
        $('#detail-province').text(plan.travelDestinationProvince);
        $('#detail-city').text(plan.travelDestinationCity);
        if (plan.travelDate.holiday.holiday_name){
            $(`#detail-holidays`).show()
            $(`#holiday-name`).text(plan.travelDate.holiday.holiday_name);
            $(`#holiday-description`).text(plan.travelDate.holiday.holiday_description);
            $(`#holiday-type`).text(plan.travelDate.holiday.holiday_type);
        }
    }) 
    .fail (err => {console.log(err)})
}

const checkHoliday = () =>{
    $(`#new-holiday-name`).empty();
    $(`#new-holiday-description`).empty();
    $(`#new-holiday-type`).empty();
    $.ajax({
        type: "GET",
        url: SERVER+"holidays/"+ $(`#form-date`).val()
    }).done(res => {
        if (res.holiday){
            $(`#no-holiday`).hide();
            $(`#new-holiday-name`).text(res.holiday.holiday_name);
            $(`#new-holiday-description`).text(res.holiday.holiday_description);
            $(`#new-holiday-type`).text(res.holiday.holiday_type);
        }
        else $(`#no-holiday`).show();
    })
}

const delPlan = (id) =>{
    swal({
        title: "Sure Delete",
        text: `Delete Todo ${name} ?`,
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((willDelete) => {
        if (willDelete) {
            $.ajax({
                type: "DELETE",
                url: SERVER+`travels/${id}`,
                headers: {access_token: localStorage.access_token}
            })
            .done(res => {
                auth()
            })
            .fail(err => {console.log(err)})
        }
    });
}

const editPage = (id) => {
    $(`#plan-block`).hide();
    $('#edit-form-block').show()
    $.ajax({
        type: "GET",
        url: SERVER + "travels/" + id,
        headers: {access_token: localStorage.access_token}
    })
    .done(plan => {
        console.log(plan)
        let date = new Date(plan.travelDate.value)
        date = date.toISOString().slice(0,10)
        $('#edit-province').val(plan.travelDestinationProvince),
        $('#edit-city').val(plan.travelDestinationCity),
        $('#edit-date').val(date)
        getCovidEdit()
        checkHolidayEdit()
        $(`#edit-form`).off().on('submit', (e) => {
            e.preventDefault()
            editPlan(id)
        })
    })
    .fail(err => {
        $('#edit-error').text(err.responseJSON.message)
    })
}

const editPlan = (id) => {
    console.log('edit')
    $.ajax({
        type: "PUT",
        url: SERVER+"travels/"+id,
        data: {
            "travelDestinationProvince":  $('#edit-province').val(),
            "travelDestinationCity":  $('#edit-city').val(),
            "travelDate":  $('#edit-date').val(),
        },
        headers: {
            access_token: localStorage.access_token
        }
    }).done(res => {
        auth()
    }).fail(err => console.log(err))
}

const getCovidEdit = () => {
    $(`#new-covid-data`).empty();
    $.ajax({
        type: "GET",
        url: SERVER + "covid/" + $("#edit-province").val()
    }) .done(covid => {
        console.log(covid)
        if(covid){
            $(`#edit-covid-data`).append(`
            <section>Jumlah kasus: ${covid.list_data.jumlah_kasus}</section>
            <section>Jumlah dirawat: ${covid.list_data.jumlah_dirawat}</section>
            <section>Jumlah meninggal: ${covid.list_data.jumlah_meninggal}</section>
            <section>Jumlah sembuh: ${covid.list_data.jumlah_sembuh}</section>
            `)
        } 
    })
}

const checkHolidayEdit = () =>{
    console.log('a')
    $(`#edit-holiday-name`).empty();
    $(`#edit-holiday-description`).empty();
    $(`#edit-holiday-type`).empty();
    $.ajax({
        type: "GET",
        url: SERVER+"holidays/"+ $(`#edit-date`).val()
    }).done(res => {
        if (res.holiday){
            $(`#edit-no-holiday`).hide();
            $(`#edit-holiday-name`).text(res.holiday.holiday_name);
            $(`#edit-holiday-description`).text(res.holiday.holiday_description);
            $(`#edit-holiday-type`).text(res.holiday.holiday_type);
        }
        else $(`#no-holiday`).show();
    })
}