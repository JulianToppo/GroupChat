const loginBtn= document.getElementById('loginBtn');
const signUpBtn=document.getElementById('signUpBtn');

var submitLoginForm=(e)=>{
    try {
        e.preventDefault();
        let email=document.getElementById('email').value;
        let password=document.getElementById('password').value;
    
        if(email=='' || password==''){
            alert('Put in the values')
        }else{
            let myObj={
                "email":email,
                "password":password
            }
    
            axios.post("/login",myObj).then((result)=>{
                localStorage.clear();
                localStorage.setItem("token",result.data.token);
                alert(result.data.message);
                window.location="/chatapp"

            }).catch(err=>{
                alert(JSON.stringify(err.response.data.Error));
                console.log(err.response.data.Error)
            })
        }
    } catch (error) {
        console.log(error);
    }
   

}

var redirectSignupPage=(e)=>{
    try {
          e.preventDefault();
          window.location='/signup';
    } catch (error) {
        console.log(error);
    }
  
    
}


loginBtn.addEventListener('click',submitLoginForm);
signUpBtn.addEventListener('click',redirectSignupPage);