var url = require('url') ;
var len;
exports.ownershipRequired = function(req, res, next) {
	var objQuizOwner = req.quiz.UserId;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;

if (isAdmin || objQuizOwner === logUser) {
		next();
	} else {
		res.redirect('/');
	}
};

// Autoload :id
exports.load = function(req, res, next, quizId) {

	req.collections.quiz.findOne({id:Number(quizId)},function(error, quiz) {
	if (quiz) {
			req.quiz = quiz;
			next();
		} else {
			next(new Error('Nonexistent quizId=' + quizId))
		}
	}
)};



// GET /quizzes
// GET /users/:userId/quizzes
exports.index = function(req, res) {
	var options = {};
	var query = url.parse(req.url,true).query;
	var quizzes;

	if (JSON.stringify(query) != '{}' && query.search != ''){
		options = {where: ['question like ?', '%'+query.search.replace(/\s+/g,'%')+'%']};
		console.log(options);
	}

	var _page = 'quiz-index';
	if (req.user) {
		options = {
			UserId: req.user.id
		}
		_page = 'quiz-index-user';
	}
req.collections.quiz.find(options, {sort: {_id: 1}}).toArray((error, qss) => {
				if (error) return next(error)
					quizzes=qss;
					len=quizzes.length;
					console.log(len);

					res.render('quizzes/index.ejs', {
					page : _page,
					quizzes: quizzes,
					errors: []
				});
				})

		};


	/*models.Quiz.findAll(options).then(
		function(quizzes) {

			len=quizzes.length;
			res.render('quizzes/index.ejs', {
				page : _page,
				quizzes: quizzes,
				errors: []
			});
		}
	).catch(function(error) {
		next(error)
	});
};
*/

// GET /quizzes/:id
exports.show = function(req, res) {
	res.render('quizzes/show', {
		page : 'quiz-show',
		quiz: req.quiz,
		errors: []
	});
};

// GET /quizzes/:id/answer
exports.answer = function(req, res) {
	var result = 'Incorrect';

	if(!req.session.user.correctCount)
		req.session.user.correctCount = 0;
	if(!req.session.user.incorrectCount)
			req.session.user.incorrectCount = 0;

	if (req.query.answer === req.quiz.answer) {
		result = 'Correct';
		req.session.user.correctCount=req.session.user.correctCount+1;
		console.log("CorrectCount:"+req.session.user.correctCount);

	}
	else{
			req.session.user.incorrectCount=req.session.user.incorrectCount+1;
			console.log("IncorrectCount:"+req.session.user.incorrectCount);
	}
	res.render(
		'quizzes/answer', {
			page : 'quiz-answer',
			quiz : req.quiz,
			answer : result,
			len: len,
			errors: []
		}
	);
};

// GET /quizzes/new
exports.new = function(req, res) {
	var quiz = {
		question: '',
		answer: ''
	};

	res.render('quizzes/new', {
		page : 'quiz-new',
		quiz: quiz,
		errors: []
	});
};

// GET /quizzes/new
/*exports.new = function(req, res) {
	var quiz = models.Quiz.build({
		question: '',
		answer: ''
	});

	res.render('quizzes/new', {
		page : 'quiz-new',
		quiz: quiz,
		errors: []
	});
};
*/

// POST /quizzes/create
exports.create = function(req, res) {
var quizLength = 0;
	req.body.quiz.UserId = req.session.user.id;
	if (req.files.image) {
		req.body.quiz.image = req.files.image.name;
	}
	req.collections.quiz.find({}, {sort: {_id: -1}}).toArray((error, quizess) => {
	    if (error) return next(error)
			if(quizess){
				quizLength = quizess.length;
				console.log("quizLength:"+quizLength);
				req.body.quiz.id=quizLength+1;
				 }

req.collections.quiz.insert(req.body.quiz, (err, results) => {
	if (err) {
		res.render('quizzes/new', {
			page : 'quiz-new',
			quiz: quiz,
			errors: err.errors
		});
	}
	else{
    res.redirect('/quizzes')
	}
})
}
)//toArray
};


// GET /quizzes/:id/edit
exports.edit = function(req, res) {
	var quiz = req.quiz;

	console.log(quiz);

	res.render('quizzes/edit', {
		page : 'quiz-edit',
		quiz: quiz,
		errors: []
	});
};

// PUT /quizzes/:id
exports.update = function(req, res) {
	if (req.files.image) {
		req.quiz.image = req.files.image.name;
	}
	req.quiz.question = req.body.quiz.question;
	req.quiz.answer = req.body.quiz.answer;
	req.quiz.thematic = req.body.quiz.thematic;
	req.quiz.options = req.body.quiz.options;

req.collections.quiz.update({id:req.quiz.id} ,{$set: {"question": req.quiz.question, "options": req.quiz.options, "answer":req.quiz.answer,"thematic": req.quiz.thematic, "image":req.quiz.image }},
	function(error, count) {
	if (error) {
		res.render('quizzes/edit', {
			quiz: req.quiz,
			errors: err.errors
		});
	}
	else{
		res.redirect('/quizzes');
	}
}
)};

// DELETE /quizzes/:id
exports.destroy = function(req, res) {
	req.collections.quiz.remove({id:req.quiz.id}, function(error, count) {
		 if (error)
		 console.log(error);
	 	res.redirect('/quizzes');
	}
)};
