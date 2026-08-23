/**
 * Confetti Canvas Effect for Game Won Celebrations
 */
export class ConfettiEffect {
    static trigger() {
        const canvas = document.createElement("canvas");
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "9999";
        document.body.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ["#edc22e", "#f65e3b", "#f2b179", "#ffcc33", "#60a5fa", "#34d399", "#f472b6"];
        const particles = Array.from({ length: 90 }, () => ({
            x: canvas.width / 2,
            y: canvas.height / 3,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.7) * 16,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rSpeed: (Math.random() - 0.5) * 10,
            opacity: 1
        }));

        let frame = 0;
        const animate = () => {
            if (frame > 130) {
                canvas.remove();
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3;
                p.rotation += p.rSpeed;
                p.opacity -= 0.007;
                if (p.opacity <= 0) return;

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });
            frame++;
            requestAnimationFrame(animate);
        };
        animate();
    }
}
