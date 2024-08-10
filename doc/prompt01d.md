
ChatGPT 17:04

修正に失敗して、画像の生成ができなくなった


current all scripts

##############js/scripts#################################
document.addEventListener("DOMContentLoaded", function () {
    const thumbnailsContainer = document.getElementById("thumbnails");
    const form = document.querySelector('form');

    // フォーム送信のイベントリスナーを追加
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(form);

        fetch('/', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(() => {
                // 成功時の処理（例：ページをリロード）
                window.location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while uploading the images. Please try again.');
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

###############views/index.ejs################################
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>画像合成ツール</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>

<body>
    <h1>画像合成ツール</h1>

    <% if (typeof error !=='undefined' ) { %>
        <div class="error-message">
            <%= error %>
        </div>
        <% } %>

            <form method="post" enctype="multipart/form-data">
                <h2>背景画像を選択</h2>
                <input type="file" name="backgroundImage" accept="image/*" required><br>

                <h2>imageA, imageB, imageCの画像を選択</h2>
                <label for="imageA">imageA:</label>
                <input type="file" name="imageA" accept="image/*" multiple required><br>
                <label for="imageB">imageB:</label>
                <input type="file" name="imageB" accept="image/*" multiple required><br>
                <label for="imageC">imageC:</label>
                <input type="file" name="imageC" accept="image/*" multiple required><br>

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

            <h2>プレビュー</h2>
            <div id="preview"></div>

            <script src="/js/script.js"></script>
</body>

</html>

################app.js###############################
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

const UPLOAD_FOLDER = 'static/images';
const RESULT_FOLDER = path.join(__dirname, UPLOAD_FOLDER, 'Result');

// Create folders if they don't exist
fs.mkdirSync(RESULT_FOLDER, { recursive: true });

const sharp = require('sharp');

app.use(express.static('public'));
app.use('/static', express.static('static'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    fs.readdir(RESULT_FOLDER, (err, files) => {
        if (err) {
            console.error('Error reading Result folder:', err);
            return res.render('index', { resultImages: [] });
        }
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        res.render('index', { resultImages: imageFiles });
    });
});

// 他のルートハンドラーやミドルウェアはそのまま

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/images', (req, res) => {
    fs.readdir(RESULT_FOLDER, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading images directory');
        }
        // フィルタリングして画像ファイルのみ取得
        const images = files.filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file));
        res.json(images);
    });
});

app.post('/', upload.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'imageA', maxCount: 1 },
    { name: 'imageB', maxCount: 1 },
    { name: 'imageC', maxCount: 1 }
]), (req, res) => {
    try {
        // ファイルアップロードと画像処理のロジックをここに実装
        // 処理が完了したら、適切なレスポンスを返す
        res.redirect('/');
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
###############################################
###############################################