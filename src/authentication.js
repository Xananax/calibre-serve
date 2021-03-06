const session = require('express-session')
const FileStore = require('session-file-store')(session);

module.exports = function createAuth(app,tokens,skip){

	const _tokens = {};
	tokens.forEach(function(token){
		_tokens[token] = true;
	})
	app.use(session(
		{ secret: Math.random()+'calibre-server'
		, resave: false
		, saveUninitialized: true
		, store:new FileStore()
		})
	);

	function login(req, res, next) 
		{

			var token = req.session.token ||  req.query.token || req.params.token;

			if (!token){return next();}
			if(!_tokens[token]){
				req.session.token = null;
				return next();
			}
			
			req.session.token = token;

			return next();
		}


	function verify(req,res,next){
		return login(req,res,function(err){
			if(err){return next(err);}
			if(skip){
				if(skip.test(req.url)){return next();}
			}
			if(!req.session.token){
				const err = new Error('You need a valid token to access this');
				err.status = 403;
				return next(err);
			}
			return next();
		})
	}

	return {login,verify};

}