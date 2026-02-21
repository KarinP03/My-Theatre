export function move() {
    const frames = document.querySelectorAll(".poster");
    const key = {};
    document.addEventListener("keydown", (event) => {
        event.preventDefault();
        key[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        key[event.key] = false;
    });
    let direction;
    const moveFrame = 5;
    let movement = 0;
    function animate() {
        const right = (key['ArrowRight'] === true || key['d'] === true);
        const left = (key['ArrowLeft'] === true || key['a'] === true);
        if (right && direction != 'left') {
            direction = 'right';
        }
        else if (left && direction != 'right') {
            direction = 'left';
        }
        else {
            direction = undefined;
        }
        if (direction === 'right') {
            movement -= moveFrame;
        }
        if (direction === 'left') {
            movement += moveFrame;
        }
        frames.forEach((f) => {
            f.style.transform = `translateX(${movement}px)`;
        });
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}