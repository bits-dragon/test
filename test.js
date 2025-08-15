import express from 'express';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import randomUseragent from 'random-useragent';
import fs from 'fs';
import { load } from 'cheerio';
import mongoose from 'mongoose';
import { Console, error } from 'console';
import { SocksProxyAgent } from 'socks-proxy-agent';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

//---------------------------------mongodb---------------
const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    joblink: { type: String, required: true },
    company: String,
    e_count: String,
    postedtime: String,
    postTime: String,
    designation: String,
    followersCount: String,
    location: String,
    companyLink: String,
    postId: { type: String, required: true, unique: true },
}, { timestamps: true }); // adds createdAt and updatedAt

const Job = mongoose.model('jobs', jobSchema);

const uri = 'mongodb+srv://bl:dbpassword@cluster0.srbit0j.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';


const proxyList = [
    "104.237.250.13:80",       // Transparent
    "159.65.230.46:8888",      // Transparent
    "142.93.202.130:3128",     // Transparent
    "47.89.184.18:3128",       // Transparent
    "23.237.210.82:80",        // Transparent (HTTPS)
    "91.227.248.40:80",        // Transparent
    "192.81.129.252:3132",     // Transparent (HTTPS)
    "51.254.78.223:80",        // Transparent
    "51.15.228.52:8080",       // Transparent
    "152.228.154.20:80",       // Transparent
    "98.64.128.182:3128",      // Transparent
    "49.12.216.1:80",          // Transparent
    "103.253.103.50:80",       // Transparent (Japan)
    "47.91.65.23:3128",        // Transparent (Germany)
    "94.142.139.119:31280",    // Transparent (Russia, HTTPS)
    "91.239.7.75:80",          // Transparent (France)
    "91.239.7.66:80",          // Transparent (France)
    "194.183.190.10:8080",     // Transparent (Ukraine, HTTPS)
    "38.7.197.5:999",          // Transparent (United States, HTTPS)
    "45.204.9.197:9999",       // Transparent (South Africa)
    "185.105.102.179:80",      // Transparent (Iran)
    "104.248.81.109:3128",     // Transparent (United States, HTTPS)
    "185.105.102.189:80",      // Transparent (Iran)
    "38.250.126.201:999",      // Transparent (United States, HTTPS)
    "41.254.63.14:8080",       // Transparent (Libya, HTTPS)
    "185.141.213.174:8080",    // Transparent (Iran)
    "175.116.194.101:3128",    // Transparent (Korea, HTTPS)
    "180.89.56.240:3128",      // Transparent (China)
    "77.75.95.14:80",          // Transparent (Lebanon)
    "149.86.142.84:8080",      // Transparent (United States)
    "112.126.68.169:8384",     // Transparent (China)
    "104.129.194.46:10089",    // Transparent (United States, HTTPS)
    "8.146.207.243:8888",      // Transparent (United States)
    "8.140.104.98:3128",       // Transparent (United States)
    "106.12.156.26:80",        // Transparent (China)
];
await mongoose.connect(uri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
//---------------------------------------------------------------------------
const connection = mongoose.connection; // the connection object



//---------------------------------------------------------------------------------
const userAgents = [
    // Desktop
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/605.1.15 Version/16.6 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13.5; rv:115.0) Gecko/20100101 Firefox/115.0",

    // Mobile
    "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 Chrome/115.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 SamsungBrowser/21.0 Chrome/115.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Android 13; Mobile; rv:115.0) Gecko/115.0 Firefox/115.0",

    // Tablet
    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1"
];

const cutcompanies = ["Lensa", "Oracle", "Wiraa"];

async function scrapeLinkedinProfiles(url) {
    try {
        const headers = {
            'User-Agent': 'Guest',
        };
        const response = await fetch(url, { headers });
        if (!response.ok) {
            console.log(`Error: Unable to retrieve the LinkedIn company profile. Status code: ${response.status}`);
            return {};
        }

        const html = await response.text();
        const $ = load(html);
        // Extract profile info
        const titleTag = $('title').first().text();
        const designationTag = $('h2').first().text();
        const followersTag = $('meta[property="og:description"]').attr('content');

        let followersCount = "Followers count not found";
        if (followersTag) {
            const match = followersTag.match(/\b(\d[\d,.]*)\s+followers\b/);
            if (match) followersCount = match[1];
        }

        if (followersCount != "Followers count not found") {
            followersCount = parseInt(followersCount.replace(/,/g, ''))
        }
        else {
            followersCount = null;
        }
        const name = titleTag ? titleTag.split('|')[0].trim() : "Profile Name not found";
        let designation = designationTag || "Designation not found";

        // Find 'associated members' h2 and extract number
        const allH2s = $('h2').toArray();
        const targetH2 = allH2s.find(h2 => $(h2).text().toLowerCase().includes('associated members'));
        const elementText = $('.face-pile__text').text(); // Get text inside the <p>
        const numberMatch = elementText.match(/\d+/);
        const number = numberMatch ? parseInt(numberMatch[0], 10) : null;

        return {
            designation,
            e_count: number,
            followersCount,
        };

    } catch (error) {
        return {}
    }
}
function parseTimeToUTC(time12h) {
    const [time, meridiem] = time12h.split(' ');
    let [hours, minutes, seconds] = time.split(':').map(Number);
    if (meridiem.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours, minutes, seconds));
}

function convertUTCtoGMTminus4(dateUtc) {
    return new Date(dateUtc.getTime() - 4 * 60 * 60 * 1000);
}

function extractTimeAndNumber(str) {
    // Regular expression to match the number and the time unit
    const match = str.match(/(\d+)\s+(minute|hour|day)s?/);

    if (match) {
        return {
            time: match[2],  // Extract time unit (minute, hour, or day)
            number: parseInt(match[1], 10) // Extract the number and convert it to an integer
        };
    }

    if (str == "Just now") return { time: "minute", number: 0 };  // If no match found, return null
    return null;
}
async function getPosttime(link) {
    try {
        let headers = {
            // "User-Agent": randomUseragent.getRandom(),
            "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
            Accept: "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "X-Requested-With": "XMLHttpRequest",
            Connection: "keep-alive",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
        };

        const response = await fetch(link, { headers });
        if (!response.ok) {
            console.log(`Error: Unable to get time: ${response.status}`, link);
            return;
        }

        const html = await response.text();
        const $ = load(html);
        const metaDescription = $('meta[name="description"]').attr('content');

        if (metaDescription) {
            const match = metaDescription.match(/Posted\s(\d{1,2}:\d{2}:\d{2})\s?(AM|PM)/i);
            if (match && match[1]) {
                const postTime = `${match[1]} ${match[2].toUpperCase()}`;
                const utcDate = parseTimeToUTC(postTime);
                const estDate = convertUTCtoGMTminus4(utcDate);
                // console.log("Post time:", estDate)
                return estDate
            } else {
                console.log("Post time not found in meta description.");
            }
        } else {
            console.log("Meta description tag not found.");
        }
    } catch (error) {
        return "failed";
    }
}



function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function extractPostId(url) {
    if (!url) return null;
    const match = url.match(/-(\d+)(?:\?|$)/);
    return match ? match[1] : null;
}

function parsePostTimeToMinutes(postTime) {
    if (!postTime) return Infinity;

    const lower = postTime.toLowerCase();

    if (lower.includes('minute')) {
        const num = parseInt(lower.match(/\d+/)[0]);
        return num;
    } else if (lower.includes('hour')) {
        const num = parseInt(lower.match(/\d+/)[0]);
        return num * 60;
    } else if (lower.includes('day')) {
        const num = parseInt(lower.match(/\d+/)[0]);
        return num * 60 * 24;
    } else if (lower.includes('just now')) {
        return 0;
    }
    return Infinity;
}

async function fetchJob_list(index) {
    let headers = {
        "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://www.linkedin.com/jobs",
        "X-Requested-With": "XMLHttpRequest",
        Connection: "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
    };
    const headers1 = {
        "User-Agent": randomUseragent.getRandom() || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.linkedin.com/jobs",
        "Connection": "keep-alive",
        // optionally add cookies if you have authenticated session cookies
    };
    const apiUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=developer%20or%20engineer&geoId=103644278&f_TPR=r1800&f_WT=2&start=${index}`;
    // const apiUrl = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=developer%20or%20engineer&f_TPR=r86400&f_WT=2&geoId=103644278&origin=JOB_SEARCH_PAGE_JOB_FILTER&refresh=true&sortBy=DD&start=${index}'
    // &f_JIYN=true
    //keywords=Full%20Stack%20OR%20frontend%20OR%20backend%20OR%20javascript%20OR%20python
    try {
        // const proxy = {
        //   host: '81.161.5.236',
        //   port: 19117,
        //   auth: {
        //     username: 'matwilland',
        //     password: 'RrHb4GAf8V'
        //   }
        // };//
        const proxyUrl = `http://${proxyList[Math.floor(Math.random() * proxyList.length)]}`;
        const agent = new HttpsProxyAgent(proxyUrl);

        // const proxy1 = 'socks5://realalien1111_country-us:R18Z6wBZ9paB2mKS@geo.iproyal.com:32325';
        // const agent1 = new SocksProxyAgent(proxy1);

        const response = await axios.get(apiUrl, {
            httpAgent: agent,
            headers
        });
        if (response.status != 200) {
            const errorText = await response.data;
            console.error('Response body: failed', response.status);
            return { len: 0, datas: [], state: 0 };
        }//
        console.log(`Fetching jobs at start=${index}, status=${response.status}`);

        const htmlText = await response.data;
        const dom = new JSDOM(htmlText);
        const doc = dom.window.document;
        const jobCards = doc.querySelectorAll('li > div.base-card');
        let jobsElem = [];
        let currenttime = new Date()
        if (Array.from(jobCards).length == 0) {
            console.log("---", apiUrl)
            return { len: 0, datas: [], state: 2 }
        }
        for (let i = 0; i < Array.from(jobCards).length; i++) {
            const card = Array.from(jobCards)[i];

            const titleElem = card.querySelector('[class*="_title"]');
            const urlElem = card.querySelector('a.base-card__full-link');
            const companyElem = card.querySelector('[class*="_subtitle"] a');
            const locationElem = card.querySelector('[class*="_location"]');
            const postTimeElem = card.querySelector('[class*=listdate]');
            let postTime = postTimeElem ? postTimeElem.textContent.trim() : null
            let company = companyElem ? companyElem.textContent.trim() : null
            let url = urlElem ? urlElem.href : null;
            let joblink = null;
            if (url) {
                let urlObj = new URL(url);
                joblink = urlObj.origin + urlObj.pathname;
            }
            const postId = extractPostId(url);

            const companyAnchor = card.querySelector('h4.base-search-card__subtitle a');
            let clink = companyAnchor ? companyAnchor.href : null;
            let companyLink = null;
            if (clink) {
                const urlObj = new URL(clink);
                companyLink = urlObj.origin + urlObj.pathname;
            }
            let cur_post = extractTimeAndNumber(postTime)
            let postedtime;
            if (cur_post.time == "minute" && !cutcompanies.includes(company)) {
                postedtime = new Date(currenttime.getTime() - 4 * 60 * 60 * 1000 - cur_post.number * 60 * 1000)
                postedtime = postedtime.toISOString();
                const fin = {
                    title: titleElem ? titleElem.textContent.trim() : null,
                    company,
                    joblink,
                    postTime,
                    companyLink, postedtime,
                    location: locationElem ? locationElem.textContent.trim() : null,
                    postId,

                };
                jobsElem.push(fin);
            }
        }

        return { len: Array.from(jobCards).length, datas: jobsElem, state: 1 };
    } catch (error) {
        console.log("error1");
        return { len: 0, datas: [], state: 0 };
    }
}

async function fetchJob_job(jobCards) {
    let reults = []
    for (let i = 0; i < jobCards.length; i++) {
        const jobCard = jobCards[i];

        let jobfind = await Job.findOne({ postId: jobCard.postId });

        let company = await scrapeLinkedinProfiles(jobCard.companyLink);
        jobCards[i] = { ...jobCards[i], "designation": company.designation ? company.designation.trim() : "" }
        jobCards[i] = { ...jobCards[i], "followersCount": company.followersCount ? company.followersCount : "" }
        jobCards[i] = { ...jobCards[i], "e_count": company.e_count ? company.e_count : "" }


        if (!jobfind) {
            const newjob = new Job(jobCards[i]);
            if (await newjob.save()) console.log("saved", i)
        }
        reults.push(jobCards[i])

    }
    return reults;
}

async function fetchAndParseJobs(cnt) {
    try {
        let jobCards = []

        let i = 0;
        while (1) {
            let resu = await fetchJob_list(i);
            if (resu.state == 1) {
                i = i + resu.len
                jobCards.push(...resu.datas);
            }
            if (resu.state == 2) break;
            console.log("each", resu.len)
        }
        jobCards.sort((a, b) => parsePostTimeToMinutes(a.postTime) - parsePostTimeToMinutes(b.postTime));
        console.log("job", jobCards.length)
        //
        let resul = await fetchJob_job(jobCards);
        await connection.close();
        console.log('MongoDB disconnected');
    } catch (error) {

    }
}


await fetchAndParseJobs(20);//


