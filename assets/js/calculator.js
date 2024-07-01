document.addEventListener("DOMContentLoaded", function () {
  const stopLossCalculatorForm = document.getElementById(
    "stopLossCalculatorForm"
  );
  const positionSizeCalculatorForm = document.getElementById(
    "positionSizeCalculatorForm"
  );
  stopLossCalculatorForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get the input values
    const accountBlanace = Number(
      document.getElementById("sl-accountBalance").value
    );
    const risk = Number(document.getElementById("sl-risk").value);
    const profitLossRatio = Number(
      document.getElementById("sl-profitLossRatio").value
    );
    const entry = Number(document.getElementById("sl-entry").value);
    const shares = Number(document.getElementById("sl-shares").value);

    // Perform the calculation
    const positionAmount = entry * shares;
    const toleratedRisk = accountBlanace * (risk / 100) || 0;
    const stopLoss = (positionAmount - toleratedRisk) / shares || 0;
    const effectiveRisk =
      positionAmount - Number(stopLoss).toFixed(2) * shares || 0;
    const takeProfit =
      entry + (entry - Number(stopLoss).toFixed(2)) * profitLossRatio || 0;
    const profitAmount = takeProfit * shares - positionAmount || 0;

    // Display the result
    document.getElementById("sl-stopLoss").innerText = `$${Number(
      stopLoss
    ).toFixed(2)}`;
    document.getElementById("sl-positionAmount").innerText = `$${Number(
      positionAmount
    ).toFixed(2)}`;
    document.getElementById("sl-toleratedRisk").innerText = `$${Number(
      toleratedRisk
    ).toFixed(2)}`;
    document.getElementById("sl-takeProfit").innerText = `$${Number(
      takeProfit
    ).toFixed(2)}`;
    document.getElementById("sl-effectiveRisk").innerText = `$${Number(
      effectiveRisk
    ).toFixed(2)}`;
    document.getElementById("sl-profitAmount").innerText = `$${Number(
      profitAmount
    ).toFixed(2)}`;
  });
  stopLossCalculatorForm.addEventListener("reset", function (event) {
    event.preventDefault();
    document.getElementById("sl-symbol").value = "";
    document.getElementById("sl-accountBalance").value = "";
    document.getElementById("sl-risk").value = "";
    document.getElementById("sl-profitLossRatio").value = "";
    document.getElementById("sl-entry").value = "";
    document.getElementById("sl-shares").value = "";
  });
  positionSizeCalculatorForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get the input values
    const accountBlanace = Number(
      document.getElementById("ps-accountBalance").value
    );
    const risk = Number(document.getElementById("ps-risk").value);
    const profitLossRatio = Number(
      document.getElementById("ps-profitLossRatio").value
    );
    const entry = Number(document.getElementById("ps-entry").value);
    const stopLoss = Number(document.getElementById("ps-stopLoss").value);

    // Perform the calculation
    const toleratedRisk = accountBlanace * (risk / 100) || 0;
    const shares = Number(toleratedRisk / (entry - stopLoss)).toFixed(0) || 0;
    const positionAmount = entry * shares;
    const effectiveRisk =
      positionAmount - Number(stopLoss).toFixed(2) * shares || 0;
    const takeProfit =
      entry + (entry - Number(stopLoss).toFixed(2)) * profitLossRatio || 0;
    const profitAmount = takeProfit * shares - positionAmount || 0;

    // Display the result
    document.getElementById("ps-shares").innerText = `${Number(shares).toFixed(
      0
    )}`;
    document.getElementById("ps-positionAmount").innerText = `$${Number(
      positionAmount
    ).toFixed(2)}`;
    document.getElementById("ps-toleratedRisk").innerText = `$${Number(
      toleratedRisk
    ).toFixed(2)}`;
    document.getElementById("ps-takeProfit").innerText = `$${Number(
      takeProfit
    ).toFixed(2)}`;
    document.getElementById("ps-effectiveRisk").innerText = `$${Number(
      effectiveRisk
    ).toFixed(2)}`;
    document.getElementById("ps-profitAmount").innerText = `$${Number(
      profitAmount
    ).toFixed(2)}`;
  });
  positionSizeCalculatorForm.addEventListener("reset", function (event) {
    event.preventDefault();
    document.getElementById("ps-symbol").value = "";
    document.getElementById("ps-accountBalance").value = "";
    document.getElementById("ps-risk").value = "";
    document.getElementById("ps-profitLossRatio").value = "";
    document.getElementById("ps-entry").value = "";
    document.getElementById("ps-stopLoss").value = "";
  });
});

function openTab(tabId) {
  // const tabs = document.querySelectorAll(".cal-tab-content");
  // tabs.forEach((tab) => {
  //   tab.style.display = "none";
  // });
  const tabContents = document.getElementsByClassName("cal-tab-content");
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].classList.remove("active");
  }
  document.getElementById(tabId).classList.add("active");
}

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
    return {
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
    const shares = Math.round(toleratedRisk / (entry - stopLoss)) || 0;
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
  });

  positionSizeCalculatorForm.addEventListener("reset", function (event) {
    event.preventDefault();
    resetForm("ps");
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
