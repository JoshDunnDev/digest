document.addEventListener("DOMContentLoaded", function () {
  const stopLossCalculatorForm = document.getElementById(
    "stopLossCalculatorForm"
  );
  const positionSizeCalculatorForm = document.getElementById(
    "positionSizeCalculatorForm"
  );
  const swapButtonOffset = document.getElementById("swapButtonOffset");
  const swapButtonStop = document.getElementById("swapButtonStop");

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
    const stopLoss = document.getElementById("ps-stopLossInput");
    const offset = document.getElementById("ps-offset");
    const inputs = {
      symbol: document.getElementById(`${prefix}-symbol`).value,
      positionType: document.getElementById(`${prefix}-positionType`).value,
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
        prefix === "ps" && stopLoss.value ? Number(stopLoss.value) : undefined,
      offset:
        prefix === "ps" && offset.value ? Number(offset.value) : undefined,
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
    offset,
    positionType,
  }) {
    const isShort = positionType === "short";
    if (isShort && offset) {
      offset = offset * -1;
    }
    const stopLossValue = stopLoss || entry - offset || 0;
    const toleratedRisk = accountBalance * (risk / 100) || 0;
    let shares =
      (isShort ? -1 : 1) *
        Math.round(toleratedRisk / (entry - stopLossValue)) || 0;
    if (shares * entry > accountBalance) {
      shares = Math.floor(accountBalance / entry);
    }

    const positionAmount = entry * shares;
    const effectiveRisk =
      (isShort ? -1 : 1) * (positionAmount - stopLossValue * shares) || 0;
    const takeProfit = entry + (entry - stopLossValue) * profitLossRatio || 0;
    const profitAmount =
      (isShort ? -1 : 1) * (takeProfit * shares - positionAmount) || 0;
    const stopLossOffset = offset || stopLoss - entry;
    const takeProfitOffset = takeProfit - entry;

    return {
      shares,
      positionAmount,
      toleratedRisk,
      effectiveRisk,
      takeProfit,
      profitAmount,
      stopLossOffset,
      takeProfitOffset,
      stopLoss: stopLossValue,
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

  if (stopLossCalculatorForm) {
    stopLossCalculatorForm.addEventListener("submit", function (event) {
      event.preventDefault();
      calculateStopLoss();
    });

    stopLossCalculatorForm.addEventListener("reset", function (event) {
      event.preventDefault();
      resetForm("sl");
      localStorage.removeItem("sl-form");
    });
  }

  positionSizeCalculatorForm.addEventListener("submit", function (event) {
    event.preventDefault();
    calculatePositionSize();
  });

  positionSizeCalculatorForm.addEventListener("reset", function (event) {
    event.preventDefault();
    resetForm("ps");
    localStorage.removeItem("ps-form");
  });

  swapButtonOffset.addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.setItem("stop-type", "offset");
    document.getElementById("stop-container").classList.remove("active");
    document.getElementById("offset-container").classList.add("active");
    document.getElementById("stopLossOffsetResult").classList.remove("active");
    document.getElementById("stopLossResult").classList.add("active");
    document.getElementById("ps-offset").required = true;
    const stopLoss = document.getElementById("ps-stopLossInput");
    stopLoss.value = "";
    stopLoss.required = false;
    resetForm("ps", true);
  });

  swapButtonStop.addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.setItem("stop-type", "stop");
    document.getElementById("offset-container").classList.remove("active");
    document.getElementById("stop-container").classList.add("active");
    document.getElementById("stopLossResult").classList.remove("active");
    document.getElementById("stopLossOffsetResult").classList.add("active");
    document.getElementById("ps-stopLossInput").required = true;
    const offset = document.getElementById("ps-offset");
    offset.value = "";
    offset.required = false;
    resetForm("ps", true);
  });

  function resetForm(prefix, resultsOnly = false) {
    if (!resultsOnly) {
      [
        "symbol",
        "accountBalance",
        "risk",
        "profitLossRatio",
        "entry",
        "shares",
        "stopLoss",
        "offset",
      ].forEach((field) => {
        const element = document.getElementById(`${prefix}-${field}`);
        if (element) {
          element.value = "";
        }
      });
    }
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
});

function addZeroes(num) {
  num = num.toString();
  const dec = num.split(".")[1];
  const len = dec && dec.length > 2 ? dec.length : 2;
  return Number(num).toFixed(len);
}

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
      if (prefix === "ps" && key === "stopLoss") {
        key = "stopLossInput";
      }
      if (document.getElementById(`${prefix}-${key}`)) {
        document.getElementById(`${prefix}-${key}`).value =
          typeof value === "number" &&
          key !== "risk" &&
          key !== "profitLossRatio"
            ? addZeroes(value)
            : value;
      }
    });
  }
}

function loadLocalStopType() {
  const stopType = localStorage.getItem("stop-type");
  if (stopType === "offset") {
    document.getElementById("stop-container").classList.remove("active");
    document.getElementById("offset-container").classList.add("active");
    document.getElementById("stopLossOffsetResult").classList.remove("active");
    document.getElementById("stopLossResult").classList.add("active");
    const stopLoss = document.getElementById("ps-stopLossInput");
    stopLoss.value = "";
    stopLoss.required = false;
  } else {
    document.getElementById("ps-offset").required = false;
  }
}

window.addEventListener("load", () => {
  // loadLocalIntoInputs("sl");
  loadLocalIntoInputs("ps");
  loadLocalStopType();
});
