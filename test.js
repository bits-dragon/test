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
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
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
const apiUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=developer%20or%20engineer&geoId=103644278&f_TPR=r600&f_WT=2&start=${0}`;
let headers = {
    // "User-Agent": randomUseragent.getRandom(),
    // "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
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


const proxyUrl = `https://${proxyList[Math.floor(Math.random() * proxyList.length)]}`;
const agent = new HttpsProxyAgent(proxyUrl);
const res = await axios.get(apiUrl, {
    // headers,
    httpAgent: agent,
    // timeout: 10000
});
console.log(res.status)