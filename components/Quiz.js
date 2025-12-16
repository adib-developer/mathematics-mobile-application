import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Grid from './Grid';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const timeNames = ['Alex','Sam','Jordan','Taylor','Casey','Avery','Robin','Charlie','Drew','Riley','Morgan','Quinn','Harper','Logan','Jamie'];
const destinations = ['a friend\'s house','school','the shop','the park','the library','the cinema','swimming practice','football training','a cafe','the museum'];

// Custom Tally Mark component with diagonal slash
function TallyGroup({count}) {
  if (count === 0) return null;
  
  // Calculate number of complete groups of 5 and remaining marks
  const groups = Math.floor(count / 5);
  const remainder = count % 5;
  
  // ADJUSTABLE DIAGONAL LINE POSITIONING
  // Modify these values to change how the diagonal line stretches and positions
  // fontSize: Controls size of the slash character (larger = longer diagonal line)
  // top: Move line up/down (-8 = move 8 units up, 8 = move 8 units down)
  // left: Move line left/right (-8 = move 8 units left, 8 = move 8 units right)
  // bottom: Stretch line down from bottom (0 = no stretch, positive = stretches down)
  // right: Stretch line right from right edge (0 = no stretch, positive = stretches right)
  // EXAMPLE: To stretch corner-to-corner use: fontSize: 40, top: -8, left: -8, bottom: 0, right: 0
  const slashConfig = {
    fontSize: 10,           // Base font size (slash)
    scaleX: 2.2,            // Horizontal stretch (increase to stretch wider)
    scaleY: 1.8,            // Vertical stretch (increase to stretch taller)
    rotateZ: 8,             // Rotation in degrees (optional)
    offsetTop: 10,          // Vertical offset
    offsetLeft: 13          // Horizontal offset
  };
  
  return (
    <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 4}}>
      {/* Render each group of 5 tally marks */}
      {Array.from({length: groups}).map((_, idx) => (
        <View key={`group-${idx}`} style={{position: 'relative', width: 34, height: 30, marginRight: 8, justifyContent: 'center'}}>
          {/* Four vertical lines (the tally marks) */}
          <View style={{flexDirection: 'row', justifyContent: 'flex-start', position: 'absolute', width: '100%', height: '100%', alignItems: 'center'}}>
            <Text style={{fontSize: 18, fontWeight: '700', lineHeight: 24, marginRight: 2}}>|</Text>
            <Text style={{fontSize: 18, fontWeight: '700', lineHeight: 24, marginRight: 2}}>|</Text>
            <Text style={{fontSize: 18, fontWeight: '700', lineHeight: 24, marginRight: 2}}>|</Text>
            <Text style={{fontSize: 18, fontWeight: '700', lineHeight: 24}}>|</Text>
          </View>
          {/* Diagonal slash overlay - positioned on top of the vertical lines */}
          <View style={{position: 'absolute', width: '100%', height: '100%'}}>
            <Text style={{
              fontSize: slashConfig.fontSize,
              fontWeight: '700',
              lineHeight: slashConfig.fontSize,
              color: '#000',
              position: 'absolute',
              top: slashConfig.offsetTop,
              left: slashConfig.offsetLeft,
              transform: [
                { scaleX: slashConfig.scaleX },
                { scaleY: slashConfig.scaleY },
                { rotateZ: `${slashConfig.rotateZ}deg` }
              ]
            }}>╱</Text>
          </View>
        </View>
      ))}
      {/* Render any remaining marks that don't make a complete group of 5 */}
      {remainder > 0 && (
        <View style={{flexDirection: 'row', marginLeft: 6}}>
          {Array.from({length: remainder}).map((_, idx) => (
            <Text key={`rem-${idx}`} style={{fontSize: 18, fontWeight: '700', marginRight: 3, lineHeight: 24}}>|</Text>
          ))}
        </View>
      )}
    </View>
  );
}

// Fraction display component
function Fraction({numerator, denominator, size = 16}) {
  return (
    <View style={{alignItems: 'center', marginHorizontal: 4}}>
      <Text style={{fontSize: size, fontWeight: '500'}}>{numerator}</Text>
      <View style={{height: 1.5, backgroundColor: '#000', width: Math.max(String(numerator).length, String(denominator).length) * size * 0.6, marginVertical: 2}} />
      <Text style={{fontSize: size, fontWeight: '500'}}>{denominator}</Text>
    </View>
  );
}
const cityRoutes = [
  { route: 'London to Paris', stations: ['London', 'Paris'], times: [['06:18', '08:35'], ['07:24', '09:45'], ['10:30', '12:50']] },
  { route: 'Manchester to London', stations: ['Manchester', 'London'], times: [['08:15', '11:20'], ['09:40', '12:45'], ['14:10', '17:15']] },
  { route: 'Edinburgh to Birmingham', stations: ['Edinburgh', 'Birmingham'], times: [['07:00', '13:45'], ['09:30', '16:15'], ['12:00', '18:50']] },
  { route: 'London to Sheffield', stations: ['London', 'Sheffield'], times: [['09:15', '11:30'], ['11:45', '14:00'], ['15:20', '17:35']] },
  { route: 'Cardiff to Bristol', stations: ['Cardiff', 'Bristol'], times: [['07:05', '08:25'], ['09:10', '10:30'], ['12:40', '14:00']] },
  { route: 'Leeds to York', stations: ['Leeds', 'York'], times: [['06:50', '07:20'], ['08:05', '08:35'], ['10:25', '10:55']] }
];

function generateQuestion(topic){
  const a = Math.floor(Math.random()*12)+1;
  const b = Math.floor(Math.random()*12)+1;
  let op, expr, answer;
  
  if(topic === 'addition-subtraction'){
    op = Math.random() > 0.5 ? '+' : '-';
    expr = `${a} ${op} ${b} = ?`;
    // eslint-disable-next-line no-eval
    answer = eval(`${a} ${op} ${b}`);
    return {expr, answer, parts: null};
  } else if(topic === 'multiplication-division'){
    op = Math.random() > 0.5 ? '*' : '÷';
    expr = `${a} ${op} ${b} = ?`;
    // eslint-disable-next-line no-eval
    const evalExpr = `${a} ${op} ${b}`.replace('÷', '/');
    answer = Math.round(eval(evalExpr) * 100) / 100;
    return {expr, answer, parts: null};
  } else if(topic === 'time'){
    const timeTypes = ['unit-conversion', 'duration-difference', 'simple-journey', 'complex-journey', 'film-duration', 'timetable'];
    const timeType = timeTypes[Math.floor(Math.random() * timeTypes.length)];
    
    if(timeType === 'unit-conversion'){
      // Simple unit conversions: minutes to hours or hours to minutes
      const conversionTypes = ['min-to-hr', 'hr-to-min'];
      const convType = conversionTypes[Math.floor(Math.random()*2)];
      
      if(convType === 'min-to-hr'){
        const minutes = (Math.floor(Math.random()*6)+1) * 60; // 60, 120, 180, ..., 360 minutes
        expr = `Change ${minutes} minutes to hours.`;
        answer = minutes / 60;
        return {expr, answer, parts: null};
      } else {
        const hours = Math.floor(Math.random()*10)+1;
        expr = `Change ${hours} hours to minutes.`;
        answer = hours * 60;
        return {expr, answer, parts: null};
      }
    } else if(timeType === 'duration-difference'){
      // Work out the difference between two durations
      const mins1 = (Math.floor(Math.random()*30)+25);
      const hrs2 = Math.floor(Math.random()*3)+1;
      const mins2 = (Math.floor(Math.random()*4)+1) * 15; // 15, 30, 45, 60 minutes
      
      const totalMins1 = mins1;
      const totalMins2 = hrs2 * 60 + mins2;
      const diffMins = Math.abs(totalMins2 - totalMins1);
      
      expr = `Work out the difference, in minutes, between ${mins1} minutes and ${hrs2} hour${hrs2>1?'s':''} ${mins2 === 60 ? '(1 hour)' : mins2} minutes.`;
      answer = diffMins;
      return {expr, answer, parts: null};
    } else if(timeType === 'simple-journey'){
      const startHr = Math.floor(Math.random()*8)+8;
      const startMin = [0, 10, 15, 20, 30, 40, 45, 50][Math.floor(Math.random()*8)];
      const leg1 = Math.floor(Math.random()*45)+8;
      const wait = Math.floor(Math.random()*25)+5;
      const leg2 = Math.floor(Math.random()*45)+8;
      const traveller = pick(timeNames);
      const dest = pick(destinations);

      expr = `${traveller} left home at ${startHr}:${startMin.toString().padStart(2,'0')}\n${traveller} walked for ${leg1} minutes.\n${traveller} waited for ${wait} minutes.\n${traveller} then walked for another ${leg2} minutes to ${dest}.`;
      
      const totalMin = startHr*60 + startMin + leg1 + wait + leg2;
      const endHr = Math.floor(totalMin/60);
      const endMin = totalMin % 60;
      const arrival = `${endHr}:${endMin.toString().padStart(2,'0')}`;
      const walkTotal = leg1 + leg2;
      return {expr, answer: null, parts: [
        { question: `How many minutes did ${traveller} walk in total?`, answer: walkTotal },
        { question: `What time did ${traveller} arrive? (HH:MM)`, answer: arrival }
      ]};
    } else if(timeType === 'complex-journey'){
      // Like Hayley's or Natalie's journey - multi-step with breaks and fractions
      const startHr = Math.floor(Math.random()*3)+9; // 9-11 am
      const startMin = [0, 10, 20, 30, 40, 50][Math.floor(Math.random()*6)];
      
      const leg1 = Math.floor(Math.random()*35)+12;
      const shopWait = Math.floor(Math.random()*20)+8;
      const leg2 = Math.floor(Math.random()*35)+15;
      
      const name = pick(timeNames);
      const dest = pick(destinations);
      const stop = pick(['the shop','the bakery','a newsagent','the market','a kiosk']);
      
      expr = `${name} left home at ${startHr}:${startMin.toString().padStart(2,'0')}\n${name} walked to ${stop}, taking ${leg1} minutes.\n${name} was there for ${shopWait} minutes.\nThen ${name} walked to ${dest}, taking ${leg2} minutes.\nWhat time did ${name} arrive at ${dest}?`;
      
      const totalMin = startHr*60 + startMin + leg1 + shopWait + leg2;
      const endHr = Math.floor(totalMin/60);
      const endMin = totalMin % 60;
      const arrival = `${endHr}:${endMin.toString().padStart(2,'0')}`;
      answer = arrival;
      return {expr, answer, parts: null};
    } else if(timeType === 'film-duration'){
      const startHr = Math.floor(Math.random()*6)+14;
      const startMin = [0, 15, 30, 45][Math.floor(Math.random()*4)];
      const duration = Math.floor(Math.random()*60)+60;
      
      expr = `A film started at ${startHr}:${startMin.toString().padStart(2,'0')}.\nThe film lasted ${Math.floor(duration/60)} hours and ${duration%60} minutes.`;
      
      const totalMin = startHr*60 + startMin + duration;
      const endHr = Math.floor(totalMin/60);
      const endMin = totalMin % 60;
      const finish = `${endHr}:${endMin.toString().padStart(2,'0')}`;
      return {expr, answer: null, parts: [
        { question: 'How long was the film (minutes)?', answer: duration },
        { question: 'What time did the film finish? (HH:MM)', answer: finish }
      ]};
    } else if(timeType === 'timetable'){
      // Create realistic timetable data with multiple columns
      const selectedTable = pick(cityRoutes);
      const selectedTimeIndex = Math.floor(Math.random()*selectedTable.times.length);
      const selectedTimes = selectedTable.times[selectedTimeIndex];
      
      const depTime = selectedTimes[0];
      const arrTime = selectedTimes[1];
      
      const [depHr, depMin] = depTime.split(':').map(Number);
      const [arrHr, arrMin] = arrTime.split(':').map(Number);
      
      const depTotalMin = depHr * 60 + depMin;
      const arrTotalMin = arrHr * 60 + arrMin;
      const journeyMin = arrTotalMin - depTotalMin;
      const journeyHr = Math.floor(journeyMin / 60);
      
      const tableData = {
        route: selectedTable.route,
        stations: selectedTable.stations,
        allTimes: selectedTable.times,
        selectedIndex: selectedTimeIndex
      };
      
      const parts = [
        {
          question: `A train leaves at ${depTime}, how many minutes does it take to reach ${selectedTable.stations[1]}?`,
          answer: journeyMin
        },
        {
          question: `What is the journey time in hours and minutes?`,
          answer: `${journeyHr}:${(journeyMin % 60).toString().padStart(2,'0')}`
        }
      ];
      
      return {expr: null, table: tableData, answer: null, parts: parts};
    }
  } else if(topic === 'metric-conversions'){
    // Metric conversion question types based on sample worksheet
    const types = ['g-to-kg','kg-to-g','km-to-m','m-to-km','cm-to-mm','mm-to-cm','ml-to-l','l-to-ml'];
    const t = types[Math.floor(Math.random()*types.length)];
    let value, exprVal;

    if(t === 'g-to-kg'){
      value = (Math.floor(Math.random()*50)+1) * 10; // grams e.g., 10..500
      expr = `Change ${value} grams to kilograms.`;
      answer = value / 1000;
    } else if(t === 'kg-to-g'){
      value = (Math.floor(Math.random()*10)+1) * 1; // kilograms e.g., 1..20
      expr = `Change ${value} kilograms to grams.`;
      answer = value * 1000;
    } else if(t === 'km-to-m'){
      value = (Math.floor(Math.random()*9)+1) + Math.floor(Math.random()*9)/10; // e.g., 1.0 - 9.8 km
      expr = `Change ${value} kilometres to metres.`;
      answer = Math.round(value * 1000);
    } else if(t === 'm-to-km'){
      value = (Math.floor(Math.random()*900)+10); // metres e.g., 10..909
      expr = `Change ${value} metres to kilometres.`;
      answer = value / 1000;
    } else if(t === 'cm-to-mm'){
      value = (Math.floor(Math.random()*99)+1); // cm 1..99
      expr = `Change ${value} cm to mm.`;
      answer = value * 10;
    } else if(t === 'mm-to-cm'){
      value = (Math.floor(Math.random()*900)+10); // mm
      expr = `Change ${value} mm to cm.`;
      answer = value / 10;
    } else if(t === 'ml-to-l'){
      value = (Math.floor(Math.random()*25)+1) * 10; // ml
      expr = `Change ${value} millilitres to litres.`;
      answer = value / 1000;
    } else if(t === 'l-to-ml'){
      value = (Math.floor(Math.random()*5)+1) + (Math.random()>0.5?0.5:0); // litres 1,1.5,2..
      expr = `Change ${value} litres to millilitres.`;
      answer = Math.round(value * 1000);
    }
    return {expr, answer, parts: null};
  } else if(topic === 'fractions'){
    const types = ['simplify', 'equivalent', 'compare', 'non-equivalent', 'word-problem', 'ordering', 'closer-to'];
    const t = types[Math.floor(Math.random()*types.length)];
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    
    if(t === 'simplify'){
      const num = Math.floor(Math.random()*24)+6;
      const denom = Math.floor(Math.random()*24)+6;
      const g = gcd(num, denom);
      return {
        expr: 'Simplify',
        fraction: {num, denom},
        answer: `${num/g}/${denom/g}`,
        answerFraction: {num: num/g, denom: denom/g},
        parts: null
      };
    } else if(t === 'equivalent'){
      const num = Math.floor(Math.random()*6)+2;
      const denom = Math.floor(Math.random()*6)+3;
      const factor = Math.floor(Math.random()*4)+2;
      return {
        expr: 'equivalent',
        fraction1: {num, denom},
        fraction2: {num: '?', denom: denom * factor},
        answer: num * factor,
        parts: null
      };
    } else if(t === 'compare'){
      const num1 = Math.floor(Math.random()*8)+1;
      const denom1 = Math.floor(Math.random()*6)+3;
      const num2 = Math.floor(Math.random()*8)+1;
      const denom2 = Math.floor(Math.random()*6)+3;
      const val1 = num1/denom1;
      const val2 = num2/denom2;
      return {
        expr: 'compare',
        fraction1: {num: num1, denom: denom1},
        fraction2: {num: num2, denom: denom2},
        answer: val1 > val2 ? `${num1}/${denom1}` : `${num2}/${denom2}`,
        answerFraction: val1 > val2 ? {num: num1, denom: denom1} : {num: num2, denom: denom2},
        parts: null
      };
    } else if(t === 'non-equivalent'){
      // Generate a target fraction and several equivalent fractions, plus one non-equivalent
      const targetNum = Math.floor(Math.random()*4)+2;
      const targetDenom = Math.floor(Math.random()*4)+3;
      const fractions = [];
      
      // Add 3-4 equivalent fractions
      for(let i=0; i<4; i++){
        const mult = i+2;
        fractions.push({num: targetNum*mult, denom: targetDenom*mult});
      }
      
      // Add one non-equivalent fraction
      let nonEqNum, nonEqDenom;
      do {
        nonEqNum = Math.floor(Math.random()*20)+5;
        nonEqDenom = Math.floor(Math.random()*20)+10;
        const g = gcd(nonEqNum, nonEqDenom);
        nonEqNum /= g;
        nonEqDenom /= g;
      } while(Math.abs(nonEqNum/nonEqDenom - targetNum/targetDenom) < 0.05);
      
      const nonEqIdx = Math.floor(Math.random()*5);
      fractions.splice(nonEqIdx, 0, {num: nonEqNum, denom: nonEqDenom});
      fractions.length = 5; // Keep only 5
      
      return {
        expr: 'non-equivalent',
        targetFraction: {num: targetNum, denom: targetDenom},
        fractionList: fractions,
        answer: `${nonEqNum}/${nonEqDenom}`,
        parts: null
      };
    } else if(t === 'word-problem'){
      const problemTypes = ['sweets', 'counters', 'pens'];
      const pType = pick(problemTypes);
      
      if(pType === 'sweets'){
        const total = [12, 15, 18, 20, 24, 26, 30][Math.floor(Math.random()*7)];
        const red = Math.floor(Math.random()*(total-5))+3;
        const g = gcd(red, total);
        expr = `There are ${total} sweets in a bag.\n${red} of the sweets are red.\nThe rest of the sweets are white.\n\nWhat fraction of the sweets are red?`;
        answer = `${red/g}/${total/g}`;
        return {expr, answer, parts: null};
      } else if(pType === 'counters'){
        const colors = ['Red', 'Blue', 'Yellow', 'Green'];
        const total = [15, 17, 20, 22][Math.floor(Math.random()*4)];
        const counts = [];
        let sum = 0;
        for(let i=0; i<3; i++){
          const c = Math.floor(Math.random()*(total-sum-3))+2;
          counts.push(c);
          sum += c;
        }
        counts.push(total - sum);
        
        const targetIdx = Math.floor(Math.random()*4);
        const targetColor = colors[targetIdx].toLowerCase();
        const targetCount = counts[targetIdx];
        const g = gcd(targetCount, total);
        
        expr = `There are ${total} counters in a bag.\nThe table shows the number of counters of each colour.\n\nWhat fraction of the counters are ${targetColor}?`;
        const tableData = {
          headers: ['Colour', ...colors],
          rows: [['Number of Counters', ...counts]]
        };
        answer = `${targetCount/g}/${total/g}`;
        return {expr, answer, parts: null, table: tableData};
      } else {
        const total = [9, 12, 15, 18][Math.floor(Math.random()*4)];
        const red = Math.floor(Math.random()*(total-3))+2;
        const g = gcd(total-red, total);
        expr = `There are ${total} pens in a box.\n${red} pens are red.\nThe rest of the pens are green.\n\nWhat fraction of the pens are green?`;
        answer = `${(total-red)/g}/${total/g}`;
        return {expr, answer, parts: null};
      }
    } else if(t === 'ordering'){
      // Generate 4-5 fractions and ask to order them
      const count = Math.random() > 0.5 ? 4 : 5;
      const fractions = [];
      const denoms = [3, 4, 5, 6, 8, 10, 12, 15, 20, 30];
      
      for(let i=0; i<count; i++){
        const denom = pick(denoms);
        const num = Math.floor(Math.random()*(denom-1))+1;
        fractions.push({num, denom, value: num/denom});
      }
      
      fractions.sort((a,b) => a.value - b.value);
      const answer = fractions.map(f => `${f.num}/${f.denom}`).join(',');
      
      // Shuffle for display
      const shuffled = [...fractions].sort(() => Math.random() - 0.5);
      
      return {
        expr: 'ordering',
        fractionList: shuffled.map(f => ({num: f.num, denom: f.denom})),
        answer: answer,
        parts: null
      };
    } else if(t === 'closer-to'){
      // Which fraction is closer to 1 or 1/2
      const target = Math.random() > 0.5 ? 1 : 0.5;
      const targetStr = target === 1 ? '1' : '1/2';
      
      const f1Denom = [6, 7, 8, 10, 12][Math.floor(Math.random()*5)];
      const f1Num = Math.floor(Math.random()*(f1Denom-2))+2;
      
      let f2Denom, f2Num;
      do {
        f2Denom = [6, 7, 8, 10, 12][Math.floor(Math.random()*5)];
        f2Num = Math.floor(Math.random()*(f2Denom-2))+2;
      } while(f1Num/f1Denom === f2Num/f2Denom);
      
      const dist1 = Math.abs(f1Num/f1Denom - target);
      const dist2 = Math.abs(f2Num/f2Denom - target);
      
      const closer = dist1 < dist2 ? `${f1Num}/${f1Denom}` : `${f2Num}/${f2Denom}`;
      
      return {
        expr: 'closer-to',
        targetValue: targetStr,
        fraction1: {num: f1Num, denom: f1Denom},
        fraction2: {num: f2Num, denom: f2Denom},
        answer: closer,
        parts: null
      };
    }
  } else if(topic === 'place-value'){
    const types = ['identify-digit', 'write-number'];
    const t = types[Math.floor(Math.random()*types.length)];
    
    if(t === 'identify-digit'){
      const positionTypes = [
        {num: Math.floor(Math.random()*900)+100, digit: Math.floor(Math.random()*3), name: ['hundreds', 'tens', 'units'][Math.floor(Math.random()*3)]},
        {num: Math.floor(Math.random()*9000)+1000, digit: Math.floor(Math.random()*4), name: ['thousands', 'hundreds', 'tens', 'units'][Math.floor(Math.random()*4)]}
      ];
      const p = positionTypes[Math.floor(Math.random()*2)];
      expr = `What is the value of the ${p.name} digit in ${p.num}?`;
      const strNum = String(p.num);
      const digitVal = parseInt(strNum[strNum.length - (p.digit + 1)]) * Math.pow(10, p.digit);
      answer = digitVal;
      return {expr, answer, parts: null};
    } else {
      // write-number
      const thousands = Math.floor(Math.random()*9)+1;
      const hundreds = Math.floor(Math.random()*10);
      const tens = Math.floor(Math.random()*10);
      const units = Math.floor(Math.random()*10);
      expr = `Write the number: ${thousands} thousands, ${hundreds} hundreds, ${tens} tens, ${units} units`;
      answer = thousands * 1000 + hundreds * 100 + tens * 10 + units;
      return {expr, answer, parts: null};
    }
    return {expr, answer, parts: null};
  } else if(topic === 'rounding'){
    const types = ['nearest-10', 'nearest-100', 'nearest-1000', 'decimal-places'];
    const t = types[Math.floor(Math.random()*types.length)];
    
    if(t === 'nearest-10'){
      const num = Math.floor(Math.random()*900)+100;
      expr = `Round ${num} to the nearest 10`;
      answer = Math.round(num / 10) * 10;
    } else if(t === 'nearest-100'){
      const num = Math.floor(Math.random()*9000)+1000;
      expr = `Round ${num} to the nearest 100`;
      answer = Math.round(num / 100) * 100;
    } else if(t === 'nearest-1000'){
      const num = Math.floor(Math.random()*90000)+10000;
      expr = `Round ${num} to the nearest 1000`;
      answer = Math.round(num / 1000) * 1000;
    } else {
      const num = (Math.random() * 100).toFixed(3);
      expr = `Round ${num} to 1 decimal place`;
      answer = Math.round(num * 10) / 10;
    }
    return {expr, answer, parts: null};
  } else if(topic === 'negative-numbers'){
    const types = ['addition', 'subtraction', 'multiplication', 'sequence'];
    const t = types[Math.floor(Math.random()*types.length)];
    let n1, n2;
    
    if(t === 'addition'){
      n1 = (Math.random() > 0.5 ? -1 : 1) * (Math.floor(Math.random()*12)+1);
      n2 = (Math.random() > 0.5 ? -1 : 1) * (Math.floor(Math.random()*12)+1);
      expr = `${n1} + ${n2} = ?`;
      answer = n1 + n2;
    } else if(t === 'subtraction'){
      n1 = (Math.random() > 0.5 ? -1 : 1) * (Math.floor(Math.random()*12)+1);
      n2 = (Math.random() > 0.5 ? -1 : 1) * (Math.floor(Math.random()*12)+1);
      expr = `${n1} - ${n2} = ?`;
      answer = n1 - n2;
    } else if(t === 'multiplication'){
      n1 = (Math.random() > 0.5 ? -1 : 1) * (Math.floor(Math.random()*8)+2);
      n2 = (Math.random() > 0.5 ? -1 : 1) * (Math.floor(Math.random()*8)+2);
      expr = `${n1} × ${n2} = ?`;
      answer = n1 * n2;
    } else {
      const start = (Math.random() > 0.5 ? -1 : 1) * (Math.floor(Math.random()*10)+1);
      const diff = (Math.random() > 0.5 ? -1 : 1) * (Math.floor(Math.random()*5)+1);
      expr = `Sequence: ${start}, ${start + diff}, ${start + 2*diff}, ?, ?`;
      answer = start + 3*diff;
    }
    return {expr, answer, parts: null};
  } else if(topic === 'powers-roots'){
    const types = ['square', 'cube', 'power', 'square-root', 'cube-root'];
    const t = types[Math.floor(Math.random()*types.length)];
    
    if(t === 'square'){
      const n = Math.floor(Math.random()*12)+2;
      expr = `${n}² = ?`;
      answer = n * n;
    } else if(t === 'cube'){
      const n = Math.floor(Math.random()*6)+2;
      expr = `${n}³ = ?`;
      answer = n * n * n;
    } else if(t === 'power'){
      const base = Math.floor(Math.random()*6)+2;
      const exp = Math.floor(Math.random()*3)+2;
      expr = `${base}^${exp} = ?`;
      answer = Math.pow(base, exp);
    } else if(t === 'square-root'){
      const n = Math.floor(Math.random()*13)+2;
      expr = `√${n*n} = ?`;
      answer = n;
    } else {
      const n = Math.floor(Math.random()*5)+2;
      expr = `∛${n*n*n} = ?`;
      answer = n;
    }
    return {expr, answer, parts: null};
  } else if(topic === 'bidmas'){
    const types = ['brackets', 'order', 'mixed'];
    const t = types[Math.floor(Math.random()*types.length)];
    let n1, n2, n3, n4;
    
    if(t === 'brackets'){
      n1 = Math.floor(Math.random()*6)+2;
      n2 = Math.floor(Math.random()*6)+2;
      n3 = Math.floor(Math.random()*6)+2;
      expr = `(${n1} + ${n2}) × ${n3} = ?`;
      answer = (n1 + n2) * n3;
    } else if(t === 'order'){
      n1 = Math.floor(Math.random()*6)+2;
      n2 = Math.floor(Math.random()*4)+2;
      n3 = Math.floor(Math.random()*6)+2;
      expr = `${n1} + ${n2} × ${n3} = ?`;
      answer = n1 + (n2 * n3);
    } else {
      n1 = Math.floor(Math.random()*4)+2;
      n2 = Math.floor(Math.random()*4)+2;
      n3 = Math.floor(Math.random()*4)+2;
      n4 = Math.floor(Math.random()*4)+1;
      expr = `(${n1} + ${n2}) × ${n3} ÷ ${n4} = ?`;
      answer = ((n1 + n2) * n3) / n4;
    }
    return {expr, answer, parts: null};
  } else if(topic === 'factors-multiples'){
    const types = ['factor', 'multiple', 'prime', 'prime-factorization'];
    const t = types[Math.floor(Math.random()*types.length)];
    
    if(t === 'factor'){
      const n = Math.floor(Math.random()*20)+10;
      const factors = [];
      for(let i = 1; i <= n; i++) if(n % i === 0) factors.push(i);
      expr = `How many factors does ${n} have?`;
      answer = factors.length;
    } else if(t === 'multiple'){
      const n = Math.floor(Math.random()*10)+3;
      const mult = Math.floor(Math.random()*4)+2;
      expr = `What is the ${mult}th multiple of ${n}?`;
      answer = n * mult;
    } else if(t === 'prime'){
      const candidates = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
      const num = candidates[Math.floor(Math.random()*candidates.length)];
      expr = `Is ${num} a prime number? (yes/no)`;
      answer = 'yes';
    } else {
      const nums = [12, 18, 20, 24, 30, 36, 40, 42];
      const n = nums[Math.floor(Math.random()*nums.length)];
      expr = `Find the prime factorization of ${n}`;
      answer = `prime factors of ${n}`;
    }
    return {expr, answer, parts: null};
  } else if(topic === 'coordinates'){
    const questionTypes = [
      {
        setup: () => {
          const x = Math.floor(Math.random()*6)-2;
          const y = Math.floor(Math.random()*6)-2;
          const bx = Math.floor(Math.random()*6)-3;
          const by = Math.floor(Math.random()*6)-4;
          const cx = Math.floor(Math.random()*6)+1;
          const cy = Math.floor(Math.random()*6)-3;
          return {
            points: {A: [x, y], B: [bx, by], C: [cx, cy]},
            parts: [
              {
                question: `(a) Plot the point with coordinates (${x}, ${y}). Label this point A.`,
                answer: `${x},${y}`
              },
              {
                question: `(b) Write down the coordinates of the midpoint of BC.`,
                answer: `${(bx+cx)/2},${(by+cy)/2}`
              }
            ]
          };
        }
      },
      {
        setup: () => {
          const ax = Math.floor(Math.random()*6)-2;
          const ay = Math.floor(Math.random()*6)+1;
          const bx = Math.floor(Math.random()*6)-3;
          const by = Math.floor(Math.random()*6)-2;
          return {
            points: {A: [ax, ay], B: [bx, by]},
            parts: [
              {
                question: `(a) Write down the coordinates of point A.`,
                answer: `${ax},${ay}`
              },
              {
                question: `(b) Write down the coordinates of the midpoint of AB.`,
                answer: `${(ax+bx)/2},${(ay+by)/2}`
              },
              {
                question: `(c) Write down the x-coordinate of point B.`,
                answer: bx
              }
            ]
          };
        }
      }
    ];
    
    const qtypeIdx = Math.floor(Math.random() * questionTypes.length);
    const qsetup = questionTypes[qtypeIdx].setup();
    
    const parts = qsetup.parts.map(p => ({...p}));
    
    return {
      expr: null,
      coords: qsetup.points,
      answer: null,
      parts: parts
    };
  } else if(topic === 'pictograms'){
    // Grade 1 • 1.13 pictogram/tally fault-finding: now includes a tally-only version matching the worksheet
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    const trueCounts = [11,13,9,11,9];
    const frequencies = [...trueCounts];

    const wrongIdx = Math.floor(Math.random()*days.length);
    frequencies[wrongIdx] = Math.max(1, frequencies[wrongIdx] + (Math.random()>0.5?1:-1));

    const tallyTable = {
      headers: ['Day','Tally','Frequency'],
      rows: days.map((d,i)=>({day: d, tallyCount: trueCounts[i], frequency: frequencies[i]})),
      isTally: true
    };

    const tableWithRoute = {route: 'Grade 1 • 1.13 Pictograms', ...tallyTable};
    const tallyScenario = 'The tally chart shows information about the number of ice creams sold by a shop last week.';
    const tallyPart = { question: 'Write down one thing that is wrong with the tally chart.', answer: `Row ${days[wrongIdx]} frequency does not match tally` };

    const variant = Math.random() < 0.5 ? 'tally-only' : 'tally-and-pictogram';

    if(variant === 'tally-only'){
      return {expr: tallyScenario, answer: null, parts: [tallyPart], table: tableWithRoute};
    }

    const keyVal = 3;
    const pictogramRows = days.map((d,i)=>{
      const exactSymbols = trueCounts[i] / keyVal;
      return [d, exactSymbols];
    });
    const picWrongIdx = Math.floor(Math.random()*days.length);
    pictogramRows[picWrongIdx][1] = Math.max(0.33, pictogramRows[picWrongIdx][1] + (Math.random()>0.5?0.5:-0.5));

    const pictogramTable = {
      key: keyVal,
      headers: ['Day', 'Circle'],
      rows: pictogramRows
    };

    expr = 'The tally chart shows the number of ice creams sold by a shop last week.';
    const parts = [
      tallyPart,
      { question: 'Write down one thing that is wrong with the pictogram.', answer: `Row ${days[picWrongIdx]} symbols do not match the key` }
    ];

    return {expr, answer: null, parts, table: tableWithRoute, extraTable: pictogramTable};
  } else {
    const ops = ['+','-','*'];
    op = ops[Math.floor(Math.random()*ops.length)];
    expr = `${a} ${op} ${b} = ?`;
    answer = eval(expr);
    return {expr, answer, parts: null};
  }
}

export default function Quiz({onBack, topic}){
  const [q, setQ] = useState(generateQuestion(topic));
  const [input, setInput] = useState('');
  const [partInputs, setPartInputs] = useState([]);
  const [score, setScore] = useState(0);
  const [asked, setAsked] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [currentPart, setCurrentPart] = useState(0);

  useEffect(()=>{ 
    setFeedback(''); 
    setInput(''); 
    if(q.parts && q.parts.length){
      setPartInputs(Array(q.parts.length).fill(''));
    } else {
      setPartInputs([]);
    }
  },[q]);

  const submit = () => {
    let correctAnswer;
    const hasParts = q.parts && q.parts.length > 0;
    if(hasParts){
      let localScore = 0;
      const normalize = (v) => String(v).replace(/\s/g,'').toLowerCase();

      const partFeedback = q.parts.map((p, idx) => {
        const expected = p.answer;
        const userVal = partInputs[idx];
        let correct = false;
        if (typeof expected === 'number' && Number.isFinite(expected)){
          const num = Number(userVal);
          correct = Number.isFinite(num) && Math.abs(num - expected) < 1e-9;
        } else {
          // Flexible text matching for descriptive answers
          const normalizedUser = normalize(userVal);
          const normalizedExpected = normalize(expected);
          
          // Check exact match first
          if (normalizedUser === normalizedExpected) {
            correct = true;
          } else if (expected.toLowerCase().includes('does not match') || expected.toLowerCase().includes('wrong')) {
            // For error-finding questions, check if answer contains key concepts
            const userLower = userVal.toLowerCase();
            const expectedLower = expected.toLowerCase();
            
            // Extract the day name from expected answer
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            const expectedDay = days.find(d => expectedLower.includes(d));
            
            // Check if user mentioned the correct day and the concept of mismatch
            if (expectedDay && userLower.includes(expectedDay)) {
              const hasMismatchConcept = userLower.includes('match') || 
                                        userLower.includes('wrong') || 
                                        userLower.includes('incorrect') ||
                                        userLower.includes('differ') ||
                                        userLower.includes('not');
              const hasFrequency = userLower.includes('frequency') || userLower.includes('freq');
              const hasTally = userLower.includes('tally') || userLower.includes('talli');
              
              if (hasMismatchConcept && (hasFrequency || hasTally)) {
                correct = true;
              }
            }
          } else {
            // Default exact normalized match
            correct = normalizedUser === normalizedExpected;
          }
        }
        if (correct) localScore += 1;
        return `${String.fromCharCode(97+idx)}) ${correct ? '✓' : `✗ (ans: ${expected})`}`;
      });

      setScore(s => s + localScore);
      setAsked(a => a + q.parts.length);
      setFeedback(partFeedback.join('   '));
      return;
    }

    correctAnswer = q.answer;
    
    if (typeof correctAnswer === 'number' && Number.isFinite(correctAnswer)) {
      const val = Number(input);
      if (!Number.isFinite(val)) { setFeedback('Please enter a number'); return; }
      if (Math.abs(val - correctAnswer) < 1e-9){ 
        setScore(s => s+1); 
        setFeedback('Correct!');
        setInput('');
        setAsked(a => a+1);
      } else {
        setFeedback(`Wrong — answer: ${correctAnswer}`);
        setAsked(a => a+1);
      }
      return;
    }

    const norm = (v) => String(v).replace(/\s/g,'').toLowerCase();
    const user = norm(input);
    const expected = norm(correctAnswer);
    if (user === expected) {
      setScore(s => s+1); 
      setFeedback('Correct!');
      setInput('');
      setAsked(a => a+1);
    } else {
      setFeedback(`Wrong — answer: ${correctAnswer}`);
      setAsked(a => a+1);
    }
  };

  const nextQuestion = () => {
    setFeedback('');
    setInput('');
    setQ(generateQuestion(topic));
    setCurrentPart(0);
  };

  const renderSymbols = (count, keyVal = 1) => {
    const fullCount = Math.floor(count);
    const decimal = count - fullCount;
    
    const items = [];
    
    const D = 30;  // diameter
    const R = 15;  // radius
    const B = 1.8; // border width
    const M = 7;   // margin

    // Draw full circles
    for(let i = 0; i < fullCount; i++){
      items.push(
        <View key={`full-${i}`} style={{width:D, height:D, marginRight:M, position:'relative'}}>
          <View style={{width:D, height:D, borderRadius:R, borderWidth:B, borderColor:'#000'}}/>
          <View style={{position:'absolute', left:R-(B/2), top:0, width:B, height:D, backgroundColor:'#000'}}/>
        </View>
      );
    }

    // Draw partial circle - all fractional values render as half circles
    if(decimal > 0.15){
      // Half circle with vertical line on right edge
      items.push(
        <View 
          key="partial" 
          style={{
            width: R,
            height: D,
            marginRight: M,
            overflow: 'hidden',
            borderRightWidth: B,
            borderRightColor: '#000'
          }}
        >
          <View style={{width:D, height:D, borderRadius:R, borderWidth:B, borderColor:'#000'}}/>
        </View>
      );
    }

    return (
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {items}
      </View>
    );
  };

  const isTimetable = q.table && q.table.allTimes;

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Quiz</Text>
      {isTimetable ? (
        <>
          <Text style={styles.routeTitle}>{q.table.route}</Text>
          {q.expr && <Text style={styles.scenario}>{q.expr}</Text>}
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.headerCell, {flex: 1}]}>
                <Text style={styles.headerText}>Station</Text>
              </View>
              {q.table.allTimes.map((_, idx) => (
                <View key={idx} style={[styles.tableCell, styles.headerCell, {flex: 1}]}>
                  <Text style={styles.headerText}>Train {idx + 1}</Text>
                </View>
              ))}
            </View>
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, {flex: 1}]}>
                <Text style={styles.cellText}>{q.table.stations[0]}</Text>
              </View>
              {q.table.allTimes.map((times, idx) => (
                <View key={idx} style={[styles.tableCell, {flex: 1}]}>
                  <Text style={styles.cellText}>{times[0]}</Text>
                </View>
              ))}
            </View>
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, {flex: 1}]}>
                <Text style={styles.cellText}>{q.table.stations[1]}</Text>
              </View>
              {q.table.allTimes.map((times, idx) => (
                <View key={idx} style={[styles.tableCell, {flex: 1}]}>
                  <Text style={styles.cellText}>{times[1]}</Text>
                </View>
              ))}
            </View>
          </View>
          {q.parts && q.parts.length > 0 && (
            <>
              <Text style={styles.partIndicator}>Answer the parts below:</Text>
              {q.parts.map((p, idx) => (
                <View key={idx} style={styles.partRow}>
                  <Text style={styles.partLabel}>{String.fromCharCode(97+idx)})</Text>
                  <Text style={[styles.question, {flex:1, marginVertical:6}]}>{p.question.replace(/^\(.[^)]+\)\s*/,'')}</Text>
                  <TextInput
                    style={[styles.input, {width: '35%', marginLeft:8}]}
                    value={partInputs[idx]}
                    onChangeText={(t)=> setPartInputs((arr)=>{ const copy=[...arr]; copy[idx]=t; return copy; })}
                    keyboardType={typeof p.answer === 'number' ? 'numeric' : 'default'}
                    placeholder='Answer'
                  />
                </View>
              ))}
            </>
          )}
        </>
      ) : q.table ? (
        <>
          {q.table.route && <Text style={styles.routeTitle}>{q.table.route}</Text>}
          {q.expr && <Text style={styles.scenario}>{q.expr}</Text>}
          <View style={styles.table}>
            {q.table.headers && (
              <View style={styles.tableRow}>
                {q.table.headers.map((header, idx) => {
                  // Ensure header column widths match body column widths for symmetry
                  const flexVal = q.table.isTally
                    ? ([1, 1.5, 1][idx] || 1)
                    : 1;
                  return (
                    <View key={idx} style={[styles.tableCell, styles.headerCell, {flex: flexVal}]}> 
                      <Text style={styles.headerText}>{header}</Text>
                    </View>
                  );
                })}
              </View>
            )}
            {q.table.rows && q.table.rows.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.tableRow}>
                {q.table.isTally ? (
                  <>
                    <View style={[styles.tableCell, {flex: 1}]}>
                      <Text style={styles.cellText}>{row.day}</Text>
                    </View>
                    <View style={[styles.tableCell, {flex: 1.5, alignItems: 'flex-start'}]}>
                      <TallyGroup count={row.tallyCount} />
                    </View>
                    <View style={[styles.tableCell, {flex: 1}]}>
                      <Text style={styles.cellText}>{row.frequency}</Text>
                    </View>
                  </>
                ) : (
                  row.map((cell, cellIdx) => (
                    <View key={cellIdx} style={[styles.tableCell, {flex: 1}]}> 
                      <Text style={styles.cellText}>{cell}</Text>
                    </View>
                  ))
                )}
              </View>
            ))}
          </View>
          {/* Part (a) directly below the tally table */}
          {q.table.isTally && q.parts && q.parts.length > 0 && (
            <View style={{width:'95%'}}>
              <Text style={styles.partIndicator}>Answer the part below:</Text>
              <View style={styles.partRow}>
                <Text style={styles.partLabel}>a)</Text>
                <Text style={[styles.question, {flex:1, marginVertical:6}]}>{q.parts[0].question.replace(/^\(.[^)]+\)\s*/,'')}</Text>
                <TextInput
                  style={[styles.input, {width: '35%', marginLeft:8}]}
                  value={partInputs[0]}
                  onChangeText={(t)=> setPartInputs((arr)=>{ const copy=[...arr]; copy[0]=t; return copy; })}
                  keyboardType={typeof q.parts[0].answer === 'number' ? 'numeric' : 'default'}
                  placeholder='Answer'
                />
              </View>
            </View>
          )}
          {q.extraTable && (
            <>
              <Text style={[styles.scenario, {marginTop:70}]}>The pictogram shows the number of chocolate bars sold.</Text>
              <View style={{flexDirection:'row', width:'100%', alignItems:'flex-start', justifyContent:'center', marginTop:12}}>
                <View style={{width:100}}></View>
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    {q.extraTable.headers.map((header, idx) => (
                      <View key={idx} style={[styles.tableCell, styles.headerCell, {flex: idx === 0 ? 1 : 2}]}> 
                        <Text style={styles.headerText}>{header}</Text>
                      </View>
                    ))}
                  </View>
                  {q.extraTable.rows.map((row, rowIdx) => (
                    <View key={rowIdx} style={styles.tableRow}>
                      <View style={[styles.tableCell, {flex:1}]}> 
                        <Text style={styles.cellText}>{row[0]}</Text>
                      </View>
                      <View style={[styles.tableCell, {flex:2}]}> 
                        {renderSymbols(row[1], q.extraTable.key)}
                      </View>
                    </View>
                  ))}
                </View>
                <View style={{width:200, paddingLeft:40, paddingTop:70}}>
                  <View style={{borderWidth:1.5, borderColor:'#666', backgroundColor:'#e8f0ff', padding:10}}>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                      <View style={{position:'relative', width:32, height:32, marginRight:12}}>
                        <View style={{width:32, height:32, borderRadius:16, borderWidth:1.5, borderColor:'#000'}}></View>
                        <View style={{position:'absolute', left:15.25, top:0, width:1.5, height:32, backgroundColor:'#000'}}></View>
                      </View>
                      <View style={{flex:1}}>
                        <Text style={{fontSize:14, fontWeight:'bold', color:'#333', marginBottom:4}}>Key:</Text>
                        <Text style={{fontSize:13, color:'#333', lineHeight:18}}>Represents {q.extraTable.key}{'\n'}chocolate bars</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              {q.parts && q.parts.length > 1 && (
                <View style={{width:'95%'}}>
                  <Text style={styles.partIndicator}>Answer the parts below:</Text>
                  {q.parts.slice(1).map((p, idx) => (
                    <View key={idx+1} style={styles.partRow}>
                      <Text style={styles.partLabel}>{String.fromCharCode(98+idx)})</Text>
                      <Text style={[styles.question, {flex:1, marginVertical:6}]}>{p.question.replace(/^\(.[^)]+\)\s*/,'')}</Text>
                      <TextInput
                        style={[styles.input, {width: '35%', marginLeft:8}]}
                        value={partInputs[idx+1]}
                        onChangeText={(t)=> setPartInputs((arr)=>{ const copy=[...arr]; copy[idx+1]=t; return copy; })}
                        keyboardType={typeof p.answer === 'number' ? 'numeric' : 'default'}
                        placeholder='Answer'
                      />
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </>
      ) : q.parts && q.parts.length > 0 ? (
        <>
          {q.expr && <Text style={styles.scenario}>{q.expr}</Text>}
          {q.coords && <Grid points={q.coords} min={-5} max={5} width={300} height={300} />}
          {q.parts.map((p, idx) => (
            <View key={idx} style={styles.partRow}>
              <Text style={styles.partLabel}>{String.fromCharCode(97+idx)})</Text>
              <Text style={[styles.question, {flex:1, marginVertical:6}]}>{p.question.replace(/^\(.[^)]+\)\s*/,'')}</Text>
              <TextInput
                style={[styles.input, {width: '25%', marginLeft:8}]}
                value={partInputs[idx]}
                onChangeText={(t)=> setPartInputs((arr)=>{ const copy=[...arr]; copy[idx]=t; return copy; })}
                keyboardType={typeof p.answer === 'number' ? 'numeric' : 'default'}
                placeholder='Answer'
              />
            </View>
          ))}
        </>
      ) : q.fraction || q.fractionList || q.fraction1 || q.targetFraction ? (
        <View style={{alignItems: 'center', marginVertical: 15, width: '100%'}}>
          {q.expr === 'Simplify' && (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.question}>Simplify </Text>
              <Fraction numerator={q.fraction.num} denominator={q.fraction.denom} size={18} />
            </View>
          )}
          {q.expr === 'equivalent' && (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Fraction numerator={q.fraction1.num} denominator={q.fraction1.denom} size={18} />
              <Text style={styles.question}> = </Text>
              <Fraction numerator={q.fraction2.num} denominator={q.fraction2.denom} size={18} />
            </View>
          )}
          {q.expr === 'compare' && (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.question}>Which is larger: </Text>
              <Fraction numerator={q.fraction1.num} denominator={q.fraction1.denom} size={18} />
              <Text style={styles.question}> or </Text>
              <Fraction numerator={q.fraction2.num} denominator={q.fraction2.denom} size={18} />
              <Text style={styles.question}>?</Text>
            </View>
          )}
          {q.expr === 'non-equivalent' && q.targetFraction && (
            <View style={{alignItems: 'center', width: '100%'}}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                <Text style={styles.question}>One of these fractions is not equivalent to </Text>
                <Fraction numerator={q.targetFraction.num} denominator={q.targetFraction.denom} size={16} />
              </View>
              <Text style={styles.question}>Write down this fraction.</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10}}>
                {q.fractionList.map((f, idx) => (
                  <View key={idx} style={{margin: 8}}>
                    <Fraction numerator={f.num} denominator={f.denom} size={16} />
                  </View>
                ))}
              </View>
            </View>
          )}
          {q.expr === 'ordering' && (
            <View style={{alignItems: 'center', width: '100%'}}>
              <Text style={styles.question}>Write the following fractions in order of size.</Text>
              <Text style={[styles.question, {fontSize: 14}]}>Start with the smallest fraction.</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10}}>
                {q.fractionList.map((f, idx) => (
                  <View key={idx} style={{margin: 8}}>
                    <Fraction numerator={f.num} denominator={f.denom} size={16} />
                  </View>
                ))}
              </View>
            </View>
          )}
          {q.expr === 'closer-to' && (
            <View style={{alignItems: 'center', width: '100%'}}>
              <Text style={styles.question}>Work out which of the fractions is closer to {q.targetValue}</Text>
              <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
                <View style={{margin: 8}}>
                  <Fraction numerator={q.fraction1.num} denominator={q.fraction1.denom} size={18} />
                </View>
                <Text style={{fontSize: 18, marginHorizontal: 10}}>or</Text>
                <View style={{margin: 8}}>
                  <Fraction numerator={q.fraction2.num} denominator={q.fraction2.denom} size={18} />
                </View>
              </View>
            </View>
          )}
        </View>
      ) : q.table && !q.parts ? (
        <>
          <Text style={styles.scenario}>{q.expr}</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {q.table.headers.map((header, idx) => (
                <View key={idx} style={[styles.tableCell, styles.headerCell, {flex: 1}]}>
                  <Text style={styles.headerText}>{header}</Text>
                </View>
              ))}
            </View>
            {q.table.rows.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.tableRow}>
                {row.map((cell, cellIdx) => (
                  <View key={cellIdx} style={[styles.tableCell, {flex: 1}]}>
                    <Text style={styles.cellText}>{cell}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.question}>{q.expr}</Text>
      )}
      {! (q.parts && q.parts.length) && (
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          keyboardType={(typeof q.answer === 'number') ? 'numeric' : 'default'}
          placeholder='Your answer'
          editable={!feedback}
        />
      )}
      {!feedback ? (
        <TouchableOpacity style={styles.btn} onPress={submit}>
          <Text style={styles.btnt}>Submit</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.btn} onPress={nextQuestion}>
          <Text style={styles.btnt}>Next Question</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.feedback}>{feedback}</Text>
      <Text style={styles.stat}>Score: {score} / {asked}</Text>
      <TouchableOpacity onPress={onBack} style={styles.link}><Text style={styles.linkt}>Back</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root:{alignItems:'center', paddingHorizontal:10, overflow:'visible'},
  title:{fontSize:24,fontWeight:'700',marginBottom:10},
  routeTitle:{fontSize:18,fontWeight:'600',marginTop:10,marginBottom:12,color:'#333'},
  table:{marginVertical:16,borderWidth:2,borderColor:'#999',overflow:'visible',minWidth:'40%',maxWidth:'40%'}, 
  tableRow:{flexDirection:'row',width:'100%'},
  tableCell:{borderRightWidth:2,borderBottomWidth:2,borderColor:'#999',padding:18,justifyContent:'center',alignItems:'center',minHeight:68},
  headerCell:{backgroundColor:'#e8f0fe'},
  headerText:{fontWeight:'700',fontSize:18,textAlign:'center'},
  cellText:{fontSize:17,textAlign:'center',fontWeight:'500'},
  scenario:{fontSize:16, marginVertical:10, lineHeight:24, textAlign:'left', width:'90%', color:'#444', fontWeight:'500'},
  question:{fontSize:18, marginVertical:15, lineHeight:26, textAlign:'left', width:'90%'},
  partIndicator:{fontSize:12, color:'#666', marginBottom:10, textAlign:'left'},
  input:{borderWidth:1,borderColor:'#ccc',width:'60%',padding:8,borderRadius:6,textAlign:'center'},
  btn:{backgroundColor:'#28a745',padding:10,borderRadius:6,marginTop:10,width:'60%'},
  btnt:{color:'#fff',textAlign:'center',fontWeight:'600'},
  feedback:{marginTop:12,color:'#333'},
  stat:{marginTop:8,color:'#666'},
  link:{marginTop:20},
  linkt:{color:'#007bff'},
  partRow:{flexDirection:'row',alignItems:'center',width:'95%', marginBottom:8},
  partLabel:{width:20, fontWeight:'700', textAlign:'right', marginRight:6}
});