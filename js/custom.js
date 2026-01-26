const $carousel = document.querySelector(".carousel"),
    $carouselInner = document.querySelector(".carousel-inner"),
    $slides = document.querySelectorAll(".slide"); // 초기 슬라이드 리스트

const $controls = document.querySelector(".controls");
const $nextBtn = document.querySelector("#nextBtn");
const $prevBtn = document.querySelector("#prevBtn");

$howManyBtns = document.querySelectorAll(".how-many-carousel button");

let config = {gap: 10, widthPercent: 20, limit: 4};
let isTransitioning = false;

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

            // posIndex에 따라 정확한 X 좌표 계산 (3이면 화면 오른쪽 밖, -3이면 왼쪽 밖)
            let x = centerX - (slideWidth / 2) + (posIndex * (slideWidth + gap));

            slide.classList.add("absolute");
            slide.style.left = `${x}px`;

            if (posIndex === 0) slide.classList.add('active');
            else slide.classList.remove('active');
        });
    }
}

staticPosition();

function updateSlideCount(count) {
    if (isTransitioning) return;
    $carouselInner.innerHTML = "";

    let slidesData = Array.from({ length: count }, (_, i) => i + 1);
    let finalSlides = [];

    if (count >= 5) {
        slidesData.forEach((num, index) => {
            let pos = 0;
            if (index === 0) {
                pos = 0; // 1번은 무조건 중앙
            }
            // 오른쪽 배치: index 1, 2 (숫자 2, 3) -> 6개일 땐 index 3(숫자 4)까지 포함
            else if (index <= 2 || (count > 5 && index === 3)) {
                pos = index;
            }
            // 왼쪽 배치: 나머지 (뒤에서부터 -1, -2 부여)
            else {
                pos = index - count;
            }
            finalSlides.push({ num, pos });
        });
    } else {
        // 5개 미만 (1~4개)
        slidesData.forEach((num, index) => {
            finalSlides.push({
                num: num,
                pos: -Math.floor(count / 2) + index
            });
        });
    }

    // ... (이후 DOM 생성 및 staticPosition 호출은 동일)
    finalSlides.forEach(item => {
        const newSlide = document.createElement("div");
        newSlide.classList.add("slide");
        newSlide.innerHTML = `<span>${item.num}</span><img src="./images/img-${String(item.num).padStart(2, "0")}.jpg">`;
        newSlide.dataset.pos = item.pos;
        $carouselInner.appendChild(newSlide);
    });

    staticPosition();
}

function next() {
    if (isTransitioning) return;
    const allSlides = document.querySelectorAll(".slide");
    if (allSlides.length <= config.limit) return;
    isTransitioning = true;

    // 1. 현재 화면 왼쪽 끝(-2)에 있는 슬라이드를 복제
    const outgoing = Array.from(allSlides).find(s => parseInt(s.dataset.pos) === -2);
    // 2. 현재 화면 오른쪽 끝에 있는 슬라이드의 pos를 찾음
    const maxPos = Math.max(...Array.from(allSlides).map(s => parseInt(s.dataset.pos)));

    if (outgoing) {
        const clone = outgoing.cloneNode(true);
        clone.classList.remove("transition");
        // 복제본을 현재 가장 오른쪽 놈의 옆 포지션에 배치 (예: 2번 옆이면 3)
        clone.dataset.pos = maxPos + 1;
        $carouselInner.append(clone);

        staticPosition(); // 즉시 위치 고정
        clone.offsetHeight; // 리플로우
    }

    // 모든 슬라이드 왼쪽으로 이동
    document.querySelectorAll(".slide").forEach(slide => {
        slide.classList.add("transition");
        slide.dataset.pos = parseInt(slide.dataset.pos) - 1;
    });

    staticPosition();

    setTimeout(() => {
        // 이동 후, 화면 왼쪽 가이드라인(-2)보다 멀어진 놈들만 제거
        document.querySelectorAll(".slide").forEach(slide => {
            if (parseInt(slide.dataset.pos) < -2) {
                slide.remove();
            }
        });
        isTransitioning = false;
    }, 500);
}

function prev() {
    if (isTransitioning) return;
    const allSlides = document.querySelectorAll(".slide");
    if (allSlides.length <= config.limit) return;
    isTransitioning = true;

    // 1. 화면에 보이는 '2'가 아니라, 전체 중 가장 오른쪽에 있는 놈(예: 4번)을 찾습니다.
    const maxPos = Math.max(...Array.from(allSlides).map(s => parseInt(s.dataset.pos)));
    const outgoing = Array.from(allSlides).find(s => parseInt(s.dataset.pos) === maxPos);

    // 2. 현재 가장 왼쪽에 있는 놈(예: 5번)의 포지션을 찾습니다.
    const minPos = Math.min(...Array.from(allSlides).map(s => parseInt(s.dataset.pos)));

    if (outgoing) {
        const clone = outgoing.cloneNode(true);
        clone.classList.remove("transition", "active");

        // 가장 왼쪽(-2)의 앞번호인 -3 위치에 배치
        clone.dataset.pos = minPos - 1;
        $carouselInner.prepend(clone);

        staticPosition();
        clone.offsetHeight;
    }

    // 3. 모든 슬라이드 오른쪽으로 이동
    document.querySelectorAll(".slide").forEach(slide => {
        slide.classList.add("transition");
        slide.dataset.pos = parseInt(slide.dataset.pos) + 1;
    });

    staticPosition();

    // 4. 정리 (화면 오른쪽 끝 가이드라인 2보다 커진 놈들은 삭제하지 않고 유지할지 결정해야 함)
    // 무한 루프를 위해 삭제 조건을 '화면 밖'으로 넉넉히 잡거나,
    // 아예 삭제하지 않고 순환시키려면 이 부분을 손봐야 합니다.
    setTimeout(() => {
        const currentSlides = document.querySelectorAll(".slide");
        // 전체 개수가 유지되도록, 새로 들어온 만큼 끝에서 나간 놈만 지웁니다.
        currentSlides.forEach(slide => {
            if (parseInt(slide.dataset.pos) > maxPos) {
                slide.remove();
            }
        });
        isTransitioning = false;
    }, 500);
}

$nextBtn.addEventListener("click", next);
$prevBtn.addEventListener("click", prev);
$howManyBtns.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
        const currentActive = document.querySelector(".how-many-carousel button.active");
        if (currentActive) {
            currentActive.classList.remove("active");
        }
        btn.classList.add("active");
        updateSlideCount(idx + 1);
    });
});

window.addEventListener("resize", staticPosition);