#!/bin/bash

#!/bin/bash

# 遍歷當前目錄中的所有以 "螢幕錄製" 開頭、包含三個分隔符號 "-" 的文件
for file in *.gif; do
    # 提取文件名（不包含路徑）
    filename=$(basename "$file")

    # 將 "螢幕錄製" 替換為 "video"
    new_filename=$(echo "$filename" | sed 's/上午/am/')

    # 生成新的文件名
    new_filepath="${new_filename}"

    # 如果新的文件名和原文件名不同，進行重命名
    if [ "$filename" != "$new_filename" ]; then
        mv "$file" "$new_filepath"
        echo "已將 $filename 重命名為 $new_filename"
    fi
done

