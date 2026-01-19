const $carousel = document.querySelector(".carousel"),
    $carouselInner = document.querySelector(".carousel-inner"),
    $slides = document.querySelectorAll(".slide"); // 초기 슬라이드 리스트

const $nextBtn = document.querySelector("#nextBtn");
const $prevBtn = document.querySelector("#prevBtn");

let config = {gap: 10, widthPercent: 20};
let isTransitioning = false;

function staticPosition() {
    const currentSlides = document.querySelectorAll(".slide");

    currentSlides.forEach((slide) => {
        const posIndex = parseInt(slide.dataset.pos);
        const carouselWidth = $carousel.offsetWidth;
        const centerX = carouselWidth / 2;
        const {gap, widthPercent} = config;
        const slideWidth = carouselWidth * (widthPercent / 100) - gap;

        let x = centerX - (slideWidth / 2) + (posIndex * (slideWidth + gap));
        let zIndex = 10 - Math.abs(posIndex);

        slide.style.left = `${x}px`;
        slide.style.width = `${slideWidth}px`;
        slide.style.zIndex = Math.round(zIndex);

        // 화면 밖 영역 투명도 처리
        if (posIndex < -2 || posIndex > 2) {
            slide.style.opacity = "0";
            slide.style.visibility = "hidden";
        } else {
            slide.style.opacity = "1";
            slide.style.visibility = "visible";
        }

        if (posIndex === 0) slide.classList.add('active');
        else slide.classList.remove('active');
    });
}

staticPosition();

function next() {
    if (isTransitioning) return;
    isTransitioning = true;

    // 1. 나갈 놈(-2)을 복제해서 클론 생성
    const outgoingSlide = Array.from(document.querySelectorAll(".slide"))
        .find(slide => parseInt(slide.dataset.pos) === -2);

    if (outgoingSlide) {
        const clone = outgoingSlide.cloneNode(true);

        clone.style.transition = "none";
        clone.dataset.pos = "3"; // 화면 오른쪽 끝 바로 바깥 위치
        $carouselInner.append(clone);

        // 클론이 '3' 위치에 가 있도록 즉시 계산해서 좌표를 찍어줍니다.
        // (이때 transition이 none이라 사용자 눈에는 안 보입니다)
        staticPosition();

        // 브라우저가 위치를 인식할 수 있게 강제로 리프레시 (매우 중요)
        clone.offsetHeight;
    }

    // 2. 이제 클론을 포함한 모든 슬라이드를 왼쪽으로 한 칸 이동
    const allSlides = document.querySelectorAll(".slide");
    allSlides.forEach(slide => {
        // 다시 부드러운 이동을 위해 트랜지션 복구
        slide.style.transition = "all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";

        let currentPos = parseInt(slide.dataset.pos);
        slide.dataset.pos = currentPos - 1;
    });

    // 3. 이동된 위치(pos가 -3, -2, -1, 0, 1, 2가 됨)로 다시 그리기
    // 이때 모든 슬라이드가 "동시에" 왼쪽으로 슥 이동합니다.
    staticPosition();

    // 4. 화면 밖으로 완전히 나간 놈(-3이 된 놈) 삭제
    setTimeout(() => {
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
    isTransitioning = true;

    const currentSlides = document.querySelectorAll(".slide");

    const outgoingSlide = Array.from(currentSlides).find(slide => parseInt(slide.dataset.pos) === 2);

    if (outgoingSlide) {
        const clone = outgoingSlide.cloneNode(true);
        clone.style.transition = "none";
        clone.dataset.pos = "-3";
        $carouselInner.prepend(clone);

        staticPosition();
        clone.offsetHeight;
    }

    // 2. 모든 슬라이드를 오른쪽으로 이동 (+1)
    const allSlides = document.querySelectorAll(".slide");
    allSlides.forEach(slide => {
        slide.style.transition = "all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
        let currentPos = parseInt(slide.dataset.pos);
        slide.dataset.pos = currentPos + 1;
    });

    staticPosition();

    // 3. 오른쪽 끝 바깥으로 나간 놈(3이 된 놈) 삭제
    setTimeout(() => {
        document.querySelectorAll(".slide").forEach(slide => {
            if (parseInt(slide.dataset.pos) > 2) {
                slide.remove();
            }
        });
        isTransitioning = false;
    }, 500);
}

$nextBtn.addEventListener("click", next);
$prevBtn.addEventListener("click", prev);