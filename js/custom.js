const $carousel = document.querySelector(".carousel"),
    $carouselInner = document.querySelector(".carousel-inner"),
    $controls = document.querySelector(".controls"),
    $nextBtn = document.querySelector("#nextBtn"),
    $prevBtn = document.querySelector("#prevBtn"),
    $howManyBtns = document.querySelectorAll(".how-many-carousel button"),
    $centerOnBtn = document.querySelector("#centerOnBtn"),
    $centerOffBtn = document.querySelector("#centerOffBtn");

let config = { gap: 10, widthPercent: 20, limit: 4 };
let isTransitioning = false;

/**
 * 1. 슬라이드 위치 계산 및 배치 함수
 */
function staticPosition() {
    const currentSlides = document.querySelectorAll(".slide");
    const total = currentSlides.length;
    const { gap, widthPercent } = config;
    const carouselWidth = $carousel.offsetWidth;

    if (total <= config.limit) {
        $carousel.classList.add("init");
        $controls.classList.add("disabled");
    } else {
        $carousel.classList.remove("init");
        $controls.classList.remove("disabled");

        currentSlides.forEach((slide) => {
            const posIndex = parseInt(slide.dataset.pos);
            const slideWidth = (carouselWidth * (widthPercent / 100)) - gap;
            const centerX = carouselWidth / 2;

            // 중앙 기준 좌표 계산
            let x = centerX - (slideWidth / 2) + (posIndex * (slideWidth + gap));

            slide.classList.add("absolute");
            slide.style.left = `${x}px`;

            // 중앙(0)인 요소에 active 클래스 부여
            if (posIndex === 0) slide.classList.add('active');
            else slide.classList.remove('active');
        });
    }
}

/**
 * 2. 슬라이드 요소 생성 공통 함수
 */
function createSlideElement(num, pos) {
    const $slide = document.createElement("div");
    $slide.classList.add("slide");
    $slide.innerHTML = `<span>${num}</span><img src="./images/img-${String(num).padStart(2, "0")}.jpg">`;
    $slide.dataset.pos = pos;
    return $slide;
}

/**
 * 3. 슬라이드 개수 업데이트 함수
 */
function updateSlideCount(count) {
    if (isTransitioning) return;
    $carouselInner.innerHTML = "";

    const slidesData = Array.from({ length: count }, (_, i) => i + 1);

    slidesData.forEach((num, index) => {
        let pos;
        if (count < 5) {
            // 5개 미만: 중앙 정렬 배치
            pos = -Math.floor(count / 2) + index;
        } else {
            // 5개 이상: [5, 6, (1), 2, 3, 4] 형태의 대칭 배치
            if (index === 0) pos = 0;
            else if (index <= 2 || (count > 5 && index === 3)) pos = index; // 오른쪽 배치
            else pos = index - count; // 왼쪽 배치
        }
        $carouselInner.appendChild(createSlideElement(num, pos));
    });

    staticPosition();
}

/**
 * 4. 무한 루프 이동 통합 함수 (Next / Prev)
 */
function move(direction) {
    if (isTransitioning) return;
    const allSlides = document.querySelectorAll(".slide");
    if (allSlides.length <= config.limit) return;
    isTransitioning = true;

    // 현재 포지션 데이터 추출
    const posArray = Array.from(allSlides).map(s => parseInt(s.dataset.pos));
    const maxPos = Math.max(...posArray);
    const minPos = Math.min(...posArray);

    if (direction === "next") {
        // [Next] 왼쪽 끝(-2) 복제 -> 오른쪽 끝(max + 1) 추가
        const outgoing = Array.from(allSlides).find(s => parseInt(s.dataset.pos) === -2);
        if (outgoing) {
            const clone = outgoing.cloneNode(true);
            clone.classList.remove("transition", "active");
            clone.dataset.pos = maxPos + 1;
            $carouselInner.append(clone);
        }
    } else {
        // [Prev] 오른쪽 끝(max) 복제 -> 왼쪽 끝(min - 1) 추가
        const outgoing = Array.from(allSlides).find(s => parseInt(s.dataset.pos) === maxPos);
        if (outgoing) {
            const clone = outgoing.cloneNode(true);
            clone.classList.remove("transition", "active");
            clone.dataset.pos = minPos - 1;
            $carouselInner.prepend(clone);
        }
    }

    // 클론 생성 후 즉시 위치 고정 (Transition 없이)
    staticPosition();

    // 애니메이션 실행
    requestAnimationFrame(() => {
        // 리플로우 강제 (클론의 초기 위치 인식)
        $carouselInner.offsetHeight;

        document.querySelectorAll(".slide").forEach(slide => {
            slide.classList.add("transition");
            const currentPos = parseInt(slide.dataset.pos);
            slide.dataset.pos = (direction === "next") ? currentPos - 1 : currentPos + 1;
        });
        staticPosition();
    });

    // 정리 작업 (0.5초 후 화면 밖 슬라이드 제거)
    setTimeout(() => {
        document.querySelectorAll(".slide").forEach(slide => {
            const p = parseInt(slide.dataset.pos);
            if ((direction === "next" && p < -2) || (direction === "prev" && p > maxPos)) {
                slide.remove();
            }
        });
        isTransitioning = false;
    }, 500);
}

// addEventListener Settings
$nextBtn.addEventListener("click", () => move("next"));
$prevBtn.addEventListener("click", () => move("prev"));

$howManyBtns.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
        const currentActive = document.querySelector(".how-many-carousel button.active");
        if (currentActive) currentActive.classList.remove("active");
        btn.classList.add("active");
        updateSlideCount(idx + 1);
    });
});

window.addEventListener("resize", staticPosition);

// 초기 실행
staticPosition();