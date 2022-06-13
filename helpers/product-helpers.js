var db=require('../config/connection')
var collection=require('../config/collection');
const { ObjectId } = require('bson');
const { response } = require('express');

module.exports={

    addProducts:async(product)=>{
      
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
        let kidsproducts= await db.get().collection(collection.PRODUCT_COLLECTION).find({category:"KIDS"}).toArray()

        resolve({products,menproducts,womenproducts,kidsproducts})
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
    },
    addOffers:async(data)=>{
     
      return new Promise (async(resolve,reject)=>{
       
        const offers= await db.get().collection(collection.OFFERS_COLLECTIONS).insertOne({
          offer1:data.percentage1,
          offer2:data.percentage2,
          brand1:data.brand1,
          brand2:data.brand2

          
        }); 
   
         resolve(offers.insertedId)             
      })
      
     
    },
    getOffersData:()=>{
      return new Promise (async(resolve,reject)=>{
        let offerdata= await db.get().collection(collection.OFFERS_COLLECTIONS).find().sort({_id:-1}).limit(1).toArray()

        resolve(offerdata)
      });
         
    },

    serchProduct:(data)=>{
      return new Promise (async(resolve,reject)=>{
        if (data.type == "null"){
         let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({$or:[{"title":data.searchkey},{"brand":data.searchkey},{"category":data.searchkey}]}).toArray()
         resolve(products)
        }else if(data.type == "men"){
          
          let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({$and:[{"category":"MEN"},{$or:[{"title":data.searchkey},{"brand":data.searchkey},{"category":data.searchkey}]}]}).toArray()

        
          
          resolve(products)

        }else if(data.type == "women"){

          let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({$and:[{"category":"WOMEN"},{$or:[{"title":data.searchkey},{"brand":data.searchkey},{"category":data.searchkey}]}]}).toArray()

          
          resolve(products)

        }
        else{
          let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({$and:[{"category":"KIDS"},{$or:[{"title":data.searchkey},{"brand":data.searchkey},{"category":data.searchkey}]}]}).toArray()

         
          if (products == null){
           
          }
          resolve(products)
        }
        resolve()
      })
    },


    offerProducts:(data)=>{
      return new Promise (async(resolve,reject)=>{
        let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({"brand":data}).toArray()
        
       
        resolve(products)

      })
  
    } ,
    
    
    
}