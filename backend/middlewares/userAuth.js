// import jwt from 'jsonwebtoken'

// //user authentication middleware

// const authUser = async (req,res,next) => {
//     try {

//         const {token} = req.headers
//         if(!token) {
//             return res.json({success:false,message:'Not Authorized Login Again'})
//         }
//         const token_decode = jwt.verify(token,process.env.JWT_SECRET)    
//         req.body.userId = token_decode.id  
//         next()
          
//     } catch (error) {
//         console.log(error)
//         res.json({success:false,message:error.message})
//     }
// }

// export default authUser
import jwt from 'jsonwebtoken';

// User authentication middleware
const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export default authUser;