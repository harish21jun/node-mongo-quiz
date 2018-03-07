var express			= require('express'),
	path			= require('path'),
	favicon			= require('serve-favicon'),
	logger			= require('morgan'),
	cookieParser	= require('cookie-parser'),
	bodyParser		= require('body-parser'),
	partials		= require('express-partials'),
	methodOverride	= require('method-override'),
	session			= require('express-session'),
	debug			= require('debug')('quiz'),
	//nodemailer = require('nodemailer');
	dotenv			= require('dotenv');
	const mongodb= require('mongodb')
	var url = "mongodb://";//localhost:27017/tocp-quiz-db'


	if(process.env.OPENSHIFT_MONGODB_PASSWORD){
  url = url+process.env.OPENSHIFT_MONGODB_USER + ":" +
  process.env.OPENSHIFT_MONGODB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_SERVICE_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_SERVICE_PORT + '/' +
  process.env.OPENSHIFT_MONGODB_DATABASE;
}
else {
	url=url+"localhost:27017/tocp-quiz-db";
}
console.log("MongoDB Connection URL:"+url);

	var collections;

	mongodb.MongoClient.connect(url, (error, database) => {
	  if (error) return process.exit(1)
	  collections = {
		 user: database.collection('Users'),
		 quiz: database.collection('Quiz')
		}
	}
);
var app = express();

app.use(function(req, res, next) {
  if (!collections.user || ! collections.quiz) return next(new Error("No collections."))
  req.collections = collections;
  return next();
});


var env = process.env.NODE_ENV || 'dev';

if (env == 'dev'){
	dotenv.load();
};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('node-mongo-quiz'));
app.use(session({
	secret: 'qwertyuiop',
    resave: true,
    saveUninitialized: true,
		cookie: { maxAge: 300000 }
}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
	if (!req.session.redir) {
		req.session.redir = '/';
	}
	if (!req.path.match(/\/login|\/logout|\/user/)) {
		req.session.redir = req.path;
	}

	res.locals.session = req.session;

	next();
});

app.use('/', require('./routes/index'));

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});


var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
app.listen(port, ip, function () {
    console.log( "Listening on " + ip + ", server_port " + port  );
});
