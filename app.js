const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const plotly = require('plotly')("archishmanghosh", "3znZIQTgON5GawnxL4mz")
const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
let profileUrl = 'https://codeforces.com/api/user.info?handles=';
let statusUrl = 'https://codeforces.com/api/user.status?handle=';
let ratingUrl = 'https://codeforces.com/api/user.rating?handle=';

app.get('/', (req, res) => {
    res.render('home');
    profileUrl = 'https://codeforces.com/api/user.info?handles=';
    statusUrl = 'https://codeforces.com/api/user.status?handle=';
    ratingUrl = 'https://codeforces.com/api/user.rating?handle=';
});

app.post('/', (req, res) => {
    const userName = req.body.cfUserName;
    profileUrl = profileUrl + userName;
    statusUrl = statusUrl + userName;
    ratingUrl = ratingUrl + userName;
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    https.get(profileUrl, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            const jsonData = JSON.parse(data);
            const handle = jsonData.result[0].handle;
            const dp = jsonData.result[0].titlePhoto;
            const firstName = typeof jsonData.result[0].firstName !== 'undefined' ? jsonData.result[0].firstName : 'Anonymous';
            const lastName = typeof jsonData.result[0].lastName !== 'undefined' ? jsonData.result[0].lastName : '';
            const rating = jsonData.result[0].maxRating + '(' + jsonData.result[0].maxRank + ')';
            const friends = jsonData.result[0].friendOfCount;
            const place = typeof jsonData.result[0].city !== 'undefined' ? jsonData.result[0].city : '' + ', ' + typeof jsonData.result[0].country !== 'undefined' ? jsonData.result[0].country : 'Somewhere on Earth';
            const org = jsonData.result[0].organization.length ? jsonData.result[0].organization : 'OR-chi Fan Club :p';

            if (jsonData.status === 'OK') {
                res.render('login', {
                    handle: handle,
                    dp: dp,
                    firstName: firstName,
                    lastName: lastName,
                    rating: rating,
                    friends: friends,
                    place: place,
                    org: org
                });
            } else {
                res.render('failure');
            }
        });
    });
});

app.post('/login', (req, res) =>{
    https.get(statusUrl, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            const jsonData = JSON.parse(data);
            if (jsonData.status === 'OK') {
                let ratings = new Array(10).fill(0);
                let allRatings = [1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000, 4000];
                for (let i = 0; i < jsonData.result.length; i++) {
                    for (let j = 0; j < 10; j++) {
                        if (jsonData.result[i].problem.rating < allRatings[j]) {
                            ratings[j] += 1;
                        }
                    }
                }

                res.render('submissions', {ratings: ratings, allRatings: allRatings});
            } else {
                res.render('failure');
            }
        });
    });
});

app.listen(PORT, () => {
    console.log('Server running on port 3000');
});