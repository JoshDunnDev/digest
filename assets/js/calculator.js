document.addEventListener("DOMContentLoaded", function () {
  const stopLossCalculatorForm = document.getElementById(
    "stopLossCalculatorForm"
  );
  const positionSizeCalculatorForm = document.getElementById(
    "positionSizeCalculatorForm"
  );

  function calculateStopLoss() {
    const inputs = getInputs("sl");
    const results = performStopLossCalculation(inputs);
    displayResults(results, "sl");
  }

  function calculatePositionSize() {
    const inputs = getInputs("ps");
    const results = performPositionSizeCalculation(inputs);
    displayResults(results, "ps");
  }

  function getInputs(prefix) {
    const inputs = {
      symbol: document.getElementById(`${prefix}-symbol`).value,
      accountBalance: Number(
        document.getElementById(`${prefix}-accountBalance`).value
      ),
      risk: Number(document.getElementById(`${prefix}-risk`).value),
      profitLossRatio: Number(
        document.getElementById(`${prefix}-profitLossRatio`).value
      ),
      entry: Number(document.getElementById(`${prefix}-entry`).value),
      shares:
        prefix === "sl"
          ? Number(document.getElementById(`${prefix}-shares`).value)
          : undefined,
      stopLoss:
        prefix === "ps"
          ? Number(document.getElementById(`${prefix}-stopLoss`).value)
          : undefined,
    };

    localStorage.setItem(`${prefix}-form`, JSON.stringify(inputs));

    return inputs;
  }

  function performStopLossCalculation({
    accountBalance,
    risk,
    profitLossRatio,
    entry,
    shares,
  }) {
    const positionAmount = entry * shares;
    const toleratedRisk = accountBalance * (risk / 100) || 0;
    const stopLoss = (positionAmount - toleratedRisk) / shares || 0;
    const effectiveRisk =
      positionAmount - Number(stopLoss).toFixed(2) * shares || 0;
    const takeProfit =
      entry + (entry - Number(stopLoss).toFixed(2)) * profitLossRatio || 0;
    const profitAmount = takeProfit * shares - positionAmount || 0;
    const stopLossOffset = stopLoss - entry;
    const takeProfitOffset = takeProfit - entry;

    return {
      positionAmount,
      toleratedRisk,
      stopLoss,
      effectiveRisk,
      takeProfit,
      profitAmount,
      stopLossOffset,
      takeProfitOffset,
    };
  }

  function performPositionSizeCalculation({
    accountBalance,
    risk,
    profitLossRatio,
    entry,
    stopLoss,
  }) {
    const toleratedRisk = accountBalance * (risk / 100) || 0;
    let shares = Math.round(toleratedRisk / (entry - stopLoss)) || 0;
    if (shares * entry > accountBalance) {
      shares = Math.floor(accountBalance / entry);
    }

    const positionAmount = entry * shares;
    const effectiveRisk = positionAmount - stopLoss * shares || 0;
    const takeProfit = entry + (entry - stopLoss) * profitLossRatio || 0;
    const profitAmount = takeProfit * shares - positionAmount || 0;

    return {
      shares,
      positionAmount,
      toleratedRisk,
      effectiveRisk,
      takeProfit,
      profitAmount,
    };
  }

  function displayResults(
    {
      shares,
      positionAmount,
      toleratedRisk,
      stopLoss,
      effectiveRisk,
      takeProfit,
      profitAmount,
      stopLossOffset,
      takeProfitOffset,
    },
    prefix
  ) {
    const fieldsToUpdate = {
      shares,
      positionAmount,
      toleratedRisk,
      stopLoss,
      effectiveRisk,
      takeProfit,
      profitAmount,
      stopLossOffset,
      takeProfitOffset,
    };
    Object.entries(fieldsToUpdate).forEach(([key, value]) => {
      if (document.getElementById(`${prefix}-${key}`)) {
        const innerTextValue =
          key === "shares" ? value : `$${Number(value).toFixed(2)}`;
        document.getElementById(`${prefix}-${key}`).innerText = innerTextValue;
      }
    });
  }

  stopLossCalculatorForm.addEventListener("submit", function (event) {
    event.preventDefault();
    calculateStopLoss();
  });

  positionSizeCalculatorForm.addEventListener("submit", function (event) {
    event.preventDefault();
    calculatePositionSize();
  });

  function resetForm(prefix) {
    [
      "symbol",
      "accountBalance",
      "risk",
      "profitLossRatio",
      "entry",
      "shares",
      "stopLoss",
    ].forEach((field) => {
      const element = document.getElementById(`${prefix}-${field}`);
      if (element) {
        element.value = "";
      }
    });
    [
      "positionAmount",
      "toleratedRisk",
      "stopLoss",
      "shares",
      "effectiveRisk",
      "takeProfit",
      "profitAmount",
      "stopLossOffset",
      "takeProfitOffset",
    ].forEach((field) => {
      const element = document.getElementById(`${prefix}-${field}`);
      if (element) {
        element.innerText = field === "shares" ? 0 : "$0";
      }
    });
  }

  stopLossCalculatorForm.addEventListener("reset", function (event) {
    event.preventDefault();
    resetForm("sl");
    localStorage.removeItem("sl-form");
  });

  positionSizeCalculatorForm.addEventListener("reset", function (event) {
    event.preventDefault();
    resetForm("ps");
    localStorage.removeItem("ps-form");
  });
});

function openTab(tabId) {
  const tabs = document.getElementsByClassName("cal-tab");
  Array.from(tabs).forEach((tab) => tab.classList.remove("active"));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
  const tabContents = document.getElementsByClassName("cal-tab-content");
  Array.from(tabContents).forEach((tab) => tab.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
}

function loadLocalIntoInputs(prefix) {
  const values = localStorage.getItem(`${prefix}-form`);
  if (values) {
    const parsedValues = JSON.parse(values);
    Object.entries(parsedValues).forEach(([key, value]) => {
      if (document.getElementById(`${prefix}-${key}`)) {
        document.getElementById(`${prefix}-${key}`).value = value;
      }
    });
  }
}

window.addEventListener("load", () => {
  loadLocalIntoInputs("sl");
  loadLocalIntoInputs("ps");
});
