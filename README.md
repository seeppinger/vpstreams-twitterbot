# vpstreams-twitterbot

Automatically retweets tweets with the twitter-lite library from users on a list with a specified search query

## Run it

Install the following:  
`npm install twitter-lite`  
`npm install dotenv`

Create a .env file in the root directory with the following content
```
CONSUMER_KEY=
CONSUMER_SECRET=
ACCESS_TOKEN=
TOKEN_SECRET=
BEARER_TOKEN=
LIST_ID=
USER_ID=
```
and fill it with the necessary information (you need a Twitter developer account for this). You can get the user and list id directly from the browsers url when on Twitter.

## Options
You can adjust the time and retweet limit to your liking as long as you stay within the rate limites defined by Twitter.