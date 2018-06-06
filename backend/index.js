/* socket */
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const port = 4001;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let connected = 0;
io.on('connection', socket => {
    console.log('User connected');
    socket.emit('update', worldRecord);
    socket.on('disconnect', ()=>{
        console.log('user disconnected');
    })
})

server.listen(port, () => {
    console.log("start listen on " + port);
    
})

/* class people         class world
 *                      
 *  no                  people
 *  class               class
 *  record              peopleNum
 *  score               makeDecision
 *  history             calculateMean
 *                      
*/

/* experient environment */
const ROUND = 100;
const classNum = 4;
const peopleNum = [2000, 2000, 2000, 2000];
const HISTORY_NUM = 2;
const A_Num = peopleNum[0];
const B_Num = peopleNum[1];
const C_Num = peopleNum[2];
const D_Num = peopleNum[3];
const peopleSum = A_Num + B_Num + C_Num + D_Num;

let world = [];
let worldNum = 0;

/* initilize world without client */
for(let index = 0 ;index < classNum ; index++){
    world.push({
        people: [],
        class: index,
        peopleNum: peopleNum[index],
        score: 0,
        makeDecision: function(){
            /* initialize function */
        }, 
        calculateMean: function(){
            /* initialize function */
        }
    })
    initializeClass(world[index].people, world[index].peopleNum, world[index].class);
}

function initializeClass(peopleArray, peopleNum, peopleClass){
    for(let index = 0; index < peopleNum; index++){
        peopleArray.push({
            no: worldNum,
            index: index,
            class: peopleClass,
            history: {},
            score: 0
        });
        worldNum ++;
    }
}

/* initialize Rule without client */

/* 
 * BETRAY = 0 COOPERATE = 1
 *
 *    [0][1]
 * [0] 1  5
 * [1] 0  3
 *
 */

const table = [1, 5, 0, 3]
const BETRAY = 0;
const COOPERATE = 1;

/* 一報還一報 */
world[0].makeDecision = function(history){
    if (history.length == 0)
        return COOPERATE;
    let indexNow = history.length;
    return history.record[indexNow-1];
}

/* 兩報還一報 */
world[1].makeDecision = function(history){
    let indexNow = history.length;
    if(indexNow <= 1)
        return COOPERATE;
    else if(history.record[indexNow-1] == BETRAY && history.record[indexNow-2] == BETRAY)
        return BETRAY;
    else
        return COOPERATE;
}

/* 大壞蛋 */
world[2].makeDecision = function(histroy){
        return BETRAY;
}

/* 瘋子 */
world[3].makeDecision = function(histrory){
    let rand = Math.random();
    if(rand > 0.5)
        return BETRAY;
    else
        return COOPERATE;
}

/* calculate mean */
world[0].calculateMean = (round) => {
    if(round == 0)
        return 0;
    let score = (A_Num / peopleSum) * 3 
               +(B_Num / peopleSum) * 3
               +(C_Num / peopleSum) * (1 - firstMeetProp(peopleSum, round)) * 1
               +(D_Num / peopleSum) * ( (1+3+5+0) * 0.25 * (1-firstMeetProp(peopleSum, round)) + (3+0) * 0.5 * firstMeetProp(peopleSum, round));
    return score;
}

world[1].calculateMean = (round) => {
    if(round == 0)
        return 0;
    let firstMeet = firstMeetProp(peopleSum, round);
    let secondMeet = secondMeetProp(peopleSum, round);
    let score = (A_Num / peopleSum) * 3
               +(B_Num / peopleSum) * 3
               +(C_Num / peopleSum) * (1 - firstMeet - secondMeet) * 1
               +(D_Num / peopleSum) * ( (1 - firstMeet - secondMeet) * ((1.0 / 4.0) * ( 0.5 * 5 + 0.5 * 1) + (3.0 / 4.0) * ( 0.5 * 3 + 0.5 * 0))
                                       +(firstMeet + secondMeet) * (0.5 * 3 + 0.5 * 0));
    return score;
}

world[2].calculateMean = (round) => {
    if(round == 0)
        return 0;
    let firstMeet = firstMeetProp(peopleSum, round);
    let secondMeet = secondMeetProp(peopleSum, round);
    let score = (A_Num / peopleSum) * (firstMeet * 5 + (1-firstMeet) * 1)
               +(B_Num / peopleSum) * ((firstMeet + secondMeet) * 5 + (1 - firstMeet - secondMeet) * 1)
               +(C_Num / peopleSum) * 1
               +(D_Num / peopleSum) * (0.5 * 5 + 0.5 * 1);
    return score;
}

world[3].calculateMean = (round) => {
    if(round == 0)
        return 0;
    let firstMeet = firstMeetProp(peopleSum, round);
    let secondMeet = secondMeetProp(peopleSum, round);
    let score = (A_Num / peopleSum) * (firstMeet * (5 * 0.5 + 3 * 0.5) + (1-firstMeet) * (1 + 3 + 0 + 5) * 0.25)
               +(B_Num / peopleSum) * ((firstMeet + secondMeet) * (5 *0.5 + 3 * 0.5) 
                                      +(1 - firstMeet - secondMeet) * (0.75 * (0.5 * 1 + 0.5 * 0) + 0.25 * (0.5 * 5 + 0.5 * 3)))
               +(C_Num / peopleSum) * (0.5 * 0 + 0.5 * 1)
               +(D_Num / peopleSum) * (1 + 3 + 0 + 5) * 0.25;
    return score;
}

function firstMeetProp(Sum, round){
    return Math.pow( (Sum-1)/Sum , round - 1);
}

function secondMeetProp(sum, round){
    let notMeet = (sum - 1) / sum;
    let meet = 1 / sum;
    return Math.pow(notMeet, round - 2) * Math.pow(meet, 1)  * (round - 1);
}


let worldRecord = [];
/* initialize world record */
addWorldRecord(world, worldRecord, 0);

/* round start */

for(let times = 0 ; times < ROUND; times++){
    
    let left = worldNum;
    let peopleArray = [];
    /* initilize array of people */
    for(let index = 0 ; index < worldNum ; index++){
        peopleArray.push(index);
    }
    while(left > 0){
        /* pick a combination */
        let a = pickPerson(peopleArray, left, world);
        left -= 1;
        let b = pickPerson(peopleArray, left, world);
        left -= 1;

        /* apply rule */
        let aRule = world[a.class].makeDecision;
        let bRule = world[b.class].makeDecision;
        if(typeof(a.history[b.no]) == "undefined")
            initializeHistory(a.history, b.no);
        if(typeof(b.history[a.no]) == "undefined")
            initializeHistory(b.history, a.no);
        
        let aDecision = aRule(a.history[b.no]);
        let bDecision = bRule(b.history[a.no]);

        /* update Record */
        addRecord(a.history[b.no], bDecision);
        addRecord(b.history[a.no], aDecision);
        
        /* update score */
        a.score += table[aDecision*2 + bDecision];
        b.score += table[bDecision*2 + aDecision];
    }
    /* record the score */ 
    updateScore(world);
    addWorldRecord(world, worldRecord, times+1);

    /* statistic console */
    worldRecord[times].map((record, index) => {
        console.log("class "+ index + ": "+record.mean);
    })
}

function addWorldRecord(world, worldRecord, round){
    let newWorld = [];
    for(let classType = 0 ; classType < world.length; classType++){
        newWorld.push({
            people: [],
            class: world[classType].class,
            score: world[classType].score,
            mean: world[classType].calculateMean(round)
        })
        for(let index = 0 ; index < world[classType].people.length; index++){
            let person = world[classType].people[index];
            newWorld[classType].people.push({
                no: person.no,
                score: person.score,
            })
        }
    }
    worldRecord.push(newWorld);
}

function pickPerson(peopleArray, left){
    let Index = Math.floor(Math.random() * left);
    let person = indexToPeople(peopleArray[Index], world);
    peopleArray.splice(Index, 1);
    return person
}

function indexToPeople(index, world){
    let classType = 0;
    while(index >= world[classType].peopleNum){
        index -= world[classType].peopleNum;
        classType++;
    }
    return world[classType].people[index]
}

function initializeHistory(history, index){
    history[index] = {
        record: [],
        length: 0
    }
}

function addRecord(history, decision){
    if(history.record.length < HISTORY_NUM){
        history.record.push(decision);
    }
    else{
        history.record.splice(0,1);
        history.record.push(decision);
    }
    history.length = history.record.length;
}

function updateScore(world, round){
    for(let classIndex = 0 ; classIndex < classNum; classIndex++){
        let score = 0;
        for(let peopleIndex = 0 ; peopleIndex < world[classIndex].peopleNum; peopleIndex++){
            score += world[classIndex].people[peopleIndex].score;
            world[classIndex].score = score;
        }
    }
}


world.map(peopleClass => {
    console.log(peopleClass.score);
});




