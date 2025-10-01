document.addEventListener('DOMContentLoaded', () => {

    // 1. 缓存所有需要用到的 DOM 元素
    // ======================================
    const homeView = document.getElementById('home-view');
    const resultView = document.getElementById('result-view');
    const drawBtn = document.getElementById('draw-btn');
    const backBtn = document.getElementById('back-btn');

    const lotTitle = document.getElementById('lot-title');
    const lotLuckLevel = document.getElementById('lot-luck-level');
    // 修改点 1: 获取宫位元素
    const lotPalace = document.getElementById('lot-palace');
    const lotPoemElements = [
        document.getElementById('lot-poem-1'),
        document.getElementById('lot-poem-2'),
        document.getElementById('lot-poem-3'),
        document.getElementById('lot-poem-4')
    ];
    const lotStory = document.getElementById('lot-story');
    const lotStoryDetail = document.getElementById('lot-story-detail');
    const lotGeneralP1 = document.getElementById('lot-general-p1');
    const lotGeneralP2 = document.getElementById('lot-general-p2');
    const interpretationGrid = document.getElementById('lot-interpretation-grid');
    
    const interpretationMap = {
        "home": "家宅", "self": "自身", "trade": "交易", "marriage": "婚姻",
        "six_a": "六甲", "travel": "出行", "silkworm": "田产", "livestock": "六畜",
        "missing": "寻人", "lawsuit": "官司", "loss": "失物", "illness": "疾病"
    };

    /**
     * 显示抽签结果
     * @param {object} lot - 单个签的数据对象
     */
    function showResult(lot) {
        homeView.classList.add('hidden');
        resultView.classList.remove('hidden');

        lotTitle.textContent = lot.title;
        // 修改点 2: 从数据中获取宫位值并显示
        lotPalace.textContent = `【${lot.palace}】`;
        
        const poemLines = lot.poem.split(' ');
        lotPoemElements.forEach((el, index) => {
            el.textContent = poemLines[index] || '';
        });
        
        lotLuckLevel.textContent = lot.luck_level;
        lotLuckLevel.className = 'inline-block px-3 py-1 mt-1 text-md font-semibold rounded-full'; // Reset class
        if (lot.luck_level.includes('上')) {
            lotLuckLevel.classList.add('luck-level-ss');
        } else if (lot.luck_level.includes('中')) {
            lotLuckLevel.classList.add('luck-level-sp');
        } else if (lot.luck_level.includes('下')) {
            lotLuckLevel.classList.add('luck-level-xx');
        }

        lotStory.textContent = lot.story;
        lotStoryDetail.textContent = lot.story_detail;
        
        const generalText = lot.interpretation.general;
        const splitIndex = generalText.indexOf("此卦");
        if (splitIndex !== -1) {
            lotGeneralP1.textContent = generalText.substring(0, splitIndex).trim();
            lotGeneralP2.textContent = generalText.substring(splitIndex).trim();
        } else {
            lotGeneralP1.textContent = generalText;
            lotGeneralP2.textContent = '';
        }
        
        interpretationGrid.innerHTML = '';
        for (const key in interpretationMap) {
            if (lot.interpretation[key]) {
                const item = document.createElement('div');
                item.className = 'flex items-baseline';
                item.innerHTML = `
                    <span class="text-sm font-semibold text-amber-600 w-1/3">${interpretationMap[key]}：</span>
                    <span class="text-gray-600 text-sm w-2/3">${lot.interpretation[key]}</span>
                `;
                interpretationGrid.appendChild(item);
            }
        }
    }

    /**
     * 设置摇一摇监听器
     * @param {function} onShake - 摇动时要执行的回调函数
     */
    function setupShakeListener(onShake) {
        if (!window.DeviceMotionEvent) return;

        let lastShakeTime = 0;
        const SHAKE_THRESHOLD = 15;
        const COOLDOWN_TIME = 2000;

        window.addEventListener('devicemotion', (event) => {
            const now = Date.now();
            if (homeView.classList.contains('hidden') || (now - lastShakeTime < COOLDOWN_TIME)) {
                return;
            }

            const { accelerationIncludingGravity } = event;
            if (!accelerationIncludingGravity) return; // 增加健壮性检查

            const { x, y, z } = accelerationIncludingGravity;
            const totalAcceleration = Math.sqrt(x * x + y * y + z * z);

            if (totalAcceleration > SHAKE_THRESHOLD) {
                lastShakeTime = now;
                onShake();
            }
        });
    }
    
    /**
     * 初始化应用，绑定事件
     * @param {Array} lots - 所有的签文数据
     */
    function initialize(lots) {
        const performDraw = () => {
            const randomIndex = Math.floor(Math.random() * lots.length);
            showResult(lots[randomIndex]);
        };

        drawBtn.addEventListener('click', performDraw);
        backBtn.addEventListener('click', () => {
            resultView.classList.add('hidden');
            homeView.classList.remove('hidden');
        });

        setupShakeListener(performDraw);
    }

    /**
     * 主函数，用于获取数据并启动应用
     */
    async function main() {
        try {
            const response = await fetch('qian_data.json');
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const lotsData = await response.json();
            initialize(lotsData);
        } catch (error) {
            console.error('Error loading the lot data:', error);
            drawBtn.textContent = '加载数据失败，请刷新';
            drawBtn.disabled = true;
        }
    }
    
    // 3. 运行主函数
    // ======================================
    main();

});