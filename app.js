(function () {
  const stepPart = document.getElementById("step-part");
  const stepModel = document.getElementById("step-model");
  const stepShipping = document.getElementById("step-shipping");
  const backToPart = document.getElementById("back-to-part");
  const backFromShipping = document.getElementById("back-from-shipping");

  const formShipping = document.getElementById("form-shipping");
  const shippingName = document.getElementById("shipping-name");
  const shippingPhone = document.getElementById("shipping-phone");
  const shippingAddress = document.getElementById("shipping-address");
  const shippingSummary = document.getElementById("shipping-summary");
  const btnShippingSubmit = document.getElementById("btn-shipping-submit");
  const shippingMessage = document.getElementById("shipping-message");

  const gameCodeInput = document.getElementById("game-code-input");
  const gameCodeSubmit = document.getElementById("game-code-submit");
  const gameCodeMessage = document.getElementById("game-code-message");
  const gameCodeScreen = document.getElementById("game-code-screen");
  const gameRoomScreen = document.getElementById("game-room-screen");
  const gameRoomLabel = document.getElementById("game-room-label");
  const gameScoreValue = document.getElementById("game-score-value");
  const gameTimer = document.getElementById("game-timer");
  const gameClickBtn = document.getElementById("game-click-btn");
  const gamePlayArea = document.getElementById("game-play-area");
  const gameResultArea = document.getElementById("game-result-area");
  const gameResultMsg = document.getElementById("game-result-msg");
  const gameResultScores = document.getElementById("game-result-scores");

  const GAME_ENTRY_CODES = ["1111", "0000"];
  const GAME_DURATION_SEC = 10;
  var currentUserCode = null;
  var gameScore = 0;
  var gameTimerId = null;
  var gameEndTime = null;

  const partCards = document.querySelectorAll(".options-part .option-card");
  const modelCards = document.querySelectorAll(".options-model .option-card");

  let selectedPart = null;
  let selectedModel = null;

  function showStep(stepElement) {
    [stepPart, stepModel, stepShipping].forEach(function (el) {
      if (el) el.classList.remove("active");
    });
    if (stepElement) stepElement.classList.add("active");
  }

  function showView(viewName) {
    [stepPart, stepModel, stepShipping].forEach(function (el) {
      if (el) el.classList.remove("active");
    });
    if (viewName === "home") {
      stepPart.classList.add("active");
    }
  }

  document.querySelectorAll("[data-view]").forEach(function (el) {
    if (el.getAttribute("data-view") === "home") {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        showView("home");
      });
    }
  });

  partCards.forEach(function (card) {
    card.addEventListener("click", function () {
      selectedPart = card.getAttribute("data-part");
      showStep(stepModel);
    });
  });

  if (backToPart) {
    backToPart.addEventListener("click", function () {
      showStep(stepPart);
    });
  }

  modelCards.forEach(function (card) {
    card.addEventListener("click", function () {
      selectedModel = card.getAttribute("data-model");
      if (!selectedModel || !selectedPart) return;
      showStep(stepShipping);
      if (shippingSummary) {
        shippingSummary.textContent =
          "선택: " + getModelLabel(selectedModel) + " / " + getPartLabel(selectedPart);
      }
    });
  });

  if (backFromShipping) {
    backFromShipping.addEventListener("click", function () {
      showStep(stepModel);
    });
  }

  function getPartLabel(part) {
    var labels = { left: "왼쪽 유닛", right: "오른쪽 유닛", case: "본체 (케이스)" };
    return labels[part] || part;
  }

  function getModelLabel(model) {
    var labels = {
      "airpods-1": "에어팟 1세대",
      "airpods-2": "에어팟 2세대",
      "airpods-3": "에어팟 3세대",
      "airpods-4": "에어팟 4세대",
      "pro-1": "에어팟 Pro 1세대",
      "pro-2": "에어팟 Pro 2세대",
      "pro-3": "에어팟 Pro 3세대",
    };
    return labels[model] || model;
  }

  // ——— 게임 입장 코드 ———
  function resetGameUI() {
    gameScore = 0;
    if (gameScoreValue) gameScoreValue.textContent = "0";
    if (gameTimer) gameTimer.textContent = "시작 버튼을 누르세요";
    if (gameClickBtn) {
      gameClickBtn.disabled = false;
      gameClickBtn.textContent = "시작";
    }
    if (gameResultArea) {
      gameResultArea.style.display = "none";
      if (gameResultMsg) gameResultMsg.textContent = "";
      if (gameResultScores) gameResultScores.textContent = "";
    }
  }

  function enterGame() {
    var code = (gameCodeInput?.value || "").trim();
    if (gameCodeMessage) {
      gameCodeMessage.style.display = "none";
      gameCodeMessage.textContent = "";
      gameCodeMessage.className = "form-message";
    }
    if (!GAME_ENTRY_CODES.includes(code)) {
      if (gameCodeMessage) {
        gameCodeMessage.textContent = "코드가 올바르지 않아요. 다시 입력해 주세요.";
        gameCodeMessage.className = "form-message error";
        gameCodeMessage.style.display = "block";
      }
      return;
    }
    currentUserCode = code;
    if (gameRoomLabel) gameRoomLabel.textContent = "게임 방";
    resetGameUI();
    if (gameCodeScreen) gameCodeScreen.classList.remove("game-screen-active");
    if (gameRoomScreen) gameRoomScreen.classList.add("game-screen-active");
  }

  function showResult(myScore, scores) {
    if (!gameResultArea || !gameResultMsg || !gameResultScores) return;
    gameResultArea.style.display = "block";
    var otherCode = currentUserCode === "1111" ? "0000" : "1111";
    var otherScore = scores[otherCode];
    if (gameResultScores) {
      var myScoreText = "내 점수: " + myScore + "점";
      var otherScoreText = otherScore != null ? "상대: " + otherScore + "점" : "상대: —";
      gameResultScores.textContent = myScoreText + " / " + otherScoreText;
    }
    if (otherScore == null) {
      gameResultMsg.textContent = "상대 방 결과를 기다리는 중…";
      gameResultMsg.className = "game-result-msg";
    } else if (myScore > otherScore) {
      gameResultMsg.textContent = "승자입니다! 합쳐진 에어팟의 주인이 되었어요.";
      gameResultMsg.className = "game-result-msg winner";
    } else if (myScore < otherScore) {
      gameResultMsg.textContent = "아쉽게도 패배했습니다.";
      gameResultMsg.className = "game-result-msg loser";
    } else {
      gameResultMsg.textContent = "무승부입니다.";
      gameResultMsg.className = "game-result-msg";
    }
  }

  function startGame() {
    if (!currentUserCode || !gameClickBtn || !gameTimer) return;
    gameScore = 0;
    if (gameScoreValue) gameScoreValue.textContent = "0";
    gameClickBtn.textContent = "클릭!";
    gameEndTime = Date.now() + GAME_DURATION_SEC * 1000;
    gameTimerId = setInterval(function () {
      var left = Math.ceil((gameEndTime - Date.now()) / 1000);
      if (gameTimer) gameTimer.textContent = left > 0 ? left + "초 남음" : "종료!";
      if (left <= 0) {
        clearInterval(gameTimerId);
        gameTimerId = null;
        gameClickBtn.disabled = true;
        gameClickBtn.textContent = "종료";
        fetch("/api/game-scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: currentUserCode, score: gameScore }),
        })
          .then(function (r) {
            return r.json().then(function (data) {
              return { status: r.status, data: data };
            });
          })
          .then(function (result) {
            if (result.status === 503) {
              if (gameResultMsg) {
                gameResultMsg.textContent =
                  "점수 저장이 아직 설정되지 않았어요. 잠시 후 다시 시도해 주세요.";
                gameResultMsg.className = "game-result-msg";
              }
              if (gameResultArea) gameResultArea.style.display = "block";
              return;
            }
            var scores = result.data.scores || result.data || {};
            showResult(gameScore, scores);
          })
          .catch(function () {
            if (gameResultMsg) {
              gameResultMsg.textContent = "점수 전송에 실패했어요. 네트워크를 확인해 주세요.";
              gameResultMsg.className = "game-result-msg";
            }
            if (gameResultArea) gameResultArea.style.display = "block";
          });
      }
    }, 200);
  }

  if (gameClickBtn) {
    gameClickBtn.addEventListener("click", function () {
      if (gameClickBtn.disabled) return;
      if (gameClickBtn.textContent === "시작") {
        startGame();
        return;
      }
      gameScore++;
      if (gameScoreValue) gameScoreValue.textContent = gameScore;
    });
  }

  if (gameCodeSubmit) {
    gameCodeSubmit.addEventListener("click", enterGame);
  }
  if (gameCodeInput) {
    gameCodeInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        enterGame();
      }
    });
  }

  // ——— 배송 정보 폼 제출 → Resend로 이메일 전송 ———
  if (formShipping) {
    formShipping.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (shippingMessage) {
        shippingMessage.style.display = "none";
        shippingMessage.className = "form-message";
      }

      var name = shippingName?.value?.trim();
      var phone = shippingPhone?.value?.trim();
      var address = shippingAddress?.value?.trim();

      if (!name || !phone || !address) {
        if (shippingMessage) {
          shippingMessage.textContent = "이름, 전화번호, 주소를 모두 입력해 주세요.";
          shippingMessage.className = "form-message error";
          shippingMessage.style.display = "block";
        }
        return;
      }

      if (btnShippingSubmit) {
        btnShippingSubmit.disabled = true;
        btnShippingSubmit.textContent = "보내는 중…";
      }

      try {
        var res = await fetch("/api/send-registration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            part: selectedPart,
            model: selectedModel,
            partLabel: getPartLabel(selectedPart),
            modelLabel: getModelLabel(selectedModel),
            name: name,
            phone: phone,
            address: address,
          }),
        });

        var data = await res.json().catch(function () { return {}; });

        if (!res.ok) {
          throw new Error(data.error || data.message || "전송에 실패했어요.");
        }

        if (shippingMessage) {
          shippingMessage.textContent =
            "seung031220@naver.com으로 보냈어요. 확인 후 연락 드릴게요.";
          shippingMessage.className = "form-message success";
          shippingMessage.style.display = "block";
        }
        formShipping.reset();
        if (shippingSummary) shippingSummary.textContent = "—";
        showStep(stepPart);
        selectedPart = null;
        selectedModel = null;
      } catch (err) {
        if (shippingMessage) {
          shippingMessage.textContent =
            "전송에 실패했어요. " + (err.message || "다시 시도해 주세요.");
          shippingMessage.className = "form-message error";
          shippingMessage.style.display = "block";
        }
      } finally {
        if (btnShippingSubmit) {
          btnShippingSubmit.disabled = false;
          btnShippingSubmit.textContent = "seung031220@naver.com으로 보내기";
        }
      }
    });
  }
})();
