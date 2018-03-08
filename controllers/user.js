var crypto = require('crypto');
key='asdfghjklzxcvbnmqwertyuiop';
exports.ownershipRequired = function(req, res, next) {
	var objUser = req.user.id;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;

	if (isAdmin || objUser === logUser) {
		next();
	} else {
		res.redirect('/');
	}
};

// Autoload :id
exports.load = function(req, res, next, userId) {
	req.collections.user.findOne({id:Number(userId)},function(error, user) {
	 if (error) return next(error);
	 if(user){
		 req.user = user;
		 next();
			}
		else{
					next(new Error('Nonexistent userId ' + userId))
				}
			})
	};


exports.auth = function(req,login, password, callback) {
	var encripted = crypto.createHmac('sha1', key).update(password).digest('hex');
  if (password === '') { encripted = '';  }

req.collections.user.findOne({username:login, password:encripted},function(error, user) {
 if (error) return callback(error);
 if(user){
 		callback(null, user);
		}
	else{
				callback(new Error('Wrong password or Nonexistent user ' + login));
			}
		})
	};

// GET /user/:id/edit
exports.edit = function(req, res,next) {
	res.render('user/edit', {
		page : 'user-edit',
		user: req.user,
		errors: []
	});
};

// GET /user
exports.new = function(req, res,next) {
	var user = {
		username: '',
		password: ''
	};
	res.render('user/new', {
		page : 'user-new',
		user: user,
		errors: []
	});
};

// POST /user
/*
exports.create = function(req, res) {
var userLength = 0;
var encripted = crypto.createHmac('sha1', key).update(req.body.user.password).digest('hex');
if (req.body.user.password === '') { encripted = '';}

//req.collections.user.find({}, {sort: {_id: -1}}).toArray((error, users) => {
req.collections.user.findOne({}, {sort: {_id: -1}}, function(error, user)  {
         if (error) return next(error)
         if(user){
					 userLength = user.id;
					 console.log("userLength:"+userLength);
				 }
				 req.collections.user.insert({id:userLength+1,username:req.body.user.username, password:encripted},function(err, user) {
					 if (err) {
						 res.render('user/new', {
							 page : 'user-new',
							 user: user,
							 errors: err.errors
						 });
					 	}//if
						else{
							req.session.user = {
								id: user.id,
								username: user.username
							};
							console.log("req.session.user.id:"+req.session.user.id);
							res.redirect('/');
						} //else
				 })//insert
			 });
			//)//toArray
};


*/


exports.create = function(req, res,next) {
var userId = 0;
var encripted = crypto.createHmac('sha1', key).update(req.body.user.password).digest('hex');
if (req.body.user.password === '') { encripted = '';}

req.collections.user.findOne({}, {sort: {_id: -1}}, function(error, user)  {
         if (error) return next(error)
         if(user){
					 userId = user.id;
				 }
				 userId=userId+1;
					req.collections.user.insert({id:userId,username:req.body.user.username, password:encripted})
				 .then(
					 function() {
								req.session.user = {
								id: userId,
								username: req.body.user.username
							};
							console.log("req.session.user.id:"+req.session.user.id);
							res.redirect('/');
						})
			 });
};


// PUT /user/:id
exports.update = function(req, res, next) {

	req.user.username = req.body.user.username;
	req.user.password = req.body.user.password;
	var encripted = crypto.createHmac('sha1', key).update(req.user.password).digest('hex');

 if (req.user.password === '') {encripted = ''; }

	req.collections.user.update({id:req.user.id} ,{$set: {"username": req.user.username, "password" :encripted }}, function(error, count) {

		if (error) {
			res.render('user/' + req.user.id, {
				page : 'user-update',
				user: req.user,
				errors: err.errors
			});
		} else {
				res.redirect('/');
		}
   });
 };



// DELETE /user/:id
exports.destroy = function(req, res,next) {
	//console.log("destroy"+req.user.id);
	req.collections.user.remove({id:req.user.id}, function(error, count) {
		 if (error)
		 console.log(error);
	 	delete req.session.user;
		res.redirect('/');
 });
};
