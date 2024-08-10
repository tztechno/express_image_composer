const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });

const STATIC_IMAGES_PATH = 'static/images';
const FOLDERS = {
    A: path.join(STATIC_IMAGES_PATH, 'A'),
    B: path.join(STATIC_IMAGES_PATH, 'B'),
    C: path.join(STATIC_IMAGES_PATH, 'C'),
    background: path.join(STATIC_IMAGES_PATH, 'background'),
    result: path.join(STATIC_IMAGES_PATH, 'Result')
};

// Ensure necessary directories exist
Object.values(FOLDERS).forEach(folder => {
    fs.mkdirSync(folder, { recursive: true });
});

app.use(express.static('public'));
app.use('/static', express.static('static'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    fs.readdir(FOLDERS.result, (err, files) => {
        if (err) {
            console.error('Error reading Result folder:', err);
            return res.render('index', { resultImages: [] });
        }
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        res.render('index', { resultImages: imageFiles });
    });
});

app.post('/', upload.single('dummy'), async (req, res) => {
    try {
        const imagesA = fs.readdirSync(FOLDERS.A).filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        const imagesB = fs.readdirSync(FOLDERS.B).filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        const imagesC = fs.readdirSync(FOLDERS.C).filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        const backgrounds = fs.readdirSync(FOLDERS.background).filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

        if (backgrounds.length === 0 || imagesA.length === 0 || imagesB.length === 0 || imagesC.length === 0) {
            return res.status(400).json({ error: 'One or more image folders are empty.' });
        }

        const { posX_A, posY_A, posX_B, posY_B, posX_C, posY_C } = req.body;

        for (const background of backgrounds) {
            for (const imageA of imagesA) {
                for (const imageB of imagesB) {
                    for (const imageC of imagesC) {
                        const backgroundPath = path.join(FOLDERS.background, background);
                        const imageAPath = path.join(FOLDERS.A, imageA);
                        const imageBPath = path.join(FOLDERS.B, imageB);
                        const imageCPath = path.join(FOLDERS.C, imageC);

                        const backgroundImage = await sharp(backgroundPath).metadata();

                        const composite = await sharp(backgroundPath)
                            .composite([
                                { input: imageAPath, top: Math.round(parseFloat(posY_A) * backgroundImage.height), left: Math.round(parseFloat(posX_A) * backgroundImage.width) },
                                { input: imageBPath, top: Math.round(parseFloat(posY_B) * backgroundImage.height), left: Math.round(parseFloat(posX_B) * backgroundImage.width) },
                                { input: imageCPath, top: Math.round(parseFloat(posY_C) * backgroundImage.height), left: Math.round(parseFloat(posX_C) * backgroundImage.width) },
                            ])
                            .toBuffer();

                        const resultFilename = `${path.basename(imageA, path.extname(imageA))}_${path.basename(imageB, path.extname(imageB))}_${path.basename(imageC, path.extname(imageC))}_${path.basename(background, path.extname(background))}.png`;
                        const resultPath = path.join(FOLDERS.result, resultFilename);

                        await fs.promises.writeFile(resultPath, composite);
                    }
                }
            }
        }

        res.redirect('/');
    } catch (error) {
        console.error('Error processing images:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
