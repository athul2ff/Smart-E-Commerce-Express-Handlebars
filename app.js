var createError = require('http-errors');
var express = require('express');
const fileUpload=require('express-fileupload')

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require ('express-handlebars')    
const session=require('express-session')
const handlebarsHelpers =require('handlebars')

var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin'); 

var app = express();    

var db=require('./config/connection');
const { SafeString } = require('handlebars');
const productHelpers = require('./helpers/product-helpers');   


// view engine setup

app.use(session({
  secret: 'mYsEcReTkEy',
  cookie:{maxAge:100000000},
  resave: true,  
  saveUninitialized: true
  
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials/'}))




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());   
db.connect((err)=>{
  if(err) console.log('database connetion Err');
  else    console.log('database connected successfully');    
})
app.use('/', usersRouter);
app.use('/admin', adminRouter);




handlebarsHelpers.registerHelper("product",(userId)=>{
  return new handlebarsHelpers.SafeString(`<a href="/singelview/${userId}" class="link-product-add-cart">Quick View</a>`)
}) 

//size value1 
handlebarsHelpers.registerHelper("sizenot",(size)=>{  
  if(size=="Small" || size=="Medium" || size=="Large" || size=="XL" || size =="XXL"){
    
    return new handlebarsHelpers.SafeString(`<option value="null">${size}</option>`)
  }
})
handlebarsHelpers.registerHelper("add",(val)=>{
  let value=val+1
  return new handlebarsHelpers.SafeString(`${value}`)
}) 
handlebarsHelpers.registerHelper("date",(newDat)=>{
  let date=newDat.toString().slice(0, 10)+"_"+newDat.toString().slice(11, 16)
  return new handlebarsHelpers.SafeString(`${date}`)
})
handlebarsHelpers.registerHelper("time",(newDat)=>{
  let time=newDat.toString().slice(16, 21)
  return new handlebarsHelpers.SafeString(`${time}`)
})

handlebarsHelpers.registerHelper("dateTime",(newDat)=>{
  let time=newDat.toString().slice(0, 21)
  return new handlebarsHelpers.SafeString(`${time}`)
})

//for check box checked action on edit-product
handlebarsHelpers.registerHelper("checkSize",(size)=>{
  for(i=0;i< size.length ;i++){
    if(size[i]=="Small" || size=="Small"){
      return new handlebarsHelpers.SafeString(`checked`)
    }
  }
})
handlebarsHelpers.registerHelper("checkSize2",(size)=>{
  for(i=0;i< size.length ;i++){
    if(size[i]=="Medium" || size=="Medium"){
      return new handlebarsHelpers.SafeString(`checked`)
    }
  }
})
handlebarsHelpers.registerHelper("checkSize3",(size)=>{
  for(i=0;i< size.length ;i++){
    if(size[i]=="Large" || size=="Large"){
      return new handlebarsHelpers.SafeString(`checked`)
    }
  }
})
handlebarsHelpers.registerHelper("checkSize4",(size)=>{
  for(i=0;i< size.length ;i++){
    if(size[i]=="XL" || size=="XL"){
      return new handlebarsHelpers.SafeString(`checked`)
    }
  }
})
handlebarsHelpers.registerHelper("checkSize5",(size)=>{
  for(i=0;i< size.length ;i++){
    if(size[i]=="XXL" || size=="XXL"){
      return new handlebarsHelpers.SafeString(`checked`)
    }
  }
})

//checked radio action  
handlebarsHelpers.registerHelper("checkRadio1",(product)=>{
  if(product.category=="MEN"){
    return new handlebarsHelpers.SafeString(`checked`)
  }
})          
handlebarsHelpers.registerHelper("checkRadio2",(product)=>{
  if(product.category=="WOMEN"){
    return new handlebarsHelpers.SafeString(`checked`)
  }
})
handlebarsHelpers.registerHelper("checkRadio3",(product)=>{
  if(product.category=="KIDS"){
    return new handlebarsHelpers.SafeString(`checked`)
  }
})


handlebarsHelpers.registerHelper("block",(status,userId)=>{
  if(status=="unblock"){
    return new handlebarsHelpers.SafeString(`<td><a href="/admin/block/${userId}"><div style="background-color: #0562afb4;margin: 10px; width: 140px; color: #ffff; padding: 4px; text-align: center;width: 100px;">BLOCK USER</div></td></a>`)
  } else {
    return new handlebarsHelpers.SafeString(`<td><a href="/admin/unblock/${userId}"><div style="background-color: #05123898;margin: 10px; width: 140px; color: rgba(255, 255, 255, 0.856); padding: 4px; text-align: center; width: 100px;">UNBLOCK </div></td></a>`)
  }
})

handlebarsHelpers.registerHelper("dueAmount",(total,status)=>{ 
  let zero=0
  if(status==="cod"){
    return new handlebarsHelpers.SafeString(`${total}`)
  }else{
    return new handlebarsHelpers.SafeString(`${zero}`)
  }
})
//status select 
handlebarsHelpers.registerHelper("checkOrderStatus",(status)=>{
  if(status=="received"){
    return new handlebarsHelpers.SafeString(`selected`)
  }
 
})  

handlebarsHelpers.registerHelper("checkOrderStatus1",(status)=>{
  if(status=="shipped"){
    return new handlebarsHelpers.SafeString(`selected`)
  }
  console.log(status,"helloooooo world")
})


handlebarsHelpers.registerHelper("checkOrderStatus2",(status)=>{
  if(status=="delivered"){
    return new handlebarsHelpers.SafeString(`selected`)
  }
})

//Order failed error
handlebarsHelpers.registerHelper("orderIssue",(paymentMethod,statusupdate)=>{
  if(paymentMethod=="online"){
    return new handlebarsHelpers.SafeString(`online Payment`)
  }else if(statusupdate=="canceled"){
    return new handlebarsHelpers.SafeString(`canceled by customer`)
  }
  else{
    return new handlebarsHelpers.SafeString(`Network Error`)
  }
}) 

//delivered disable
handlebarsHelpers.registerHelper("disableDelivered",(method)=>{
  if(method==="delivered"){
    return new handlebarsHelpers.SafeString(`disabled`)
  }
})
//cancel Order
handlebarsHelpers.registerHelper("cancelOrder",(status)=>{
  if (status=="canceled"){
    return new handlebarsHelpers.SafeString(`disabled`)
  }
})
handlebarsHelpers.registerHelper("cancelStatus",(status)=>{
  if(status=="canceled"){
    return new handlebarsHelpers.SafeString(`Canceled`)
  }else{
    return new handlebarsHelpers.SafeString(`Cancel Order`)
  }
})

//invoice line total
handlebarsHelpers.registerHelper("lineTotal",(price,quantity)=>{
  let value1=parseInt(price)
  let value=parseInt(quantity)
  let total=value*value1
  return new handlebarsHelpers.SafeString(`${total}`)
})
//refund amount
handlebarsHelpers.registerHelper("refund",(payment,total,status)=>{
  if(payment=="online" && status=="placed"){
    return new handlebarsHelpers.SafeString(`${total}`)
  }else{
    return new handlebarsHelpers.SafeString(`0`)
  }
})



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));       
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
