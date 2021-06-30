const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

//Establishing SQL connection with postgre database
const db = knex ({
  client: 'pg',
  connection: {
    connectionString : process.env.DATABASE_URL,
    ssl:true
  }
});

//Create the web server to establish HTTP connection
const app = express();


//Encoding part 
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());


app.get('/',(req,res) => {
	res.json("it's working ...");
})
// To apply "Dependencies Injection" to signin.userSignin andmake the code much cleaner, apply the following:
// * Export the signin file => const signin = require('../controllers/signin')
// ** Delete below rout and paste this => app.post('/signin', (req,res)=> {signin.userSignin(req, res, db, bcrypt)})
// *** Go to /controllers/signin.js & uncommment the whole file, and that is it
// Did not apply that becuse we have literally 3 routes only in this server.

app.post('/signin',(req,res) => {
	const { email, password} = req.body;
	//note 775 below.
	db('login').select('email','hash').where({email:email})
	.then(response => {
		dbEmail = response[0].email;
		dbHash = response[0].hash;
		//compare hash with password hash & assign the comparasion value to var
		const passowrdMatch = bcrypt.compareSync(password, dbHash);
		if (passowrdMatch) {
			db('users').select('*').where({email:dbEmail})
			.then(resp => {
				const user = resp[0];
				res.json({ messege:'success', userInfo:user });
			})
			.catch(error => console.log('oops retriving data error: iner promise==> ',error))
		} 
		else {
			//else if the email found but the password not matching
			res.json({messege:'Check your email & Password !!'})
		}
	})
	.catch(err => {
		//email not found or did not connect to DB
		res.json({messege:'Signing in failed, you need to Register or check your Email & password'})
	})
})

app.post('/register',(req,res) => {
	const {name, email, password} = req.body;
	let dataPushCheck = false;
		//check if the values not empty(intially)
		if(name.length > 2 && email.length > 6 && password !== ""){
		//grapping the password into a temprary var & hashing it
		let hashpass = bcrypt.hashSync(password);
		//pushing the date to DB users table
		db('users').insert({
			name: name,
			email: email,
			date: new Date()
		})
		.then(response => {
			dataPushCheck = true;
			//pushing the data to DB login table
			db('login').insert({
				email: email,
				hash: hashpass
			})
			//best practice here to use transaction >>> will be update soon.
			.then(resp => resp ? dataPushCheck = true : console.log(dataPushCheck, ': naai naii, check =false'))
			// 	dataPushCheck = true;
			// 	console.log(resp, 'wow database updated successfully');
			//.catch(erro => console.log('oops inner promise error'))			
		})
		.catch(err => res.json({messege:'Failed to register: Email is already used'}))
		.finally(() => {
			// if both promises executed without errors and push success, responsing with the registered user
			if (dataPushCheck){
				let userInfo;
				db('users').where({ email: email }).select('*')
				.then(response => userInfo=response[0])
				.finally(() => {
					res.json({
						messege:'You are registered !!',
						userInfo:userInfo
					});
				})
				
			}
		})
		// note 221 below.
	}
	else { res.json({messege:'Failed to register: Email, Name or Password is too short'}) }
})

// app.get('/profile/:id',(req,res) => {
// 	const id = Number(req.params.id);
// 	let bool = true;
// 	database.users.map(user => {
// 		if (user.id === id) {
// 			bool = false;
// 			res.json(user);
// 		}
// 	})
// 	if (bool) {
// 		res.status(404).send('<h1>Failed: Not Found 404</h1>');
// 	}
// })

app.put('/image',(req,res) => {
	const id = Number(req.body.id);
	db('users')
	.returning('rank')
  .where('id', '=', id)
  .increment('rank', 1)
  .then(rank => res.json(Number(rank)))
  .catch(err => res.status(404).send('FAILED: NOT FOUND 404'))
})


app.listen(process.env.PORT || 3000, ()=>{
	console.log('express server is working');
})































//////////////////////////////////////////////////////////////////////////////////////
// db('users').insert({
// 	name: 'name',
// 	email: 'email',
// 	date: new Date()
// 	})
// .then(console.log)
// .catch(console.log)

	// db('users')
	// .returning('rank')
 //  .where('id', '=', 45)
 //  .increment('rank', 1)
 //  .then(console.log)


// db('users').where({ email: 'email' }).select('*').then(res => console.log(res[0]))
	// db('login').select('email','hash').where({email:'andrei@gmail.com'})
	// .then(res => {
	// 	dbEmail = res[0].email;
	// 	dbHash = res[0].hash;
	// 	console.log(dbEmail ,'and here is the hash:',dbHash);
	// })
///////////////////////////////////////////////////////////////////////////////////////





//221 note
		//========================================================
		//hash the password (Async way)
		// bcrypt.hash(hashpass, null, null, function(err, hash) {
		// 	hashpass = hash;
		// 	console.log(hashpass);
		// });

		//pushing to the fake database
		// database.users.push({
		// 	id: database.users[database.users.length-1].id + 1,
		// 	name: name,
		// 	email: email,
		// 	rank: 0,
		// 	date: new Date()
		// });
		//
		// database.login.push({
		// 	//we need to store the same id for users and login, since we pushed no need to +1
		// 	id: database.users[database.users.length-1].id,
		// 	email: database.users[database.users.length-1].email,
		// 	hash: hashpass
		// });
		//========================================================== 	






//note 775: if we still using fake database (for register)
		// 	let bool = true;
		//
		// 	function compareCurrentUserHash(user,password) {
		// 		let found;
		// 		database.login.map(loginInfo => {
		// 			if (user.id === loginInfo.id) {
		// 				//for each elemnt in login we compare id's when match compare the password' hashes & return T/F
		// 				found = bcrypt.compareSync(password, loginInfo.hash);
		// 			}
		// 		})
		// 		// when not found or the hashes is not matching/passwords it will be false 
		// 		return found;
		// 	}
		//
		// 	database.users.map(user => {
		// 		if (email === user.email && compareCurrentUserHash(user,password)) {
		// 			bool = false;
		// 			res.json({
		// 				messege:'success',
		// 				userInfo:user
		// 			});
		// 		}
		// 	})
		// 	// make sure that the engine will not run the other res even if this will not affect the frond-end.
		// 	if (bool) {
		// 		//res.status(404).send('<h1>Failed: Not Found 404</h1>');
		// 		res.json({messege:'Failed to register: Email and/or Password typed incorrectly'})
		// 	}






// My fake database:
// const database = {

// 	users:[
// 		{
// 			id: 100,
// 			name: 'eihab',
// 			email: 'eihab@gmail.com',
// 			rank: 0,
// 			date: new Date()
// 		},
// 		{
// 			id: 101,
// 			name: 'andrei',
// 			email: 'andrei@gmail.com',
// 			rank: 0,
// 			date: new Date()
// 		},
// 		{
// 			id: 102,
// 			name: 'shakira',
// 			email: 'shakira@gmail.com',
// 			rank: 0,
// 			date: new Date()
// 		}
// 	],
// 	login:[
// 	{
// 		id:100,
// 		email:'eihab@gmail.com',
// 		hash:'$2a$10$PSxOaaAmFU5TcFzrpI6MoONl6KKubO2Qvsm1lp.XLLECr4HImomu6'
// 	},
// 	{
// 		id:101,
// 		email:'andrei@gmail.com',
// 		hash:'$2a$10$UR18rc2VKbkkzPGL/0dl0eQx2PM5rLOWKvADPTyD7OnNXktzQajOy'
// 	},
// 	{
// 		id:102,
// 		email:'shakira@gmail.com',
// 		hash:'$2a$10$Rq/dmpxS1cqzUoaRKovnS.StgxS3yLNpY3h8tU.eBC0BRPNgMI2GO'
// 	}
// 	]
// }

