import { WebClient } from '@slack/web-api';

const token1 = process.env.SLACK_BOT_TOKEN; // load from env

const token = 'xoxb-8840923140053-9354338297218-YxcOfPJCNfOMaM4e3tobE3k6';
// const token1 = 'xoxb-8840923140053-9365248833524-DUa8pTMiAIadVZbu0MiodUNu';
const slackclient = new WebClient(token1);
const proxy_errorlId = 'C09B72958BS';
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