"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = __importDefault(require("./routes/users"));
const auth_1 = __importDefault(require("./routes/auth"));
const haliSaha_1 = __importDefault(require("./routes/haliSaha"));
const reservation_1 = __importDefault(require("./routes/reservation"));
const review_1 = __importDefault(require("./routes/review"));
const logger_1 = __importDefault(require("./core/logger/logger"));
const rateLimiter_1 = require("./middlewares/rateLimiter");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
app.use((0, cors_1.default)());
app.use(rateLimiter_1.globalLimiter);
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (msg) => logger_1.default.info(msg.trim())
    }
}));
app.use(express_1.default.json());
console.log("✅ Morgan aktif"); // Bunu terminalde görüyor musun?
app.use('/api', users_1.default);
app.use('/api', auth_1.default);
app.use('/api', haliSaha_1.default);
app.use('/api', reservation_1.default);
app.use('/api', review_1.default);
app.get('/', (req, res) => {
    res.send('Toplansin backend runliyo');
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
