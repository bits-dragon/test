import { WebClient } from '@slack/web-api';
import dotenv from "dotenv";
dotenv.config();

const token1 = "xoxb-8840923140053-9365248833524-R7QndmyA7i1reUCj8un3cEj9"; // load from env
console.log(token1);
const token = 'o';
const slackclient = new WebClient(token1);
const proxy_errorlId = 'C099B72958BS';
const jobsId = "C09AFMB5MV1";
(async () => {
    
    try {
        const result = await slackclient.chat.postMessage({
            channel: jobsId,
            text: "Hello from bot!",
        });
        console.log("Message sent:");
    } catch (err) {
        console.error("Slack API error:", err);
    }
})();