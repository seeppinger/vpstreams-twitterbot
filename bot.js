require('dotenv').config()
const config = require('./config');
const twitter = require('twitter-lite');
const client = new twitter(config);
const app = new twitter({
  bearer_token: process.env.BEARER_TOKEN
});

const listId = process.env.LIST_ID;
const userId = process.env.USER_ID

var getListCounter = 0;
var lastTweetId = ''
var userList = [];

/**
 * Main funtion of bot that will be called on repeat
 */
function performAction() {
   
    //only get list every 20th time (every hour)
    if (getListCounter == 0 || getListCounter == 19) {
        getUserList();
        getListCounter = 0;
    }
    var query = buildQuery();
    searchAndRewteet(query);
    getListCounter++;
}

/**
 * Get list of user who will be autoretweeted
 */
async function getUserList() {
    await client.get('lists/members', { list_id: listId})
    .then(result => {
        userList = result.users;
    }).catch(console.error);
}

/**
 * Search and reweet tweets by specificed users
 * @param {*} query contains the search query
 */
async function searchAndRewteet(query) {

    var rawTweets = []
    await app.get('search/tweets', query)
    .then(result => {
        rawTweets = result.statuses;
        if(rawTweets.length > 0) {
            lastTweetId = rawTweets[0].id_str;
        }
        console.log("Fetched tweets: " + rawTweets.length)
    }).catch(console.error);

    //Filter tweets to exclude retweets, replies and tweets from our user
    var filteredTweets = [];
    rawTweets.forEach(rawTweet => {
        if (!rawTweet.retweeted_status && !rawTweet.in_reply_to_status_id && (rawTweet.user.id_str != userId)) {
            filteredTweets.push(rawTweet);
        }
    });
    console.log("Filtered tweets: " + filteredTweets.length)

    //Save tweet ids only by list members
    var tweetIds = [];
    filteredTweets.forEach(filteredTweet => {
        userList.forEach(user => {
            if (user.id_str == filteredTweet.user.id_str) {
                tweetIds.push(filteredTweet.id_str);
            }
        });
    });
    console.log("Filtered by list: " + tweetIds.length)

    //determine max number of retweets (rate limit)
    var maxRetweets
    if (tweetIds.length > 5) {
        maxRetweets = 5;
    } else {
        maxRetweets = tweetIds.length;
    }

    //retweet tweets
    for (let index = 0; index < maxRetweets; index++) {
        const tweetId = tweetIds[index];
        client.post('statuses/retweet/' + tweetId)
        .catch(console.error)
    }
}

//Call function on startup
performAction();

//Call function every 3min
setInterval(performAction, 1000 * 60 * 3);

/**
 * Build the search query for search/tweets
 * @param {*} query contains the query
 */
function buildQuery(query) {
    //Check if lastTweetId is present to minimize request count with since_id
    if (lastTweetId == '') {
        query = { q: "%23VPStreams", count: 100, result_type: "recent" };
    } else {
        query = { q: "%23VPStreams", count: 25, since_id: lastTweetId, result_type: "recent" };
    }
    return query;
}
