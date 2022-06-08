var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('bson')
const { response } = require('express')
// var ObjectId=require('mongodb').ObjectId  
const Razorpay = require('razorpay')
const { resolve } = require('path')
const { AuthorizationDocumentList } = require('twilio/lib/rest/preview/hosted_numbers/authorizationDocument')
var instance = new Razorpay({
    key_id: 'rzp_test_79XxtKjzAHhMKG',
    key_secret: 'VA9JMYudQ0wCfbBCXCErvJbg',
  });  



  
module.exports = {  


    addUser: (usersData) => {
        return new Promise(async (resolve, reject) => {
            var name = await db.get().collection(collection.USER_COLLECTION).findOne({ email: usersData.email })
            if (name == null) {
                usersData.password = await bcrypt.hash(usersData.password, 10)
                userdata = {
                    name: usersData.name,  
                    gender: usersData.gender,
                    email: usersData.email,
                    password: usersData.password,
                    status:"unblock"
                 }

                db.get().collection('userdetails').insertOne(userdata).then((data) => {
                    
                    resolve(data)
                })
            } else {
                console.log("user alredy exists");
                resolve(false)
            }

        })
    },
    checkUser:(usersData) => {
        return new Promise(async(resolve, reject) => {
            let responce={}

              var user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: usersData.email })
            if(user){
                bcrypt.compare(usersData.Password,user.password).then((status)=>{
                    if(status){
                        resolve(user)
                    }else{
                        resolve(status);   
                    }
                     
                           
                }) 
            }else{
                resolve(status)
            }
            
        
        })
    },
    getAllusers:()=>{
        return new Promise(async(resolve,reject)=>{
            let usersData  =await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(usersData)
        })
    },

    blockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
       db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
       {
           $set:{status:"block"}
       }).then((data)=>{
           resolve()
       })
        })
    }, 

    unblockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id: ObjectId(userId)},
            {
                $set:{status:"unblock"}
            }).then(()=>{
                resolve()
            })
        })
    },
    checkemail:(usersData) => {
        return new Promise(async(resolve, reject) => {
            let responce={}

              var user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: usersData.email })
            if(user){
              
               resolve(user)
            }else{
               
            }
        
        })
    },

    changepassword:(productDetals)=>{
        emailid=productDetals.email
          
        return new Promise(async(resolve,reject)=>{
            productDetals.password = await bcrypt.hash(productDetals.password, 10) 
          db.get().collection(collection.USER_COLLECTION).updateOne({email:emailid},{
            $set:{
              name:productDetals.name,
              gender:productDetals.gender,
              email:productDetals.email,
              password:productDetals.password,         
              status:"unblock",
              
            }  
          }).then((response)=>{
            resolve(response)
          })
        })
      }  ,
      
      addToCart:(proId,userId)=>{
          let proObj={
              item:ObjectId(proId),
              quantity:1,

          }
          return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(userCart){   
                let proExist=userCart.products.findIndex(products=>products.item==proId)
                console.log(proExist);
                
                if(proExist != -1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:ObjectId(userId),'products.item':ObjectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }).then(()=>{
                        resolve()
                    })
                }else{

                    db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},
                    {
    
                        $push: {products:proObj}
                            
    
                    }
                    ).then((response)=>{
                        response.status=true
                        resolve(response.status)
                    })
    
                }

              
            }else{
                  let cartObj={
                    user:ObjectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                 resolve(response)
                })
            }
        })
      },

      getCartProducts:(userId)=>{
          return new Promise(async(resolve,reject)=>{
              let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
              {
                  $match:{user:ObjectId(userId)}
              },
              {
                  $unwind:"$products"
              },
              {
                  $project:{
                      item:"$products.item",
                      quantity:"$products.quantity"
                  }
              },
              {
                  $lookup:{
                      from:'products',
                      localField:'item',
                      foreignField:'_id',
                      as:'products'
                  }
              },
              {
                  $project:{
                      item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
                  }
              }

            ]).toArray()
             
            resolve(cartItems)
          })
      },

      getCartCount:(userId)=>{
          return new Promise(async(resolve,reject)=>{
              let count=0
              let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
              
              if(cart){
                  count=cart.products.length 
              }
              resolve(count)
            })
      },

      changeProductQty:(details)=>{
         details.count=parseInt(details.count)
         details.quantity=parseInt(details.quantity)

         return new Promise((resolve,reject)=>{
             if(details.count==-1 && details.quantity==1 || details.count==22){
                 db.get().collection(collection.CART_COLLECTION)
                 .updateOne({_id:ObjectId(details.cart)},
                 {
                     $pull:{products:{item:ObjectId(details.product)}}
                 }).then((response)=>{
                     resolve({removeProduct:true})
                 })
                 
             }else{
                 db.get().collection(collection.CART_COLLECTION)
                 .updateOne({_id:ObjectId(details.cart),'products.item':ObjectId(details.product)},
                 {
                     $inc:{'products.$.quantity':details.count}
                 }).then((response)=>{
                     resolve({status:true})
                 })
             }
         })

        
      },
      getTotalAmount:(userId)=>{
         
          return new Promise(async(resolve,reject)=>{
            let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:ObjectId(userId)}
            },
            {
                $unwind:"$products"
            },
            {
                $project:{
                    item:"$products.item",
                    quantity:"$products.quantity"
                }
            },
            {
                $lookup:{
                    from:'products',
                    localField:'item',
                    foreignField:'_id',
                    as:'products'
                }
            },
           
            {
                $project:{
                    item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
                }
            },
             
            {
                $group:{
                    _id:null,
                    
                    total:{$sum:{$multiply:['$quantity','$products.offer']}}
                }
            }

          ]).toArray()
           
          resolve(total)
        })  
      },

      placeOrder:(order,product,total,userId)=>{
          db.get().collection(collection.ADDRESS_COLLECTIONS).findOneAndDelete({"userId":userId})
          let abc=product
         
          return new Promise(async(resolve,reject)=>{
             let status=await order.paymentMethod=='cod'?'placed':'pending'
             let address={
                userId:userId,
                delivaryDetails:{
                    name:order.name,
                    mobile:order.mobile,
                    altMobile:order.mobile2,
                    email:order.email,
                    pincode:order.pincode,
                    country:order.country,
                    state:order.state,
                    city:order.city,
                    landmark:order.landmark,
                    address:order.address,
                    
                 }
             }
            
             let orderObj={
                 delivaryDetails:{
                    name:order.name,
                    mobile:order.mobile,
                    altMobile:order.mobile2,
                    email:order.email,
                    pincode:order.pincode,
                    country:order.country,
                    state:order.state,
                    city:order.city,
                    landmark:order.landmark,
                    address:order.address,
                    date:new Date()
                    
                 },
                 userId:ObjectId(userId),
                 paymentMethod:order.paymentMethod,
                 products:abc,
                 total:total[0].total ,  
                 status:status,
                 grandTotal:order.grandTotal,
                 statusupdate:"received"
             }
             db.get().collection(collection.ADDRESS_COLLECTIONS).insertOne(address)
             db.get().collection(collection.ORDER_COLLECTIONS).insertOne(orderObj).then((response)=>{

                 db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(userId)})
                 
                 
                 resolve(response.insertedId.toString())

             })


          })  
  
      },

      getCartProductList:(userId)=>{
          return new Promise(async(resolve,reject)=>{
              let cart= await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
              resolve(cart.products)
          })
      },

      generateRazorpay:(orderId,total)=>{
         
          return new Promise((resolve,reject)=>{
          
           var instance = new Razorpay({
            key_id: 'rzp_test_79XxtKjzAHhMKG',
            key_secret: 'VA9JMYudQ0wCfbBCXCErvJbg',
          });  
            var options = {
              amount: total*100,  // amount in the smallest currency unit
              currency: "INR",
              receipt:""+orderId
            };
            instance.orders.create(options, function(err, order) {
              console.log(order);
              resolve(order)
            });
          })
      },

      verifyPayment:(details)=>{
          return new Promise((resolve,reject)=>{
              const crypto=require('crypto')
              let hamc = crypto.createHmac('sha256','VA9JMYudQ0wCfbBCXCErvJbg')
              hamc.update(details['payment[razorpay_order_id]']+ '|'+details['payment[razorpay_payment_id]'])
              hamc=hamc.digest('hex')
              if(hamc==details['payment[razorpay_signature]']){
                  resolve()
              }else{
                  reject()
              }
          })
      },

      changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:ObjectId(orderId)},
            {
                $set:{
                    "status":"placed"
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    

    getOrderList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders= await db.get().collection(collection.ORDER_COLLECTIONS).find({$and:[{userId:ObjectId(userId)},{statusupdate:{$ne:"delivered"}}]  }).sort({"delivaryDetails.date":-1}).toArray() 
            resolve(orders)
        })
    },
    getDeliveredOrder:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders= await db.get().collection(collection.ORDER_COLLECTIONS).find({$and:[{userId:ObjectId(userId)},{statusupdate:"delivered"}]}).sort({"delivaryDetails.date":-1}).toArray( )
            resolve(orders)
        })
    },

    getOrderproduct:(orderId)=>{

        return new Promise(async(resolve,reject)=>{
            let orderItems=await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
            {
                $match:{_id:ObjectId(orderId)}
            },
            {
                $unwind:"$products"
            },
            {
                $project:{
                    item:"$products.item",
                    quantity:"$products.quantity"
                }
            },
            {
                $lookup:{
                    from:'products',
                    localField:'item',
                    foreignField:'_id',
                    as:'products'
                }
            },
            {
                $project:{
                    item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
                }
            }

          ]).toArray()
          resolve(orderItems)
        })
    },

    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders= await db.get().collection(collection.ORDER_COLLECTIONS).find({$and:[{status:"placed"},{statusupdate:{$ne:"canceled"}}]} ).sort({"delivaryDetails.date":-1}).toArray()
            resolve(orders)
        })
    },

    deliveredOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders= await db.get().collection(collection.ORDER_COLLECTIONS).find({statusupdate:"delivered"}).sort({"delivaryDetails.date":-1}).toArray()
            resolve(orders)
        })
    },

    pendingOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders= await db.get().collection(collection.ORDER_COLLECTIONS).find({ $or:[{status:"pending"},{statusupdate:"canceled"}]}).sort({"delivaryDetails.date":-1}).toArray()
            resolve(orders)
        })
    }  ,

    cancelOrder:(orderId)=>{
     db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:(ObjectId(orderId))},
     {
         $set:{statusupdate:"canceled"}
     })
    },
    
    
    changeOrderStatus:(currentStatus,orderId)=>{
        
        return new Promise(async(resolve,reject)=>{
            if(currentStatus=="received"){
                db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:ObjectId(orderId)},
                {
                    $set:{statusupdate:"received"}
                    
                })
                resolve()
            }
           else if(currentStatus=="shipped"){
            
                db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:ObjectId(orderId)},
                {
                    $set:{statusupdate:"shipped"}
                    
                })
                resolve()
            }
            else if(currentStatus=="delivered"){
                db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:ObjectId(orderId)},
                {
                    $set:{statusupdate:"delivered"}
                    
                })
                resolve()
            }
           
        })
    },

    getOrderdetails:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
         let product=await db.get().collection(collection.ORDER_COLLECTIONS).findOne({_id:ObjectId(orderId)})
           resolve(product)
        })
    },

 //coupon
    createCoupon:async(couponCod,amount,quantity)=>{
       let sample=await db.get().collection(collection.COUPON_COLLECTIONS).findOne({code:couponCod})
        return new Promise((resolve,reject)=>{
            if(sample === null){
                let coupon ={
                    code:couponCod,
                    amount:amount,
                    quantity:quantity,
                    date:new Date()
               }
   
             db.get().collection(collection.COUPON_COLLECTIONS).insertOne(coupon).then((data)=>{
                 resolve(data)
             })
            }
            else{
                resolve(false)
            }
          
        })
    },

    validateCoupon:async(couponcode)=>{

       let coupon=await db.get().collection(collection.COUPON_COLLECTIONS).findOne({code:couponcode})
       console.log(coupon,"exist hewareeeee");
       return coupon;
    },

    lessCouponDiscount:async(userId,couponAmount)=>{
        console.log(userId,"less");
        let total =await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
        console.log(subtotal);
        return(subtotal)
    },

    getAddress:async(userId)=>{
        let address=await db.get().collection(collection.ADDRESS_COLLECTIONS).find({userId:userId}).toArray()
        return (address)
    },

    singleTotal:async(productid)=>{
        let proId= productid.slice(1);
        let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({_id:ObjectId(proId)}).toArray()
        return product
    },

    getTotalOrders:async()=>{
        let totalOrders= await db.get().collection(collection.ORDER_COLLECTIONS).count()
        return(totalOrders)
    },
    
    getTotalRevenue:async()=>{
        let revenue =0
        let orders= await db.get().collection(collection.ORDER_COLLECTIONS).find({statusupdate:"delivered"}).toArray()
        let count = await db.get().collection(collection.ORDER_COLLECTIONS).find({statusupdate:"delivered"}).count()

             for(i=0;i<count;i++){
                 let num1=parseInt(orders[i].grandTotal)
                 revenue=revenue+num1
             }

             
        return revenue
    },

    pendingOrdersCount:async()=>{
        let count = db.get().collection(collection.ORDER_COLLECTIONS).find({statusupdate:"received"}).count()

        return count
    },

    usersCount:async()=>{
        let count =await db.get().collection(collection.USER_COLLECTION).count()

        return count
    }
    

 

   
}