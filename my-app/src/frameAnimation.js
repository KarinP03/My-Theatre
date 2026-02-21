export function move() {
    const key = {};
    document.addEventListener("keydown", (event) => {
        if (event.key.startsWith('Arrow')) {
            event.preventDefault();
        }
        key[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        key[event.key] = false;
    });

    let direction;
    const moveFrame = 5;
    let movement = 0;

    function animate() {
        // Query elements inside the loop so dynamically fetched poster components are found
        const frames = document.querySelectorAll(".poster-wrapper");
        const gallery = document.querySelector(".gallery");

        const right = (key['ArrowRight'] === true || key['d'] === true);
        const left = (key['ArrowLeft'] === true || key['a'] === true);
        
        if (right && direction !== 'left') {
            direction = 'right';
        } else if (left && direction !== 'right') {
            direction = 'left';
        } else {
            direction = undefined;
        }

        if (direction === 'right') {
            movement -= moveFrame;
        }
        if (direction === 'left') {
            movement += moveFrame;
        }

        // Move all poster wrappers together
        frames.forEach((f) => {
            f.style.transform = `translateX(${movement}px)`;
        });

        // Parallax endlessly scrolling background
        if (gallery) {
            gallery.style.backgroundPosition = `${movement * 0.5}px center`;
        }

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}