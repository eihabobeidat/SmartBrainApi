// const userSignin = (req, res, db, bcrypt) => {
// 	const { email, password} = req.body;
// 	//note 775 below.
// 	db('login').select('email','hash').where({email:email})
// 	.then(response => {
// 		dbEmail = response[0].email;
// 		dbHash = response[0].hash;
// 		//compare hash with password hash & assign the comparasion value to var
// 		const passowrdMatch = bcrypt.compareSync(password, dbHash);
// 		if (passowrdMatch) {
// 			db('users').select('*').where({email:dbEmail})
// 			.then(resp => {
// 				const user = resp[0];
// 				res.json({ messege:'success', userInfo:user });
// 			})
// 			.catch(error => console.log('oops retriving data error: iner promise==> ',error))
// 		} 
// 		else {
// 			//else if the email found but the password not matching
// 			res.json({messege:'Check your email & Password !!'})
// 		}
// 	})
// 	.catch(err => {
// 		//email not found or did not connect to DB
// 		res.json({messege:'Signing in failed, you need to Register or check your Email & password'})
// 	})
// }

// module.exports = {
// 	signin:userSignin
// };