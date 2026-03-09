import config from './src/config/env.js';
import connectDB from './src/config/db.js';
import app from './src/app.js';
import { seedPredefinedThemes } from './src/services/themeService.js';

connectDB().then(async () => {
    await seedPredefinedThemes();
    const PORT = config.PORT;
    app.listen(PORT, () => {
        console.log(`Server running in port ${PORT}`);
    });
});
