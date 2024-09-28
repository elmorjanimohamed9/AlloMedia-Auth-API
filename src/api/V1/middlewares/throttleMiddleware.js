const throttle = {};

export const otpThrottling = (req, res, next) => {
    const { email } = req.body;

    if (!throttle[email]) {
        throttle[email] = { attempts: 0, lastAttempt: Date.now() };
    }

    const { attempts, lastAttempt } = throttle[email];

    const currentTime = Date.now();
    const timeSinceLastAttempt = currentTime - lastAttempt;

    if (attempts >= 5) {
        const waitTime = Math.min(30000, 1000 * (attempts - 4) * 10); 
        return res.status(429).json({ message: `Too many attempts, please wait ${waitTime / 1000} seconds.` });
    }

    // Reset attempts if more than 1 minute has passed
    if (timeSinceLastAttempt > 60000) {
        throttle[email] = { attempts: 1, lastAttempt: currentTime };
    } else {
        throttle[email].attempts++;
    }

    next();
};
