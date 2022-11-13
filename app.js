const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const plotly = require('plotly')("archishmanghosh", "3znZIQTgON5GawnxL4mz")
const PORT = 3000;

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
            if (jsonData.status === 'OK') {
                res.render('login', {
                    handle: jsonData.result[0].handle,
                    dp: jsonData.result[0].titlePhoto,
                    firstName: jsonData.result[0].firstName,
                    lastName: jsonData.result[0].lastName,
                    rating: jsonData.result[0].maxRating + '(' + jsonData.result[0].maxRank + ')',
                    friends: jsonData.result[0].friendOfCount,
                    place: jsonData.result[0].city + ', ' + jsonData.result[0].country,
                    org: jsonData.result[0].organization
                });
            } else {
                res.render('failure');
            }
        });
    });
});

app.post('/login', (req, res) =>{
    const buttonClicked = req.body.button;
    if (buttonClicked === 'subButton') {
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
    } else {
        https.get(ratingUrl, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
    
            response.on('end', () => {
                const jsonData = JSON.parse(data);
                // console.log(jsonData);
                if (jsonData.status === 'OK') {
                    res.render('rating')
                } else {
                    res.render('failure');
                }
            });
        });
    }
});

app.listen(PORT, () => {
    console.log('Server running on port 3000');
});

// handle: jsonData.result[0].handle,
// dp: jsonData.result[0].titlePhoto,
// firstName: jsonData.result[0].firstName,
// lastName: jsonData.result[0].lastName,
// rating: jsonData.result[0].maxRating + '(' + jsonData.result[0].maxRank + ')',
// friends: jsonData.result[0].friendOfCount,
// place: jsonData.result[0].city + ', ' + jsonData.result[0].country,
// org: jsonData.result[0].organization

// handle: 'OR-chi',
// dp: '..',
// firstName: 'Archishman',
// lastName: 'Ghosh',
// rating: '1561' + '(' + 'Specialist' + ')',
// friends: '116',
// place: 'Kolkata, India',
// org: 'JGEC'