

var express = require('express');
require('dotenv').config()
var router = express.Router();

var userHelpers = require('../helpers/users-helpers')
var productHelpers=require('../helpers/product-helpers')
var keys=require('../config/keys');    
const usersHelpers = require('../helpers/users-helpers');
const { response } = require('express');
const { authToken } = require('../config/keys');
const { ObjectId } = require('mongodb');

const accountSid =  process.env.TWILIO_ACCOUNT_SID
const autToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid,autToken);  

 
 
const veryfyuser= (req,res,next)=>{         
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}
   
/* GET home page. */  

router.get('/', async(req,res) =>{ 

  let totalOrders=await usersHelpers.getTotalOrders()
  let CartCount=await userHelpers.getCartCount(req.session.userid)
  let total=await userHelpers.getTotalAmount(req.session.userid)
  let totalamount = total[0]
  var pageStatus ="home"
  let offer =await productHelpers.getOffersData()
  let offers=offer[0]
     console.log(offers);
 
  productHelpers.getAllproducts().then((products)=>{
    req.session.user=true
    res.render('user/index', {CartCount,totalamount,user:req.session.user,indexPage:true, products,userLoggedIn:req.session.userLoggedIn,pageStatus,offers,totalOrders});
   
  })

});

///serach offer products///

router.get('/offerproduct1',async(req,res)=>{
  let totalOrders=await usersHelpers.getTotalOrders()
  let offerData1 =await productHelpers.getOffersData()
      offerData1=offerData1[0]
      offerData1=offerData1.brand1
  let products =await productHelpers.offerProducts(offerData1)
  let CartCount=await userHelpers.getCartCount(req.session.userid)
  let total=await userHelpers.getTotalAmount(req.session.userid)
  let totalamount = total[0]

  console.log(products);

  res.render('user/serachProducts',{user:true,userLoggedIn:req.session.userLoggedIn,products,total,totalamount,CartCount,totalOrders})
  
})

router.get('/offerproduct2',async(req,res)=>{
  let totalOrders=await usersHelpers.getTotalOrders()
  let offerData2 =await productHelpers.getOffersData()
      offerData2=offerData2[0]
      offerData2=offerData2.brand2
  let products =await productHelpers.offerProducts(offerData2)
  let CartCount=await userHelpers.getCartCount(req.session.userid)
  let total=await userHelpers.getTotalAmount(req.session.userid)
  let totalamount = total[0]

  res.render('user/serachProducts',{user:true,userLoggedIn:req.session.userLoggedIn,products,total,totalamount,CartCount,totalOrders})

})

////serch main/////

router.post('/search',async(req,res)=>{
  let totalOrders=await usersHelpers.getTotalOrders()
 let products =await productHelpers.serchProduct(req.body)
 let CartCount=await userHelpers.getCartCount(req.session.userid)
  let total=await userHelpers.getTotalAmount(req.session.userid)
  let totalamount = total[0]
 
 if(products[0]==null){
   res.redirect("/")
 }

 res.render('user/serachProducts',{user:true,userLoggedIn:req.session.userLoggedIn,products,total,totalamount,CartCount,totalOrders})
})

router.get('/login', function (req, res) {
   let loginpage=true
  res.render('user/login',{loginpage,loginErr:req.session.loginErr, blockErr:req.session.blockErr,passwordErr:req.session.passwordErr});  
  
  req.session.loginErr=false
  req.session.blockErr=false
  req.session.passwordErr=false
});
 

router.get('/Signup', function (req, res, next) {   
  let loginpage=true
  res.render('user/signup',{loginpage,signupErr:req.session.signupErr});
  req.session.signupErr=false
});


router.get('/goHome', function (req, res, next) {
  res.redirect('/')
});


router.post('/submitSignupForm',  async (req, res) =>{
  


  userHelpers.addUser(req.body).then((responce)=>{
    if(responce==false){
      req.session.signupErr=true
      res.redirect('/Signup')   
    }else{
      req.session.userLoggedIn=true     
      mobile=parseInt(req.body.mobile) 
 

      client.verify.services(keys.serviceid)
             .verifications
             .create({to: '+91'+mobile, channel: 'sms'})
             .then((verification) => {
               res.render('user/forgotpassword',{user:true,mobile,otpErr:req.session.otpErr})   
               req.session.otpErr=false   
              }
               ).catch((err)=>{
                 console.log(err);
               })

    }
    
  })
});

router.post('/successotp',(req,res)=>{
  
  
client.verify.services(keys.serviceid)
.verificationChecks
.create({to: '+91'+req.body.mobile, code:req.body.otp })
.then(verification_check =>{
    if(verification_check.status=='approved'){  
      res.redirect('/')
    }else{
      req.session.otpErr=true    
      res.redirect('user/forgotpassword')     
    }


})      
 
})
    


router.post('/logedin',function(req,res){
   userHelpers.checkUser(req.body).then((status)=>{
     req.session.userid=status._id
     if(status){
       if(status.status=='unblock'){
        req.session.userLoggedIn=true
        res.redirect('/')
       }else if(status.status=='block'){
         req.session.blockErr=true
         res.redirect('/login')
       }
     }else{
       req.session.passwordErr=true
      res.redirect('/login')
     }
   })

});

router.get('/logout',function(req,res){
  req.session.destroy()
  res.redirect('/login')
})

router.get('/singelview/:userId',veryfyuser,async(req,res)=>{
  let totalOrders=await usersHelpers.getTotalOrders()
  let CartCount=await userHelpers.getCartCount(req.session.userid)
  let total=await userHelpers.getTotalAmount(req.session.userid)
  let totalamount = total[0]

  productHelpers.getProductData(req.params.userId).then((products)=>{
    let proId= ObjectId(products._id).toString()
    
     req.session.user=true
    res.render('user/single-view',{totalOrders,proId,CartCount,totalamount,user:req.session.user,products ,userLoggedIn:req.session.userLoggedIn});
  })

});

router.get('/resetpassword',(req,res)=>{
  res.render('user/resetpassword',{user:true,blockErr:req.session.blockErr})
  req.session.blockErr=false
});        

router.post('/repassword',(req,res)=>{
  console.log(req.body.email);
  userHelpers.checkemail(req.body).then((data)=>{
   if(data.status=='unblock'){
     res.render('user/psswordchange',{data})
   }else if(data.status=='block'){
     req.session.blockErr=true  
     res.redirect('/resetpassword')
   }
  })
});

router.post('/submitnewpassword',(req,res)=>{
usersHelpers.changepassword(req.body).then((responce)=>{
  req.session.userLoggedIn=true
  res.redirect('/')
})  
})



////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

router.get('/addtocart/:id', async(req,res)=>{      
   console.log(req.session.userid);
   if(req.session.userid){   
     
    usersHelpers.addToCart(req.params.id,req.session.userid).then(async()=>{
    let total=await usersHelpers.getTotalAmount(req.session.userid)
     res.json({status:true,total})    
    })
  }else{
     
    let total = 0
    res.json({status:false,total})
    
  }
      
});

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////




router.get('/menscollections',async(req,res)=>{
 
  let CartCount=await userHelpers.getCartCount(req.session.userid)
  let total=await userHelpers.getTotalAmount(req.session.userid)
  let totalOrders=await usersHelpers.getTotalOrders()
  let totalamount = total[0]
  var pageStatus="men"
  let products = await productHelpers.getAllproducts()
res.render("user/menscollections",{totalOrders,pageStatus,user:true,userLoggedIn:req.session.userLoggedIn,products,total,totalamount,CartCount})
})

router.get('/womencollections',async(req,res)=>{
  let totalOrders=await usersHelpers.getTotalOrders()
  let CartCount=await userHelpers.getCartCount(req.session.userid)
  let total=await userHelpers.getTotalAmount(req.session.userid)
  let totalamount = total[0]
  var pageStatus="women"
  let products = await productHelpers.getAllproducts()
res.render("user/womenporducts",{totalOrders,pageStatus,user:true,userLoggedIn:req.session.userLoggedIn,products,CartCount,totalamount,total})
})

router.get('/kidscollections',async(req,res)=>{
  let totalOrders=await usersHelpers.getTotalOrders()
  let CartCount=await userHelpers.getCartCount(req.session.userid)
  let total=await userHelpers.getTotalAmount(req.session.userid)
  let totalamount = total[0]
  var pageStatus="kids"
  let products = await productHelpers.getAllproducts()
res.render("user/kidsproducts",{totalOrders,pageStatus,user:true,userLoggedIn:req.session.userLoggedIn,products,CartCount,total,totalamount})
})


       
router.get('/cart',veryfyuser,async(req,res)=>{
  if(req.session.userLoggedIn){
     let totalOrders=await usersHelpers.getTotalOrders()
     let products=await userHelpers.getCartProducts(req.session.userid)
     let total=await userHelpers.getTotalAmount(req.session.userid)
     let CartCount=await userHelpers.getCartCount(req.session.userid)
     let userId=req.session.userid
  let totalamount = total[0]
    res.render('user/cart',{totalOrders,userId,user:req.session.user,CartCount,totalamount,products,userLoggedIn:req.session.userLoggedIn})
  }else[
    res.redirect('/login')
  ]
  
});   

router.post('/change-product-quantity',(req,res,next)=>{
 
  userHelpers.changeProductQty(req.body).then(async(response)=>{
    console.log(req.body.userId);
     let userId=req.body.userId
     total=await userHelpers.getTotalAmount(userId);
     totalPrice=total[0]
     response.total=totalPrice.total
     
    res.json(response)  
  })
   
})

router.get('/placeorder',veryfyuser,async(req,res)=>{
  let user=req.session.user 
  let total=await userHelpers.getTotalAmount(req.session.userid)
  let products=await userHelpers.getCartProducts(req.session.userid)
  let address=await userHelpers.getAddress(req.session.userid)
      address=address[0] 
      address={...address};
      address=await address.delivaryDetails
  let totalamount = total[0]
  let userId=req.session.userid
  
  if(user){
    res.render('user/payment',{userId,address,products,user,totalamount,userLoggedIn:req.session.userLoggedIn})
  }else{
    res.redirect('/login')          
  }    
  
})
 
router.post('/placeorder',async(req,res)=>{
  
  let products= await userHelpers.getCartProducts(req.body.userId)
  let totalPrice= await userHelpers.getTotalAmount(req.body.userId)
  let userId=req.body.userId
  userHelpers.placeOrder(req.body,products,totalPrice,userId).then((orderId)=>{
    
    if(req.body.paymentMethod=='cod'){ 
     
      res.json({stat:true})
    }else{  
          
      let total=req.body.grandTotal
      userHelpers.generateRazorpay(orderId,total).then((response)=>{
        console.log(response,"response2")
            
          res.json(response)
      })
    }
    

  })
  console.log(req.body);   
  
})


//////placeOrder single product //////



router.post('/placeorder1',async(req,res)=>{

  

  let products= await userHelpers.singleTotal(req.body.productId)
  let totalPrice= req.body.grandTotal
  let userId=req.body.userId
  userHelpers.placeOrder(req.body,products,totalPrice,userId).then((orderId)=>{
    
    if(req.body.paymentMethod=='cod'){ 
     
      res.json({stat:true})
    }else{  
          
      let total=req.body.grandTotal
      userHelpers.generateRazorpay(orderId,total).then((response)=>{ 
        console.log(response,"response2")
            
          res.json(response)
      })
    }
    

  })
     
  
})



router.get('/just',veryfyuser,(req,res)=>{  
  res.render('user/success',{user:req.session.user,userLoggedIn:req.session.userLoggedIn})
})
  
router.post('/verify-payment',(req,res)=>{ 
  console.log(req.body);
  usersHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false,errMsg:''})
  })
  
})

router.get('/view-orders',veryfyuser,async(req,res)=>{
 let order=await usersHelpers.getOrderList(req.session.userid)
    res.render('user/orders',{order,user:req.session.user,userLoggedIn:req.session.userLoggedIn})    
  
})
router.get('/view-order-details/:id',veryfyuser, async(req,res)=>{     
  let products=await userHelpers.getOrderproduct(req.params.id)
 
  res.render('user/orderProducts',{products,user:req.session.user,userLoggedIn:req.session.userLoggedIn})
})

router.get('/invoice/:id',veryfyuser,async(req,res)=>{
  let orderId=req.params.id
  let orderDetails=await userHelpers.getOrderdetails(orderId)
  console.log(orderDetails);
  let products= await usersHelpers.getOrderproduct(orderId)
  res.render('user/invoice',{orderDetails,products})
    
})

router.get('/invoice1/:id',veryfyuser,async(req,res)=>{
  let orderId=req.params.id
  let orderDetails=await userHelpers.getOrderdetails(orderId)
  let products= await usersHelpers.getOrderproduct(orderId)
  res.render('user/invoice',{orderDetails,products})
    
})

router.get('/delivered-orders',veryfyuser,async(req,res)=>{
  let order=await usersHelpers.getDeliveredOrder(req.session.userid)
    
    res.render('user/delivered-orders',{order,user:req.session.user,userLoggedIn:req.session.userLoggedIn})    
  
  })

  router.post('/cancel-order',(req,res)=>{
    userHelpers.cancelOrder(req.body.orderId);
     res.json({status:true})
  })

router.post('/search-main',(req,res)=>{
  console.log(req.body);
  
})






// buy now //
router.get('/buynow:id',veryfyuser,async(req,res)=>{
  let productId=await req.params['id']
  productId=productId
  let user=req.session.user 
  let productDetals=await userHelpers.singleTotal(productId)
  let userId =await req.session.userid
  
  let address=await userHelpers.getAddress(userId)
      address=address[0] 
      address={...address};
      address=await address.delivaryDetails
  console.log("its get addresss");
  console.log(address); 


  productDetals=productDetals[0]
  
  if(user){
    res.render('user/singlepayment',{userId,address,user,productDetals,productId,userLoggedIn:req.session.userLoggedIn})
  }else{
    res.redirect('/login')          
  }    
  
})

/// single view coupon applay

router.post('/coupon-single',async(req,res)=>{
  console.log(req.body.totalAmount) ;
  let userid=req.session.userid
 let coupon =await userHelpers.validateCoupon(req.body.couponCode)
 if(coupon===null){
   console.log("coupon null");
   res.json({couponStatus:false})
 }else{
   let total=await usersHelpers.getTotalAmount(userid)
   
   let num1=parseInt(req.body.totalAmount);
   let num2=parseInt(coupon.amount);
   let grandTotal=num1-num2  
   console.log(grandTotal,"grandTotal");

  res.json({couponStatus:true,
    grandTotal:grandTotal,
    couponAmount:num2
  
  })
 }
  }) 




router.post('/coupon',async(req,res)=>{
  let userid=req.session.userid
 let coupon =await userHelpers.validateCoupon(req.body.couponCode)
 if(coupon===null){
   console.log("coupon null");
   res.json({couponStatus:false})
 }else{
   let total=await usersHelpers.getTotalAmount(userid)
   
   let num1=parseInt(total[0].total);
   let num2=parseInt(coupon.amount);
   let grandTotal=num1-num2  
   console.log(grandTotal,"grandTotal");

  res.json({couponStatus:true,
    grandTotal:grandTotal,
    couponAmount:num2
  
  })
 }
  }) 





module.exports = router;
