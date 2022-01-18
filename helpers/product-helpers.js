var db=require('../config/connection')
var collection=require('../config/collection');
const { ObjectId } = require('bson');
const { response } = require('express');

module.exports={

    addProducts:async(product)=>{
      console.log(product);
        return new Promise (async(resolve,reject)=>{
       
          const data= await db.get().collection(collection.PRODUCT_COLLECTION).insertOne({
            title:product.title,
            brand:product.brand,
            category:product.category,
            size:product.size,         
            details:product.details,
            price:product.price,
            offer:parseInt(product.offer),
            quantity:product.quantity
          }); 
     
           resolve(data.insertedId)             
        })
      
    },
    getAllproducts:()=>{
      return new Promise (async(resolve,reject)=>{
        let products= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
        let menproducts= await db.get().collection(collection.PRODUCT_COLLECTION).find({category:"MEN"}).toArray()
        let womenproducts= await db.get().collection(collection.PRODUCT_COLLECTION).find({category:"WOMEN"}).toArray()
        resolve({products,menproducts,womenproducts})
        // resolve(products)
      })
      
    },
    getProductData:(userId)=>{
        return new Promise(async(resolve,reject)=>{
       let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(userId)})
       resolve(product)
       })
    },

    deleteProduct:(productId)=>{ 
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:ObjectId(productId)}).then((response)=>{
          resolve(response)
        })
      })
    },
    editProduct:(productId,productDetals)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(productId)},{
          $set:{
            title:productDetals.title,
            brand:productDetals.brand,
            category:productDetals.category,
            size:productDetals.size,         
            details:productDetals.details,
            price:productDetals.price,
            offer:parseInt(productDetals.offer),  
            quantity:productDetals.quantity
          }  
        }).then((response)=>{  
          resolve(response)
        })
      })
    },
    
    getAllCoupon:async()=>{
      let coupon = db.get().collection(collection.COUPON_COLLECTIONS).find().toArray()
      return coupon
    }
    
}