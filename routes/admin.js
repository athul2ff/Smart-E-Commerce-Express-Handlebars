var express = require('express');
const usersHelpers = require('../helpers/users-helpers');
const productHelpers = require('../helpers/product-helpers')
var router = express.Router();
const fileUpload=require('express-fileupload');
const { response } = require('express');
var base64ToImage =require('base64-to-image')

/* GET admin listing. */
router.get('/', async(req, res, next)=>{   
  let totalOrders=await usersHelpers.getTotalOrders()
  let revenue =await usersHelpers.getTotalRevenue()
  let pendings=await usersHelpers.pendingOrdersCount()
  let usersCount= await usersHelpers.usersCount()
  var currentPage = "graph"
 
  res.render('admin/graph',{admin:true,currentPage,totalOrders,revenue,pendings,usersCount})        
});
 
router.get('/products',function (req,res) {
  var currentPage = "products"
  productHelpers.getAllproducts().then((products)=>{
    let product=products.products
    res.render('admin/products',{admin:true,product,currentPage})

  })
  
})
 
router.get('/user',function(req,res,next){
  
  var currentPage = "user"
usersHelpers.getAllusers().then((user)=>{
  
  // console.log(user); 
  res.render('admin/user',{admin:true,topview:true,user,currentPage});    

});

})
router.get('/addProduct',function (req,res){   
  var currentPage = "products"  
  res.render('admin/addproduct',{admin:true,currentPage})
            
});   

router.get('/block/:userId',function (req,res) {
  usersHelpers.blockUser(req.params.userId).then(()=>{
  res.redirect('/admin/user')  
  })               
})

router.get('/unblock/:userId',(req,res)=>{
  usersHelpers.unblockUser(req.params.userId).then(()=>{
  res.redirect('/admin/user')
  })
})

router.get("/addOffers",(req,res)=>{
  var currentPage ="offers"
  res.render("admin/addOffers",{admin:true,currentPage})
})

router.post('/postProducts',(req,res)=>{  
  
  productHelpers.addProducts(req.body).then((id)=>{

    var base64Str1 = req.body.imageBase64Data1
    var path = "./public/images/admin/img/product-images/";
    var optionalObj = { fileName: id + '_1', type: "jpg" };
    base64ToImage(base64Str1, path, optionalObj);  

    var base64Str2 = req.body.imageBase64Data2
    var path = "./public/images/admin/img/product-images/";
    var optionalObj = { fileName: id + '_2', type: "jpg" };
    base64ToImage(base64Str2, path, optionalObj);

    var base64Str3 = req.body.imageBase64Data3
    var path = "./public/images/admin/img/product-images/";
    var optionalObj = { fileName: id + '_3', type: "jpg" };
    base64ToImage(base64Str3, path, optionalObj);

    var base64Str4 = req.body.imageBase64Data4
    var path = "./public/images/admin/img/product-images/";
    var optionalObj = { fileName: id + '_4', type: "jpg" };
    base64ToImage(base64Str4, path, optionalObj);
  res.redirect('/admin/products')
  })

})

router.get('/deleteproducts/:id',(req,res)=>{          
  let productId=req.params.id
  productHelpers.deleteProduct(productId).then((response)=>{
    res.redirect('/admin/products')  
  })      
})

router.get('/editproduct/:id',(req,res)=>{      
  var currentPage = "products" 
  let productId=req.params.id
  productHelpers.getProductData(productId).then((product)=>{
    res.render('admin/edit-product',{admin:true, product,currentPage})           
  })       
})





router.post ('/postOffers',(req,res)=>{
  
  productHelpers.addOffers(req.body).then((response)=>{
    console.log(response);
    console.log(typeof( req.files.offerImage1)+"hello athul");
    let image1=req.files.offerImage1
    let image2=req.files.offerImage2
    image1.mv('./public/images/offer/'+response+'1'+'.jpg',(err,done)=>{
      if(err){
        console.log(err);
      }else{
        image2.mv('./public/images/offer/'+response+'2'+'.jpg',(err,done)=>{
          if(err){
            console.log(err);
          }else{
            res.send("hello")
          }
        })
        
      }
    })
  })
   
})









router.post('/updateproducts/:id',(req,res)=>{
  let id=req.params.id
  let productId=req.params.id
  let newData=req.body
  productHelpers.editProduct(productId,newData).then((response)=>{
    console.log(req.files);
    if(req.files==null){
      res.redirect('/admin/products')
    }else{
   if(req.files.image1){
    var base64Str1 = req.body.imageBase64Data1
    var path = "./public/images/admin/img/product-images/";
    var optionalObj = { fileName: id + '_1', type: "jpg" };
    base64ToImage(base64Str1, path, optionalObj);
   }
   if(req.files.image2){
    var base64Str2 = req.body.imageBase64Data2
    var path = "./public/images/admin/img/product-images/";
    var optionalObj = { fileName: id + '_2', type: "jpg" };
    base64ToImage(base64Str2, path, optionalObj);
   }
   if(req.files.image3){
    var base64Str3 = req.body.imageBase64Data3
    var path = "./public/images/admin/img/product-images/";
    var optionalObj = { fileName: id + '_3', type: "jpg" };
    base64ToImage(base64Str3, path, optionalObj);
   }
   if(req.files.image4){
    var base64Str4 = req.body.imageBase64Data4
    var path = "./public/images/admin/img/product-images/";
    var optionalObj = { fileName: id + '_4', type: "jpg" };    
    base64ToImage(base64Str4, path, optionalObj); 
   }}
  
    res.redirect('/admin/products')
  })
})

router.get('/orders',async(req,res)=>{
  var currentPage = "orders"
  let orders = await usersHelpers.getAllOrders()
  res.render('admin/orders',{admin:true,orders,currentPage})
})

router.get('/pending-orders',async(req,res)=>{  
  res.redirect('/admin/orders')
})  

router.get('/deliverd-orders',async(req,res)=>{
  var currentPage = "orders"
  let orders = await usersHelpers.deliveredOrders()
  res.render('admin/deliverd-orders',{admin:true,orders,currentPage})
})

router.get('/failed-orders',async(req,res)=>{
  var currentPage = "orders"
  let pendingOrders = await usersHelpers.pendingOrders()
  res.render('admin/failed-orders',{admin:true,pendingOrders,currentPage})
})

router.post('/change-order-status',(req,res)=>{
 let orderId=req.body.orderId
 let orderStatus=req.body.status

  usersHelpers.changeOrderStatus(orderStatus,orderId).then((response)=>{
   
  })

})

router.get('/coupons',async(req,res)=>{
  var currentPage = "coupons"

  let coupon=await productHelpers.getAllCoupon()
  res.render('admin/coupon',{admin:true,coupon,currentPage})
})

router.post('/add-coupon',(req,res)=>{
  let couponCode= req.body.couponCode
  let amount= req.body.amount
  let quantity =req.body.quantity
  usersHelpers.createCoupon(couponCode,amount,quantity).then((response)=>{
    if(response===false){
      res.redirect('/admin/coupons')
    }else{
      res.redirect('/admin/coupons')                  
    }
    console.log(response,"abcd");  
      
  })
  
})


module.exports = router;
   