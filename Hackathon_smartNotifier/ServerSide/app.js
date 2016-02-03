var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();
var mysql = require('mysql');
var fs = require('fs');
app.use(express.static('../uploads'))
var HttpsProxyAgent = require('https-proxy-agent')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
 var fileupload = require('fileupload').createFileUpload('/uploadDirectory').middleware
var done=true;
var countrow=2;
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
   // console.log(file);
    cb(null, file.originalname);
  }
})
var countrow=0;
var upload = multer({ storage: storage });

var proxy='http://pavankumar_patil:Nambiyar@10@hjproxy.persistent.co.in:8080';
var agent = new HttpsProxyAgent(proxy);
var PdfReader=require('pdfreader').PdfReader;
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root@123',
  database : 'hck_smartnotifier'
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Pass to next layer of middleware
    next();
});

//to make db connection
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... \n\n");  
} else {
    console.log("Error connecting database ... \n\n");  
}
});




app.post('/login', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', '*');
	var body=req.body;
	console.log(body); 
	var query="SELECT * FROM login where email_id='"+body.email_id+"' and passwordforuser='"+body.password+"'";
	connection.query(query,function(err, rows, fields) {
	if (!err) {
		if(rows.length>0){
			console.log("Record matched to db");
			res.send(JSON.stringify({
			result: 'success',
			json: rows
			}));
			
		}
		else{
			console.log("Record not matched to db");
			res.send(JSON.stringify({
			result: 'error',
			json: rows
			}));
		}
	}
	else{	
		console.error(err);
		res.statusCode = 500;
		res.send(JSON.stringify({
			result: 'error',
			err: err.code
		}));
		//connection.end();
	}	 
	});

});

//To get requested user's details
app.get('/getFile', function(req, res) {
	  res.sendFile('./uploads/'+req.query.filename,{root:__dirname})
		
});
app.post('/log', upload.single('file'), function(req,res){
 //  console.log(req.query);
     connection.query("SELECT * from noticedetails",function(err, rows, fields) {
	if (err) {
		console.error(err);
		res.statusCode = 500;
		res.send(JSON.stringify({
			result: 'error',
			err: err.code
		}));
	}
	else{
	//console.log(rows.length);
	 countrow=rows.length+1;
	//console.log(countrow);
var query1="INSERT INTO  noticedetails VALUES ("+countrow+",'"+req.query.documentName+"','"+req.query.typeOfDocument+"','"+req.query.link_of_website+"','doc',"+"'02-02-1016'"+")";
	connection.query(query1,function(err, rows, fields) {
	if (err) {
		console.error(err);
		res.statusCode = 500;
		res.send(JSON.stringify({
			result: 'error',
			err: err.code
		}));
	}
	else{	 
	//	console.log("Record saved to Requests table");
	//	console.log("file object"+req.file);
		//console.log("filename"+req.file.originalname);
	getCategory(req.file.originalname);
		res.send(JSON.stringify({
				result: 'success',
				json: rows,
				length: rows.length
				}));
		//connection.end();
	}	 
	});
    	
	}	 
	});
    
	
});
 
app.post('/uploads', function(req, res) {
  console.dir(req.files);
});
//To post user's details
app.post('/postregistrationData', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', '*');
	var body=req.body;
//	console.log(body); 
	var query1="INSERT INTO  user_details VALUES ('"+body.email_id+"','"+body.password+"','"+body.verticleInterested+"','"+body.pincode+"','"+body.address+"')";
	connection.query(query1,function(err, rows, fields) {
	if (err) {
		console.error(err);
		res.statusCode = 500;
		res.send(JSON.stringify({
			result: 'error',
			err: err.code
		}));
	}
	else{	
		console.log("Record saved to Requests table");
		var check=getCustomerDetails(body.email_id,function(error,isExist){
			if(error==null){
				if(isExist){
					console.log("Exist ");
				}
				else
				{	console.log("Not Exist ");
					insertCustomerData(body.email_id,body.password);
				}
			}
			else{
				console.log("Error while selecting ");
			}
		});
		res.send(JSON.stringify({
				result: 'success',
				json: rows,
				length: rows.length
				}));
		//connection.end();
	}	 
	});

});

//To update URL
/*app.get('/CategorySetter', function(req, res) {
 var categorySearchString="";
var options = {
  url: "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/563C46x19-nlc-3023/classify?text="+categorySearchString,
agent : agent,
  headers: {
  'Accept':'application/json',
    'Authorization': 'Basic MTQ1ZTVmOGYtMGQ5Ni00YjU4LTk4NWEtZWJkZTE4ZmY2YWFmOnRoR2VGNUx6akZrZQ=='
  }
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
console.log(JSON.stringify(body));
  }
  else{
  console.log(error);
  }
}



	new PdfReader().parseFileItems("hackathon/uploads/"+GSEC2201167417E764D057444891D3608A97D54F29.pdf", function(err, item){
  if (err)
    console.log(err);
  else if (!item)
    callback();
  else if (item.text)
   categorySearchString=categorySearchString+" "+item.text;
console.log(categorySearchString);
});

request(options, callback);


});*/
app.get('/getNotices', function(req, res) {
	
connection.query('SELECT * FROM noticedetails ', function(err, rows, fields) {
	
  if (!err){
   
	res.send(rows);
	}
  else{
    console.log('Error while performing Query.');
  }
  });
	


});

function getCategory(filename){
//console.log("filename"+filename);

 var categorySearchString="";
var options = {
  url: "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/563C46x19-nlc-3160/classify?text='"+categorySearchString+"'",
agent : agent,
  headers: {
'Accept':'application/json',
    'Authorization': 'Basic MTQ1ZTVmOGYtMGQ5Ni00YjU4LTk4NWEtZWJkZTE4ZmY2YWFmOnRoR2VGNUx6akZrZQ=='
  }
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {

console.log("jsonparsed"+JSON.parse(body));
console.log("jsonstringified"+JSON.stringify(JSON.parse(body)));
var cat=JSON.parse(body);
console.log("category "+cat.classes[0].class_name)

var query1="UPDATE   noticedetails set category='"+cat.classes[0].class_name+"' where ID="+countrow;
	connection.query(query1,function(err, rows, fields) {
	if (err) {
		console.error(err);
		
	}
	else{	console.log("category updated")
		//connection.end();
	}	 
	});



  }
  else{
 console.log("category error"+error);
  }
}



	new PdfReader().parseFileItems("uploads/"+filename, function(err, item){
  if (err)
    console.log(err);
  else if (!item)
    callback();
  else if (item.text)
   categorySearchString=categorySearchString+" "+item.text;
console.log(categorySearchString);
});

request(options, callback);


}

function getCustomerDetails(emailId,callback){
	connection.query("SELECT * FROM login where email_id='"+emailId+"'", function(err, rows, fields) {
	//connection.end();
  if (!err){
    console.log('The solution is: ', rows);
    if(rows.length>0){
    	 callback(null,true);
 	}
 	else
 		callback(null,false);
	//res.send(rows);
	}
  else{
    console.log('Error while performing Search on Customer.');
    callback(err,false);
  }
  });
}

function insertCustomerData(email_id,password){
	var query="INSERT INTO login  VALUES ('"+email_id+"','"+password+"')";
	connection.query(query,function(err, rows, fields) {
	if (err) {
		console.error(err);
	}
	else{	
		console.log("Record added to customer db");
	}	 
	});
}
app.listen(3000, '10.44.118.18');;
