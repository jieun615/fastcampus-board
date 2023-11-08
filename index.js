const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const secretText = 'superSecret';
const refreshSecretText = 'supersuperSecret';
const posts = [
    {
        username: 'John',
        title: 'Post 1'
    },
    {
        username: 'Han',
        title: 'Post 2'
    }
]
let refreshTokens = [];

app.use(express.json())

app.get('/', (req, res) => {
    res.send('hi');
})

app.post('/login', (req, res) => {
    const username = req.body.username;
    const user = { name: username };

    const accessToken = jwt.sign(user, 
        secretText, 
        { expiresIn: '30s' });

    const refreshToken = jwt.sign(user,
        refreshSecretText,
        { expiresIn: '1d' })
    
    refreshTokens.push(refreshToken);

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    })

    res.json({ accessToken: accessToken });
})

app.get('/posts', authMiddleware, (req, res) => {
    res.json(posts);
})

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, secretText, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    })
}

const port = 3000;
app.listen(port, () => {
    console.log('listening on port ' + port);
})