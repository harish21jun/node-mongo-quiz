exports.calculate = function(req, res, next) {
			res.render('statistics', {
				page : 'statistics',
//				quizzes: quizzes,
	//			comments: comments.length,
		//		avg: comments.length / quizzes,
			//	without_comments: no_comments,
				//with_comments: quizzes - no_comments,
				//users:userCount,
				questionAttempted:req.session.user.incorrectCount+req.session.user.correctCount,
				score:req.session.user.correctCount/(req.session.user.incorrectCount+req.session.user.correctCount)*100,
				errors: []
			});
		};
