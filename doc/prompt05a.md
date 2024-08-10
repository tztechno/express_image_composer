
Claude 20:00

ABCのファオルに入っている画像を全ての組みわわせで指定した位置に配置て合成画像を作るアプリをexpressで作っている

起きている現象
３つの画像の位置を０−１の小数で指定しているのに、指定した場所に画像が配置されていない
ファイル名は使用したA、B、Cのファイル名を繋げてファイル名としたい

current all scripts

##############js/scripts#################################
document.addEventListener("DOMContentLoaded", function () {
    const thumbnailsContainer = document.getElementById("thumbnails");
    const form = document.querySelector('form');


    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(form);

        fetch('/', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        throw new Error(error.error || 'Network response was not ok');
                    });
                }
                return response.text();
            })
            .then(() => {
                window.location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
                alert(`An error occurred while uploading the images: ${error.message}`);
            });
    });



    // 既存のコード（画像リストの取得）はそのまま
    fetch('/images')
        .then(response => response.json())
        .then(images => {
            // ... (既存のコード)
        })
        .catch(error => console.error('Error loading images:', error));
});


##############views/index.ejs#################################
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>画像合成ツール</title>
</head>

<body>
    <h1>画像合成ツール</h1>
    <form method="post" enctype="multipart/form-data">
        <h2>画像の設置位置を指定</h2>
        <label for="posX_A">imageAのx位置:</label>
        <input type="number" name="posX_A" step="0.1" required>
        <label for="posY_A">imageAのy位置:</label>
        <input type="number" name="posY_A" step="0.1" required><br>

        <label for="posX_B">imageBのx位置:</label>
        <input type="number" name="posX_B" step="0.1" required>
        <label for="posY_B">imageBのy位置:</label>
        <input type="number" name="posY_B" step="0.1" required><br>

        <label for="posX_C">imageCのx位置:</label>
        <input type="number" name="posX_C" step="0.1" required>
        <label for="posY_C">imageCのy位置:</label>
        <input type="number" name="posY_C" step="0.1" required><br>

        <button type="submit">画像を合成して保存</button>
    </form>

    <h2>結果画像</h2>
    <div id="thumbnails">
        <% resultImages.forEach(image=> { %>
            <div class="thumbnail">
                <img src="/static/images/Result/<%= image %>" alt="<%= image %>"
                    style="width: 150px; height: auto; border: 1px solid #ddd;">
                <p>
                    <%= image %>
                </p>
            </div>
            <% }) %>
    </div>
</body>

</html>
##############app.js#################################
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
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
        // Read all image files from the folders
        const imagesA = fs.readdirSync(FOLDERS.A).filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        const imagesB = fs.readdirSync(FOLDERS.B).filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        const imagesC = fs.readdirSync(FOLDERS.C).filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        const backgrounds = fs.readdirSync(FOLDERS.background).filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

        if (backgrounds.length === 0 || imagesA.length === 0 || imagesB.length === 0 || imagesC.length === 0) {
            return res.status(400).json({ error: 'One or more image folders are empty.' });
        }

        for (const background of backgrounds) {
            for (const imageA of imagesA) {
                for (const imageB of imagesB) {
                    for (const imageC of imagesC) {
                        const backgroundPath = path.join(FOLDERS.background, background);
                        const imageAPath = path.join(FOLDERS.A, imageA);
                        const imageBPath = path.join(FOLDERS.B, imageB);
                        const imageCPath = path.join(FOLDERS.C, imageC);

                        const posX_A = 0; // default position values
                        const posY_A = 0;
                        const posX_B = 0;
                        const posY_B = 0;
                        const posX_C = 0;
                        const posY_C = 0;

                        const composite = await sharp(backgroundPath)
                            .composite([
                                { input: imageAPath, top: posY_A, left: posX_A },
                                { input: imageBPath, top: posY_B, left: posX_B },
                                { input: imageCPath, top: posY_C, left: posX_C },
                            ])
                            .toBuffer();

                        const resultFilename = `result_${Date.now()}_${path.basename(background, path.extname(background))}.png`;
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







##############js/scripts#################################

##############views/index.ejs#################################

##############app.js#################################

