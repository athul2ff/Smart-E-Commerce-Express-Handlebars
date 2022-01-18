
$(document).ready(function(){
  $("#myform").validate({
    rules: {
      // no quoting necessary
      name:{
        required:true,
        minlength:'4'
      } ,
      email:{
        required:true,
        email:true
      },

      mobile:{
        required:true,
        minlength:"10",
        maxlength:"10",
        digits: true
      },
      password:  {
        required:true,
        pwcheck: true,
        minlength:"5"

      },
      Password2:{
        required:true,
        equalTo: "#password"
      },


      gender:{
        required:true
      }
     
    },
    messages: {
      name:{
      required:"please Enter your Name",
      minlength:"Enter atleaste four charectors"
      },
      
      email:{
        required:"please Enter your Email ID",
        email:"please Enter a valid Email Address"
      },
      mobile:{
        required:"please Enter your MobileNumber",
        minlength:"Number too short ",
        maxlength:"Enter a valid number",
        digits:"please Enter valid numbers"
      },
      password:{
        required:"Please Enter your password",
        pwcheck: "Password must should be Strong",
        minlength:"Password too Short"

      },
      Password2:{
        required:"please conform your password before signup",
        equalTo:"Password not match"
      },
      gender:{
        required:" select your Gender"
      }
  
    }
  });
  $.validator.addMethod("pwcheck", function(value) {
    return /^[A-Za-z0-9\d=!\-@._*]*$/.test(value) // consists of only these
        && /[a-z]/.test(value) // has a lowercase letter
        && /\d/.test(value) // has a digit
 });
  

})

