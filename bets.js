const betInput = document.querySelector("#roulette_amount");

const discordWebhookUrl = 'https://discord.com/api/webhooks/1155594517009928242/6LFq4e8JFj8tP_F08z0WUYuT_tOBqTts6FxC3H8oHFLqp-5bZqKawl7PXc-zcoMpEend';

let webhookEnabled = true; // Initialize it as enabled

const balls = document.querySelector(
  "#select_roulette > div.rolling > div.jackpot > ul"
);

const betRedButton = document.querySelector(
  "#select_roulette > div.rounds > div.round.round_red > div.round_button > div > button"
);

const betGreenButton = document.querySelector(
  "#select_roulette > div.rounds > div.round.round_green > div.round_button > button"
);

const betBlackButton = document.querySelector(
  "#select_roulette > div.rounds > div.round.round_black > div.round_button > div > button"
);

const panel = document.querySelector(".leftSide");

document.querySelector(".games")?.remove();

const scriptStates = {
  [true]: "<span class='on auto-bet__state'>ON</span>",
  [false]: "<span class='off auto-bet__state'>OFF</span>",
};

const colors = {
  dark: "<span class='auto-bet__last-color dark'>Black</span>",
  red: "<span class='auto-bet__last-color red'>Red</span>",
  green: "<span class='auto-bet__last-color green'>Green</span>",
};

async function sendDiscordMessage(message) {
  try {
    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (response.ok) {
      console.log('Message sent to Discord successfully.');
    } else {
      console.error('Failed to send message to Discord:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error sending message to Discord:', error);
  }
}

sendDiscordMessage('Script has started.');

const panelHTML = `
    <style>
        .btn{
            height: 40px;
            width: 46%;
            margin-right: 10px;
            background: none;
            font-weight: 500;
            font-size: 16px;
            padding: 0 16px;
            cursor: pointer;
            transition: all .3s ease;
            border-radius: 10px;
            line-height: 36px;
            text-transform: uppercase;
        }

        .green_inline{
            border: 2px solid #7DC48A !important;
            color: #7DC48A;
        }

        .auto-bet{
            position: relative;
            background: #222225;
            padding: 30px;
            border-radius: 10px;
        }

        .title{
            width: 100%;
            color: white;
            font-size: 26px;
            text-transform: uppercase;
            position: relative;
            display: inline-block;
            margin: 0 0 40px 0;
        }

        .data{
            color: white;
            margin-bottom: 30px;
        }

        .data > p {
            margin-bottom: 15px;
        }

        .auto-bet__start-bet, .auto-bet__max-bet{
            font-weight: 700;
            color: white;
            margin-bottom: 30px;
        }

        .auto-bet__start-bet input, .auto-bet__max-bet input{
            width: calc(100% - 30px);
            height: 38px;
            background: #2F2F34;
            border-radius: 10px;
            color: white;
            padding: 0 10px;
        }

        .data span{
          font-weight: bold;
        }

        .auto-bet label{
            width: 100%;
        }

        .on{
          color: #7DC48A;
        }

        .off{
          color: #D4594C;
        }

        .dark{
          color: black;
        }

        .red{
          color: #D4594C;
        }

        .green{
          color: #7DC48A;
        }
    </style>
    <div class="auto-bet">
        <h2 class="title">Auto bet: ${scriptStates[false]}</h2>
        <div class="auto-bet__start-bet">
            <label>
                <p>Starting Bet</p> <br>
                <input type="number">
            </label>
        </div>
        <div class="auto-bet__max-bet">
            <label>
                <p>Max Bet</p> <br>
                <input type="number">
            </label>
        </div>
        <div class="data">
            <p>Last Rolled Color: <span class="auto-bet__last-color">${
              colors[balls.lastChild.children[0].classList[0]]
            }</span></p>
            <p>Maximum Bet: <span class="auto-bet__current-max-bet">None</span></p>
            <p>Current Bet: <span class="auto-bet__current-bet">None</span></p>
        </div>
        <button class="green_inline auto-bet__start btn">Start</button>
        <button class="red_inline auto-bet__stop btn">Stop</button>
    </div>
`;

panel.innerHTML = panelHTML + panel.innerHTML;

const startBetInput = document.querySelector(".auto-bet__start-bet input");
const maxBetInput = document.querySelector(".auto-bet__max-bet input");
const startButton = document.querySelector(".auto-bet__start");
const stopButton = document.querySelector(".auto-bet__stop");
const lastColorPanel = document.querySelector(".auto-bet__last-color");
const currentBetPanel = document.querySelector(".auto-bet__current-bet");
const maxBetPanel = document.querySelector(".auto-bet__current-max-bet");
const state = document.querySelector(".auto-bet__state");

const betButtons = {
  red: betRedButton,
  dark: betBlackButton,
  green: betGreenButton,
};

let lastColor = balls.lastChild.children[0].classList[0];
let selectedColor = balls.lastChild.children[0].classList[0];
let bet = 0;
let startBet = 0;
let maxBet = 0;
let isStarted = false;
let isRolling = false;
let beted = false;
let lastGreen = false;

let noBetCount = 0;

const doBet = () => {
  if (!betInput || !isStarted) return;

  // Calculate the bet amount based on whether it's a win or a loss
  let betAmount = beted ? bet * 2 : startBet;

  // Check if the calculated bet amount exceeds the maximum bet
  if (maxBet && betAmount > maxBet) {
    // Set the bet amount to the maximum bet if exceeded
    betAmount = maxBet;
  }

  betInput.value = betAmount.toString();
  betButtons[selectedColor].click();
  beted = true;

  // Update the current bet displayed in the HTML panel
  currentBetPanel.innerText = betAmount;

  sendDiscordMessage(`Placed a bet of ${betAmount} on ${selectedColor}.`);

  // Update the bet amount for the next round, whether it's a win or loss
  bet = beted ? bet * 2 : startBet;
};

const changeState = (newState) => {
  if ((!startBetInput.value && newState) || isStarted === newState) return;

  bet = parseInt(startBetInput.value) || 0;
  maxBet = parseInt(maxBetInput.value) || 0;

  startBet = bet;

  isStarted = newState;
  state.innerHTML = scriptStates[newState];

  currentBetPanel.innerText = bet || "None";
  maxBetPanel.innerHTML = maxBet || "None";

  startBetInput.value = "0";
  maxBetInput.value = "0";

  !isRolling && doBet();

  // Toggle webhook status based on the newState
  webhookEnabled = newState;
};


const onRollEnd = (mutation) => {
  if (!mutation.addedNodes.length) {
    // No bet was placed
    if (!beted) {
      noBetCount++;
      // Send a message through the webhook indicating no bet was placed
      sendDiscordMessage(`No bet placed in round ${noBetCount}.`);
    }
    return;
  }

  // Reset noBetCount when a bet is placed
  noBetCount = 0;

  const previousColor = selectedColor;
  lastColor = balls.lastChild.children[0].classList[0];
  lastColorPanel.innerHTML = colors[lastColor];

  if (beted && lastColor === selectedColor) {
    // You won the last round and a bet was placed
    sendDiscordMessage(`Congratulations! You won ${bet * 2} on ${selectedColor}.`);
  } else if (lastColor !== selectedColor) {
    // You lost the last round, specify the winning color
    const winningColor = lastColor === "dark" ? "black" : lastColor;
    sendDiscordMessage(`Oops! You lost ${startBet} on ${selectedColor}. ${winningColor} won.`);
  }

  bet =
    lastColor !== selectedColor &&
    (maxBet ? bet * 2 <= maxBet : true) &&
    isStarted &&
    beted
      ? bet * 2
      : startBet;

  currentBetPanel.innerText = bet;

  if (isStarted) {
    lastColor === "green" && (lastGreen = true);
    selectedColor = lastColor;
  }

  lastColor !== "green" && (lastGreen = false);

  beted = false;

  !lastGreen && setTimeout(() => doBet(), 10000);
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => onRollEnd(mutation));
});

balls && observer.observe(balls, { childList: true });

startButton.addEventListener("click", () => changeState(true));
stopButton.addEventListener("click", () => changeState(false));

setInterval(() => {
  const progress = document.querySelector(
    "#select_roulette > div.rolling > div.progress > span"
  );

  isRolling = progress.innerText === "***ROLLING***";
}, 500);
