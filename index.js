import express from 'express';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import randomUseragent from 'random-useragent';
import fs from 'fs';
import { load } from 'cheerio';
import mongoose from 'mongoose';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { WebClient } from '@slack/web-api';





//---------------------------------mongodb---------------
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  joblink: { type: String, required: true },
  company: String,
  e_count: Number,
  postedtime: String,
  postTime: String,
  designation: String,
  followersCount: Number,
  location: String,
  companyLink: String,
  postId: { type: Number, required: true, unique: true },
  companylog: String,
}, { timestamps: true }); // adds createdAt and updatedAt

const timeSchema = new mongoose.Schema({
  time_text: String
}, { timestamps: true })


const blockcom = new mongoose.Schema({
  blockcompany: String
})

const tokenli = new mongoose.Schema({
  botname: String,
  token: String,
  channelId: String
})

const Job = mongoose.model('jobs_1', jobSchema);
const timeSch = mongoose.model("time", timeSchema);
const Blockcompanies = mongoose.model("blockcompanies", blockcom);
const Tokenlist = mongoose.model("tokens", tokenli);

const uri = 'mongodb+srv://bl:dbpassword@cluster0.srbit0j.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

const proxyList = [
  "185.162.231.237:80",
  "199.34.230.33:80",
  "141.101.120.37:80",
  "104.18.197.95:80",
  "103.169.142.220:80",
  "46.254.92.45:80",
  "45.131.210.34:80",
  "31.43.179.72:80",
  "185.193.28.117:80",
  "198.41.200.188:80",
  "209.46.30.36:80",
  "104.254.140.37:80",
  "45.131.211.148:80",
  "104.16.0.24:80",
  "172.64.146.52:80",
  "103.169.142.67:80",
  "5.182.34.226:80",
  "104.27.26.183:80",
  "46.254.93.247:80",
  "188.42.88.117:80",
  "104.24.52.64:80",
  "188.42.89.205:80",
  "45.159.217.34:80",
  "45.131.211.179:80",
  "185.162.228.93:80",
  "104.21.84.213:80",
  "172.67.204.84:80",
  "104.17.49.44:80",
  "45.80.108.174:80",
  "185.193.29.180:80",
  "103.160.204.102:80",
  "185.162.231.239:80",
  "45.131.211.200:80",
  "23.227.39.242:80",
  "45.131.208.222:80",
  "23.227.60.173:80",
  "162.159.242.59:80",
  "195.85.23.191:80",
  "104.16.242.74:80",
  "104.17.6.160:80",
  "209.46.30.130:80",
  "46.254.93.11:80",
  "104.16.246.160:80",
  "103.21.244.184:80",
  "104.24.229.222:80",
  "172.67.221.10:80",
  "185.162.230.116:80",
  "104.239.72.87:80",
  "182.253.37.83:443",
  "172.64.85.92:80"
];

await mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
//---------------------------------------------------------------------------

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ msg: " successfully deployed " });
  setTimeout(() => {
    console.log("executed repeteadly")
  }, 3000);

})


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


let cutcompanies = []
// let tokens = await Tokenlist.find();


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
    const elementText = $('.face-pile__text').text() || "0"; // Get text inside the <p>
    const numberMatch = elementText.match(/\d[\d,]*/) || "0";
    const number = numberMatch ? parseInt(numberMatch[0].replace(/,/g, ''), 10) : 0;

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

async function axiosGetWithRetry(url, headers, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const proxyUrl = `http://${proxyList[Math.floor(Math.random() * proxyList.length)]}`;
      const agent = new HttpsProxyAgent(proxyUrl);
      const res = await axios.get(url, {
        headers,
        // httpAgent: agent,
        timeout: 5000
      });
      console.log(res.status)
      return res;
    } catch (err) {
      console.log(`Axios attempt ${i + 1} failed: ${err.code} ${err.message}`);
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 700)); // wait 1 sec before retry
    }
  }
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

async function fetchJob_list(index, query, second) {
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
  // const apiUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=developer%20or%20engineer&geoId=103644278&f_TPR=r600&f_WT=2&start=${index}`;
  // const apiUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=developer%20or%20engineer&f_TPR=r600&f_WT=2&geoId=103644278&origin=JOB_SEARCH_PAGE_JOB_FILTER&refresh=true&sortBy=DD&start=${index}`
  const apiUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=` + query + `&f_TPR=r` + second + `&f_WT=2&geoId=103644278&origin=JOB_SEARCH_PAGE_JOB_FILTER&refresh=true&sortBy=DD&start=${index}`

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

    // const response = await axios.get(apiUrl, {
    //   httpAgent: agent,
    //   headers
    // });
    const response = await axiosGetWithRetry(apiUrl, headers);

    if (response.status != 200) {
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
      return { len: 0, datas: [], state: 2 }
    }
    for (let i = 0; i < Array.from(jobCards).length; i++) {
      const card = Array.from(jobCards)[i];
      console.log(i)

      const titleElem = card.querySelector('[class*="_title"]');
      const urlElem = card.querySelector('a.base-card__full-link');
      const companyElem = card.querySelector('[class*="_subtitle"] a');
      const locationElem = card.querySelector('[class*="_location"]');
      const postTimeElem = card.querySelector('[class*=listdate]');
      const imgElem = card.querySelector('.search-entity-media img');

      let postTime = postTimeElem ? postTimeElem.textContent.trim() : null
      let company = companyElem ? companyElem.textContent.trim() : null
      let url = urlElem ? urlElem.href : null;
      let joblink = null;
      let companylog = imgElem ? imgElem.getAttribute('data-delayed-url') : null;

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
          companylog
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
      reults.push(jobCards[i])
    }

  }
  return reults;
}

async function fetchAndParseJobs(query, second) {
  try {
    let jobCards = []

    let i = 0;
    while (1) {
      let resu = await fetchJob_list(i, query, second);
      if (resu.state == 1) {
        i = i + resu.len
        jobCards.push(...resu.datas);
      }
      if (resu.state == 2 || resu.state == 0) break;
      // console.log("fetch job list length", resu.len)
    }
    jobCards.sort((a, b) => parsePostTimeToMinutes(a.postTime) - parsePostTimeToMinutes(b.postTime));
    console.log("fetch job list length", jobCards.length)

    let resul = await fetchJob_job(jobCards);

    return resul;//
  } catch (error) {
    return [];
  }
}


async function oneScrap() {

  let jobs1 = await fetchAndParseJobs(15);
  fs.writeFileSync('1.json', JSON.stringify(jobs1, null, 2), 'utf-8');
  return jobs1;
}

app.get('/location', async (req, res) => {
  let result = await fetch('https://ipinfo.io/json')
  result = await result.json();
  console.log(result);
  res.json(
    result
  );//
})


app.get('/giveme', async (req, res) => {
  console.log("/giveme")
  try {
    // Fetch jobs sorted by postedtime descending, limit 100
    const jobs = await Job.find()
      .sort({ postedtime: -1 })  // descending order
      .limit(100)
      .exec();

    res.json({ count: jobs.length, jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/once_run', async (req, res) => {
  await timeSch.findByIdAndUpdate("689f8428f36aeb80642bb953", { "time_text": new Date().toString() }, { new: true })
  const start = Date.now();
  let jobs1 = [];
  jobs1 = await fetchAndParseJobs();
  const end = Date.now();
  res.jsoun({
    count: jobs1.length || 0,
    time: end.toString(),
    // body: jobs1
  });
})
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// oneScrap()
app.get('/update', async (req, res) => {
  const comap = await Blockcompanies.find();
  cutcompanies = comap.map(c => c.blockcompany);
  await timeSch.findByIdAndUpdate("689f8428f36aeb80642bb953", { "time_text": new Date().toString() }, { new: true })
  const start = Date.now();
  let jobs1 = [];
  let query = req.query.q || ""
  let second = req.query.n || 300
  jobs1 = await fetchAndParseJobs(query, second);
  const end = Date.now();
  res.json({
    count: jobs1.length || 0,
    time: (end - start) / 1000,
    body: jobs1
  });
})



import { DateTime } from "luxon";

app.get('/view', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 100;
    const skip = (page - 1) * limit;

    // --- Filters ---
    const empMax = parseInt(req.query.emp) || null;
    const companyQuery = req.query.company || "";
    const titleQuery = req.query.title || "";

    let filter = {};
    if (empMax) {
      filter.e_count = { $gte: 1, $lte: empMax };
    }
    if (companyQuery) {
      filter.company = { $regex: companyQuery, $options: "i" };
    }
    if (titleQuery) {
      filter.title = { $regex: titleQuery, $options: "i" };
    }

    // Fetch jobs
    const jobs = await Job.find(filter)
      .sort({ postedtime: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limit);

    // ---- Format Time ----
    function formatEST(dateStr) {
      if (!dateStr) return "N/A";
      const est = DateTime.fromISO(dateStr, { zone: "America/New_York" });
      return est.toFormat("yyyy/MM/dd HH:mm:ss");
    }

    function formatJST(dateStr) {
      if (!dateStr) return "N/A";
      const est = DateTime.fromISO(dateStr, { zone: "America/New_York" });
      const jst = est.setZone("Asia/Tokyo");
      return jst.toFormat("yyyy/MM/dd HH:mm:ss");
    }

    // ---- Job cards ----
    const jobCards = jobs.map(job => `
      <div class="job-card">
        <div class="job-header">
          <img src="${job.companylog || 'https://via.placeholder.com/50'}" alt="Logo" class="company-logo"/>
          <div>
            <h3><a href="${job.joblink}" target="_blank">${job.title || 'Untitled'}</a></h3>
            <p class="company">
              <a href="${job.companyLink || '#'}" target="_blank">
                ${job.company || 'Unknown Company'}
              </a>
            </p>
            <p class="industry">${job.designation || 'Industry not found'}</p>
            <p class="location">📍 ${job.location || 'Location not specified'}</p>
          </div>
        </div>
        <div class="job-footer">
          <p>Employees: ${job.e_count || 'N/A'}</p>
          <p>Followers: ${job.followersCount || 'N/A'}</p>
          <p>Posted (EST): ${formatEST(job.postedtime)}</p>
          <p>Posted (JST): ${formatJST(job.postedtime)}</p>
        </div>
      </div>
    `).join("");

    // ---- Pagination (with ellipsis) ----
    let pagination = `<div class="pagination">`;

    if (page > 1) {
      pagination += `<a href="/view?page=${page - 1}&emp=${empMax || ""}&company=${companyQuery}&title=${titleQuery}" class="page-btn">« Prev</a>`;
    }

    if (page > 3) {
      pagination += `<a href="/view?page=1&emp=${empMax || ""}&company=${companyQuery}&title=${titleQuery}" class="page-btn">1</a>`;
      if (page > 4) {
        pagination += `<span class="ellipsis">...</span>`;
      }
    }

    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      if (i === page) {
        pagination += `<span class="page-btn active">${i}</span>`;
      } else {
        pagination += `<a href="/view?page=${i}&emp=${empMax || ""}&company=${companyQuery}&title=${titleQuery}" class="page-btn">${i}</a>`;
      }
    }

    if (page < totalPages - 2) {
      if (page < totalPages - 3) {
        pagination += `<span class="ellipsis">...</span>`;
      }
      pagination += `<a href="/view?page=${totalPages}&emp=${empMax || ""}&company=${companyQuery}&title=${titleQuery}" class="page-btn">${totalPages}</a>`;
    }

    if (page < totalPages) {
      pagination += `<a href="/view?page=${page + 1}&emp=${empMax || ""}&company=${companyQuery}&title=${titleQuery}" class="page-btn">Next »</a>`;
    }

    pagination += `</div>`;

    // ---- HTML page ----
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Job Listings - Page ${page}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f3f2ef; }
          .container { max-width: 900px; margin: 20px auto; padding: 10px; }
          h1 { margin-bottom: 15px; }

          /* Search Bar */
          form.search-bar {
            margin-bottom: 25px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            background: #fff;
            padding: 12px 15px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          form.search-bar input[type="number"],
          form.search-bar input[type="text"] {
            flex: 1;
            min-width: 160px;
            padding: 10px 15px;
            border: 1px solid #ccc;
            border-radius: 25px;
            font-size: 14px;
            outline: none;
            transition: border 0.2s, box-shadow 0.2s;
          }
          form.search-bar input:focus {
            border: 1px solid #0073b1;
            box-shadow: 0 0 4px rgba(0,115,177,0.3);
          }
          form.search-bar button {
            padding: 10px 20px;
            border: none;
            border-radius: 25px;
            background: #0073b1;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          form.search-bar button:hover {
            background: #005f8c;
          }
          form.search-bar a.clear-btn {
            padding: 10px 20px;
            border-radius: 25px;
            background: #eee;
            color: #555;
            font-size: 14px;
            text-decoration: none;
            transition: background 0.2s ease;
          }
          form.search-bar a.clear-btn:hover {
            background: #ddd;
          }

          /* Job cards */
          .job-card { background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .job-header { display: flex; gap: 15px; align-items: center; }
          .company-logo { width: 50px; height: 50px; object-fit: cover; border-radius: 5px; }
          h3 { margin: 0; font-size: 18px; }
          h3 a { text-decoration: none; color: #0073b1; }
          h3 a:hover { text-decoration: underline; }
          .company a { color: #555; text-decoration: none; }
          .company a:hover { text-decoration: underline; }
          .industry { color: #777; font-size: 14px; }
          .location { color: #333; font-size: 14px; margin-top: 4px; }
          .job-footer { margin-top: 10px; font-size: 13px; color: #666; display: flex; gap: 20px; flex-wrap: wrap; }

          /* Pagination */
          .pagination { margin: 30px 0; text-align: center; }
          .page-btn {
            display: inline-block;
            padding: 8px 14px;
            margin: 0 4px;
            border-radius: 20px;
            border: 1px solid #0073b1;
            text-decoration: none;
            color: #0073b1;
            font-size: 14px;
            transition: all 0.2s ease;
          }
          .page-btn:hover {
            background: #0073b1;
            color: white;
          }
          .page-btn.active {
            background: #0073b1;
            color: white;
            font-weight: bold;
            cursor: default;
          }
          .ellipsis {
            display: inline-block;
            margin: 0 6px;
            color: #999;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Job Listings</h1>

          <!-- Search bar -->
          <form class="search-bar" method="get" action="/view">
            <input type="number" id="emp" name="emp" value="${empMax || ""}" min="1" placeholder="Max Employees (e.g. 50)" />
            <input type="text" id="company" name="company" value="${companyQuery}" placeholder="Search by Company" />
            <input type="text" id="title" name="title" value="${titleQuery}" placeholder="Search by Title" />
            <button type="submit">Search</button>
            ${(empMax || companyQuery || titleQuery) ? `<a href="/view" class="clear-btn">Clear</a>` : ""}
          </form>

          ${jobCards || "<p>No jobs found.</p>"}
          ${pagination}
        </div>
      </body>
      </html>
    `;

    res.send(html);

  } catch (error) {
    console.error("Error rendering jobs:", error);
    res.status(500).send("<h1>Internal Server Error</h1>");
  }
});

