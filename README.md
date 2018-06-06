# Game-Theory-Experient
這是一個關於多局賽局的實驗。  
當賽局只有一局的時候，最好的策略就是當一個壞人  
因為不管對手如何選擇，壞都比好更有利。  
因此理性的人在``僅有一局``的賽局都會當壞人。  
  
然而，當賽局是多局的呢？  
當賽局是多局的，每個人都擁有記憶。也就是說，我現在如何做選擇，跟你之前如何對我有關係。
## 規則
|       | 你合作 | 你背叛 |
| :--:  | :--:| :--:|
| 我合作 | 3     |   0   |
| 我背叛 | 5     |   1   |

兩個人的決定，依據這張表格得到各自的分數。  

現在寫死的策略有四種
1. 一報還一報: ``沒遇過都出好，接著重複上一局對手的決定``
2. 兩報還一報: ``沒遇過都出好，接著，當對手連當兩局壞人，則出壞``
3. 大壞人 : ``永遠都出壞``
4. 不理性 : ``隨機``  
  
現在每一種人各n個，每一局隨機配對，並根據兩人的決定計分，接著進入下一局
下一局跟這一局最大的差異是，現在每個人都多了與上一個對手``交手的記憶``
當兩人第二次遇見以後，兩人會完全根據這個對手的紀錄做決定
比如說，一報還一報的人，遇到了已經遇過的不理性的人，不理性的人上一局出壞，根據策略，一報換一報這一局會出壞  
必須注意的是，沒有人知道對手的種類，唯一擁有的是對戰紀錄
  
現在進行m局，比較m局裡所有的得分

每個類別的人都根據如下的API做決策
```
function makeDecision(history){
  /* your strategy */
  return [BETRAY][COOPERATE]
}
```
目前策略寫死在後端，不過實驗的結果仍然很有趣，大家可以觀察好人跟壞人，隨著局數的增加，分數是如何變化的  
## Backend
```
cd backend
npm install
node index.js
```
如果想要改變實驗的環境，包括``比賽局數m``和``四個種類的人數n``(可以不同的初始比例開始)
可以進入index.js
![](https://github.com/tall15421542/Game-Theory-Experient/blob/master/img/%E8%9E%A2%E5%B9%95%E5%BF%AB%E7%85%A7%202018-06-06%20%E4%B8%8B%E5%8D%8810.01.25.png)

## Frontend
```
cd front
npm install
npm start
```

## UI
### 直方圖
上方的直方圖顯示的是隨機從各種類的人抽15人，縱軸是個人的得分  
從這張圖可以看到比分的趨勢

### 圓餅圖和相對分數
圓餅圖顯示分數的比例  
右邊的進度圖則以分數最高的當作基準，紀錄所有人的比例

### 歷史回放
在頁面中有一個拉桿，旁邊有輸入的格子，可以輸入數字跳到該局的統計狀況
這裡調控的是目前所顯示的局數，控制拉桿，便可以看到各種策略動態的消長

### 表格
紀錄各種人的分數，以及我算出來的期望值，和實際上在第n局，各種人得到的平均分數

![](https://github.com/tall15421542/Game-Theory-Experient/blob/master/img/%E8%9E%A2%E5%B9%95%E5%BF%AB%E7%85%A7%202018-06-06%20%E4%B8%8B%E5%8D%889.49.43.png)
![](https://github.com/tall15421542/Game-Theory-Experient/blob/master/img/%E8%9E%A2%E5%B9%95%E5%BF%AB%E7%85%A7%202018-06-06%20%E4%B8%8B%E5%8D%889.49.54.png)
