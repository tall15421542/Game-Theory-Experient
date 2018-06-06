import React, { Component } from 'react';
import './App.css';
import { color as themeColors } from '@data-ui/theme';
import { Histogram, DensitySeries, BarSeries, withParentSize, XAxis, YAxis } from '@data-ui/histogram';
import  socketIoClient from 'socket.io-client'
import { range } from 'd3-array';
import throttle from 'lodash/throttle';
import Range from './Range';
import { scaleOrdinal } from '@vx/scale';
import { LegendOrdinal } from '@vx/legend';
import { RadialChart, ArcSeries, ArcLabel } from '@data-ui/radial-chart';
import { Line, Circle } from 'rc-progress';

const colorScale = scaleOrdinal({ range: themeColors.categories });

const DEBOUNCE_MS = 100;
const INDEX_CHANGE = 50;
const className = ["一報還一報 ", "兩報還一報 ", "大壞蛋", "瘋子"];
const MAX_BIN = 15;

themeColors.categories = ['#55D7E4', '#96DDE4', '#5EC4CD', '#028E9B'];

const ResponsiveHistogram = withParentSize(({ parentWidth, parentHeight, ...rest}) => (
    <Histogram
    width={parentWidth}
    height={parentHeight}
    {...rest}
    />
));

function min(a,b){
    return a < b? a:b;
}

function compare(a, b){
    if(a.score < b.score)
        return 1;
    else if(a.score > b.score)
        return -1;
    else
        return 0;
}


class App extends Component {
    constructor(){
        super();
        this.handleChangeIndex = throttle(this.onChangeIndex.bind(this), DEBOUNCE_MS);
        //this.handleChange = this.handleChange.bind(this);
        //this.handleTexting = this.handleTexting.bind(this);
        this.state={
            worldRecord: [],
            index: 1,
            //world: [],
            endpoint: "http://127.0.0.1:4001",
            complete: 0,
            input: "",
            rank: []
        }
    } 

    
    onChangeIndex(e) {
        if (e.target){
            if(e.target.value > this.state.worldRecord.length){
                alert("outside the range");
            }
            else{
                this.setState({ index: (e.target.value) });
                console.log(e.target.value);
            }
        }
    }

    renderHistoryControls() {
        if(!this.state.complete)
            return(
                <div class="incomplete">Round {this.state.index}</div>
            );
        const index = this.state.index;
        return (
          <div className="history">
            <div className = "historyControl">
                <Range
                  id="bins"
                  label={`history index (${index})`}
                  min={0}
                  max={this.state.worldRecord.length-1}
                  value={this.state.index}
                  step={20}
                  onChange={this.handleChangeIndex}
                />
            </div>
            <div className="historyInput">
                <input type="text" 
                 onChange = {event => this.handleChange(event)} 
                 onKeyDown = {event => this.handleTexting(event)}
                 style = {{width: 50 }}
                 value = {this.state.input}
                />
            </div>
          </div>
        );
    }

    handleChange(e){
            this.setState({input: (e.target.value)});
    }

    handleTexting(e){
        switch(e.keyCode){
            case 13:
                e.preventDefault();
                if(isNaN(this.state.input)){
                    alert("not number!");
                    this.setState({input: ""});
                }
                else if(Number(this.state.input) >= this.state.worldRecord.length
                        || Number(this.state.input) < 0){
                    alert("outside the history ");
                }
                else{
                    this.setState({index: Number(this.state.input)});
                    this.setState({input: ""});
                    console.log("change!");
                }
        }
    }


    componentDidMount(){
        const endpoint = this.state.endpoint;
        let socket = socketIoClient(endpoint);
        socket.on("update", (worldRecord) =>{
            this.setState({worldRecord: worldRecord});
            let timerId = setInterval( ()=>{
                this.setState({index: this.state.index+INDEX_CHANGE});
                if(this.state.index + INDEX_CHANGE >= this.state.worldRecord.length){
                    this.setState({index: this.state.worldRecord.length - 1});
                    this.setState({complete: 1});
                    clearInterval(timerId);
                }
                console.log(this.state.index);
            }, 500)
        })
        console.log("socket!");
        /* world is an array of object */
    }

    initializeBinned(world, binnedData){
        for( let index = 0 ; index < world.length ; index++){
            binnedData.push({
                data: [],
                index: index
            })
        }
        for (let classType = 0 ; classType < world.length; classType++){
            let peopleNum = world[classType].people.length;
            for( let index = 0 ; index < min(peopleNum, MAX_BIN); index++){
                let person = world[classType].people[index];
                binnedData[classType].data.push(
                    {
                        id: (person.no.toString()),
                        bin:((classType).toString() + person.no.toString()),
                        count: person.score,
                        classType: className[classType]
                    }
                )
                if(index == min(peopleNum - 1,MAX_BIN-1)){
                    binnedData[classType].data.push(
                        {
                            id: ((person.no+1).toString()),
                            bin:((classType).toString() + '99999999'),
                            count: 0,
                            classType: className[classType]
                        }
                    )
                
                }
            }
        }
    }

    renderTableContent(){
        if(typeof(this.state.worldRecord[1]) !== "undefined"){
            let rank = [];
            let foreIndex = this.state.index - 1 >= 0 ? this.state.index - 1 : 0;
            console.log(foreIndex);
            let foreWorld = this.state.worldRecord[foreIndex];
            this.state.worldRecord[this.state.index].map((classType, index) =>{
                rank.push({
                    classType: classType.class,
                    score: classType.score,
                    mean: parseFloat((classType.score - foreWorld[index].score) / (classType.people.length)).toFixed(2),
                    theoremMean: parseFloat(classType.mean).toFixed(2)
                })
            })
            rank.sort(compare);
            console.log("what happen");
            let max = rank[0].score;
            
            let reducer = (accmulator, currentValue) => accmulator + Number(currentValue.score);
            let sum = rank.reduce(reducer, 0);
            console.log(sum);
            return(
                <div  className="tableBlock">
                    <table className="table">
                    <thead>
                    <tr style={{textAlign: 'center', fontSize: '30px', margin: '15px'}}>
                        <td></td>
                        <td>Score</td>
                        <td>Theorem</td>
                        <td>Actual</td>
                    </tr>
                    </thead>
                    <tbody>
                    {rank.map(classType => {
                        return(
                            <tr style={{backgroundColor: themeColors.categories[classType.classType], padding: '40px', textAlign: 'center',
                                        width: '200px', color: 'black'}}>
                                <td>{className[classType.classType]}</td>
                                <td>{classType.score}</td>
                                <td>{classType.theoremMean}</td>
                                <td>{classType.mean}</td>
                            </tr>
                        )
                    })}
                    </tbody>
                    </table>
                </div>
            )
        }
        else
            console.log("not enter");
    }

    renderProgress(){
        let rank = [];
        this.state.worldRecord[this.state.index].map(classType =>{
            rank.push({
                classType: classType.class,
                score: classType.score,
                mean: parseFloat(classType.score / (classType.people.length * this.state.index)).toFixed(2)
            })
        })
        rank.sort(compare);
        let max = rank[0].score;
        return( 
            <div className="progress">
                {rank.map(classType => {
                    return(
                        <div>
                            <p className="progressName">{className[classType.classType]} ({classType.score}分)</p>
                            <Line strokeWidth="3" percent={classType.score / max * 100} strokeColor={themeColors.categories[classType.classType]}/>
                        </div>
                    )
                })}
            </div>
        ) 
    }

    renderPieChart(){
        let data = [];
        let sum = 0;
        this.state.worldRecord[this.state.index].map((classType, index) =>{
            data.push({
                label: className[index],
                value: classType.score,
                index: index
            })
            sum += classType.score;
        })
        return(
            <div  className="pie">
                <RadialChart
                  ariaLabel="This is a radial-chart chart of..."
                  width={300}
                  height={300}
                  renderTooltip={({ event, datum, data, fraction }) => (
                    <div>
                      <strong>{datum.label}</strong>
                      {datum.value} ({(fraction * 100).toFixed(2)}%)
                    </div>
                  )}
                >
                  <ArcSeries
                    data={data}
                    pieValue={d => d.value}
                    fill={arc => themeColors.categories[arc.data.index]}
                    stroke="white"
                    strokeWidth={1}
                    label = {arc => `${(arc.data.value / sum * 100).toFixed(1)}%`}
                    labelComponent={<ArcLabel 
                        fontSize={10}
                        textAnchor={arc => (((arc.endAngle + arc.startAngle) / 2) > 3.14 ? 'end' : 'start'
                        )}
                        fill={arc => themeColors.categories[arc.data.index]}
                    />}
                    innerRadius={radius => 0.35 * radius}
                    outerRadius={radius => 0.6 * radius}
                    labelRadius={radius => 0.75 * radius}
                  />
                </RadialChart>
            </div>
        )
    }



    render() {
        let margin={ top: 32, right: 32, bottom: 10, left: 64 }
        let binnedData = [];
        let index = this.state.index;
        let world = this.state.worldRecord[index];
        let complete = this.state.complete;
        if(!complete && this.state.index >= this.state.worldRecord.length - INDEX_CHANGE)
            complete = 1;
        if(typeof(world) !== "undefined"){
            this.initializeBinned(world, binnedData);
            console.log(world);
            return (
                <div>
                    <div className="histogram">

                        <ResponsiveHistogram
                           ariaLabel="My histogram of ..."
                           orientation="vertical"
                           cumulative={false}
                           normalized={false}
                           binCount={20}
                           valueAccessor={datum => datum}
                           binType="categorical"
                           height= {470}
                           width = {1000}
                           margin={margin}
                           renderTooltip={({ event, datum, data, color }) => (
                             <div>
                                <strong style={{ color }}>{data.class}</strong>
                                <div>{datum.classType}</div>
                                <div><strong>ID </strong>{datum.id}</div>
                                <div><strong>Score  </strong>{datum.count}</div>
                              </div>
                           )}
                        >
                        {binnedData.map( (classType) => {
                            return(
                                <BarSeries
                                    animated
                                    fill={themeColors.categories[classType.index]}
                                    binnedData={ classType.data }
                                />
                            );
                        })}
                            
                        
                       {0 && < XAxis />}
                       {0 && <YAxis label="score"/>}
                     </ResponsiveHistogram>
                    </div>
                    <div className="second">
                        {this.renderPieChart()}
                        {this.renderProgress()}
                    </div>
                    {this.renderHistoryControls()}
                    {this.renderTableContent()}
                </div>
                );
        }
        else{
            return (
                <div>Connecting ...</div>
            );
        }
        
    }
}

export default App;
