const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

signIn = async (req, res) => {
    const prisma = req.prisma
    const email = req.body.email
    const password = req.body.password
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    .then(async user => {
        var passwordIsValid = bcrypt.compareSync(
            password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        const token = jwt.sign({ id: user.id },
                                process.env.ACCESS_TOKEN_SECRET,
                                {
                                    algorithm: 'HS256',
                                    allowInsecureKeySizes: true,
                                    expiresIn: 86400, // 24 hours
                                });

        var authorities = [];
        if (user.roles) {
            user.roles.then(roles => {
                for (let i = 0; i < roles.length; i++) {
                    authorities.push("ROLE_" + roles[i].name.toUpperCase());
                }
            });
        }

        res.status(200).send({
            id: user.id,
            email: user.email,
            roles: authorities,
            accessToken: token
        });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
};

function generateAccessToken(user) {
    const payload = {
        id: user.id,
        email: user.email
    };

    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = { expiresIn: '1h' };

    return jwt.sign(payload, secret, options);
}


// // Generate a new refresh token
// function generateRefreshToken(user) {
//     const payload = {
//         id: user.id,
//         email: user.email
//     };

//     const secret = 'your-refresh-token-secret';
//     const options = { expiresIn: '7d' };

//     return jwt.sign(payload, secret, options);
// }

// // Verify a refresh token
// function verifyRefreshToken(token) {
//     const secret = 'your-refresh-token-secret';

//     try {
//         const decoded = jwt.verify(token, secret);
//         return { success: true, data: decoded };
//     } catch (error) {
//         return { success: false, error: error.message };
//     }
// }
  
// // Refresh an access token using a valid refresh token
// app.post('/token/refresh', (req, res) => {
//     const refreshToken = req.body.refreshToken;

//     if (!refreshToken) {
//         return res.sendStatus(401);
//     }

//     const result = verifyRefreshToken(refreshToken);

//     if (!result.success) {
//         return res.status(403).json({ error: result.error });
//     }

//     const user = result.data;
//     const newAccessToken = generateAccessToken(user);
//     res.json({ accessToken: newAccessToken });
// });

module.exports = { signIn, generateAccessToken }
