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
  const gameInstruction = document.getElementById("game-instruction");
  const gameWaitingArea = document.getElementById("game-waiting-area");
  const gameWaitingMsg = document.getElementById("game-waiting-msg");
  const gamePlayArea = document.getElementById("game-play-area");
  const gameCountdown = document.getElementById("game-countdown");
  const gameInstructionText = document.getElementById("game-instruction-text");
  const gameClickBtn = document.getElementById("game-click-btn");
  const gameReactionTimeEl = document.getElementById("game-reaction-time");
  const gameResultArea = document.getElementById("game-result-area");
  const gameResultMsg = document.getElementById("game-result-msg");
  const gameResultTimes = document.getElementById("game-result-times");

  const GAME_ENTRY_CODES = ["1111", "0000"];
  var currentUserCode = null;
  var gameState = "waiting"; // waiting, countdown, ready, clicked, finished
  var gameCountdownId = null;
  var gameWaitStartTime = null;
  var gameButtonShowTime = null;
  var gameReactionTime = null;
  var checkOpponentInterval = null;
  var checkResultInterval = null;

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
    gameState = "waiting";
    gameReactionTime = null;
    if (gameWaitingArea) gameWaitingArea.style.display = "block";
    if (gamePlayArea) gamePlayArea.style.display = "none";
    if (gameResultArea) gameResultArea.style.display = "none";
    if (gameWaitingMsg) gameWaitingMsg.textContent = "다른 참가자 대기 중…";
    if (gameClickBtn) {
      gameClickBtn.style.display = "none";
      gameClickBtn.disabled = false;
    }
    if (gameReactionTimeEl) gameReactionTimeEl.style.display = "none";
    if (gameResultMsg) gameResultMsg.textContent = "";
    if (gameResultTimes) gameResultTimes.textContent = "";
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
    
    // 이미 다른 코드로 입장했는지 확인
    if (currentUserCode && currentUserCode !== code) {
      if (gameCodeMessage) {
        gameCodeMessage.textContent = "이미 " + currentUserCode + " 방에 입장했습니다. 다른 브라우저/기기에서 " + code + " 코드로 입장해 주세요.";
        gameCodeMessage.className = "form-message error";
        gameCodeMessage.style.display = "block";
      }
      return;
    }
    
    currentUserCode = code;
    gameState = "waiting"; // 명시적으로 waiting 상태로 설정
    console.log("🎮 게임 입장:", code, "gameState:", gameState, "브라우저:", navigator.userAgent.substring(0, 50));
    if (gameRoomLabel) gameRoomLabel.textContent = "게임 방 (" + code + ")";
    resetGameUI();
    if (gameCodeScreen) gameCodeScreen.classList.remove("game-screen-active");
    if (gameRoomScreen) gameRoomScreen.classList.add("game-screen-active");
    notifyEntered();
    // 약간의 지연 후 확인 시작 (입장 상태가 저장될 시간 제공)
    setTimeout(function() {
      startCheckingOpponent();
    }, 500);
  }

  function notifyEntered() {
    if (!currentUserCode) {
      console.error("입장 실패: currentUserCode가 없습니다");
      return;
    }
    console.log("입장 시도:", currentUserCode);
    fetch("/api/game-scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: currentUserCode, entered: true }),
    })
      .then(function (r) {
        console.log("입장 응답 상태:", r.status, r.statusText);
        if (!r.ok) {
          return r.json().then(function (errData) {
            throw new Error(errData.error || "입장 실패: " + r.status);
          });
        }
        return r.json();
      })
      .then(function (data) {
        console.log("입장 완료:", currentUserCode, data);
        if (gameWaitingMsg) {
          gameWaitingMsg.textContent = "입장 완료! 상대방 대기 중…";
        }
      })
      .catch(function (err) {
        console.error("입장 실패:", err);
        if (gameWaitingMsg) {
          gameWaitingMsg.textContent = "입장 실패: " + (err.message || "네트워크 오류");
          gameWaitingMsg.style.color = "#ff3b30";
        }
      });
  }

  function startCheckingOpponent() {
    if (checkOpponentInterval) clearInterval(checkOpponentInterval);
    checkOpponentInterval = setInterval(function () {
      checkBothEntered();
    }, 2000);
  }

  function checkBothEntered() {
    fetch("/api/game-scores")
      .then(function (r) {
        if (!r.ok) {
          console.error("입장 상태 확인 실패:", r.status, r.statusText);
          return r.json().then(function (errData) {
            throw new Error(errData.error || "상태 확인 실패");
          });
        }
        return r.json();
      })
      .then(function (data) {
        // 더 명확한 타입 체크
        var entered1111 = !!(data.entered_1111 === true || data.entered_1111 === "1" || data.entered_1111 === 1 || data.entered_1111 === "true" || (data.entered_1111 != null && data.entered_1111 !== false && data.entered_1111 !== "false" && data.entered_1111 !== 0 && data.entered_1111 !== "0"));
        var entered0000 = !!(data.entered_0000 === true || data.entered_0000 === "1" || data.entered_0000 === 1 || data.entered_0000 === "true" || (data.entered_0000 != null && data.entered_0000 !== false && data.entered_0000 !== "false" && data.entered_0000 !== 0 && data.entered_0000 !== "0"));
        
        console.log("🔍 입장 상태 확인:", {
          entered1111: entered1111,
          entered0000: entered0000,
          raw_entered_1111: data.entered_1111,
          raw_entered_0000: data.entered_0000,
          rawData: data,
          gameState: gameState,
          currentUserCode: currentUserCode,
          bothEntered: entered1111 && entered0000,
          canStart: entered1111 && entered0000 && gameState === "waiting"
        });
        
        if (entered1111 && entered0000) {
          if (gameState === "waiting") {
            console.log("✅ 두 명 모두 입장! 게임 시작");
            clearInterval(checkOpponentInterval);
            startReactionGame();
          } else {
            console.log("⚠️ 두 명 모두 입장했지만 gameState가 'waiting'이 아님:", gameState);
          }
        } else {
          if (gameWaitingMsg) {
            var waitingText = "다른 참가자 대기 중…";
            if (currentUserCode === "1111") {
              waitingText = entered0000 ? "0000 방 입장 완료, 게임 시작 대기 중…" : "0000 방 대기 중… (1111: " + (entered1111 ? "입장✓" : "미입장") + ", 0000: " + (entered0000 ? "입장✓" : "미입장") + ")";
            } else if (currentUserCode === "0000") {
              waitingText = entered1111 ? "1111 방 입장 완료, 게임 시작 대기 중…" : "1111 방 대기 중… (1111: " + (entered1111 ? "입장✓" : "미입장") + ", 0000: " + (entered0000 ? "입장✓" : "미입장") + ")";
            }
            gameWaitingMsg.textContent = waitingText;
          }
        }
      })
      .catch(function (err) {
        console.error("입장 상태 확인 실패:", err);
        if (gameWaitingMsg) {
          gameWaitingMsg.textContent = "상태 확인 오류: " + (err.message || "네트워크 오류");
        }
      });
  }

  function startReactionGame() {
    gameState = "countdown";
    if (gameWaitingArea) gameWaitingArea.style.display = "none";
    if (gamePlayArea) gamePlayArea.style.display = "block";
    if (gameCountdown) gameCountdown.textContent = "준비...";
    if (gameInstructionText) gameInstructionText.textContent = "버튼이 나타나면 빠르게 클릭하세요!";
    var count = 3;
    gameCountdownId = setInterval(function () {
      if (gameCountdown) gameCountdown.textContent = count > 0 ? count + "..." : "시작!";
      count--;
      if (count < 0) {
        clearInterval(gameCountdownId);
        showButtonAfterRandomDelay();
      }
    }, 1000);
  }

  function showButtonAfterRandomDelay() {
    var delay = Math.random() * 4000 + 1000;
    gameWaitStartTime = Date.now();
    setTimeout(function () {
      if (gameState === "countdown") {
        gameState = "ready";
        gameButtonShowTime = Date.now();
        if (gameClickBtn) {
          gameClickBtn.style.display = "block";
          gameClickBtn.textContent = "클릭!";
        }
        if (gameCountdown) gameCountdown.textContent = "";
      }
    }, delay);
  }

  function showResult(myTime, times) {
    if (!gameResultArea || !gameResultMsg || !gameResultTimes) return;
    gameResultArea.style.display = "block";
    var otherCode = currentUserCode === "1111" ? "0000" : "1111";
    var otherTime = times[otherCode];
    if (gameResultTimes) {
      var myTimeText = "내 반응 시간: " + (myTime != null ? myTime.toFixed(3) + "초" : "—");
      var otherTimeText = otherTime != null ? "상대: " + otherTime.toFixed(3) + "초" : "상대: —";
      gameResultTimes.textContent = myTimeText + " / " + otherTimeText;
    }
    if (otherTime == null) {
      gameResultMsg.textContent = "상대방 결과를 기다리는 중…";
      gameResultMsg.className = "game-result-msg";
      // 상대방 결과가 없으면 주기적으로 확인
      startCheckingResult(myTime);
    } else {
      // 상대방 결과가 있으면 최종 결과 표시
      displayFinalResult(myTime, otherTime);
      // 확인 중단
      if (checkResultInterval) {
        clearInterval(checkResultInterval);
        checkResultInterval = null;
      }
    }
  }

  function displayFinalResult(myTime, otherTime) {
    if (!gameResultMsg) return;
    console.log("🏆 최종 결과 계산:", { myTime: myTime, otherTime: otherTime });
    
    if (myTime == null) {
      gameResultMsg.textContent = "결과를 확인할 수 없어요.";
      gameResultMsg.className = "game-result-msg";
      return;
    }
    
    if (otherTime == null) {
      gameResultMsg.textContent = "상대방 결과를 기다리는 중…";
      gameResultMsg.className = "game-result-msg";
      return;
    }
    
    // 반응 시간이 짧을수록 승자 (더 빠르게 클릭)
    if (myTime < otherTime) {
      gameResultMsg.textContent = "승자입니다! 합쳐진 에어팟의 주인이 되었어요.";
      gameResultMsg.className = "game-result-msg winner";
      console.log("✅ 승리!");
    } else if (myTime > otherTime) {
      gameResultMsg.textContent = "아쉽게도 패배했습니다.";
      gameResultMsg.className = "game-result-msg loser";
      console.log("❌ 패배");
    } else {
      gameResultMsg.textContent = "무승부입니다.";
      gameResultMsg.className = "game-result-msg";
      console.log("🤝 무승부");
    }
  }

  function startCheckingResult(myTime) {
    if (checkResultInterval) clearInterval(checkResultInterval);
    console.log("🔄 상대방 결과 확인 시작 (내 시간:", myTime, ")");
    checkResultInterval = setInterval(function () {
      fetch("/api/game-scores")
        .then(function (r) {
          if (!r.ok) {
            console.error("결과 확인 실패:", r.status);
            return null;
          }
          return r.json();
        })
        .then(function (data) {
          if (!data) return;
          console.log("📊 결과 확인 응답:", data);
          
          var otherCode = currentUserCode === "1111" ? "0000" : "1111";
          var otherTime = null;
          
          // 현재 사용자 코드에 따라 상대방 시간 가져오기
          if (currentUserCode === "1111") {
            otherTime = data.reaction_0000 != null ? data.reaction_0000 : null;
          } else if (currentUserCode === "0000") {
            otherTime = data.reaction_1111 != null ? data.reaction_1111 : null;
          }
          
          console.log("상대방 시간:", otherTime, "(코드:", otherCode + ")");
          
          if (otherTime != null) {
            console.log("✅ 상대방 결과 확인됨:", otherTime, "초");
            // 결과 업데이트
            if (gameResultTimes) {
              var myTimeText = "내 반응 시간: " + (myTime != null ? myTime.toFixed(3) + "초" : "—");
              var otherTimeText = "상대: " + otherTime.toFixed(3) + "초";
              gameResultTimes.textContent = myTimeText + " / " + otherTimeText;
            }
            displayFinalResult(myTime, otherTime);
            // 확인 중단
            clearInterval(checkResultInterval);
            checkResultInterval = null;
            console.log("✅ 최종 결과 표시 완료");
          } else {
            console.log("⏳ 상대방 결과 대기 중...");
          }
        })
        .catch(function (err) {
          console.error("결과 확인 실패:", err);
        });
    }, 2000); // 2초마다 확인
  }

  if (gameClickBtn) {
    gameClickBtn.addEventListener("click", function () {
      if (gameState !== "ready" || gameClickBtn.disabled) return;
      gameState = "clicked";
      gameReactionTime = (Date.now() - gameButtonShowTime) / 1000;
      if (gameClickBtn) {
        gameClickBtn.disabled = true;
        gameClickBtn.textContent = "완료!";
      }
      if (gameReactionTimeEl) {
        gameReactionTimeEl.style.display = "block";
        gameReactionTimeEl.textContent = "반응 시간: " + gameReactionTime.toFixed(3) + "초";
      }
      fetch("/api/game-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: currentUserCode, reactionTime: gameReactionTime }),
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
            var times = result.data.times || result.data || {};
            console.log("결과 수신:", { myTime: gameReactionTime, times: times });
            showResult(gameReactionTime, times);
            gameState = "finished";
        })
        .catch(function () {
          if (gameResultMsg) {
            gameResultMsg.textContent = "결과 전송에 실패했어요. 네트워크를 확인해 주세요.";
            gameResultMsg.className = "game-result-msg";
          }
          if (gameResultArea) gameResultArea.style.display = "block";
        });
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
