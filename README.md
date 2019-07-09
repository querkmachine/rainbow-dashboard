# Rainbow Dashboard 3.0

Back in university, in the long passed year of 2014, I aimed to make a home status dashboard for my final year project. Why? No reason; I just thought they were cool things to have. Proactive information at a glance would always be useful, right? [It was named Rainbow Dashboard.](https://twitter.com/kimpegasus/status/440861771537342464)

For whatever reason I tried writing it in PHP and MySQL, languages I was (and am) familiar but not particularly proficient with. I wanted dozens of integrations with third parties, support for multiple user accounts, and to make absolutely everything configurable via a web UI—anyway, it sucked. Upon completion of university I left it to rot.

In late 2018, armed with a newly acquired Raspberry Pi, I revived the project and in a couple of evenings bust out [a reasonably well working dashboard](https://github.com/querkmachine/dashboard/tree/develop) using [Express](https://expressjs.com/) and web sockets, for reasons of "remote controlling this would be cool" that never came to fruition. Rainbow Dashboard 2.0 could tell you the time, the weather, and what the plural of "beef" is, but not much else more. 

2.0 has been in constant use since release, but hasn't been updated at all in that time. The way it got built is a little cumbersome and difficult to expand upon, so now, in July 2019, I'm rewriting it all in everyone's favourite framework of the hour: [Vue](https://vuejs.org/). Why? Because I've used Vue for ages and are pretty comfortable doing crazy things with it, but I've not really done much with web components and [Vue CLI](http://cli.vuejs.org/) so... now I am.

Neat, eh?

## Notes to self

### Things I wanna add

- [x] a clock
- [x] Philips Hue integration
- [ ] Mastodon feed integration
- [ ] Dark Sky integration
- [ ] Bus times integration
- [ ] Google Calendar integration
- [ ] Spotify/now playing integration
- [ ] Cycle accent colour over time maybe?
- [ ] Actually do the cool remote control thing 2.0 was meant to do

### `.env` variables that aren't in source control

```
VUE_APP_HUE_API_ENDPOINT=
VUE_APP_HUE_API_KEY=
```

### Those terminal commands in full

Project setup: `npm install`
Development: `npm run serve`
Production: `npm run build`
Tests: `npm run test`
Linting: `npm run lint`