let submitBtn = document.getElementById('submitBtn');

var submitSignUpDetail = (e) => {
    try {
        e.preventDefault();
        let username = document.getElementById('name').value;
        let email = document.getElementById('email').value;
        let phonenumber = document.getElementById('phonenumber').value;
        let password = document.getElementById('password').value;

        if (username == '' || email == '' || phonenumber == '' || password == '') {
            alert('Fill the signup values')
        } else {
            let myObj = {
                'username': username,
                'email': email,
                'phonenumber': phonenumber,
                'password': password
            }

            axios.post('/signup', myObj).then(
                (result) => {
                    console.log(result.data.message);
                    alert("Successfully signed up!")
                    window.location = "/"
                }
            ).catch(err => {
                console.log(err)
                alert("User Already Exists! -" + JSON.stringify(err.response.data.Error.errors[0].message));
                console.log(err.response.data.Error.errors[0])
            })

        }

    } catch (error) {
        console.log(error);
    }
}

submitBtn.addEventListener('click', submitSignUpDetail);