// ========================================
// Phase 1: 기본 레이아웃 및 디버그 환경 구축
// Phase 2: Local NLP 엔진 구현 (TDD)
// Phase 3: 타자 게임 물리 엔진 및 매칭 로직
// ========================================

// DOM 요소 캐시
const elements = {
    gameCanvas: document.getElementById('gameCanvas'),
    gameInput: document.getElementById('gameInput'),
    debugInput: document.getElementById('debugInput'),
    injectBtn: document.getElementById('injectBtn'),
    debugOutput: document.getElementById('debugOutput'),
    captionText: document.getElementById('captionText'),
    debugPanel: document.querySelector('.debug-panel'),
    scoreValue: document.getElementById('scoreValue'),
    lifeIcons: document.getElementById('lifeIcons'),
    gameOverModal: document.getElementById('gameOverModal'),
    finalScoreValue: document.getElementById('finalScoreValue'),
    restartBtn: document.getElementById('restartBtn'),
};

// ========================================
// 불용어(Stop-word) 배열 - Phase 2
// ========================================
const STOPWORDS = [
// 1. 강의 진행용 습관어
    '자', '이제', '일단', '먼저', '다음을', '다음으로', '넘어가서', '넘어가겠습니다', 
    '보시면', '보시죠', '아시겠죠', '이해되시죠', '질문', '있나요', 
    '알아봅시다', '살펴봅시다', '다뤄보겠습니다', '말씀드리면', '설명하자면', 
    '여기서', '저기서', '이것을', '저것을', '그것을', '다시', '한번',

    // 2. 접속사 및 연결어
    '그리고', '그래서', '그러면', '그렇다면', '하지만', '그런데', '따라서', 
    '왜냐하면', '어쨌든', '아무튼', '반면에',

    // 3. 강조 및 정도를 나타내는 부사
    '아주', '매우', '정말', '진짜', '가장', '제일', '좀', '조금', '많이', 
    '잘', '거의', '보통', '대부분', '항상', '주로', '아마도', '역시', '그냥',

    // 4. 인사말 및 마무리
    '안녕하세요', '반갑습니다', '이상으로', '마칠게요', '수고하셨습니다', '수고하셨어요',

    // 5. 불필요한 서술어 (단어가 아닌 문장 단위로 끊길 때를 대비)
    '중요합니다', '기억하세요', '다릅니다', '같습니다', '있습니다', '없습니다',
    '됩니다', '안됩니다', '합시다', '하세요'
];

// ========================================
// Phase 2: Local NLP 필터링 엔진
// ========================================

/**
 * 단어 가공 파이프라인 (5단계)
 * 1. 토큰화: 띄어쓰기 기준 분리
 * 2. 특수기호 제거: 구두점 제거
 * 3. 조사/어미 제거: 정규식으로 한국어 조사, 어미 탈락
 * 4. 길이 필터링: 1글자 이하 제외
 * 5. 불용어 필터링: STOPWORDS 제외
 */
function processText(text) {
    // Step 1: 토큰화 - 띄어쓰기 기준 분리
    let tokens = text.split(' ');
    console.log('[NLP] Step 1 - 토큰화:', tokens);

    // Step 2: 특수기호 제거 - 구두점 제거 (.,?!;: 등)
    tokens = tokens.map(token => {
        return token.replace(/[.,?!;:'"()[\]{}]/g, '');
    });
    console.log('[NLP] Step 2 - 특수기호 제거:', tokens);

    // Step 3: 조사 및 어미 제거
    // 정규식: 한국어 조사(은|는|이|가|을|를|에|에서|의|로|으로), 어미(입니다|합니다|습니다|였다|였습니다 등)
    const josaEomiRegex = /(은|는|이|가|을|를|에|에서|의|로|으로|입니다|합니다|습니다|였|이었|일|하|했|합|함|호|면|므로)$/g;
    tokens = tokens.map(token => {
        return token.replace(josaEomiRegex, '');
    });
    console.log('[NLP] Step 3 - 조사/어미 제거:', tokens);

    // Step 4: 길이 필터링 - 1글자 이하 제외
    tokens = tokens.filter(token => token.length > 1);
    console.log('[NLP] Step 4 - 길이 필터링:', tokens);

    // Step 5: 불용어 필터링
    tokens = tokens.filter(token => !STOPWORDS.includes(token));
    console.log('[NLP] Step 5 - 불용어 필터링:', tokens);

    return tokens;
}

// ========================================
// Phase 2: TDD 테스트 케이스
// ========================================

/**
 * NLP 엔진 테스트 함수
 * console.assert()를 사용하여 각 테스트 케이스 검증
 */
function testNLPEngine() {
    console.log('');
    console.log('🧪 [TEST] NLP 엔진 테스트 시작');
    console.log('=====================================');

    // 테스트 케이스 1
    const input1 = '오늘 배울 메모리가 아주 중요합니다.';
    const expected1 = ['메모리', '아주', '중요'];
    const result1 = processText(input1);
    
    console.log('');
    console.log('📝 Test Case 1:');
    console.log('입력:', `"${input1}"`);
    console.log('기대값:', expected1);
    console.log('실제값:', result1);
    
    const pass1 = JSON.stringify(result1) === JSON.stringify(expected1);
    console.assert(
        pass1,
        `❌ Test Case 1 FAIL - 예상: ${JSON.stringify(expected1)}, 실제: ${JSON.stringify(result1)}`
    );
    console.log(pass1 ? '✅ Test Case 1 PASS' : '❌ Test Case 1 FAIL');

    // 테스트 케이스 2
    const input2 = '자, 포인터는 어렵습니다.';
    const expected2 = ['포인터', '어렵'];
    const result2 = processText(input2);
    
    console.log('');
    console.log('📝 Test Case 2:');
    console.log('입력:', `"${input2}"`);
    console.log('기대값:', expected2);
    console.log('실제값:', result2);
    
    const pass2 = JSON.stringify(result2) === JSON.stringify(expected2);
    console.assert(
        pass2,
        `❌ Test Case 2 FAIL - 예상: ${JSON.stringify(expected2)}, 실제: ${JSON.stringify(result2)}`
    );
    console.log(pass2 ? '✅ Test Case 2 PASS' : '❌ Test Case 2 FAIL');

    // 추가 테스트 케이스 (보너스)
    console.log('');
    console.log('📝 Additional Test Cases:');
    
    const input3 = '포인터와 메모리 관리가 중요하다.';
    const result3 = processText(input3);
    console.log('입력:', `"${input3}"`);
    console.log('결과:', result3);

    console.log('');
    console.log('=====================================');
    console.log(`✨ 테스트 완료: ${pass1 && pass2 ? 'ALL PASS ✅' : 'SOME FAILED ❌'}`);
    console.log('');

    return pass1 && pass2;
}

// ========================================
// Phase 4: Web Speech API (STT) 통합
// ========================================

let recognition = null;
let shouldRestartSpeech = true;
let finalTranscript = '';

function supportsSpeechRecognition() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

function renderCaption(finalText, interimText) {
    const finalHtml = finalText ? `<div class="final">${finalText}</div>` : '';
    const interimHtml = interimText ? `<div class="interim">${interimText}</div>` : '';
    elements.captionText.innerHTML = finalHtml + interimHtml;
}

function handleSpeechResult(event) {
    let interimResults = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();

        if (result.isFinal) {
            finalTranscript += transcript + ' ';
            console.log('[STT] 최종 인식:', transcript);
            if (gameEngine) {
                const filteredWords = processText(transcript);
                if (filteredWords.length) {
                    gameEngine.addWords(filteredWords);
                    logDebugOutput(`STT 처리: "${transcript}" → [${filteredWords.join(', ')}]`);
                } else {
                    logDebugOutput(`STT 처리: "${transcript}" → 필터링 후 단어 없음`);
                }
            }
        } else {
            interimResults += transcript + ' ';
        }
    }

    renderCaption(finalTranscript.trim(), interimResults.trim());
}

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        console.log('🎙️ STT 시작됨');
        logDebugOutput('🎙️ STT 시작됨');
    };

    recognition.onresult = handleSpeechResult;

    recognition.onerror = (event) => {
        console.warn('[STT] 오류', event.error);
        logDebugOutput(`STT 오류: ${event.error}`);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            shouldRestartSpeech = false;
        }
    };

    recognition.onend = () => {
        console.log('🎙️ STT 종료됨');
        if (shouldRestartSpeech) {
            console.log('🔁 STT 자동 재시작 시도 중...');
            logDebugOutput('🔁 STT 자동 재시작 시도 중...');
            setTimeout(() => {
                try {
                    recognition.start();
                } catch (err) {
                    console.warn('[STT] 재시작 실패', err);
                }
            }, 300);
        }
    };
}

function startSpeechRecognition() {
    if (!supportsSpeechRecognition()) {
        renderCaption('STT를 지원하지 않는 브라우저입니다.', '');
        logDebugOutput('⚠️ STT 미지원 브라우저');
        return;
    }

    if (!recognition) {
        initSpeechRecognition();
    }

    try {
        recognition.start();
    } catch (err) {
        console.warn('[STT] start 호출 중 오류', err);
        setTimeout(() => {
            try {
                recognition.start();
            } catch (retryErr) {
                console.error('[STT] 재시도 실패', retryErr);
            }
        }, 500);
    }
}

function stopSpeechRecognition() {
    shouldRestartSpeech = false;
    if (recognition) {
        recognition.stop();
    }
}

// ========================================
// Phase 3: 타자 게임 물리 엔진 및 매칭 로직
// ========================================

/**
 * Word 클래스
 * 화면에 떨어지는 각 단어를 표현
 */
class Word {
    constructor(text, id, currentScore = 0, baseSpeed = 0.5, speedMultiplier = 0.05) {
        this.id = id;
        this.text = text;
        // 화면 너비에서 우측 패널 제외 (0 ~ 윈도우 너비 - 320px)
        this.x = Math.random() * (window.innerWidth - 320 - 100);
        this.y = -50; // 화면 위쪽에서 시작
        
        // Phase 6 & 7: 동적 난이도 - 점수에 따라 속도 증가, 초기 속도 하향
        this.speed = baseSpeed + Math.random() * 0.5 + (currentScore * speedMultiplier);
        
        this.element = null;
        this.createDOM();
    }

    /**
     * DOM 요소 생성 및 게임 캔버스에 추가
     */
    createDOM() {
        this.element = document.createElement('div');
        this.element.className = 'falling-word';
        this.element.textContent = this.text;
        this.element.dataset.wordId = this.id;
        elements.gameCanvas.appendChild(this.element);
        this.updatePosition();
    }

    /**
     * 화면상 위치 업데이트 (CSS로 렌더링)
     */
    updatePosition() {
        if (this.element) {
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
        }
    }

    /**
     * 한 프레임 진행 (낙하)
     */
    update() {
        this.y += this.speed;
        this.updatePosition();
    }

    /**
     * 화면 밖인지 확인 (제거 대상인지)
     */
    isOutOfBounds() {
        return this.y > window.innerHeight;
    }

    /**
     * Y좌표 반환 (매칭 시 가장 낮은 단어 찾기 용)
     */
    getY() {
        return this.y;
    }

    /**
     * DOM 제거
     */
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

/**
 * GameEngine 클래스
 * 단어 큐 관리, 애니메이션, 매칭 로직 담당
 */
class GameEngine {
    constructor() {
        this.words = []; // 화면에 있는 단어들
        this.nextWordId = 0; // 단어 고유 ID 할당 용
        this.isAnimating = false;
        this.score = 0;
        this.maxWordsOnScreen = 10; // 최대 동시 단어 개수
        
        // Phase 6: 목숨 시스템
        this.life = 5; // 초기 목숨 5개
        this.baseSpeed = 0.5; // Phase 7: 초기 낙하 속도 하향 (0.5 ~ 1.0)
        this.speedMultiplier = 0.05; // 속도 증가 계수 조정 (점수 * 0.05)

        // Phase 7: 순차 스폰 시스템
        this.wordQueue = []; // 대기 중인 단어들
        this.lastSpawnTime = 0; // 마지막 스폰 시간
        this.spawnCooldown = 900; // 스폰 쿨타임 (800ms ~ 1000ms)

        console.log('[GameEngine] 초기화 완료');
    }

    /**
     * 텍스트에서 추출된 단어 배열을 게임에 추가
     * Phase 7: 즉시 스폰하지 않고 wordQueue에 저장
     * @param {string[]} tokens - processText()에서 반환한 단어 배열
     */
    addWords(tokens) {
        console.log(`[GameEngine] 단어 큐에 추가: ${tokens.length}개`);
        
        // 모든 단어를 wordQueue에 추가 (밸런스 체크 제거 - 큐에서 관리)
        tokens.forEach(token => {
            this.wordQueue.push(token);
            console.log(`📥 큐에 단어 추가: "${token}" (큐 길이: ${this.wordQueue.length})`);
        });
    }

    /**
     * 게임 루프 (requestAnimationFrame)
     */
    update() {
        const currentTime = Date.now();

        // Phase 7: 순차 스폰 - 쿨타임 체크 후 단어 스폰
        if (this.wordQueue.length > 0 && 
            currentTime - this.lastSpawnTime >= this.spawnCooldown &&
            this.words.length < this.maxWordsOnScreen) {
            
            const token = this.wordQueue.shift();
            const word = new Word(token, this.nextWordId++, this.score, this.baseSpeed, this.speedMultiplier);
            this.words.push(word);
            this.lastSpawnTime = currentTime;
            
            console.log(`🚀 단어 스폰: "${token}" (ID: ${word.id}) - 큐 남음: ${this.wordQueue.length}`);
        }

        // 1. 모든 단어 업데이트 (낙하)
        for (let i = this.words.length - 1; i >= 0; i--) {
            const word = this.words[i];
            word.update();

            // Phase 6: 바닥에 닿았는지 체크 (목숨 차감)
            const bottomThreshold = window.innerHeight - 80; // 입력창 높이 제외
            if (word.y >= bottomThreshold) {
                console.log(`💔 단어 바닥 도착: "${word.text}" - 목숨 차감`);
                word.remove();
                this.words.splice(i, 1);
                this.life--;
                updateLifeDisplay(this.life);
                
                // 게임 오버 체크
                if (this.life <= 0) {
                    this.gameOver();
                    return;
                }
                continue;
            }

            // 화면 밖으로 나간 단어 제거 (기존 로직)
            if (word.isOutOfBounds()) {
                console.log(`❌ 단어 제거 (화면 밖): "${word.text}"`);
                word.remove();
                this.words.splice(i, 1);
            }
        }
    }

    /**
     * 사용자 입력 단어와 매칭
     * Rule 1: 화면에 없는 단어 입력 시 무시
     * Rule 2: 동일한 단어 여러 개면 가장 아래쪽(Y좌표 최대)만 제거
     * @param {string} inputText - 사용자가 입력한 텍스트
     * @returns {boolean} - 매칭 성공 여부
     */
    matchWord(inputText) {
        const searchText = inputText.trim();
        
        if (!searchText) {
            return false;
        }

        console.log(`[매칭] 입력: "${searchText}"`);

        // 화면의 단어들 중 같은 텍스트 찾기
        const matchingWords = this.words.filter(w => w.text === searchText);

        if (matchingWords.length === 0) {
            console.log(`❌ Rule 1: 화면에 없는 단어 "${searchText}" 무시됨`);
            return false;
        }

        // Rule 2: 동일한 단어가 여러 개면 가장 아래쪽 (Y 좌표 최대) 단어만 제거
        const targetWord = matchingWords.reduce((prev, current) => {
            return current.getY() > prev.getY() ? current : prev;
        });

        console.log(`✅ Rule 2: 동일 단어 ${matchingWords.length}개 중 가장 낮은 "${targetWord.text}" (Y: ${targetWord.getY().toFixed(1)}) 제거`);

        // 배열에서 제거
        const index = this.words.indexOf(targetWord);
        if (index > -1) {
            const bounds = targetWord.element ? targetWord.element.getBoundingClientRect() : null;
            const canvasBounds = elements.gameCanvas.getBoundingClientRect();

            targetWord.remove();
            this.words.splice(index, 1);
            this.score++;
            updateScoreDisplay(this.score);

            if (bounds) {
                const effectX = bounds.left - canvasBounds.left + bounds.width / 2;
                const effectY = bounds.top - canvasBounds.top;
                showScoreEffect(effectX, effectY, '+1');
            }

            console.log(`📊 점수: ${this.score} | 남은 단어: ${this.words.length}/${this.maxWordsOnScreen}`);
            return true;
        }

        return false;
    }

    /**
     * 현재 게임 상태 조회
     */
    getStatus() {
        return {
            wordsCount: this.words.length,
            score: this.score,
            canAddWords: this.words.length < this.maxWordsOnScreen,
        };
    }

    /**
     * Phase 6: 게임 오버 처리
     */
    gameOver() {
        console.log('💀 게임 오버!');
        this.isAnimating = false;
        
        // STT 중단
        stopSpeechRecognition();
        
        // 게임 오버 모달 표시
        if (elements.finalScoreValue) {
            elements.finalScoreValue.textContent = String(this.score);
        }
        if (elements.gameOverModal) {
            elements.gameOverModal.style.display = 'flex';
        }
        
        logDebugOutput(`게임 오버 - 최종 점수: ${this.score}`);
    }

    /**
     * Phase 6: 게임 리셋
     */
    resetGame() {
        console.log('🔄 게임 리셋');
        
        // 모든 단어 제거
        this.words.forEach(word => word.remove());
        this.words = [];
        
        // Phase 7: 큐 초기화
        this.wordQueue = [];
        this.lastSpawnTime = 0;
        
        // 상태 초기화
        this.score = 0;
        this.life = 5;
        this.nextWordId = 0;
        
        // UI 업데이트
        updateScoreDisplay(0);
        updateLifeDisplay(5);
        
        // 모달 숨김
        if (elements.gameOverModal) {
            elements.gameOverModal.style.display = 'none';
        }
        
        // STT 재시작
        startSpeechRecognition();
        
        // 게임 루프 재시작
        this.startGameLoop();
        
        logDebugOutput('게임 리셋 완료');
    }

    /**
     * 게임 루프 시작
     */
    startGameLoop() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const animate = () => {
            this.update();
            requestAnimationFrame(animate);
        };

        animate();
        console.log('🎮 [GameEngine] 게임 루프 시작');
    }
}

// GameEngine 전역 인스턴스
let gameEngine = null;

function initDebugPanel() {
    elements.injectBtn.addEventListener('click', () => {
        const text = elements.debugInput.value.trim();
        if (text && gameEngine) {
            console.log('[DEBUG INJECT] 원본:', text);
            
            // 텍스트를 NLP 파이프라인으로 필터링
            const tokens = processText(text);
            console.log('[DEBUG INJECT] 필터링 후:', tokens);
            
            if (tokens.length > 0) {
                gameEngine.addWords(tokens);
                logDebugOutput(`주입: "${text}" → [${tokens.join(', ')}]`);
            } else {
                logDebugOutput(`주입 실패: "${text}" (필터링 후 단어 없음)`);
            }
            
            elements.debugInput.value = '';
            elements.debugInput.focus();
        }
    });

    // Enter 키로도 주입 가능
    elements.debugInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.injectBtn.click();
        }
    });
}

// 디버그 출력 로그
function logDebugOutput(message) {
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    const log = `[${timestamp}] ${message}`;
    
    elements.debugOutput.innerHTML += log + '\n';
    elements.debugOutput.scrollTop = elements.debugOutput.scrollHeight;
}

function updateScoreDisplay(score) {
    if (elements.scoreValue) {
        elements.scoreValue.textContent = String(score);
    }
}

function updateLifeDisplay(life) {
    if (elements.lifeIcons) {
        const hearts = '❤️'.repeat(Math.max(0, life));
        elements.lifeIcons.textContent = hearts;
    }
}

function showScoreEffect(x, y, text) {
    const effect = document.createElement('div');
    effect.className = 'score-effect';
    effect.textContent = text;
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    elements.gameCanvas.appendChild(effect);

    setTimeout(() => {
        if (effect && effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 800);
}

/**
 * 게임 입력창 이벤트 리스너
 * Enter 키 입력 시 matchWord 호출
 */
function initGameInput() {
    elements.gameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const inputWord = elements.gameInput.value.trim();
            
            if (!inputWord) {
                return;
            }

            // 게임 엔진의 매칭 로직 실행
            const matched = gameEngine.matchWord(inputWord);
            
            // 입력창 비우기
            elements.gameInput.value = '';
            elements.gameInput.focus();

            // 시각적 피드백
            if (matched) {
                elements.gameInput.style.borderColor = '#00ffff';
                setTimeout(() => {
                    elements.gameInput.style.borderColor = '#00ff00';
                }, 200);
            } else {
                elements.gameInput.style.borderColor = '#ff0000';
                setTimeout(() => {
                    elements.gameInput.style.borderColor = '#00ff00';
                }, 200);
            }
        }
    });
}

/**
 * Phase 6: 다시 시작 버튼 이벤트 리스너
 */
function initRestartButton() {
    if (elements.restartBtn) {
        elements.restartBtn.addEventListener('click', () => {
            if (gameEngine) {
                gameEngine.resetGame();
            }
        });
    }
}

// ========================================
// 초기화 함수
// ========================================
function init() {
    console.log('🎮 전공어 산성비 게임 시작');
    console.log('📋 Phase 1: 기본 레이아웃 및 디버그 환경 구축');
    
    initDebugPanel();
    
    // Phase 2: TDD 테스트 실행
    console.log('');
    console.log('📋 Phase 2: Local NLP 엔진 구현 (TDD)');
    const testPassed = testNLPEngine();
    logDebugOutput(testPassed ? '✅ NLP 테스트 ALL PASS' : '❌ NLP 테스트 FAILED');

    // Phase 3: 게임 엔진 초기화 및 시작
    console.log('');
    console.log('📋 Phase 3: 타자 게임 물리 엔진 구축');
    gameEngine = new GameEngine();
    logDebugOutput('🎮 GameEngine 초기화 완료');
    
    // 게임 입력 리스너 설정
    initGameInput();
    logDebugOutput('⌨️ 게임 입력 리스너 설정 완료');
    
    // 게임 루프 시작
    gameEngine.startGameLoop();
    logDebugOutput('▶️ 게임 루프 시작');

    // Phase 4: STT 시작
    if (supportsSpeechRecognition()) {
        startSpeechRecognition();
        logDebugOutput('🎤 STT 연동 시도');
    } else {
        renderCaption('STT를 지원하지 않는 브라우저입니다.', '');
        logDebugOutput('⚠️ STT 미지원 브라우저');
    }

    // Phase 5: 디버그 패널 숨김 및 UI 클린업
    if (elements.debugPanel) {
        setTimeout(() => {
            elements.debugPanel.style.display = 'none';
            console.log('🧹 디버그 패널 숨김 완료');
        }, 1200);
    }

    updateScoreDisplay(0);

    // 게임 입력창 포커스
    elements.gameInput.focus();
    logDebugOutput('✅ 시스템 준비 완료');
    console.log('✅ 디버그 패널 초기화 완료');
    
    // Phase 6: 목숨 표시 초기화
    updateLifeDisplay(5);
    logDebugOutput('❤️ 목숨 표시 초기화 완료');
    
    // Phase 6: 다시 시작 버튼 초기화
    initRestartButton();
    logDebugOutput('🔄 다시 시작 버튼 초기화 완료');
}

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', init);
