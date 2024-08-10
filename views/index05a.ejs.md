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