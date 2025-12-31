import React, {useState, useEffect, useRef} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, PanResponder, Animated } from 'react-native';
import Grid from './Grid';

// Convert caret-style exponents (e.g. "5^3") into Unicode superscript characters (e.g. "5³")
const formatSuperscripts = (text) => {
  if (typeof text !== 'string') return text;
  const map = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻' };
  // Replace caret-style exponents with superscripts and show × for multiplication
  let out = text.replace(/\^(-?\d+)/g, (_, exp) => {
    return exp.split('').map(c => map[c] || c).join('');
  });
  try {
    out = out.replace(/\*/g, '×');
  } catch (_) {}
  return out;
};

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
    scaleX: 2.8,            // Horizontal stretch (increase to stretch wider)
    scaleY: 2,            // Vertical stretch (increase to stretch taller)
    rotateZ: 12,             // Rotation in degrees (optional)
    offsetTop: 10,          // Vertical offset
    offsetLeft: 10.5          // Horizontal offset
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
function Fraction({numerator, denominator, size = 22}) {
  const renderPart = (val) => {
    if (typeof val === 'string' && /^[xX]$/.test(val)) {
      return <Text style={{fontSize: size, fontStyle: 'italic', fontWeight: '700', fontFamily: 'Times New Roman'}}>{val}</Text>;
    }
    return <Text style={{fontSize: size, fontWeight: '500', fontFamily: 'Times New Roman'}}>{val}</Text>;
  };

  return (
    <View style={{alignItems: 'center', marginHorizontal: 6}}>
      {renderPart(numerator)}
      <View style={{height: 1.8, backgroundColor: '#000', width: Math.max(String(numerator).length, String(denominator).length) * size * 0.6, marginVertical: 4}} />
      {renderPart(denominator)}
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
        // use 'x' as the unknown variable
        fraction2: {num: 'x', denom: denom * factor},
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
    } else if(t === 'equivalent'){
      const num = Math.floor(Math.random()*6)+2;
      const denom = Math.floor(Math.random()*6)+3;
      const factor = Math.floor(Math.random()*4)+2;
      return {
        expr: 'equivalent',
        fraction1: {num, denom},
        // use 'x' as the unknown variable
        fraction2: {num: 'x', denom: denom * factor},
        answer: num * factor,
        parts: null
      };
      
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
      // Decide whether to ask to start with smallest or biggest
      const orderDirection = Math.random() > 0.5 ? 'smallest' : 'biggest';
      const ascending = fractions.map(f => `${f.num}/${f.denom}`);
      const answer = orderDirection === 'smallest' ? ascending.join(',') : ascending.reverse().join(',');

      // Shuffle for display
      const shuffled = [...fractions].sort(() => Math.random() - 0.5);

      return {
        expr: 'ordering',
        fractionList: shuffled.map(f => ({num: f.num, denom: f.denom})),
        answer: answer,
        orderDirection: orderDirection,
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
    // Grade 1 • 1.13 pictogram/tally questions with variety
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    
    // Varied contexts for questions
    const contexts = [
      { item: 'ice creams', location: 'a shop', itemPlural: 'ice creams' },
      { item: 'chocolate bars', location: 'a store', itemPlural: 'chocolate bars' },
      { item: 'books', location: 'a library', itemPlural: 'books' },
      { item: 'toys', location: 'a toy shop', itemPlural: 'toys' },
      { item: 'pencils', location: 'a stationery store', itemPlural: 'pencils' },
      { item: 'stickers', location: 'a shop', itemPlural: 'stickers' },
      { item: 'cupcakes', location: 'a bakery', itemPlural: 'cupcakes' },
      { item: 'flowers', location: 'a flower shop', itemPlural: 'flowers' }
    ];
    const context = contexts[Math.floor(Math.random() * contexts.length)];
    
    // More varied frequencies
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
    const tallyScenario = `The tally chart shows information about the number of ${context.itemPlural} sold by ${context.location} last week.`;
    const tallyPart = { question: 'Write down one thing that is wrong with the tally chart.', answer: `Row ${days[wrongIdx]} frequency does not match tally` };

    const variant = Math.random() < 0.17 ? 'tally-only' : (Math.random() < 0.25 ? 'tally-and-pictogram' : (Math.random() < 0.35 ? 'completion' : (Math.random() < 0.5 ? 'pictogram-with-clues' : (Math.random() < 0.7 ? 'multi-part-pictogram' : 'pictogram-with-calculation'))));

    if(variant === 'tally-only'){
      return {expr: tallyScenario, answer: null, parts: [tallyPart], table: tableWithRoute};
    } else if(variant === 'multi-part-pictogram'){
      // Multi-part pictogram: (a) read value, (b) complete empty row, (c) calculate total
      const months = ['January', 'February', 'March', 'April'];
      const keyValMulti = 8; // Key: 1 square = 8 books
      
      // Randomly select which 3 months will be pre-filled (1 will be empty)
      const allIndices = [0, 1, 2, 3];
      const shuffledIndices = allIndices.sort(() => Math.random() - 0.5);
      const prefilledIndices = shuffledIndices.slice(0, 3).sort((a, b) => a - b);
      const emptyIndex = shuffledIndices[3];
      
      // Generate counts with variation including halves and quarters
      const squareVariations = [
        1, 1.5, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.5, 5
      ];
      
      const multiCounts = [];
      // For each pre-filled month, randomly select from variations
      for (let i = 0; i < 3; i++) {
        multiCounts.push(squareVariations[Math.floor(Math.random() * squareVariations.length)]);
      }
      
      const multiBookCounts = multiCounts.map(c => c * keyValMulti);
      
      // Generate empty month count with variation
      const emptyMonthSquares = squareVariations[Math.floor(Math.random() * squareVariations.length)];
      const emptyMonthBooks = emptyMonthSquares * keyValMulti;
      
      // Create pictogram rows with random positioning
      const multiPictogramRows = months.map((month, idx) => {
        const prefilledPosition = prefilledIndices.indexOf(idx);
        if (prefilledPosition !== -1) {
          return [month, multiCounts[prefilledPosition]];
        } else {
          return [month, null]; // Empty row
        }
      });
      
      const multiPictogramTable = {
        key: keyValMulti,
        headers: ['Day', 'Square'],
        rows: multiPictogramRows,
        isIncomplete: true,
        hasQuarters: true,
        title: `The pictogram shows information about the number of ${context.itemPlural} sold by an author in ${prefilledIndices.map(i => months[i]).join(', ').replace(/, ([^,]*)$/, ' and $1')}.`
      };
      
      const totalBooks = multiBookCounts.reduce((sum, c) => sum + c, 0) + emptyMonthBooks;
      
      // Pick one of the pre-filled months for part (a) question
      const readMonthIdx = prefilledIndices[Math.floor(Math.random() * prefilledIndices.length)];
      const readMonthPosition = prefilledIndices.indexOf(readMonthIdx);
      
      const multiExpr = `The pictogram shows information about the number of ${context.itemPlural} sold by an author in ${prefilledIndices.map(i => months[i]).join(', ').replace(/, ([^,]*)$/, ' and $1')}.`;
      const multiParts = [
        { question: `Write down the number of ${context.itemPlural} sold in ${months[readMonthIdx]}`, answer: multiBookCounts[readMonthPosition] },
        { question: `${emptyMonthBooks} ${context.itemPlural} were sold in ${months[emptyIndex]}, show this information on the pictogram.`, answer: `${months[emptyIndex]}=${emptyMonthSquares}` },
        { question: `What was the total number of ${context.itemPlural} sold in these four months?`, answer: totalBooks }
      ];
      
      return {
        expr: multiExpr,
        answer: null,
        parts: multiParts,
        extraTable: multiPictogramTable,
        context,
        questionType: 'multi-part-pictogram',
        aprilInfo: { month: months[emptyIndex], books: emptyMonthBooks, squares: emptyMonthSquares }
      };
    } else if(variant === 'pictogram-with-calculation'){
      // Pictogram with calculation: (a)(i) and (ii) read values, then use math clue to complete remaining rows
      const calcDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
      
      // Randomly select which 2 days will be pre-filled (the other 2 will need completion)
      const prefilledIndices = [];
      const emptyIndices = [];
      
      // Generate random selection of 2 pre-filled and 2 empty days
      const shuffledIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
      prefilledIndices.push(shuffledIndices[0], shuffledIndices[1]);
      emptyIndices.push(shuffledIndices[2], shuffledIndices[3]);
      
      // Sort to maintain day order
      prefilledIndices.sort((a, b) => a - b);
      emptyIndices.sort((a, b) => a - b);
      
      const keyValCalc = [6, 8, 10, 12][Math.floor(Math.random() * 4)]; // Random even key
      
      // More variation in circle counts for first 2 days
      const circleVariations = [
        [1, 2], [1, 2.5], [1, 3], [1, 3.5],
        [1.5, 2], [1.5, 2.5], [1.5, 3], [1.5, 3.5],
        [2, 3], [2, 3.5], [2, 4],
        [2.5, 3], [2.5, 3.5], [2.5, 4],
        [1, 4], [1.5, 4], [2, 4.5], [2.5, 4.5],
        [3, 4], [3, 4.5], [3.5, 4.5]
      ];
      
      const selectedVariation = circleVariations[Math.floor(Math.random() * circleVariations.length)];
      const day1Circles = selectedVariation[0];
      const day2Circles = selectedVariation[1];
      
      const day1Count = day1Circles * keyValCalc;
      const day2Count = day2Circles * keyValCalc;
      
      // Generate day 3 and day 4 with mathematical relationship
      // Day3 + Day4 = total, and Day4 = multiplier × Day3
      const multiplier = [2, 3, 4][Math.floor(Math.random() * 3)];
      
      // More variation in totals based on key value
      const possibleTotals = keyValCalc === 6 ? [18, 24, 30, 36, 42, 48] :
                             keyValCalc === 8 ? [16, 24, 32, 40, 48] :
                             keyValCalc === 10 ? [20, 30, 40, 50, 60] :
                             [24, 36, 48, 60, 72];
      
      const total = possibleTotals[Math.floor(Math.random() * possibleTotals.length)];
      const day3Count = total / (multiplier + 1);
      const day4Count = day3Count * multiplier;
      const day3Circles = day3Count / keyValCalc;
      const day4Circles = day4Count / keyValCalc;
      
      // Create pictogram rows with varied day positions
      const calcPictogramRows = calcDays.map((day, idx) => {
        if (idx === prefilledIndices[0]) return [day, day1Circles];
        if (idx === prefilledIndices[1]) return [day, day2Circles];
        return [day, null]; // Empty rows for completion
      });
      
      const calcPictogramTable = {
        key: keyValCalc,
        headers: ['Day', 'Circle'],
        rows: calcPictogramRows,
        isIncomplete: true,
        hasQuarters: false
      };
      
      const calcExpr = `The pictogram shows information about the number of ${context.itemPlural} sold by ${context.location} on ${calcDays[prefilledIndices[0]]} and ${calcDays[prefilledIndices[1]]}.`;
      const calcClue = `On ${calcDays[emptyIndices[0]]} and ${calcDays[emptyIndices[1]]} a total of ${total} ${context.itemPlural} were sold. The number of ${context.itemPlural} sold on ${calcDays[emptyIndices[1]]} was ${multiplier} times the number of ${context.itemPlural} sold on ${calcDays[emptyIndices[0]]}.`;
      
      const calcParts = [
        { 
          question: `Write down the number of ${context.itemPlural} sold`, 
          subParts: [
            { question: `On ${calcDays[prefilledIndices[0]]}`, answer: day1Count },
            { question: `On ${calcDays[prefilledIndices[1]]}`, answer: day2Count }
          ]
        },
        { question: 'Use this information to complete the pictogram.', answer: `${calcDays[emptyIndices[0]]}=${day3Circles},${calcDays[emptyIndices[1]]}=${day4Circles}` }
      ];
      
      return {
        expr: calcExpr,
        answer: null,
        parts: calcParts,
        extraTable: calcPictogramTable,
        context,
        questionType: 'pictogram-with-calculation',
        clueText: calcClue,
        calculationInfo: {
          day3: calcDays[emptyIndices[0]],
          day4: calcDays[emptyIndices[1]],
          day3Circles: day3Circles,
          day4Circles: day4Circles
        }
      };
    } else if(variant === 'pictogram-with-clues'){
      // New variant: incomplete pictogram with text clues
      const cluesDays = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
      const possibleKeys = [2, 6, 8, 10, 12]; // Even numbers excluding 4
      const keyValClues = possibleKeys[Math.floor(Math.random() * possibleKeys.length)];
      
      // Generate counts - exactly 2 days will need half circles, rest are whole numbers
      const cluesCounts = [];
      let halfCircleDaysAdded = 0;
      
      for(let i = 0; i < cluesDays.length; i++) {
        const needsHalfCircle = halfCircleDaysAdded < 2 && (Math.random() < 0.4 || (i >= 3 && halfCircleDaysAdded < 2));
        
        if(needsHalfCircle) {
          // Generate count that results in X.5 symbols (half circle at end)
          const numWholeSymbols = Math.floor(Math.random() * 4) + 1; // 1-4 whole circles
          cluesCounts.push(numWholeSymbols * keyValClues + keyValClues / 2); // Add half
          halfCircleDaysAdded++;
        } else {
          // Generate count that results in whole circles only
          const numSymbols = Math.floor(Math.random() * 4) + 2; // 2-5 whole symbols
          cluesCounts.push(numSymbols * keyValClues);
        }
      }
      
      // Decide which days are pre-filled (2-3 days)
      const numPrefilledDays = Math.floor(Math.random() * 2) + 2; // 2 or 3 days
      const prefilledIndices = [];
      while(prefilledIndices.length < numPrefilledDays) {
        const idx = Math.floor(Math.random() * 5);
        if(!prefilledIndices.includes(idx)) {
          prefilledIndices.push(idx);
        }
      }
      
      // Create pictogram rows
      const pictogramCluesRows = cluesDays.map((d, i) => {
        if(prefilledIndices.includes(i)) {
          return [d, cluesCounts[i] / keyValClues]; // Pre-filled with correct symbols
        }
        return [d, null]; // Empty, needs drag-and-drop
      });
      
      const pictogramCluesTable = {
        key: keyValClues,
        headers: ['Day', 'Circle'],
        rows: pictogramCluesRows,
        isIncomplete: true,
        hasQuarters: true // No quarters - whole circles only
      };
      
      // Generate text clues
      const emptyDayIndices = cluesDays.map((d, i) => i).filter(i => !prefilledIndices.includes(i));
      
      // Calculate total for filled days
      const totalFilledDays = prefilledIndices.reduce((sum, idx) => sum + cluesCounts[idx], 0);
      
      // Text clues format: "A total of X items were sold on [filled days]. Y items on [day1]. Z items on [day2]."
      const filledDayNames = prefilledIndices.map(idx => cluesDays[idx]).join(', ').replace(/, ([^,]*)$/, ' and $1');
      const cluesText = [];
      cluesText.push(`A total of ${totalFilledDays} ${context.itemPlural} were sold on ${filledDayNames}.`);
      
      // Add individual day clues for empty days
      emptyDayIndices.forEach(idx => {
        cluesText.push(`${cluesCounts[idx]} ${context.itemPlural} were sold on ${cluesDays[idx]}.`);
      });
      
      const cluesExpr = `This incomplete pictogram shows information about the number of ${context.itemPlural} sold by ${context.location} on Monday, Tuesday and Wednesday.`;
      
      return {
        expr: cluesExpr,
        answer: null,
        parts: [{ 
          question: 'Use the information to complete the pictogram.', 
          answer: emptyDayIndices.map(idx => `${cluesDays[idx]}=${cluesCounts[idx]/keyValClues}`).join(',')
        }],
        extraTable: pictogramCluesTable,
        context,
        cluesText,
        questionType: 'pictogram-with-clues'
      };
    } else if(variant === 'completion'){
      // Completion question with randomization
      const completionDays = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
      
      // Generate drastically different random frequencies (range 3-19)
      const completionCounts = completionDays.map(() => Math.floor(Math.random() * 17) + 3);
      
      // Randomly decide which days need tally drag-and-drop (1-3 days)
      const numDragDays = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 days
      const dragDayIndices = [];
      while(dragDayIndices.length < numDragDays) {
        const idx = Math.floor(Math.random() * 5);
        if(!dragDayIndices.includes(idx)) {
          dragDayIndices.push(idx);
        }
      }
      
      // Ensure at least one day is complete (has both tally and frequency)
      let completeDayIdx = Math.floor(Math.random() * 5);
      while(dragDayIndices.includes(completeDayIdx)) {
        completeDayIdx = Math.floor(Math.random() * 5);
      }
      
      // Create incomplete tally table
      const incompleteTallyRows = completionDays.map((d,i)=>{
        if(i === completeDayIdx) {
          // One day is complete (reference)
          return {day: d, tallyCount: completionCounts[i], frequency: completionCounts[i]};
        } else if(dragDayIndices.includes(i)) {
          // Days that need tally drag-and-drop
          return {day: d, tallyCount: null, frequency: completionCounts[i]};
        } else {
          // Days that need frequency input
          return {day: d, tallyCount: completionCounts[i], frequency: null};
        }
      });
      
      const incompleteTallyTable = {
        headers: ['Day','Tally','Frequency'],
        rows: incompleteTallyRows,
        isTally: true,
        isCompletion: true
      };
      
      const tableWithRouteCompletion = {route: 'Grade 1 • 1.13 Pictograms', ...incompleteTallyTable};
      
      // Create incomplete pictogram (only one day filled)
      const keyValComp = 2; // Key value is always 2
      const incompletePictogramRows = completionDays.map((d,i)=>{
        if(i === completeDayIdx) return [d, completionCounts[i] / keyValComp];
        return [d, null];
      });
      
      const incompletePictogramTable = {
        key: keyValComp,
        headers: ['Day', 'Circle'],
        rows: incompletePictogramRows,
        isIncomplete: true,
        hasQuarters: false // No quarters for completion questions - only full and half circles
      };
      
      const completionExpr = `The incomplete table show information about the number of ${context.itemPlural} sold by ${context.location} last week.`;
      const completionParts = [
        { question: 'Complete the tally chart.', answer: completionCounts.map((c,i) => `${completionDays[i]}=${c}`).join(',') },
        { question: `Complete the pictogram to represent the ${context.item} sales`, answer: completionCounts.map((c,i) => `${completionDays[i]}=${c/keyValComp}`).join(',') }
      ];
      
      return {expr: completionExpr, answer: null, parts: completionParts, table: tableWithRouteCompletion, extraTable: incompletePictogramTable, context};
    }

    const keyVal = 3;
    const picWrongIdx = Math.floor(Math.random()*days.length);
    const pictogramRows = days.map((d,i)=>{
      if(i === picWrongIdx) {
        // Error day: intentionally wrong - show half circle (0.5 off from correct)
        const correctCount = Math.round(trueCounts[i] / keyVal);
        return [d, correctCount + 0.5];
      } else {
        // Correct days: round to whole numbers
        return [d, Math.round(trueCounts[i] / keyVal)];
      }
    });

    const pictogramTable = {
      key: keyVal,
      headers: ['Day', 'Circle'],
      rows: pictogramRows
    };

    expr = `The tally chart shows the number of ${context.itemPlural} sold by ${context.location} last week.`;
    const parts = [
      tallyPart,
      { question: 'Write down one thing that is wrong with the pictogram.', answer: `Row ${days[picWrongIdx]} symbols do not match the key` }
    ];

    return {expr, answer: null, parts, table: tableWithRoute, extraTable: pictogramTable, context};
  }
  
  // ========== GRADE 2 TOPICS ==========
  
  else if(topic === 'calculation-problems'){
    // 2.1 Calculation Problems - Multi-step word problems
    const problems = [
      () => {
        // Q1: Sausage rolls change problem
        const rolls = Math.floor(Math.random() * 4) + 5; // 5-8 rolls
        const priceP = Math.floor(Math.random() * 30) + 70; // 70-99p
        const payment = 20;
        const cost = (rolls * priceP) / 100;
        const change = payment - cost;
        return {
          expr: `${pick(['Amelia', 'Sarah', 'Emma'])} wants to buy ${rolls} sausage rolls. Each sausage roll costs ${priceP}p. She pays with a £${payment} note. Work out how much change she will get from £${payment}.`,
          answer: parseFloat(change.toFixed(2))
        };
      },
      () => {
        // Q2: Chocolate bars change
        const budget = Math.floor(Math.random() * 3) + 4; // £4-£6
        const pricePerBar = (Math.floor(Math.random() * 20) + 30) / 100; // £0.30-£0.49
        const canBuy = Math.floor(budget / pricePerBar);
        const spent = canBuy * pricePerBar;
        const change = budget - spent;
        return {
          expr: `${pick(['Ava', 'Olivia', 'Sophie'])} wants to buy as many chocolate bars as she can. She has £${budget} to spend. Each chocolate bar costs £${pricePerBar.toFixed(2)}. Work out how much change she will get from £${budget}.`,
          answer: parseFloat(change.toFixed(2))
        };
      },
      () => {
        // Q3: Pens with change
        const pens = Math.floor(Math.random() * 3) + 5; // 5-7 pens
        const priceP = Math.floor(Math.random() * 15) + 25; // 25-39p
        const payment = 10;
        const cost = (pens * priceP) / 100;
        const change = payment - cost;
        return {
          expr: `${pick(['Mason', 'Jack', 'Oliver'])} wants to buy ${pens} pens. Each pen costs ${priceP}p. He pays with a £${payment} note. Work out how much change he will get from £${payment}.`,
          answer: parseFloat(change.toFixed(2))
        };
      },
      () => {
        // Q4: Bulk stationery purchase
        const qty = 30;
        const pensFor = 5;
        const pensPrice = (Math.floor(Math.random() * 20) + 75) / 100; // £0.75-£0.94
        const rulersFor = 10;
        const rulersPrice = (Math.floor(Math.random() * 50) + 240) / 100; // £2.40-£2.89
        const pencilsFor = 6;
        const pencilsPrice = (Math.floor(Math.random() * 15) + 48) / 100; // £0.48-£0.62
        const calcPrice = (Math.floor(Math.random() * 100) + 600) / 100; // £6.00-£6.99
        
        const pensCost = (qty / pensFor) * pensPrice;
        const rulersCost = (qty / rulersFor) * rulersPrice;
        const pencilsCost = (qty / pencilsFor) * pencilsPrice;
        const calcsCost = qty * calcPrice;
        const total = pensCost + rulersCost + pencilsCost + calcsCost;
        
        return {
          expr: `${pick(['Mr Blair', 'Mr Smith', 'Mrs Jones'])} buys ${qty} pens, ${qty} rulers, ${qty} pencils and ${qty} calculators.\n\nPrice List:\nPens: ${pensFor} for ${pensPrice.toFixed(2)}p\nRulers: ${rulersFor} for £${rulersPrice.toFixed(2)}\nPencils: ${pencilsFor} for ${pencilsPrice.toFixed(2)}p\nCalculators: £${calcPrice.toFixed(2)} each\n\nWhat is the total amount of money spent?`,
          answer: parseFloat(total.toFixed(2))
        };
      },
      () => {
        // Q5: Car monthly payments
        const carPrice = Math.floor(Math.random() * 2000) + 5000; // £5000-£6999
        const deposit = Math.floor(Math.random() * 400) + 800; // £800-£1199
        const months = 12;
        const remaining = carPrice - deposit;
        const monthly = remaining / months;
        return {
          expr: `${pick(['Mo', 'Ali', 'Sam'])} buys a car. The total cost of the car is £${carPrice}. He pays a deposit of £${deposit}. He then pays ${months} equal monthly payments. How much is each monthly payment?`,
          answer: parseFloat(monthly.toFixed(2))
        };
      },
      () => {
        // Q6: Café spending
        const coffees = Math.floor(Math.random() * 2) + 2; // 2-3
        const coffeePrice = (Math.floor(Math.random() * 30) + 150) / 100; // £1.50-£1.79
        const teas = 2;
        const teaPrice = (Math.floor(Math.random() * 20) + 100) / 100; // £1.00-£1.19
        const cakes = Math.floor(Math.random() * 3) + 4; // 4-6
        const cakePrice = (Math.floor(Math.random() * 40) + 200) / 100; // £2.00-£2.39
        
        const total = (coffees * coffeePrice) + (teas * teaPrice) + (cakes * cakePrice);
        return {
          expr: `${pick(['Liam', 'Noah', 'James'])} goes to a café. He buys:\n${coffees} coffees for £${coffeePrice.toFixed(2)} each\n${teas} teas for £${teaPrice.toFixed(2)} each\n${cakes} cakes for £${cakePrice.toFixed(2)} each\n\nWork out the total amount spent.`,
          answer: parseFloat(total.toFixed(2))
        };
      },
      () => {
        // Q7: Pens and pencils system
        const pens = Math.floor(Math.random() * 2) + 3; // 3-4
        const pencils = Math.floor(Math.random() * 3) + 4; // 4-6
        const totalCost = (Math.floor(Math.random() * 30) + 100) / 100; // £1.00-£1.29
        const pensBought = 4;
        const pensCost = (Math.floor(Math.random() * 20) + 110) / 100; // £1.10-£1.29
        
        const penPrice = pensCost / pensBought;
        const pencilPrice = (totalCost - (pens * penPrice)) / pencils;
        const answer = penPrice + (2 * pencilPrice);
        
        return {
          expr: `${pick(['David', 'Lucas', 'Ethan'])} buys ${pens} pens and ${pencils} pencils from the stationary shop. The total cost is £${totalCost.toFixed(2)}.\n\n${pick(['James', 'Harry', 'Ben'])} buys ${pensBought} pens for £${pensCost.toFixed(2)}.\n\nWork out how much it would cost to buy 1 pen and 2 pencils.`,
          answer: parseFloat(answer.toFixed(2))
        };
      },
      () => {
        // Q8: Budget check problem
        const calcPrice = (Math.floor(Math.random() * 40) + 500) / 100; // £5.00-£5.39
        const penPrice = (Math.floor(Math.random() * 20) + 110) / 100; // £1.10-£1.29
        const calcs2Price = calcPrice * 2;
        const pens3Price = penPrice * 3;
        const budget = 200;
        const qty = 30;
        
        const totalNeeded = (qty * calcPrice) + (qty * penPrice);
        const hasEnough = totalNeeded <= budget;
        
        return {
          expr: `2 calculators cost £${calcs2Price.toFixed(2)}\n3 pens cost £${pens3Price.toFixed(2)}\n\n${pick(['Jude', 'Tom', 'Alex'])} wants to buy ${qty} calculators and ${qty} pens. He only has £${budget}.\n\nDoes he have enough money? (Answer 1 for Yes, 0 for No)`,
          answer: hasEnough ? 1 : 0
        };
      },
      () => {
        // Q9: String cutting problem
        const totalLength = Math.floor(Math.random() * 50) + 330; // 330-379 cm
        const firstCuts = 3;
        const firstLength = 40;
        const secondLength = 35;
        
        const remaining = totalLength - (firstCuts * firstLength);
        const numCuts = Math.floor(remaining / secondLength);
        
        return {
          expr: `A piece of string is ${totalLength} cm long.\n\n${pick(['John', 'Mike', 'Pete'])} cuts three ${firstLength} cm lengths off the string. He then cuts the rest into as many ${secondLength} cm lengths as possible.\n\nWork out how many ${secondLength} cm lengths of string he cuts.`,
          answer: numCuts
        };
      },
      () => {
        // Q10: Weekly pay calculation
        const weekdayRate = (Math.floor(Math.random() * 50) + 900) / 100; // £9.00-£9.49
        const saturdayRate = (Math.floor(Math.random() * 40) + 1100) / 100; // £11.00-£11.39
        const weekdayHours = 12;
        const saturdayHours = 4;
        
        const total = (weekdayRate * weekdayHours) + (saturdayRate * saturdayHours);
        
        return {
          expr: `${pick(['Molly', 'Lucy', 'Emma'])} gets paid £${weekdayRate.toFixed(2)} for each hour she works from Monday to Friday. She gets paid £${saturdayRate.toFixed(2)} for each hour she works on Saturday.\n\nLast week she worked ${weekdayHours} hours from Monday to Friday and ${saturdayHours} hours on Saturday.\n\nHow much was she paid last week?`,
          answer: parseFloat(total.toFixed(2))
        };
      },
      () => {
        // Q11: Chocolate bars for students
        const students = Math.floor(Math.random() * 20) + 100; // 100-119
        const packSize = 6;
        const packPrice = (Math.floor(Math.random() * 20) + 115) / 100; // £1.15-£1.34
        
        const packsNeeded = Math.ceil(students / packSize);
        const total = packsNeeded * packPrice;
        
        return {
          expr: `${pick(['Aiden', 'Ryan', 'Connor'])} wants to buy a chocolate bar for every student in year 7. There are ${students} students in year 7.\n\nA pack of ${packSize} chocolate bars costs £${packPrice.toFixed(2)}.\n\nWork out how much he will have to pay for the chocolate bars.`,
          answer: parseFloat(total.toFixed(2))
        };
      },
      () => {
        // Q12: Shared savings problem
        const total = Math.floor(Math.random() * 50) + 470; // £470-£519
        const difference = Math.floor(Math.random() * 20) + 30; // £30-£49
        
        const person1Saved = (total - difference) / 2;
        
        return {
          expr: `${pick(['Noah', 'Liam', 'Mason'])} and ${pick(['Mia', 'Ava', 'Isla'])} saved a total of £${total}. ${pick(['Mia', 'Ava', 'Isla'])} saved £${difference} more than ${pick(['Noah', 'Liam', 'Mason'])}.\n\nHow much did ${pick(['Noah', 'Liam', 'Mason'])} save?`,
          answer: parseFloat(person1Saved.toFixed(2))
        };
      },
      () => {
        // Q13: Cups of tea problem
        const litres = (Math.floor(Math.random() * 5) + 15) / 10; // 1.5-1.9 litres
        const mlPerCup = 200;
        const totalMl = litres * 1000;
        const cups = Math.floor(totalMl / mlPerCup);
        
        return {
          expr: `${pick(['Abigail', 'Emily', 'Grace'])} has boiled a kettle. She has ${litres.toFixed(1)} litres of water.\n\nShe wants to make as many cups of tea as possible. For each cup of tea she needs ${mlPerCup}ml of water.\n\nHow many cups of tea can she make?`,
          answer: cups
        };
      },
      () => {
        // Q14: Washing powder problem
        const packSize = 650;
        const washesPerWeek = 2;
        const gramsPerWash = 40;
        const weeks = 13;
        
        const totalGrams = washesPerWeek * gramsPerWash * weeks;
        const packsNeeded = Math.ceil(totalGrams / packSize);
        
        return {
          expr: `A shop sells washing powder in ${packSize}g packs.\n\n${pick(['Jacob', 'Daniel', 'Joshua'])} has no washing powder. He estimates that he does ${washesPerWeek} washes a week, using ${gramsPerWash}g each wash.\n\nHe wants to buy enough washing powder for ${weeks} weeks.\n\nHow many packs of washing powder does he need to buy?`,
          answer: packsNeeded
        };
      }
    ];
    const selected = problems[Math.floor(Math.random() * problems.length)]();
    return { expr: selected.expr, answer: selected.answer, parts: null };
  }
  
  else if(topic === 'using-calculator'){
    // 2.2 Using a Calculator - Complex calculations
    const types = ['decimal-mult', 'large-division', 'mixed-operations'];
    const type = pick(types);
    
    if(type === 'decimal-mult'){
      const dec1 = (Math.floor(Math.random() * 50) + 10) / 10;
      const dec2 = (Math.floor(Math.random() * 30) + 5) / 10;
      expr = `${dec1} × ${dec2} = ?`;
      answer = Math.round(dec1 * dec2 * 100) / 100;
    } else if(type === 'large-division'){
      const dividend = Math.floor(Math.random() * 400) + 200;
      const divisor = Math.floor(Math.random() * 15) + 5;
      expr = `${dividend} ÷ ${divisor} = ?`;
      answer = Math.round((dividend / divisor) * 100) / 100;
    } else {
      const a = Math.floor(Math.random() * 50) + 20;
      const b = Math.floor(Math.random() * 30) + 10;
      const c = Math.floor(Math.random() * 20) + 5;
      expr = `(${a} + ${b}) × ${c} = ?`;
      answer = (a + b) * c;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'systematic-listing'){
    // 2.3 Systematic Listing - Combinatorics
    const foods = [
      {main: ['Burger', 'Pizza', 'Pasta'], drink: ['Coke', 'Juice']},
      {main: ['Chicken', 'Fish', 'Beef'], side: ['Chips', 'Salad']},
      {sandwich: ['Ham', 'Cheese'], bread: ['White', 'Brown']}
    ];
    const selected = pick(foods);
    
    if(selected.main){
      const combinations = selected.main.length * selected.drink.length;
      expr = `A restaurant offers ${selected.main.join(', ')} for mains and ${selected.drink.join(' or ')} for drinks. How many different meal combinations are possible?`;
      answer = combinations;
    } else {
      const combinations = selected.sandwich.length * selected.bread.length;
      expr = `A cafe makes sandwiches with ${selected.sandwich.join(' or ')} on ${selected.bread.join(' or ')} bread. How many different sandwiches can be made?`;
      answer = combinations;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'fractions-of-amount'){
    // 2.4 Fractions of an Amount
    const fractions = [
      {num: 1, denom: 2}, {num: 1, denom: 3}, {num: 1, denom: 4},
      {num: 1, denom: 5}, {num: 2, denom: 3}, {num: 3, denom: 4},
      {num: 2, denom: 5}, {num: 3, denom: 5}, {num: 4, denom: 5}
    ];
    const frac = pick(fractions);
    const amount = frac.denom * (Math.floor(Math.random() * 10) + 3);
    answer = (amount / frac.denom) * frac.num;
    
    expr = `Work out ${frac.num}/${frac.denom} of ${amount}`;
    return { expr, answer, parts: null, fractionDisplay: {numerator: frac.num, denominator: frac.denom} };
  }
  
  else if(topic === 'fractions-decimals-percentages'){
    // 2.5 Fractions, Decimals and Percentages conversions
    const types = ['frac-to-dec', 'dec-to-perc', 'perc-to-frac', 'frac-to-perc'];
    const type = pick(types);
    
    if(type === 'frac-to-dec'){
      const fracs = [{n:1,d:2,dec:0.5}, {n:1,d:4,dec:0.25}, {n:3,d:4,dec:0.75}, {n:1,d:5,dec:0.2}, {n:2,d:5,dec:0.4}];
      const f = pick(fracs);
      expr = `Convert ${f.n}/${f.d} to a decimal`;
      answer = f.dec;
    } else if(type === 'dec-to-perc'){
      const decs = [0.1, 0.2, 0.25, 0.5, 0.75, 0.8];
      const d = pick(decs);
      expr = `Convert ${d} to a percentage`;
      answer = d * 100;
    } else if(type === 'perc-to-frac'){
      const percs = [{p:25,n:1,d:4}, {p:50,n:1,d:2}, {p:75,n:3,d:4}, {p:20,n:1,d:5}];
      const p = pick(percs);
      expr = `Convert ${p.p}% to a fraction in simplest form`;
      answer = `${p.n}/${p.d}`;
    } else {
      const fracs = [{n:1,d:2,p:50}, {n:1,d:4,p:25}, {n:3,d:4,p:75}, {n:1,d:5,p:20}];
      const f = pick(fracs);
      expr = `Convert ${f.n}/${f.d} to a percentage`;
      answer = f.p;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'simplifying-algebra'){
    // 2.6 Simplifying Algebra / Collecting Like Terms
    const coef1 = Math.floor(Math.random() * 5) + 1;
    const coef2 = Math.floor(Math.random() * 4) + 1;
    const type = Math.random();
    
    if(type < 0.5){
      expr = `Simplify: ${coef1}𝑥 + ${coef2}𝑥`;
      answer = `${coef1 + coef2}𝑥`;
    } else {
      const coef3 = Math.floor(Math.random() * 3) + 1;
      expr = `Simplify: ${coef1}𝑥 + ${coef2}𝑥 + ${coef3}`;
      answer = `${coef1 + coef2}𝑥 + ${coef3}`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'writing-expression'){
    // 2.7 Writing an Expression
    const scenarios = [
      () => {
        const n = Math.floor(Math.random() * 5) + 3;
        return {
          expr: `Write an expression for: A number 𝑛 multiplied by ${n}, then add ${n}`,
          answer: `${n}𝑛 + ${n}`
        };
      },
      () => {
        const cost = Math.floor(Math.random() * 8) + 2;
        return {
          expr: `Tickets cost £${cost} each. Write an expression for the total cost of 𝑛 tickets.`,
          answer: `${cost}𝑛`
        };
      },
      () => {
        const perPen = Math.floor(Math.random() * 3) + 1;
        const perPencil = Math.floor(Math.random() * 2) + 1;
        return {
          expr: `Pens cost £${perPen} and pencils cost £${perPencil}. Write an expression for the cost of 𝑥 pens and 𝑦 pencils.`,
          answer: `${perPen}𝑥 + ${perPencil}𝑦`
        };
      }
    ];
    const selected = pick(scenarios)();
    return { expr: selected.expr, answer: selected.answer, parts: null };
  }
  
  else if(topic === 'function-machines'){
    // 2.8 Function Machines
    const operations = ['+', '-', '×', '÷'];
    const op = pick(operations);
    const input = Math.floor(Math.random() * 15) + 5;
    const operand = op === '÷' ? pick([2,3,4,5]) : Math.floor(Math.random() * 10) + 2;
    
    const output = op === '+' ? input + operand :
                   op === '-' ? input - operand :
                   op === '×' ? input * operand :
                   input / operand;
    
    expr = `A function machine has the rule "${op} ${operand}". If the input is ${input}, what is the output?`;
    answer = output;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'one-step-equations'){
    // 2.9 Solving One Step Equations
    const types = ['add', 'subtract', 'multiply', 'divide'];
    const type = pick(types);
    
    if(type === 'add'){
      const x = Math.floor(Math.random() * 15) + 3;
      const added = Math.floor(Math.random() * 10) + 2;
      expr = `Solve: 𝑥 + ${added} = ${x + added}`;
      answer = x;
    } else if(type === 'subtract'){
      const x = Math.floor(Math.random() * 20) + 5;
      const subtracted = Math.floor(Math.random() * 8) + 2;
      expr = `Solve: 𝑥 - ${subtracted} = ${x - subtracted}`;
      answer = x;
    } else if(type === 'multiply'){
      const x = Math.floor(Math.random() * 10) + 2;
      const multiplier = Math.floor(Math.random() * 8) + 2;
      expr = `Solve: ${multiplier}𝑥 = ${x * multiplier}`;
      answer = x;
    } else {
      const x = Math.floor(Math.random() * 12) + 3;
      const divisor = pick([2,3,4,5]);
      expr = `Solve: 𝑥 ÷ ${divisor} = ${x / divisor}`;
      answer = x;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'angles'){
    // 2.10 Angles
    const types = ['angles-on-line', 'angles-around-point', 'angle-types'];
    const type = pick(types);
    
    if(type === 'angles-on-line'){
      const angle1 = Math.floor(Math.random() * 120) + 30;
      const angle2 = 180 - angle1;
      expr = `Two angles on a straight line are ${angle1}° and 𝑥°. Find the value of 𝑥.`;
      answer = angle2;
    } else if(type === 'angles-around-point'){
      const angles = [Math.floor(Math.random() * 80) + 40, Math.floor(Math.random() * 80) + 40, Math.floor(Math.random() * 80) + 40];
      const sum = angles.reduce((a,b) => a+b, 0);
      const missing = 360 - sum;
      expr = `Angles around a point are ${angles.join('°, ')}° and 𝑥°. Find 𝑥.`;
      answer = missing;
    } else {
      const angle = Math.floor(Math.random() * 180) + 1;
      const type = angle < 90 ? 'acute' : angle === 90 ? 'right' : angle < 180 ? 'obtuse' : 'straight';
      expr = `What type of angle is ${angle}°?`;
      answer = type;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'area-perimeter'){
    // 2.11 Area and Perimeter
    const type = Math.random() < 0.5 ? 'area' : 'perimeter';
    const length = Math.floor(Math.random() * 10) + 3;
    const width = Math.floor(Math.random() * 8) + 2;
    
    if(type === 'area'){
      expr = `Find the area of a rectangle with length ${length}cm and width ${width}cm.`;
      answer = length * width;
    } else {
      expr = `Find the perimeter of a rectangle with length ${length}cm and width ${width}cm.`;
      answer = 2 * (length + width);
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'probability'){
    // 2.12 Probability
    const scenarios = [
      () => {
        const red = Math.floor(Math.random() * 5) + 2;
        const blue = Math.floor(Math.random() * 5) + 2;
        const total = red + blue;
        return {
          expr: `A bag contains ${red} red balls and ${blue} blue balls. What is the probability of picking a red ball? Give your answer as a fraction.`,
          answer: `${red}/${total}`
        };
      },
      () => {
        const sides = 6;
        const favorable = Math.floor(Math.random() * 3) + 1;
        return {
          expr: `A fair dice is rolled. What is the probability of rolling a number less than or equal to ${favorable}?`,
          answer: `${favorable}/6`
        };
      }
    ];
    const selected = pick(scenarios)();
    return { expr: selected.expr, answer: selected.answer, parts: null };
  }
  
  else if(topic === 'frequency-polygons'){
    // 2.13 Frequency Polygons - simplified as reading data
    const intervals = ['0-10', '10-20', '20-30', '30-40'];
    const frequencies = [5, 8, 12, 6];
    const idx = Math.floor(Math.random() * intervals.length);
    
    expr = `A frequency polygon shows: ${intervals.map((int, i) => `${int}: ${frequencies[i]}`).join(', ')}. What is the frequency for the interval ${intervals[idx]}?`;
    answer = frequencies[idx];
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'averages'){
    // 2.14 Averages - Mean, Median, Mode, Range
    const data = Array.from({length: Math.floor(Math.random() * 3) + 5}, () => Math.floor(Math.random() * 20) + 5);
    const types = ['mean', 'median', 'mode', 'range'];
    const type = pick(types);
    
    if(type === 'mean'){
      const sum = data.reduce((a,b) => a+b, 0);
      answer = Math.round((sum / data.length) * 10) / 10;
      expr = `Find the mean of: ${data.join(', ')}`;
    } else if(type === 'median'){
      const sorted = [...data].sort((a,b) => a-b);
      const mid = Math.floor(sorted.length / 2);
      answer = sorted.length % 2 === 0 ? (sorted[mid-1] + sorted[mid]) / 2 : sorted[mid];
      expr = `Find the median of: ${data.join(', ')}`;
    } else if(type === 'range'){
      answer = Math.max(...data) - Math.min(...data);
      expr = `Find the range of: ${data.join(', ')}`;
    } else {
      const counts = {};
      data.forEach(n => counts[n] = (counts[n] || 0) + 1);
      const maxCount = Math.max(...Object.values(counts));
      const modes = Object.keys(counts).filter(k => counts[k] === maxCount);
      answer = modes.length === data.length ? 'no mode' : modes.join(',');
      expr = `Find the mode of: ${data.join(', ')}`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'bar-charts'){
    // 2.15 Bar Charts - reading data
    const categories = ['Apples', 'Bananas', 'Oranges', 'Grapes'];
    const values = [12, 18, 15, 10];
    const idx = Math.floor(Math.random() * categories.length);
    
    expr = `A bar chart shows fruit sales: ${categories.map((c, i) => `${c}: ${values[i]}`).join(', ')}. How many ${categories[idx]} were sold?`;
    answer = values[idx];
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'stem-leaf'){
    // 2.16 Stem and Leaf
    expr = `A stem-and-leaf diagram shows: Stem | Leaf\n2 | 3 5 7\n3 | 1 4 8\n4 | 2 6\nWhat is the largest value?`;
    answer = 46;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'pie-charts'){
    // 2.17 Pie Charts
    const total = Math.floor(Math.random() * 40) + 40;
    const fraction = pick([{angle: 90, frac: '1/4'}, {angle: 180, frac: '1/2'}, {angle: 120, frac: '1/3'}]);
    const count = total * eval(fraction.frac);
    
    expr = `A pie chart represents ${total} students. One sector has an angle of ${fraction.angle}°. How many students does this sector represent?`;
    answer = count;
    return { expr, answer, parts: null };
  }
  
  // ========== GRADE 3 TOPICS ==========
  
  else if(topic === 'error-intervals'){
    // 3.1 Error Intervals
    const value = Math.floor(Math.random() * 50) + 20;
    const dp = pick([0, 1]);
    const error = dp === 0 ? 0.5 : 0.05;
    const lower = value - error;
    const upper = value + error;
    
    expr = `A length is ${value}${dp === 1 ? '.0' : ''} cm to ${dp === 0 ? '0' : '1'} decimal place${dp === 0 ? '' : 's'}. Write the error interval.`;
    answer = `${lower} ≤ 𝑥 < ${upper}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'fractions-g3'){
    // 3.2 Fractions - operations with fractions
    const types = ['add', 'subtract', 'multiply', 'divide'];
    const type = pick(types);
    
    const num1 = Math.floor(Math.random() * 5) + 1;
    const denom1 = Math.floor(Math.random() * 6) + 2;
    const num2 = Math.floor(Math.random() * 4) + 1;
    const denom2 = type === 'add' || type === 'subtract' ? denom1 : Math.floor(Math.random() * 5) + 2;
    
    if(type === 'add'){
      const result_num = num1 + num2;
      expr = `Calculate: ${num1}/${denom1} + ${num2}/${denom1}`;
      answer = `${result_num}/${denom1}`;
    } else if(type === 'subtract'){
      const result_num = num1 - num2;
      expr = `Calculate: ${num1}/${denom1} - ${num2}/${denom1}`;
      answer = `${result_num}/${denom1}`;
    } else if(type === 'multiply'){
      const result_num = num1 * num2;
      const result_denom = denom1 * denom2;
      expr = `Calculate: ${num1}/${denom1} × ${num2}/${denom2}`;
      answer = `${result_num}/${result_denom}`;
    } else {
      const result_num = num1 * denom2;
      const result_denom = denom1 * num2;
      expr = `Calculate: ${num1}/${denom1} ÷ ${num2}/${denom2}`;
      answer = `${result_num}/${result_denom}`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'estimating'){
    // 3.3 Estimating
    const val1 = (Math.floor(Math.random() * 50) + 10) * 10 + Math.floor(Math.random() * 9) + 1;
    const val2 = (Math.floor(Math.random() * 30) + 5) * 10 + Math.floor(Math.random() * 9) + 1;
    const rounded1 = Math.round(val1 / 10) * 10;
    const rounded2 = Math.round(val2 / 10) * 10;
    
    expr = `Estimate ${val1} × ${val2}`;
    answer = rounded1 * rounded2;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'writing-simplifying-ratio'){
    // 3.4 Writing and Simplifying Ratio
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 6) + 2;
    const multiplier = Math.floor(Math.random() * 3) + 2;
    
    expr = `Simplify the ratio ${a * multiplier}:${b * multiplier}`;
    answer = `${a}:${b}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'ratio'){
    // 3.5 Ratio - sharing in ratios
    const total = Math.floor(Math.random() * 60) + 40;
    const ratio1 = Math.floor(Math.random() * 4) + 1;
    const ratio2 = Math.floor(Math.random() * 4) + 1;
    const parts = ratio1 + ratio2;
    const share1 = (total / parts) * ratio1;
    
    expr = `Share £${total} in the ratio ${ratio1}:${ratio2}. How much does the first person get?`;
    answer = share1;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'proportion'){
    // 3.6 Proportion
    const items = Math.floor(Math.random() * 8) + 4;
    const cost1 = Math.floor(Math.random() * 15) + 5;
    const items2 = items * (Math.floor(Math.random() * 3) + 2);
    const cost2 = (cost1 / items) * items2;
    
    expr = `If ${items} pens cost £${cost1}, how much do ${items2} pens cost?`;
    answer = cost2;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'percentages'){
    // 3.7 Percentages - calculate percentage of amount
    const percent = pick([10, 15, 20, 25, 30, 40, 50, 75]);
    const amount = Math.floor(Math.random() * 200) + 50;
    answer = (percent / 100) * amount;
    
    expr = `Calculate ${percent}% of £${amount}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'percentage-change'){
    // 3.8 Percentage Change
    const original = Math.floor(Math.random() * 100) + 50;
    const change = Math.floor(Math.random() * 30) + 10;
    const type = Math.random() < 0.5 ? 'increase' : 'decrease';
    
    if(type === 'increase'){
      answer = original * (1 + change / 100);
      expr = `Increase £${original} by ${change}%`;
    } else {
      answer = original * (1 - change / 100);
      expr = `Decrease £${original} by ${change}%`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'exchange-rates'){
    // 3.9 Exchange Rates
    const gbp = Math.floor(Math.random() * 500) + 100;
    const rate = (Math.floor(Math.random() * 50) + 100) / 100;
    answer = Math.round(gbp * rate * 100) / 100;
    
    expr = `Convert £${gbp} to euros at an exchange rate of £1 = €${rate}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'conversions-units'){
    // 3.10 Conversions and Units
    const conversions = [
      {from: 'cm', to: 'm', factor: 100},
      {from: 'mm', to: 'cm', factor: 10},
      {from: 'kg', to: 'g', factor: 1000},
      {from: 'km', to: 'm', factor: 1000}
    ];
    const conv = pick(conversions);
    const value = Math.floor(Math.random() * 5000) + 100;
    
    if(Math.random() < 0.5){
      answer = value / conv.factor;
      expr = `Convert ${value}${conv.from} to ${conv.to}`;
    } else {
      answer = value * conv.factor;
      expr = `Convert ${value}${conv.to} to ${conv.from}`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'scale-drawings'){
    // 3.11 Scale Drawings
    const scale = pick([2, 5, 10, 20, 50, 100]);
    const mapDist = Math.floor(Math.random() * 15) + 3;
    const realDist = mapDist * scale;
    
    expr = `On a map with scale 1:${scale}, a distance is ${mapDist}cm. What is the real distance in cm?`;
    answer = realDist;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'best-buy'){
    // 3.12 Best Buy Questions
    const pack1_items = Math.floor(Math.random() * 4) + 3;
    const pack1_cost = Math.floor(Math.random() * 5) + 2;
    const pack2_items = pack1_items * 2;
    const pack2_cost = pack1_cost * 2 - (Math.floor(Math.random() * 2) + 1);
    
    const price1 = pack1_cost / pack1_items;
    const price2 = pack2_cost / pack2_items;
    
    expr = `Pack A: ${pack1_items} items for £${pack1_cost}. Pack B: ${pack2_items} items for £${pack2_cost}. Which is better value?`;
    answer = price1 < price2 ? 'Pack A' : 'Pack B';
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'substitution'){
    // 3.13 Substitution
    const x = Math.floor(Math.random() * 10) + 1;
    const y = Math.floor(Math.random() * 10) + 1;
    const coef1 = Math.floor(Math.random() * 5) + 2;
    const coef2 = Math.floor(Math.random() * 4) + 1;
    
    expr = `If 𝑥 = ${x} and 𝑦 = ${y}, find the value of ${coef1}𝑥 + ${coef2}𝑦`;
    answer = coef1 * x + coef2 * y;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'solving-equations'){
    // 3.14 Solving Equations - multi-step
    const x = Math.floor(Math.random() * 12) + 3;
    const coef = Math.floor(Math.random() * 4) + 2;
    const add = Math.floor(Math.random() * 10) + 3;
    const result = coef * x + add;
    
    expr = `Solve: ${coef}𝑥 + ${add} = ${result}`;
    answer = x;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'drawing-linear-graphs'){
    // 3.15 Drawing Linear Graphs - find y-intercept or gradient
    const m = Math.floor(Math.random() * 5) + 1;
    const c = Math.floor(Math.random() * 8) - 4;
    const x = Math.floor(Math.random() * 5) + 1;
    const y = m * x + c;
    
    expr = `The line 𝑦 = ${m}𝑥 ${c >= 0 ? '+' : ''} ${c} passes through (${x}, 𝑦). Find 𝑦.`;
    answer = y;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'circles'){
    // 3.16 Area and Circumference of Circles
    const r = Math.floor(Math.random() * 10) + 3;
    const type = Math.random() < 0.5 ? 'area' : 'circumference';
    
    if(type === 'area'){
      answer = Math.round(Math.PI * r * r * 100) / 100;
      expr = `Find the area of a circle with radius ${r}cm (use π = 3.14)`;
    } else {
      answer = Math.round(2 * Math.PI * r * 100) / 100;
      expr = `Find the circumference of a circle with radius ${r}cm (use π = 3.14)`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'transformations'){
    // 3.17 Transformations
    const types = ['translation', 'rotation', 'reflection'];
    const type = pick(types);
    
    if(type === 'translation'){
      const x = Math.floor(Math.random() * 8) - 4;
      const y = Math.floor(Math.random() * 8) - 4;
      expr = `Describe the translation vector (${x}, ${y})`;
      answer = `${x} right, ${y} up`;
    } else if(type === 'rotation'){
      const angle = pick([90, 180, 270]);
      expr = `What is the angle of rotation for a ${angle}° turn?`;
      answer = angle;
    } else {
      const axis = pick(['x-axis', 'y-axis', 'y=x']);
      expr = `Describe reflection in the ${axis}`;
      answer = axis;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'area-compound-shapes'){
    // 3.18 Area of Compound Shapes
    const l1 = Math.floor(Math.random() * 8) + 4;
    const w1 = Math.floor(Math.random() * 5) + 3;
    const l2 = Math.floor(Math.random() * 6) + 3;
    const w2 = Math.floor(Math.random() * 4) + 2;
    
    answer = l1 * w1 + l2 * w2;
    expr = `Find the total area of an L-shape made of two rectangles: ${l1}×${w1}cm and ${l2}×${w2}cm`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'frequency-trees'){
    // 3.19 Frequency Trees
    const total = Math.floor(Math.random() * 40) + 60;
    const boys = Math.floor(total * (Math.random() * 0.3 + 0.4));
    const girls = total - boys;
    
    expr = `A frequency tree shows ${total} students: ${boys} boys and ${girls} girls. How many girls are there?`;
    answer = girls;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'two-way-tables'){
    // 3.20 Two Way Tables
    const boys_yes = Math.floor(Math.random() * 20) + 10;
    const boys_no = Math.floor(Math.random() * 15) + 5;
    const girls_yes = Math.floor(Math.random() * 18) + 12;
    const girls_no = Math.floor(Math.random() * 12) + 8;
    const total = boys_yes + boys_no + girls_yes + girls_no;
    
    expr = `A two-way table shows: Boys who said yes: ${boys_yes}, Boys who said no: ${boys_no}, Girls who said yes: ${girls_yes}, Girls who said no: ${girls_no}. What is the total number of students?`;
    answer = total;
    return { expr, answer, parts: null };
  }
  
  // ========== GRADE 4 TOPICS ==========
  
  else if(topic === 'compound-interest'){
    // 4.1 Compound Interest and Depreciation
    const principal = Math.floor(Math.random() * 5000) + 1000;
    const rate = pick([2, 3, 4, 5, 6, 8, 10]);
    const years = Math.floor(Math.random() * 3) + 2;
    const type = Math.random() < 0.5 ? 'interest' : 'depreciation';
    
    if(type === 'interest'){
      answer = Math.round(principal * Math.pow(1 + rate/100, years) * 100) / 100;
      expr = `£${principal} is invested at ${rate}% compound interest for ${years} years. Find the total amount.`;
    } else {
      answer = Math.round(principal * Math.pow(1 - rate/100, years) * 100) / 100;
      expr = `A car worth £${principal} depreciates by ${rate}% per year for ${years} years. Find its value.`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'indices'){
    // 4.2 Indices
    const base = Math.floor(Math.random() * 5) + 2;
    const exp1 = Math.floor(Math.random() * 4) + 2;
    const exp2 = Math.floor(Math.random() * 3) + 1;
    const type = pick(['multiply', 'divide', 'power']);
    
    if(type === 'multiply'){
      answer = `${base}^${exp1 + exp2}`;
      expr = `Simplify: ${base}^${exp1} × ${base}^${exp2}`;
    } else if(type === 'divide'){
      answer = `${base}^${exp1 - exp2}`;
      expr = `Simplify: ${base}^${exp1} ÷ ${base}^${exp2}`;
    } else {
      answer = `${base}^${exp1 * exp2}`;
      expr = `Simplify: (${base}^${exp1})^${exp2}`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'prime-factors-hcf-lcm'){
    // 4.3 Prime Factors, HCF and LCM
    const num1 = pick([12, 18, 24, 30, 36, 40, 48]);
    const num2 = pick([15, 20, 24, 30, 36, 45]);
    const type = Math.random() < 0.5 ? 'HCF' : 'LCM';
    
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const lcm = (a, b) => (a * b) / gcd(a, b);
    
    if(type === 'HCF'){
      answer = gcd(num1, num2);
      expr = `Find the HCF of ${num1} and ${num2}`;
    } else {
      answer = lcm(num1, num2);
      expr = `Find the LCM of ${num1} and ${num2}`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'distance-time-graphs'){
    // 4.4 Real Life and Distance Time Graphs
    const distance = Math.floor(Math.random() * 150) + 50;
    const time = Math.floor(Math.random() * 4) + 2;
    const speed = distance / time;
    
    expr = `A person travels ${distance}km in ${time} hours. What is their average speed in km/h?`;
    answer = speed;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'inequalities'){
    // 4.5 Inequalities
    const x = Math.floor(Math.random() * 15) + 5;
    const add = Math.floor(Math.random() * 10) + 3;
    const sign = pick(['>', '<', '≥', '≤']);
    
    expr = `Solve: 𝑥 + ${add} ${sign} ${x + add}`;
    answer = `𝑥 ${sign} ${x}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'forming-solving-equations'){
    // 4.6 Forming and Solving Equations
    const x = Math.floor(Math.random() * 10) + 5;
    const coef = Math.floor(Math.random() * 3) + 2;
    const add1 = Math.floor(Math.random() * 8) + 2;
    const add2 = Math.floor(Math.random() * 6) + 1;
    const total = coef * x + add1 + add2;
    
    expr = `The sum of ${coef}𝑥 + ${add1} and ${add2} is ${total}. Find 𝑥.`;
    answer = x;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'sequences-nth-term'){
    // 4.7 Sequences (Nth Term)
    const first = Math.floor(Math.random() * 10) + 3;
    const diff = Math.floor(Math.random() * 5) + 2;
    const n = Math.floor(Math.random() * 8) + 3;
    const term = first + (n - 1) * diff;
    
    expr = `The nth term of a sequence is ${diff}𝑛 + ${first - diff}. Find the ${n}th term.`;
    answer = term;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'expanding-factorising'){
    // 4.8 Expanding and Factorising
    const type = Math.random() < 0.5 ? 'expand' : 'factorise';
    
    if(type === 'expand'){
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 8) + 1;
      const c = Math.floor(Math.random() * 6) + 1;
      answer = `${a * b}𝑥 + ${a * c}`;
      expr = `Expand: ${a}(${b}𝑥 + ${c})`;
    } else {
      const factor = Math.floor(Math.random() * 4) + 2;
      const term1 = factor * (Math.floor(Math.random() * 4) + 2);
      const term2 = factor * (Math.floor(Math.random() * 5) + 1);
      answer = `${factor}(${term1/factor}𝑥 + ${term2/factor})`;
      expr = `Factorise: ${term1}𝑥 + ${term2}`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'pythagoras'){
    // 4.9 Pythagoras
    const a = Math.floor(Math.random() * 8) + 3;
    const b = Math.floor(Math.random() * 8) + 4;
    const c = Math.sqrt(a * a + b * b);
    
    expr = `A right-angled triangle has sides ${a}cm and ${b}cm. Find the hypotenuse.`;
    answer = Math.round(c * 100) / 100;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'angles-parallel-lines'){
    // 4.10 Angles in Parallel Lines
    const angle = Math.floor(Math.random() * 120) + 40;
    const types = ['alternate', 'corresponding', 'co-interior'];
    const type = pick(types);
    
    if(type === 'alternate'){
      answer = angle;
      expr = `Two parallel lines are cut by a transversal. One alternate angle is ${angle}°. Find the other.`;
    } else if(type === 'corresponding'){
      answer = angle;
      expr = `Two parallel lines are cut by a transversal. One corresponding angle is ${angle}°. Find the other.`;
    } else {
      answer = 180 - angle;
      expr = `Two parallel lines are cut by a transversal. One co-interior angle is ${angle}°. Find the other.`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'angles-polygons'){
    // 4.11 Angles in Polygons
    const sides = Math.floor(Math.random() * 5) + 5; // 5-9 sides
    const sumAngles = (sides - 2) * 180;
    
    expr = `Find the sum of interior angles in a ${sides}-sided polygon.`;
    answer = sumAngles;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'surface-area'){
    // 4.12 Surface Area
    const l = Math.floor(Math.random() * 8) + 4;
    const w = Math.floor(Math.random() * 6) + 3;
    const h = Math.floor(Math.random() * 5) + 2;
    const sa = 2 * (l*w + l*h + w*h);
    
    expr = `Find the surface area of a cuboid with dimensions ${l}cm × ${w}cm × ${h}cm.`;
    answer = sa;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'volume-prism'){
    // 4.13 Volume of a Prism
    const base = Math.floor(Math.random() * 10) + 5;
    const height = Math.floor(Math.random() * 8) + 4;
    const length = Math.floor(Math.random() * 12) + 6;
    const volume = (base * height / 2) * length;
    
    expr = `A triangular prism has a base ${base}cm, height ${height}cm, and length ${length}cm. Find the volume.`;
    answer = volume;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'cylinders'){
    // 4.14 Cylinders
    const r = Math.floor(Math.random() * 8) + 3;
    const h = Math.floor(Math.random() * 12) + 5;
    const type = Math.random() < 0.5 ? 'volume' : 'surface-area';
    
    if(type === 'volume'){
      answer = Math.round(Math.PI * r * r * h * 100) / 100;
      expr = `Find the volume of a cylinder with radius ${r}cm and height ${h}cm (use π = 3.14)`;
    } else {
      answer = Math.round((2 * Math.PI * r * h + 2 * Math.PI * r * r) * 100) / 100;
      expr = `Find the surface area of a cylinder with radius ${r}cm and height ${h}cm (use π = 3.14)`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'loci-construction'){
    // 4.15 Loci and Construction
    const distance = Math.floor(Math.random() * 8) + 4;
    expr = `Describe the locus of points ${distance}cm from a fixed point.`;
    answer = 'circle';
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'bearings'){
    // 4.16 Bearings
    const bearing = Math.floor(Math.random() * 270) + 45;
    const back_bearing = (bearing + 180) % 360;
    
    expr = `The bearing from A to B is ${bearing}°. Find the bearing from B to A.`;
    answer = back_bearing;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'plans-elevations'){
    // 4.17 Plans and Elevations
    const cubes = Math.floor(Math.random() * 15) + 8;
    expr = `A 3D shape is made from ${cubes} cubes. How many cubes are visible from the front?`;
    answer = Math.floor(cubes / 2) + Math.floor(Math.random() * 3);
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'averages-frequency-tables'){
    // 4.18 Averages from Frequency Tables
    const values = [1, 2, 3, 4, 5];
    const frequencies = [3, 5, 7, 4, 2];
    const total_freq = frequencies.reduce((a,b) => a+b, 0);
    const sum = values.reduce((acc, val, i) => acc + val * frequencies[i], 0);
    const mean = sum / total_freq;
    
    expr = `Find the mean from this frequency table: Values: ${values.join(', ')} | Frequencies: ${frequencies.join(', ')}`;
    answer = Math.round(mean * 100) / 100;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'probability-g4'){
    // 4.19 Probability
    const favorable = Math.floor(Math.random() * 6) + 2;
    const total = favorable + Math.floor(Math.random() * 10) + 5;
    
    expr = `There are ${favorable} successful outcomes out of ${total} total outcomes. What is the probability? Give as a fraction.`;
    answer = `${favorable}/${total}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'scatter-graphs'){
    // 4.20 Scatter Graphs
    const types = ['positive', 'negative', 'no correlation'];
    const type = pick(types);
    
    expr = `A scatter graph shows that as temperature increases, ice cream sales increase. What type of correlation is this?`;
    answer = 'positive';
    return { expr, answer, parts: null };
  }
  
  // ========== GRADE 5 TOPICS ==========
  
  else if(topic === 'ratio-fraction-function'){
    // 5.1 Writing a Ratio as a Fraction or Linear Function
    const ratio1 = Math.floor(Math.random() * 5) + 2;
    const ratio2 = Math.floor(Math.random() * 4) + 3;
    
    expr = `Write the ratio ${ratio1}:${ratio2} as a fraction`;
    answer = `${ratio1}/${ratio2}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'direct-inverse-proportion'){
    // 5.2 Direct and Inverse Proportion
    const type = Math.random() < 0.5 ? 'direct' : 'inverse';
    const x1 = Math.floor(Math.random() * 8) + 4;
    const y1 = Math.floor(Math.random() * 12) + 6;
    const x2 = Math.floor(Math.random() * 10) + 5;
    
    if(type === 'direct'){
      const k = y1 / x1;
      answer = Math.round(k * x2 * 100) / 100;
      expr = `𝑦 is directly proportional to 𝑥. When 𝑥 = ${x1}, 𝑦 = ${y1}. Find 𝑦 when 𝑥 = ${x2}`;
    } else {
      const k = x1 * y1;
      answer = Math.round(k / x2 * 100) / 100;
      expr = `𝑦 is inversely proportional to 𝑥. When 𝑥 = ${x1}, 𝑦 = ${y1}. Find 𝑦 when 𝑥 = ${x2}`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'reverse-percentages'){
    // 5.3 Reverse Percentages
    const final = Math.floor(Math.random() * 200) + 100;
    const percent = pick([10, 15, 20, 25, 30]);
    const original = final / (1 + percent / 100);
    
    expr = `After a ${percent}% increase, a price is £${final}. What was the original price?`;
    answer = Math.round(original * 100) / 100;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'standard-form'){
    // 5.4 Standard Form
    const mantissa = (Math.floor(Math.random() * 90) + 10) / 10;
    const exponent = Math.floor(Math.random() * 8) + 2;
    const value = mantissa * Math.pow(10, exponent);
    
    expr = `Write ${mantissa} × 10^${exponent} as an ordinary number`;
    answer = value;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'speed-density'){
    // 5.5 Speed and Density
    const type = Math.random() < 0.5 ? 'speed' : 'density';
    
    if(type === 'speed'){
      const distance = Math.floor(Math.random() * 200) + 50;
      const time = Math.floor(Math.random() * 5) + 2;
      answer = distance / time;
      expr = `Find the speed if distance is ${distance}km and time is ${time} hours`;
    } else {
      const mass = Math.floor(Math.random() * 500) + 100;
      const volume = Math.floor(Math.random() * 50) + 20;
      answer = Math.round((mass / volume) * 100) / 100;
      expr = `Find the density if mass is ${mass}g and volume is ${volume}cm³`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'changing-subject-formula'){
    // 5.6 Changing the Subject of a Formula
    const coef = Math.floor(Math.random() * 5) + 2;
    const add = Math.floor(Math.random() * 8) + 3;
    
    expr = `Make 𝑥 the subject of: 𝑦 = ${coef}𝑥 + ${add}`;
    answer = `𝑥 = (𝑦 - ${add})/${coef}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'expanding-factorising-quadratics'){
    // 5.7 Expanding and Factorising Quadratics
    const type = Math.random() < 0.5 ? 'expand' : 'factorise';
    
    if(type === 'expand'){
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 6) + 1;
      answer = `𝑥² + ${a+b}𝑥 + ${a*b}`;
      expr = `Expand: (𝑥 + ${a})(𝑥 + ${b})`;
    } else {
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 4) + 1;
      answer = `(𝑥 + ${a})(𝑥 + ${b})`;
      expr = `Factorise: 𝑥² + ${a+b}𝑥 + ${a*b}`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'solving-quadratics'){
    // 5.8 Solving Quadratics
    const root1 = Math.floor(Math.random() * 8) + 1;
    const root2 = Math.floor(Math.random() * 6) + 1;
    const b = -(root1 + root2);
    const c = root1 * root2;
    
    expr = `Solve: 𝑥² ${b >= 0 ? '+' : ''} ${b}𝑥 ${c >= 0 ? '+' : ''} ${c} = 0`;
    answer = `𝑥 = ${root1} or 𝑥 = ${root2}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'drawing-quadratic-graphs'){
    // 5.9 Drawing Quadratic Graphs
    const a = Math.floor(Math.random() * 3) + 1;
    const x = Math.floor(Math.random() * 5) + 1;
    const y = a * x * x;
    
    expr = `For 𝑦 = ${a}𝑥², find 𝑦 when 𝑥 = ${x}`;
    answer = y;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'cubic-reciprocal-graphs'){
    // 5.10 Drawing Other Graphs: Cubic/Reciprocal
    const type = Math.random() < 0.5 ? 'cubic' : 'reciprocal';
    
    if(type === 'cubic'){
      const x = Math.floor(Math.random() * 4) + 1;
      const y = x * x * x;
      expr = `For 𝑦 = 𝑥³, find 𝑦 when 𝑥 = ${x}`;
      answer = y;
    } else {
      const x = Math.floor(Math.random() * 8) + 2;
      const y = Math.round((1 / x) * 100) / 100;
      expr = `For 𝑦 = 1/𝑥, find 𝑦 when 𝑥 = ${x}`;
      answer = y;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'simultaneous-equations'){
    // 5.11 Simultaneous Equations
    const x = Math.floor(Math.random() * 8) + 2;
    const y = Math.floor(Math.random() * 6) + 1;
    const a1 = Math.floor(Math.random() * 3) + 1;
    const b1 = Math.floor(Math.random() * 3) + 1;
    const c1 = a1 * x + b1 * y;
    const a2 = Math.floor(Math.random() * 3) + 1;
    const b2 = Math.floor(Math.random() * 3) + 1;
    const c2 = a2 * x + b2 * y;
    
    expr = `Solve: ${a1}𝑥 + ${b1}𝑦 = ${c1} and ${a2}𝑥 + ${b2}𝑦 = ${c2}`;
    answer = `𝑥 = ${x}, 𝑦 = ${y}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'simultaneous-equations-graphically'){
    // 5.12 Solving Simultaneous Equations Graphically
    const x = Math.floor(Math.random() * 6) + 1;
    const y = Math.floor(Math.random() * 5) + 1;
    
    expr = `Two lines 𝑦 = 2𝑥 + 1 and 𝑦 = -𝑥 + ${x + y + 1} intersect. Find the 𝑥-coordinate of intersection.`;
    answer = x;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'midpoint-line-segment'){
    // 5.13 Midpoint of a Line Segment
    const x1 = Math.floor(Math.random() * 10) + 1;
    const y1 = Math.floor(Math.random() * 10) + 1;
    const x2 = Math.floor(Math.random() * 10) + 5;
    const y2 = Math.floor(Math.random() * 10) + 5;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    expr = `Find the midpoint of the line segment from (${x1}, ${y1}) to (${x2}, ${y2})`;
    answer = `(${midX}, ${midY})`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'gradient-line'){
    // 5.14 Gradient of a Line
    const x1 = Math.floor(Math.random() * 8) + 1;
    const y1 = Math.floor(Math.random() * 8) + 1;
    const x2 = x1 + Math.floor(Math.random() * 6) + 2;
    const y2 = y1 + Math.floor(Math.random() * 8) + 2;
    const gradient = (y2 - y1) / (x2 - x1);
    
    expr = `Find the gradient of the line through (${x1}, ${y1}) and (${x2}, ${y2})`;
    answer = Math.round(gradient * 100) / 100;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'equation-line'){
    // 5.15 Equation of a Line
    const m = Math.floor(Math.random() * 5) + 1;
    const c = Math.floor(Math.random() * 8) - 4;
    
    expr = `Write the equation of a line with gradient ${m} and 𝑦-intercept ${c}`;
    answer = `𝑦 = ${m}𝑥 ${c >= 0 ? '+' : ''} ${c}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'spheres-cones'){
    // 5.16 Spheres and Cones
    const type = Math.random() < 0.5 ? 'sphere' : 'cone';
    
    if(type === 'sphere'){
      const r = Math.floor(Math.random() * 6) + 3;
      answer = Math.round((4/3) * Math.PI * r * r * r * 100) / 100;
      expr = `Find the volume of a sphere with radius ${r}cm (use π = 3.14)`;
    } else {
      const r = Math.floor(Math.random() * 5) + 3;
      const h = Math.floor(Math.random() * 10) + 5;
      answer = Math.round((1/3) * Math.PI * r * r * h * 100) / 100;
      expr = `Find the volume of a cone with radius ${r}cm and height ${h}cm (use π = 3.14)`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'sectors-arcs'){
    // 5.17 Sector Areas and Arc Lengths
    const r = Math.floor(Math.random() * 8) + 4;
    const angle = pick([60, 90, 120, 180, 270]);
    const type = Math.random() < 0.5 ? 'sector' : 'arc';
    
    if(type === 'sector'){
      answer = Math.round((angle / 360) * Math.PI * r * r * 100) / 100;
      expr = `Find the area of a sector with radius ${r}cm and angle ${angle}° (use π = 3.14)`;
    } else {
      answer = Math.round((angle / 360) * 2 * Math.PI * r * 100) / 100;
      expr = `Find the arc length of a sector with radius ${r}cm and angle ${angle}° (use π = 3.14)`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'similar-shapes-lengths'){
    // 5.18 Similar Shapes (Lengths)
    const scale = Math.floor(Math.random() * 4) + 2;
    const length1 = Math.floor(Math.random() * 8) + 4;
    const length2 = length1 * scale;
    
    expr = `Two similar shapes have a scale factor of ${scale}. If one length is ${length1}cm, what is the corresponding length?`;
    answer = length2;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'sohcahtoa'){
    // 5.19 SOHCAHTOA (Trigonometry)
    const angle = pick([30, 45, 60]);
    const type = pick(['sin', 'cos', 'tan']);
    const side = Math.floor(Math.random() * 12) + 5;
    
    const values = {
      30: {sin: 0.5, cos: 0.866, tan: 0.577},
      45: {sin: 0.707, cos: 0.707, tan: 1},
      60: {sin: 0.866, cos: 0.5, tan: 1.732}
    };
    
    answer = Math.round(side * values[angle][type] * 100) / 100;
    expr = `In a right-angled triangle with angle ${angle}°, if the adjacent side is ${side}cm, find the ${type === 'sin' ? 'opposite' : type === 'cos' ? 'adjacent' : 'opposite'} side`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'exact-trig-values'){
    // 5.20 Exact trig values
    const angle = pick([0, 30, 45, 60, 90]);
    const func = pick(['sin', 'cos', 'tan']);
    
    const exactValues = {
      0: {sin: 0, cos: 1, tan: 0},
      30: {sin: '1/2', cos: '√3/2', tan: '1/√3'},
      45: {sin: '1/√2', cos: '1/√2', tan: 1},
      60: {sin: '√3/2', cos: '1/2', tan: '√3'},
      90: {sin: 1, cos: 0, tan: 'undefined'}
    };
    
    expr = `Find the exact value of ${func}(${angle}°)`;
    answer = exactValues[angle][func];
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'vectors'){
    // 5.21 Vectors
    const x1 = Math.floor(Math.random() * 8) + 1;
    const y1 = Math.floor(Math.random() * 6) + 1;
    const x2 = Math.floor(Math.random() * 6) + 1;
    const y2 = Math.floor(Math.random() * 8) + 1;
    
    const type = pick(['add', 'subtract', 'scalar']);
    
    if(type === 'add'){
      answer = `(${x1 + x2}, ${y1 + y2})`;
      expr = `Add vectors (${x1}, ${y1}) and (${x2}, ${y2})`;
    } else if(type === 'subtract'){
      answer = `(${x1 - x2}, ${y1 - y2})`;
      expr = `Subtract (${x2}, ${y2}) from (${x1}, ${y1})`;
    } else {
      const scalar = Math.floor(Math.random() * 4) + 2;
      answer = `(${x1 * scalar}, ${y1 * scalar})`;
      expr = `Multiply vector (${x1}, ${y1}) by scalar ${scalar}`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'probability-trees'){
    // 5.22 Probability Trees
    const prob1 = (Math.floor(Math.random() * 5) + 1) / 10;
    const prob2 = (Math.floor(Math.random() * 5) + 1) / 10;
    answer = Math.round(prob1 * prob2 * 100) / 100;
    
    expr = `Two independent events have probabilities ${prob1} and ${prob2}. What is P(both occur)?`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'venn-diagrams'){
    // 5.23 Venn Diagrams
    const setA = Math.floor(Math.random() * 20) + 10;
    const setB = Math.floor(Math.random() * 15) + 8;
    const intersection = Math.floor(Math.random() * 8) + 3;
    const union = setA + setB - intersection;
    
    expr = `Set A has ${setA} elements, Set B has ${setB} elements, and ${intersection} are in both. How many elements are in A ∪ B?`;
    answer = union;
    return { expr, answer, parts: null };
  }
  
  // ========== GRADE 6 TOPICS ==========
  
  else if(topic === 'recurring-decimals-fractions'){
    // 6.1 Recurring Decimals to Fractions
    const fractions = [{dec: '0.333...', frac: '1/3'}, {dec: '0.666...', frac: '2/3'}, {dec: '0.111...', frac: '1/9'}];
    const selected = pick(fractions);
    
    expr = `Convert ${selected.dec} to a fraction`;
    answer = selected.frac;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'fractional-negative-indices'){
    // 6.2 Fractional and Negative Indices
    const base = Math.floor(Math.random() * 6) + 2;
    const type = pick(['negative', 'fractional']);
    
    if(type === 'negative'){
      const exp = Math.floor(Math.random() * 3) + 1;
      answer = Math.round((1 / Math.pow(base, exp)) * 1000) / 1000;
      expr = `Calculate: ${base}^-${exp}`;
    } else {
      answer = Math.sqrt(base);
      expr = `Calculate: ${base}^(1/2)`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'product-rule-counting'){
    // 6.3 The Product Rule for Counting
    const choices1 = Math.floor(Math.random() * 5) + 3;
    const choices2 = Math.floor(Math.random() * 4) + 2;
    const choices3 = Math.floor(Math.random() * 3) + 2;
    
    answer = choices1 * choices2 * choices3;
    expr = `How many different outcomes if there are ${choices1} choices for the first, ${choices2} for the second, and ${choices3} for the third?`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'repeated-percentage-change'){
    // 6.4 Repeated Percentage Change
    const initial = Math.floor(Math.random() * 5000) + 1000;
    const percent = pick([5, 8, 10, 12, 15]);
    const years = Math.floor(Math.random() * 3) + 2;
    
    answer = Math.round(initial * Math.pow(1 + percent/100, years) * 100) / 100;
    expr = `£${initial} increases by ${percent}% each year for ${years} years. Find the final amount.`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'expanding-triple-brackets'){
    // 6.5 Expanding Triple Brackets
    const a = Math.floor(Math.random() * 3) + 1;
    const b = Math.floor(Math.random() * 3) + 1;
    const c = Math.floor(Math.random() * 3) + 1;
    
    expr = `Expand: (𝑥 + ${a})(𝑥 + ${b})(𝑥 + ${c})`;
    answer = `𝑥³ + ${a+b+c}𝑥² + ${a*b+b*c+a*c}𝑥 + ${a*b*c}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'parallel-perpendicular-lines'){
    // 6.6 Parallel and Perpendicular Lines
    const m = Math.floor(Math.random() * 5) + 1;
    const type = Math.random() < 0.5 ? 'parallel' : 'perpendicular';
    
    if(type === 'parallel'){
      answer = m;
      expr = `A line has gradient ${m}. What is the gradient of a parallel line?`;
    } else {
      answer = Math.round((-1/m) * 100) / 100;
      expr = `A line has gradient ${m}. What is the gradient of a perpendicular line?`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'inequalities-graphs'){
    // 6.7 Inequalities on Graphs
    const m = Math.floor(Math.random() * 4) + 1;
    const c = Math.floor(Math.random() * 6) - 3;
    const sign = pick(['>', '<', '≥', '≤']);
    
    expr = `Describe the region where 𝑦 ${sign} ${m}𝑥 + ${c}`;
    answer = `Region ${sign === '>' || sign === '≥' ? 'above' : 'below'} the line`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'similar-shapes-area-volume'){
    // 6.8 Similar Shapes (Area and Volume)
    const scale = Math.floor(Math.random() * 3) + 2;
    const type = Math.random() < 0.5 ? 'area' : 'volume';
    const original = Math.floor(Math.random() * 50) + 20;
    
    if(type === 'area'){
      answer = original * scale * scale;
      expr = `Two similar shapes have scale factor ${scale}. If one area is ${original}cm², find the other area.`;
    } else {
      answer = original * scale * scale * scale;
      expr = `Two similar shapes have scale factor ${scale}. If one volume is ${original}cm³, find the other volume.`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'enlarging-negative-scale'){
    // 6.9 Enlarging with Negative Scale Factors
    const scale = -(Math.floor(Math.random() * 3) + 2);
    const point_x = Math.floor(Math.random() * 6) + 2;
    const point_y = Math.floor(Math.random() * 5) + 2;
    
    expr = `A point (${point_x}, ${point_y}) is enlarged by scale factor ${scale} from origin. Find new coordinates.`;
    answer = `(${point_x * scale}, ${point_y * scale})`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'circle-theorems'){
    // 6.10 Circle Theorems
    const angle = Math.floor(Math.random() * 100) + 40;
    const theorems = ['angle-in-semicircle', 'angle-at-center'];
    const theorem = pick(theorems);
    
    if(theorem === 'angle-in-semicircle'){
      answer = 90;
      expr = `An angle in a semicircle is always...?`;
    } else {
      answer = angle * 2;
      expr = `An angle at the circumference is ${angle}°. Find the angle at the center subtending the same arc.`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'cumulative-frequency'){
    // 6.11 Cumulative Frequency
    const data = [5, 12, 23, 35, 42];
    const position = Math.floor(Math.random() * data.length);
    
    expr = `Cumulative frequencies are: ${data.join(', ')}. What is the cumulative frequency at position ${position + 1}?`;
    answer = data[position];
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'box-plots'){
    // 6.12 Box Plots
    const min = Math.floor(Math.random() * 20) + 10;
    const q1 = min + Math.floor(Math.random() * 10) + 5;
    const median = q1 + Math.floor(Math.random() * 8) + 4;
    const q3 = median + Math.floor(Math.random() * 10) + 5;
    const max = q3 + Math.floor(Math.random() * 12) + 6;
    const iqr = q3 - q1;
    
    expr = `A box plot has Q1 = ${q1} and Q3 = ${q3}. Find the interquartile range.`;
    answer = iqr;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'capture-recapture'){
    // 6.13 Capture Recapture
    const first_catch = Math.floor(Math.random() * 40) + 30;
    const marked = first_catch;
    const second_catch = Math.floor(Math.random() * 50) + 40;
    const recaptured = Math.floor(Math.random() * 15) + 5;
    const population = Math.round((marked * second_catch) / recaptured);
    
    expr = `${first_catch} fish are caught, marked and released. Later, ${second_catch} are caught with ${recaptured} marked. Estimate population.`;
    answer = population;
    return { expr, answer, parts: null };
  }
  
  // ========== GRADE 7 TOPICS ==========
  
  else if(topic === 'surds'){
    // 7.1 Surds
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 6) + 2;
    const type = pick(['simplify', 'rationalize']);
    
    if(type === 'simplify'){
      expr = `Simplify: √${a * a * b}`;
      answer = `${a}√${b}`;
    } else {
      expr = `Rationalize: 1/√${a}`;
      answer = `√${a}/${a}`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'bounds'){
    // 7.2 Bounds
    const value = Math.floor(Math.random() * 50) + 20;
    const dp = 0;
    const lower = value - 0.5;
    const upper = value + 0.5;
    
    expr = `A measurement is ${value}cm to the nearest cm. Find the upper bound.`;
    answer = upper;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'direct-inverse-proportion-g7'){
    // 7.3 Direct and Inverse Proportion (advanced)
    const type = pick(['square', 'cube']);
    const x1 = Math.floor(Math.random() * 5) + 2;
    const y1 = Math.floor(Math.random() * 30) + 10;
    const x2 = Math.floor(Math.random() * 6) + 3;
    
    if(type === 'square'){
      const k = y1 / (x1 * x1);
      answer = Math.round(k * x2 * x2 * 100) / 100;
      expr = `𝑦 is proportional to 𝑥². When 𝑥 = ${x1}, 𝑦 = ${y1}. Find 𝑦 when 𝑥 = ${x2}`;
    } else {
      const k = y1 / (x1 * x1 * x1);
      answer = Math.round(k * x2 * x2 * x2 * 100) / 100;
      expr = `𝑦 is proportional to 𝑥³. When 𝑥 = ${x1}, 𝑦 = ${y1}. Find 𝑦 when 𝑥 = ${x2}`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'quadratic-formula'){
    // 7.4 Quadratic Formula
    const a = 1;
    const b = Math.floor(Math.random() * 8) - 4;
    const c = Math.floor(Math.random() * 10) - 5;
    const discriminant = b*b - 4*a*c;
    
    if(discriminant >= 0){
      const x1 = (-b + Math.sqrt(discriminant)) / (2*a);
      const x2 = (-b - Math.sqrt(discriminant)) / (2*a);
      expr = `Solve using the quadratic formula: 𝑥² ${b >= 0 ? '+' : ''} ${b}𝑥 ${c >= 0 ? '+' : ''} ${c} = 0`;
      answer = `𝑥 = ${Math.round(x1*100)/100} or 𝑥 = ${Math.round(x2*100)/100}`;
    } else {
      expr = `Solve: 𝑥² + 5𝑥 + 6 = 0`;
      answer = `𝑥 = -2 or 𝑥 = -3`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'factorising-harder-quadratics'){
    // 7.5 Factorising Harder Quadratics
    const a = Math.floor(Math.random() * 3) + 2;
    const root1 = Math.floor(Math.random() * 4) + 1;
    const root2 = Math.floor(Math.random() * 3) + 1;
    
    expr = `Factorise: ${a}𝑥² + ${a*(root1+root2)}𝑥 + ${a*root1*root2}`;
    answer = `${a}(𝑥 + ${root1})(𝑥 + ${root2})`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'algebraic-fractions'){
    // 7.6 Algebraic Fractions
    const num = Math.floor(Math.random() * 6) + 2;
    const denom = Math.floor(Math.random() * 5) + 2;
    
    expr = `Simplify: (${num}𝑥)/(${denom}𝑥)`;
    answer = `${num}/${denom}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'rearranging-harder-formulae'){
    // 7.7 Rearranging Harder Formulae
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 4) + 1;
    
    expr = `Make 𝑥 the subject: 𝑦 = ${a}(𝑥 + ${b})`;
    answer = `𝑥 = 𝑦/${a} - ${b}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'trig-exponential-graphs'){
    // 7.8 Trigonometric and Exponential Graphs
    const type = pick(['sin', 'cos', 'exponential']);
    const x = Math.floor(Math.random() * 180) + 30;
    
    if(type === 'sin'){
      expr = `At what angle does sin(𝑥) = 1?`;
      answer = 90;
    } else if(type === 'cos'){
      expr = `At what angle does cos(𝑥) = 0?`;
      answer = 90;
    } else {
      const base = 2;
      const exp = Math.floor(Math.random() * 5) + 1;
      answer = Math.pow(base, exp);
      expr = `Calculate: ${base}^${exp}`;
    }
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'inverse-composite-functions'){
    // 7.9 Inverse and Composite Functions
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 8) + 1;
    
    expr = `f(𝑥) = ${a}𝑥 + ${b}. Find the inverse function f⁻¹(𝑥)`;
    answer = `(𝑥 - ${b})/${a}`;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'iteration'){
    // 7.10 Iteration
    const x0 = Math.floor(Math.random() * 5) + 2;
    const iterations = 2;
    let x = x0;
    for(let i = 0; i < iterations; i++){
      x = (x + 2) / 2;
    }
    
    expr = `Using iteration formula 𝑥ₙ₊₁ = (𝑥ₙ + 2)/2 with 𝑥₀ = ${x0}, find 𝑥₂`;
    answer = Math.round(x * 100) / 100;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'area-any-triangle'){
    // 7.11 Finding the Area of Any Triangle
    const a = Math.floor(Math.random() * 10) + 5;
    const b = Math.floor(Math.random() * 8) + 4;
    const angle = pick([30, 45, 60]);
    const sinAngle = angle === 30 ? 0.5 : angle === 45 ? 0.707 : 0.866;
    const area = 0.5 * a * b * sinAngle;
    
    expr = `Find the area of a triangle with sides ${a}cm and ${b}cm and included angle ${angle}°`;
    answer = Math.round(area * 100) / 100;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'sine-rule'){
    // 7.12 The Sine Rule
    const a = Math.floor(Math.random() * 12) + 8;
    const angleA = pick([30, 45, 60]);
    const angleB = pick([30, 45, 60]);
    const sinA = angleA === 30 ? 0.5 : angleA === 45 ? 0.707 : 0.866;
    const sinB = angleB === 30 ? 0.5 : angleB === 45 ? 0.707 : 0.866;
    const b = (a * sinB) / sinA;
    
    expr = `In a triangle, a = ${a}cm, angle A = ${angleA}°, angle B = ${angleB}°. Find side b using sine rule.`;
    answer = Math.round(b * 100) / 100;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'cosine-rule'){
    // 7.13 The Cosine Rule
    const a = Math.floor(Math.random() * 10) + 6;
    const b = Math.floor(Math.random() * 8) + 5;
    const angleC = pick([60, 90, 120]);
    const cosC = angleC === 60 ? 0.5 : angleC === 90 ? 0 : -0.5;
    const c = Math.sqrt(a*a + b*b - 2*a*b*cosC);
    
    expr = `In a triangle with sides a = ${a}cm, b = ${b}cm and angle C = ${angleC}°, find side c using cosine rule.`;
    answer = Math.round(c * 100) / 100;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'congruent-triangles'){
    // 7.14 Congruent Triangles
    const conditions = ['SSS', 'SAS', 'ASA', 'RHS'];
    const condition = pick(conditions);
    
    expr = `Two triangles have all three sides equal. Which congruence condition is this?`;
    answer = 'SSS';
    return { expr, answer, parts: null };
  }
  
  else if(topic === '3d-pythagoras-trig'){
    // 7.15 3d Pythagoras and Trigonometry
    const l = Math.floor(Math.random() * 8) + 4;
    const w = Math.floor(Math.random() * 6) + 3;
    const h = Math.floor(Math.random() * 5) + 2;
    const diagonal = Math.sqrt(l*l + w*w + h*h);
    
    expr = `Find the space diagonal of a cuboid with dimensions ${l}cm × ${w}cm × ${h}cm`;
    answer = Math.round(diagonal * 100) / 100;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'histograms'){
    // 7.16 Histograms
    const classWidth = pick([5, 10, 20]);
    const frequency = Math.floor(Math.random() * 20) + 10;
    const frequencyDensity = frequency / classWidth;
    
    expr = `A histogram bar has frequency ${frequency} and class width ${classWidth}. Find the frequency density.`;
    answer = frequencyDensity;
    return { expr, answer, parts: null };
  }
  
  else if(topic === 'conditional-probability'){
    // 7.17 Conditional Probability
    const total = Math.floor(Math.random() * 50) + 50;
    const eventA = Math.floor(total * 0.6);
    const both = Math.floor(eventA * 0.4);
    const prob = Math.round((both / eventA) * 100) / 100;
    
    expr = `P(A) = ${eventA}/${total}, P(A and B) = ${both}/${total}. Find P(B|A).`;
    answer = prob;
    return { expr, answer, parts: null };
  }
  
  else {
    const ops = ['+','-','*'];
    op = ops[Math.floor(Math.random()*ops.length)];
    expr = `${a} ${op} ${b} = ?`;
    // Evaluate only the arithmetic part (strip the "= ?") to avoid
    // SyntaxError when passing the whole question string to eval.
    try {
      const evalExpr = `${a} ${op} ${b}`;
      // eslint-disable-next-line no-eval
      answer = eval(evalExpr);
    } catch (e) {
      answer = null;
    }
    return {expr, answer, parts: null};
  }
}

export default function Quiz({onBack, topic}){
  const initialQuestion = generateQuestion(topic);
  const [q, setQ] = useState(initialQuestion);
  const [input, setInput] = useState('');
  const [partInputs, setPartInputs] = useState([]);
  const [score, setScore] = useState(0);
  const [asked, setAsked] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [currentPart, setCurrentPart] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  
  // Question history for navigation - stores question + user state
  const [questionHistory, setQuestionHistory] = useState([{
    question: initialQuestion,
    userInput: '',
    userPartInputs: [],
    userFeedback: '',
    userDroppedTallies: {},
    userDroppedCircles: {},
    userFrequencyInputs: {},
    userKeyInput: ''
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Drag and drop state for completion questions
  const [draggedTally, setDraggedTally] = useState(null);
  const [droppedTallies, setDroppedTallies] = useState({}); // Now stores array of tally values
  const [keyInput, setKeyInput] = useState(''); // User input for key value
  const [frequencyInputs, setFrequencyInputs] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({x: 0, y: 0});
  const [dropTargets, setDropTargets] = useState({});
  const [dragFromCell, setDragFromCell] = useState(null); // {day: 'Friday', index: 0}
  const [draggedCircle, setDraggedCircle] = useState(null); // For pictogram circles
  const [droppedCircles, setDroppedCircles] = useState({}); // Circles dropped in pictogram
  const [circleDropTargets, setCircleDropTargets] = useState({});
  const [dragFromCircleCell, setDragFromCircleCell] = useState(null);
  const panValue = useRef(new Animated.ValueXY()).current;
  
  // Flag to prevent reset when navigating history
  const [isNavigating, setIsNavigating] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Slide animation using Animated API (works on native and web)
  const slideAnim = useRef(new Animated.Value(0)).current; // pixels
  const SLIDE_DISTANCE = 100; // px slide distance
  const SLIDE_DURATION = 50; // ms (0.05s)

  const slideTransition = (direction, updateContent) => {
    // direction: 1 = forward (slide left), -1 = backward (slide right)
    Animated.timing(slideAnim, {
      toValue: direction * SLIDE_DISTANCE,
      duration: SLIDE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      if (typeof updateContent === 'function') updateContent();
      // jump to opposite side then slide back in
      slideAnim.setValue(-direction * SLIDE_DISTANCE);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: SLIDE_DURATION,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(()=>{ 
    // Only reset if we're not navigating through history
    if (!isNavigating) {
      setFeedback(''); 
      setInput(''); 
      if(q.parts && q.parts.length){
        setPartInputs(Array(q.parts.length).fill(''));
      } else {
        setPartInputs([]);
      }
      // Reset drag-and-drop state
      setDraggedTally(null);
      setDroppedTallies({});
      setFrequencyInputs({});
      setIsDragging(false);
      setDropTargets({});
      setDraggedCircle(null);
      setDroppedCircles({});
      setCircleDropTargets({});
      setDragFromCircleCell(null);
      setKeyInput(''); // Reset key input
      panValue.setValue({x: 0, y: 0});
    }
    // Reset the flag after state has been set
    setIsNavigating(false);
  },[q]);

  // Global drag handlers for both tallies and circles
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e) => {
      e.preventDefault();
      setDragPosition({x: e.clientX, y: e.clientY});
    };

    const handleGlobalMouseUp = (e) => {
      e.preventDefault();
      const dropX = e.clientX;
      const dropY = e.clientY;

      // Handle tally drops
      if (draggedTally !== null) {
        Object.keys(dropTargets).forEach(day => {
          const target = dropTargets[day];
          if (target && 
              dropX >= target.x && 
              dropX <= target.x + target.width &&
              dropY >= target.y && 
              dropY <= target.y + target.height) {
            setDroppedTallies(prev => ({
              ...prev, 
              [day]: [...(prev[day] || []), draggedTally]
            }));
          }
        });
        setDraggedTally(null);
      }
      // Handle circle drops
      else if (draggedCircle !== null) {
        Object.keys(circleDropTargets).forEach(day => {
          const target = circleDropTargets[day];
          if (target && 
              dropX >= target.x && 
              dropX <= target.x + target.width &&
              dropY >= target.y && 
              dropY <= target.y + target.height) {
            setDroppedCircles(prev => ({
              ...prev, 
              [day]: [...(prev[day] || []), draggedCircle]
            }));
          }
        });
        setDraggedCircle(null);
      }
      // Handle dragging tally from cell
      else if (dragFromCell) {
        const removalZone = window.removalZone;
        let droppedOnRemoval = false;
        
        if (removalZone &&
            dropX >= removalZone.x && 
            dropX <= removalZone.x + removalZone.width &&
            dropY >= removalZone.y && 
            dropY <= removalZone.y + removalZone.height) {
          droppedOnRemoval = true;
        }
        
        let droppedOnTarget = false;
        Object.keys(dropTargets).forEach(day => {
          const target = dropTargets[day];
          if (target && 
              dropX >= target.x && 
              dropX <= target.x + target.width &&
              dropY >= target.y && 
              dropY <= target.y + target.height) {
            droppedOnTarget = true;
          }
        });
        
        if (droppedOnRemoval || !droppedOnTarget) {
          setDroppedTallies(prev => {
            const updated = {...prev};
            const tallies = updated[dragFromCell.day] || [];
            tallies.splice(dragFromCell.index, 1);
            if (tallies.length === 0) {
              delete updated[dragFromCell.day];
            } else {
              updated[dragFromCell.day] = tallies;
            }
            return updated;
          });
        }
        setDragFromCell(null);
      }
      // Handle dragging circle from cell
      else if (dragFromCircleCell) {
        const removalZone = window.removalZone;
        let droppedOnRemoval = false;
        
        if (removalZone &&
            dropX >= removalZone.x && 
            dropX <= removalZone.x + removalZone.width &&
            dropY >= removalZone.y && 
            dropY <= removalZone.y + removalZone.height) {
          droppedOnRemoval = true;
        }
        
        let droppedOnTarget = false;
        Object.keys(circleDropTargets).forEach(day => {
          const target = circleDropTargets[day];
          if (target && 
              dropX >= target.x && 
              dropX <= target.x + target.width &&
              dropY >= target.y && 
              dropY <= target.y + target.height) {
            droppedOnTarget = true;
          }
        });
        
        if (droppedOnRemoval || !droppedOnTarget) {
          setDroppedCircles(prev => {
            const updated = {...prev};
            const circles = updated[dragFromCircleCell.day] || [];
            circles.splice(dragFromCircleCell.index, 1);
            if (circles.length === 0) {
              delete updated[dragFromCircleCell.day];
            } else {
              updated[dragFromCircleCell.day] = circles;
            }
            return updated;
          });
        }
        setDragFromCircleCell(null);
      }

      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, draggedTally, draggedCircle, dragFromCell, dragFromCircleCell, dropTargets, circleDropTargets]);

  const submit = () => {
    let correctAnswer;
    const hasParts = q.parts && q.parts.length > 0;
    const isCompletion = q.table && q.table.isCompletion;
    
    // Handle multi-part-pictogram questions
    if(q.questionType === 'multi-part-pictogram'){
      const errors = [];
      const successes = [];
      let pointsEarned = 0;
      
      // Part (a): Check numeric answer for March
      const partAAnswer = parseInt(partInputs[0]);
      const expectedPartA = q.parts[0].answer;
      if(partAAnswer === expectedPartA){
        successes.push(`a) ✓ Correct! ${expectedPartA} ${q.context?.itemPlural || 'items'} were sold in March`);
        pointsEarned++;
      } else {
        errors.push(`a) ✗ You answered ${partAAnswer || 'nothing'}, but the correct answer is ${expectedPartA}`);
      }
      
      // Part (b): Check pictogram completion for April
      const aprilMonth = q.aprilInfo.month;
      const expectedSquares = q.aprilInfo.squares;
      const userCircles = droppedCircles[aprilMonth] || [];
      const circleSum = userCircles.reduce((sum, circleType) => {
        if(circleType === 'full') return sum + 1;
        if(circleType === 'half') return sum + 0.5;
        if(circleType === 'quarter') return sum + 0.25;
        return sum;
      }, 0);
      
      if(Math.abs(circleSum - expectedSquares) < 0.01){
        successes.push(`b) ✓ Correct! You placed ${expectedSquares} square${expectedSquares !== 1 ? 's' : ''} for ${aprilMonth}`);
        pointsEarned++;
      } else {
        errors.push(`b) ✗ You placed ${circleSum} square${circleSum !== 1 ? 's' : ''} for ${aprilMonth}, but it should be ${expectedSquares} square${expectedSquares !== 1 ? 's' : ''}`);
      }
      
      // Part (c): Check total calculation
      const partCAnswer = parseInt(partInputs[2]);
      const expectedPartC = q.parts[2].answer;
      if(partCAnswer === expectedPartC){
        successes.push(`c) ✓ Correct! The total is ${expectedPartC} ${q.context?.itemPlural || 'items'}`);
        pointsEarned++;
      } else {
        errors.push(`c) ✗ You answered ${partCAnswer || 'nothing'}, but the correct total is ${expectedPartC}`);
      }
      
      setScore(s => s + pointsEarned);
      const feedback = [...successes, ...errors].join('\n');
      setFeedback(feedback);
      setAsked(a => a + 3); // 3 parts
      return;
    }
    
    // Handle pictogram-with-calculation questions
    if(q.questionType === 'pictogram-with-calculation'){
      const errors = [];
      const successes = [];
      let pointsEarned = 0;
      
      // Part (a)(i): Check first day answer
      const partAiAnswer = parseInt(partInputs[0]);
      const expectedAi = q.parts[0].subParts[0].answer;
      if(partAiAnswer === expectedAi){
        successes.push(`a)(i) ✓ Correct! ${expectedAi} ${q.context?.itemPlural || 'items'}`);
        pointsEarned++;
      } else {
        errors.push(`a)(i) ✗ You answered ${partAiAnswer || 'nothing'}, but the correct answer is ${expectedAi}`);
      }
      
      // Part (a)(ii): Check second day answer
      const partAiiAnswer = parseInt(partInputs[1]);
      const expectedAii = q.parts[0].subParts[1].answer;
      if(partAiiAnswer === expectedAii){
        successes.push(`a)(ii) ✓ Correct! ${expectedAii} ${q.context?.itemPlural || 'items'}`);
        pointsEarned++;
      } else {
        errors.push(`a)(ii) ✗ You answered ${partAiiAnswer || 'nothing'}, but the correct answer is ${expectedAii}`);
      }
      
      // Part (b): Check pictogram completion for both days
      const day3 = q.calculationInfo.day3;
      const day4 = q.calculationInfo.day4;
      const expectedDay3Circles = q.calculationInfo.day3Circles;
      const expectedDay4Circles = q.calculationInfo.day4Circles;
      
      const userDay3Circles = droppedCircles[day3] || [];
      const day3Sum = userDay3Circles.reduce((sum, circleType) => {
        if(circleType === 'full') return sum + 1;
        if(circleType === 'half') return sum + 0.5;
        if(circleType === 'quarter') return sum + 0.25;
        return sum;
      }, 0);
      
      const userDay4Circles = droppedCircles[day4] || [];
      const day4Sum = userDay4Circles.reduce((sum, circleType) => {
        if(circleType === 'full') return sum + 1;
        if(circleType === 'half') return sum + 0.5;
        if(circleType === 'quarter') return sum + 0.25;
        return sum;
      }, 0);
      
      if(Math.abs(day3Sum - expectedDay3Circles) < 0.01){
        successes.push(`b) ${day3}: ✓ Correct! ${expectedDay3Circles} circle${expectedDay3Circles !== 1 ? 's' : ''}`);
        pointsEarned++;
      } else {
        errors.push(`b) ${day3}: ✗ You placed ${day3Sum} circle${day3Sum !== 1 ? 's' : ''}, but it should be ${expectedDay3Circles}`);
      }
      
      if(Math.abs(day4Sum - expectedDay4Circles) < 0.01){
        successes.push(`b) ${day4}: ✓ Correct! ${expectedDay4Circles} circle${expectedDay4Circles !== 1 ? 's' : ''}`);
        pointsEarned++;
      } else {
        errors.push(`b) ${day4}: ✗ You placed ${day4Sum} circle${day4Sum !== 1 ? 's' : ''}, but it should be ${expectedDay4Circles}`);
      }
      
      setScore(s => s + pointsEarned);
      const feedback = [...successes, ...errors].join('\n');
      setFeedback(feedback);
      setAsked(a => a + 4); // 4 sub-parts total
      return;
    }
    
    // Handle pictogram-with-clues questions
    if(q.questionType === 'pictogram-with-clues'){
      let allCorrect = true;
      const errors = [];
      const successes = [];
      const keyVal = q.extraTable.key;
      
      // Check key input
      const userKey = parseInt(keyInput);
      if(userKey !== keyVal) {
        allCorrect = false;
        errors.push(`Key: ✗ You entered ${userKey || 'nothing'} but it should be ${keyVal}`);
      } else {
        successes.push(`Key: ✓ Correct (${keyVal})`);
      }
      
      q.extraTable.rows.forEach((row) => {
        const day = row[0];
        if(row[1] === null) { // This day needs to be completed
          const userCircles = droppedCircles[day] || [];
          
          // Calculate total from circles: full=1, half=0.5, quarter=0.25
          const circleSum = userCircles.reduce((sum, circleType) => {
            if(circleType === 'full') return sum + 1;
            if(circleType === 'half') return sum + 0.5;
            if(circleType === 'quarter') return sum + 0.25;
            return sum;
          }, 0);
          
          // Find expected value from answer
          const expectedPart = q.parts[0].answer;
          const dayMatch = expectedPart.match(new RegExp(`${day}=([\\d.]+)`));
          if(dayMatch) {
            const expectedSymbols = parseFloat(dayMatch[1]);
            if(Math.abs(circleSum - expectedSymbols) > 0.01) {
              allCorrect = false;
              const circleTypes = userCircles.map(c => c === 'full' ? 'full' : c === 'half' ? 'half' : 'quarter').join(', ');
              errors.push(`${day}: ✗ You placed ${userCircles.length ? `${circleSum} symbols (${circleTypes})` : 'no circles'} but it should be ${expectedSymbols} symbols`);
            } else {
              successes.push(`${day}: ✓ Correct (${circleSum} symbols)`);
            }
          }
        }
      });
      
      if(allCorrect){
        setScore(s => s + 1);
        setFeedback(`✓ All Correct!\n${successes.join('\n')}`);
        setAsked(a => a + 1);
      } else {
        const feedback = [...successes, ...errors].join('\n');
        setFeedback(feedback);
        setAsked(a => a + 1);
      }
      return;
    }
    
    // Handle completion questions separately
    if(isCompletion){
      let tallyCorrect = true;
      let pictogramCorrect = true;
      const errors = [];
      const successes = [];
      let pointsEarned = 0;
      
      // Part A: Check tally chart
      q.table.rows.forEach((row) => {
        const day = row.day;
        const expectedCount = row.tallyCount || row.frequency; // Get the expected value
        
        // Check if this row needs tally drag-and-drop (tallyCount is null)
        if(row.tallyCount === null) {
          const userTallies = droppedTallies[day] || [];
          const tallySum = userTallies.reduce((sum, val) => sum + val, 0);
          
          // Check sum first
          if(tallySum !== expectedCount){
            tallyCorrect = false;
            errors.push(`✗ Tally ${day}: Should total ${expectedCount} (you have ${tallySum})`);
          } else {
            // Check chronological order: should be groups of 5 then remainder
            const fullGroups = Math.floor(expectedCount / 5);
            const remainder = expectedCount % 5;
            
            const expectedTallies = [];
            for(let j = 0; j < fullGroups; j++) {
              expectedTallies.push(5);
            }
            if(remainder > 0) {
              expectedTallies.push(remainder);
            }
            
            // Compare arrays for correct chronological order
            const isCorrectOrder = userTallies.length === expectedTallies.length &&
              userTallies.every((val, idx) => val === expectedTallies[idx]);
            
            if(!isCorrectOrder){
              tallyCorrect = false;
              const expectedStr = expectedTallies.map(n => n === 5 ? '5-group' : `${n}-tally`).join(', ');
              errors.push(`✗ Tally ${day}: Should be in order: ${expectedStr}`);
            } else {
              successes.push(`✓ Tally ${day}: Correct (${expectedCount} total)`);
            }
          }
        } 
        // Check if this row needs frequency input (frequency is null)
        else if(row.frequency === null) {
          const userFreq = parseInt(frequencyInputs[day]);
          if(userFreq !== expectedCount){
            tallyCorrect = false;
            errors.push(`✗ Tally ${day}: Frequency should be ${expectedCount} (you entered ${userFreq || 'nothing'})`);
          } else {
            successes.push(`✓ Frequency ${day}: Correct (${expectedCount})`);
          }
        }
      });
      
      // Part B: Check pictogram circles
      if(q.extraTable && q.extraTable.isIncomplete) {
        q.extraTable.rows.forEach((row) => {
          const day = row[0];
          if(row[1] === null) { // This day needs to be completed
            const userCircles = droppedCircles[day] || [];
            
            // Calculate total from circles: full=1, half=0.5
            const circleSum = userCircles.reduce((sum, circleType) => {
              if(circleType === 'full') return sum + 1;
              if(circleType === 'half') return sum + 0.5;
              return sum;
            }, 0);
            
            // Find expected value from parts answer
            const expectedPart = q.parts[1].answer;
            const dayMatch = expectedPart.match(new RegExp(`${day}=([\\d.]+)`));
            if(dayMatch) {
              const expectedSymbols = parseFloat(dayMatch[1]);
              if(Math.abs(circleSum - expectedSymbols) > 0.01) {
                pictogramCorrect = false;
                const circleTypes = userCircles.map(c => c === 'full' ? 'full' : 'half').join(', ');
                errors.push(`✗ Pictogram ${day}: Should have ${expectedSymbols} symbols (you placed ${circleSum} - ${circleTypes || 'none'})`);
              } else {
                successes.push(`✓ Pictogram ${day}: Correct (${expectedSymbols} symbols)`);
              }
            }
          }
        });
      }
      
      // Award points: 1 point per part (2 total)
      if(tallyCorrect) pointsEarned++;
      if(pictogramCorrect) pointsEarned++;
      
      setScore(s => s + pointsEarned);
      setAsked(a => a + 2); // This is a 2-mark question
      
      // Separate tally and pictogram feedback
      const tallySuccesses = successes.filter(s => s.includes('Tally') || s.includes('Frequency'));
      const tallyErrors = errors.filter(e => e.includes('Tally'));
      const pictogramSuccesses = successes.filter(s => s.includes('Pictogram'));
      const pictogramErrors = errors.filter(e => e.includes('Pictogram'));
      
      let feedbackParts = [];
      
      // Part A: Tally feedback
      if (tallySuccesses.length > 0) {
        feedbackParts.push(`[CORRECT_HEADER]\na) ✓ Complete the tally chart\n${tallySuccesses.join('\n')}`);
      }
      if (tallyErrors.length > 0) {
        feedbackParts.push(`[ERROR_HEADER]\na) ✗ Complete the tally chart\n${tallyErrors.join('\n')}`);
      }
      
      // Part B: Pictogram feedback
      if (pictogramSuccesses.length > 0) {
        feedbackParts.push(`[CORRECT_HEADER]\nb) ✓ Complete the pictogram\n${pictogramSuccesses.join('\n')}`);
      }
      if (pictogramErrors.length > 0) {
        feedbackParts.push(`[ERROR_HEADER]\nb) ✗ Complete the pictogram\n${pictogramErrors.join('\n')}`);
      }
      
      setFeedback(feedbackParts.join('\n'));
      return;
    }
    
    if(hasParts){
      let localScore = 0;
      const normalize = (v) => String(v).replace(/\s/g,'').toLowerCase();

      // Internal AI system for intelligent answer analysis
      const analyzeAnswer = (userAnswer, expectedAnswer) => {
        if (!userAnswer || !expectedAnswer) return false;
        
        const userLower = userAnswer.toLowerCase().trim();
        const expectedLower = expectedAnswer.toLowerCase();
        
        // Calculate Levenshtein distance for fuzzy matching
        const levenshtein = (a, b) => {
          const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
          for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
          for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
          for (let j = 1; j <= b.length; j++) {
            for (let i = 1; i <= a.length; i++) {
              const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
              matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
              );
            }
          }
          return matrix[b.length][a.length];
        };
        
        // Normalize and check similarity
        const normUser = normalize(userAnswer);
        const normExpected = normalize(expectedAnswer);
        
        // Exact match after normalization
        if (normUser === normExpected) return true;
        
        // Fuzzy match with 85% similarity threshold
        const distance = levenshtein(normUser, normExpected);
        const maxLen = Math.max(normUser.length, normExpected.length);
        const similarity = 1 - (distance / maxLen);
        if (similarity >= 0.85) return true;
        
        // Semantic analysis for "what's wrong" questions
        if (expectedLower.includes('does not match') || expectedLower.includes('wrong') || 
            expectedLower.includes('symbols do not match')) {
          
          // Extract key concepts from expected answer
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
          const expectedDay = days.find(d => expectedLower.includes(d));
          
          // Tokenize user answer
          const userTokens = userLower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 0);
          
          // Check if correct day is mentioned
          const hasDayMention = expectedDay && (userLower.includes(expectedDay) || 
            userTokens.some(t => levenshtein(t, expectedDay) <= 2));
          
          if (!hasDayMention) return false;
          
          // Concept synonyms and variations
          const mismatchTerms = ['match', 'wrong', 'incorrect', 'error', 'differ', 'not', 'mismatch', 
                                 'doesnt', "doesn't", 'dont', "don't", 'cannot', "can't", 'inconsistent'];
          const frequencyTerms = ['frequency', 'freq', 'count', 'number', 'total', 'amount'];
          const tallyTerms = ['tally', 'talli', 'tallies', 'mark', 'marks', 'count'];
          const symbolTerms = ['symbol', 'circle', 'circles', 'key', 'represent', 'representation', 
                              'pictogram', 'diagram', 'half', 'decimal', 'point', 'quarter', 'fraction'];
          const cantSellTerms = ['sell', 'sold', 'cannot', "can't", 'half', 'quarter', 'fraction', 'decimal', 'point'];
          
          // Check for mismatch concept
          const hasMismatch = mismatchTerms.some(term => 
            userTokens.some(t => t === term || levenshtein(t, term) <= 1)
          );
          
          // Check for relevant domain terms based on expected answer
          let hasRelevantTerm = false;
          if (expectedLower.includes('frequency')) {
            hasRelevantTerm = frequencyTerms.some(term => 
              userTokens.some(t => t === term || levenshtein(t, term) <= 2)
            );
            // Also accept if they mention tally since frequency comes from tallies
            if (!hasRelevantTerm) {
              hasRelevantTerm = tallyTerms.some(term => 
                userTokens.some(t => t === term || levenshtein(t, term) <= 1)
              );
            }
          } else if (expectedLower.includes('symbols') || expectedLower.includes('key')) {
            hasRelevantTerm = symbolTerms.some(term => 
              userTokens.some(t => t === term || levenshtein(t, term) <= 2)
            );
            
            // Also accept answers about not being able to sell fractions
            const hasCantSellConcept = cantSellTerms.filter(term => 
              userTokens.some(t => t === term || levenshtein(t, term) <= 1)
            ).length >= 2; // Need at least 2 related terms
            
            if (hasCantSellConcept && hasDayMention) return true;
          }
          
          // Extract numbers from both expected and user answers
          const expectedNumbers = (expectedLower.match(/\d+/g) || []).map(n => parseInt(n));
          const userNumbers = (userLower.match(/\d+/g) || []).map(n => parseInt(n));
          
          // If user mentions specific numbers, verify they're correct
          if (userNumbers.length > 0 && expectedNumbers.length > 0) {
            // Check if the key numbers from expected answer appear in user answer
            const hasCorrectNumbers = expectedNumbers.every(expectedNum => 
              userNumbers.some(userNum => userNum === expectedNum)
            );
            
            // If they mention numbers but get them wrong, reject the answer
            if (!hasCorrectNumbers) return false;
          }
          
          // Accept if they mentioned day + mismatch concept + relevant term
          if (hasDayMention && hasMismatch && hasRelevantTerm) return true;
          
          // Also accept reasonable explanations that describe the error (only if numbers are correct or not mentioned)
          const hasNumbers = /\d+/.test(userLower);
          const explainsProblem = (hasMismatch || userLower.includes('should') || 
                                  userLower.includes('but') || userLower.includes('however')) &&
                                 (hasNumbers || hasRelevantTerm);
          
          if (hasDayMention && explainsProblem) return true;
        }
        
        return false;
      };

      const partFeedback = q.parts.map((p, idx) => {
        const expected = p.answer;
        const userVal = partInputs[idx];
        let correct = false;
        let detailedFeedback = '';
        
        if (typeof expected === 'number' && Number.isFinite(expected)){
          const num = Number(userVal);
          correct = Number.isFinite(num) && Math.abs(num - expected) < 1e-9;
          if (!correct) {
            detailedFeedback = userVal ? `You wrote "${userVal}" but the correct answer is ${expected}` : `You didn't provide an answer. The correct answer is ${expected}`;
          } else {
            detailedFeedback = `Correct! ${expected}`;
          }
        } else {
          // For "what's wrong" questions with tally/frequency, validate numbers against actual data
          if (q.table && q.table.rows && (expected.includes('does not match') || expected.includes('frequency'))) {
            const userLower = userVal.toLowerCase().trim();
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            const userDay = days.find(d => userLower.includes(d));
            
            if (userDay) {
              // Find the row data for this day
              const rowData = q.table.rows.find(r => r.day && r.day.toLowerCase() === userDay);
              if (rowData) {
                const correctTally = rowData.tallyCount;
                const wrongFrequency = rowData.frequency;
                
                // Extract numbers from user's answer
                const userNumbers = (userVal.match(/\d+\.?\d*/g) || []).map(n => parseFloat(n));
                
                // If user mentions specific numbers, they must be correct
                if (userNumbers.length > 0) {
                  // Check if they mention the correct tally count or identify the wrong frequency
                  const mentionsCorrectTally = userNumbers.includes(correctTally);
                  const mentionsWrongFrequency = userNumbers.includes(wrongFrequency);
                  
                  // Accept only if they mention the correct tally count (what it SHOULD be)
                  correct = mentionsCorrectTally && !userNumbers.some(n => n !== correctTally && n !== wrongFrequency);
                } else {
                  // If no numbers mentioned, use semantic analysis
                  correct = analyzeAnswer(userVal, expected);
                }
              } else {
                correct = analyzeAnswer(userVal, expected);
              }
            } else {
              correct = analyzeAnswer(userVal, expected);
            }
          } else if (q.extraTable && q.extraTable.rows && expected.includes('symbols do not match')) {
            // For pictogram "what's wrong" questions
            const userLower = userVal.toLowerCase().trim();
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            const userDay = days.find(d => userLower.includes(d));
            
            if (userDay) {
              // Find the pictogram row data for this day
              const rowData = q.extraTable.rows.find(r => r[0] && r[0].toLowerCase() === userDay);
              if (rowData && q.extraTable.key) {
                const symbolCount = rowData[1]; // Number of symbols (could be decimal like 4.5)
                const actualValue = symbolCount * q.extraTable.key; // Actual value (e.g., 4.5 * 3 = 13.5)
                const fractionalPart = actualValue - Math.floor(actualValue); // e.g., 0.5 from 13.5
                
                // Extract numbers from user's answer
                const userNumbers = (userVal.match(/\d+\.?\d*/g) || []).map(n => parseFloat(n));
                
                // If user mentions specific numbers, validate them
                if (userNumbers.length > 0) {
                  // Accept if they correctly identify the actual value (with decimal)
                  const mentionsActualValue = userNumbers.some(n => Math.abs(n - actualValue) < 0.01);
                  const mentionsSymbolCount = userNumbers.some(n => Math.abs(n - symbolCount) < 0.01);
                  const mentionsFractionalPart = userNumbers.some(n => Math.abs(n - fractionalPart) < 0.01);
                  
                  // Valid numbers: actualValue (13.5), symbolCount (4.5), fractionalPart (0.5)
                  // Also accept fractionalPart + 1 for references like "1.5 books" when fraction is 0.5
                  const validNumbers = [actualValue, symbolCount, fractionalPart];
                  if (fractionalPart > 0) {
                    validNumbers.push(fractionalPart + 1); // e.g., 1.5 for a 0.5 fraction
                  }
                  
                  // Check if user mentioned any invalid numbers
                  const hasInvalidNumbers = userNumbers.some(n => 
                    !validNumbers.some(valid => Math.abs(n - valid) < 0.01)
                  );
                  
                  // Must have valid numbers, keywords, and no invalid numbers
                  const hasRelevantKeyword = userLower.includes('sell') || userLower.includes('fraction') || 
                                            userLower.includes('decimal') || userLower.includes('half') || 
                                            userLower.includes('quarter');
                  
                  correct = (mentionsActualValue || mentionsSymbolCount || mentionsFractionalPart) && 
                           hasRelevantKeyword && !hasInvalidNumbers;
                } else {
                  // If no numbers, use semantic analysis
                  correct = analyzeAnswer(userVal, expected);
                }
              } else {
                correct = analyzeAnswer(userVal, expected);
              }
            } else {
              correct = analyzeAnswer(userVal, expected);
            }
          } else {
            // Use internal AI system for text analysis
            correct = analyzeAnswer(userVal, expected);
          }
          if (!correct) {
            // Provide detailed error feedback for "what's wrong" questions
            if (q.table && q.table.rows && (expected.includes('does not match') || expected.includes('frequency'))) {
              const userLower = userVal.toLowerCase().trim();
              const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
              const userDay = days.find(d => userLower.includes(d));
              
              if (userDay) {
                const rowData = q.table.rows.find(r => r.day && r.day.toLowerCase() === userDay);
                if (rowData) {
                  const correctTally = rowData.tallyCount;
                  const wrongFrequency = rowData.frequency;
                  detailedFeedback = `You wrote "${userVal}". The frequency for ${userDay.charAt(0).toUpperCase() + userDay.slice(1)} should be ${correctTally} (matching the tally), not ${wrongFrequency}`;
                } else {
                  detailedFeedback = userVal ? `You wrote "${userVal}". Expected: ${expected}` : `You didn't provide an answer. Expected: ${expected}`;
                }
              } else {
                detailedFeedback = userVal ? `You wrote "${userVal}". Expected: ${expected}` : `You didn't provide an answer. Expected: ${expected}`;
              }
            } else if (q.extraTable && q.extraTable.rows && expected.includes('symbols do not match')) {
              const userLower = userVal.toLowerCase().trim();
              const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
              const userDay = days.find(d => userLower.includes(d));
              
              if (userDay) {
                const rowData = q.extraTable.rows.find(r => r[0] && r[0].toLowerCase() === userDay);
                if (rowData && q.extraTable.key) {
                  const symbolCount = rowData[1];
                  const actualValue = symbolCount * q.extraTable.key;
                  const fractionalPart = actualValue - Math.floor(actualValue);
                  const userNumbers = (userVal.match(/\d+\.?\d*/g) || []).map(n => parseFloat(n));
                  
                  // Valid numbers for this question
                  const validNumbers = [actualValue, symbolCount, fractionalPart];
                  if (fractionalPart > 0) validNumbers.push(fractionalPart + 1);
                  
                  // Find any wrong numbers mentioned
                  const wrongNumbers = userNumbers.filter(n => 
                    !validNumbers.some(valid => Math.abs(n - valid) < 0.01)
                  );
                  
                  if (wrongNumbers.length > 0) {
                    detailedFeedback = `You wrote "${userVal}". ${userDay.charAt(0).toUpperCase() + userDay.slice(1)} has ${symbolCount} circles, which equals ${actualValue} ${q.context?.itemPlural || 'items'} (${symbolCount} × ${q.extraTable.key}). The fractional part is ${fractionalPart}, not ${wrongNumbers.join(' or ')}. You cannot sell ${fractionalPart} of an item`;
                  } else {
                    detailedFeedback = `You wrote "${userVal}". ${userDay.charAt(0).toUpperCase() + userDay.slice(1)} has ${symbolCount} circles, which equals ${actualValue} ${q.context?.itemPlural || 'items'} (${symbolCount} × ${q.extraTable.key}). You cannot sell ${fractionalPart} of an item`;
                  }
                } else {
                  detailedFeedback = userVal ? `You wrote "${userVal}". Expected: ${expected}` : `You didn't provide an answer. Expected: ${expected}`;
                }
              } else {
                detailedFeedback = userVal ? `You wrote "${userVal}". Expected: ${expected}` : `You didn't provide an answer. Expected: ${expected}`;
              }
            } else {
              detailedFeedback = userVal ? `You wrote "${userVal}". Expected: ${expected}` : `You didn't provide an answer. Expected: ${expected}`;
            }
          } else {
            // Generate detailed explanation for why the answer is correct
            const userLower = userVal.toLowerCase().trim();
            const expectedLower = expected.toLowerCase();
            const normalize = (v) => String(v).replace(/\s/g,'').toLowerCase();
            
            if (normalize(userVal) === normalize(expected)) {
              detailedFeedback = `Correct! Your answer "${userVal}" matches the expected answer exactly`;
            } else if (expectedLower.includes('does not match') || expectedLower.includes('wrong') || expectedLower.includes('symbols do not match')) {
              // For "what's wrong" questions, explain what they identified
              const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
              const identifiedDay = days.find(d => userLower.includes(d));
              
              if (identifiedDay && (userLower.includes('frequency') || userLower.includes('tally'))) {
                detailedFeedback = `Correct! You correctly identified that ${identifiedDay.charAt(0).toUpperCase() + identifiedDay.slice(1)} has an error - the frequency/tally count doesn't match. Your explanation clearly describes the mismatch`;
              } else if (identifiedDay && (userLower.includes('symbol') || userLower.includes('circle') || userLower.includes('key'))) {
                detailedFeedback = `Correct! You correctly identified that ${identifiedDay.charAt(0).toUpperCase() + identifiedDay.slice(1)} has an error - the pictogram symbols don't match the key value. Your explanation accurately describes the problem`;
              } else if (identifiedDay) {
                detailedFeedback = `Correct! You correctly identified ${identifiedDay.charAt(0).toUpperCase() + identifiedDay.slice(1)} as the day with the error. Your answer shows you understand there's a mismatch in the data`;
              } else {
                detailedFeedback = `Correct! Your answer "${userVal}" accurately describes the error in the chart`;
              }
            } else {
              // For other text answers, provide similarity-based feedback
              detailedFeedback = `Correct! Your answer "${userVal}" is accepted as it accurately conveys the expected information`;
            }
          }
        }
        
        if (correct) localScore += 1;
        return {
          label: `${String.fromCharCode(97+idx)})`,
          status: correct ? '✓' : '✗',
          detail: detailedFeedback
        };
      });

      setScore(s => s + localScore);
      setAsked(a => a + q.parts.length);
      // Format feedback with headers per part
      const feedbackText = partFeedback.map(f => {
        const header = f.status === '✓' ? '[CORRECT_HEADER]' : '[ERROR_HEADER]';
        return `${header}\n${f.label} ${f.status} ${f.detail}`;
      }).join('\n');
      setFeedback(feedbackText);
      return;
    }

    correctAnswer = q.answer;
    
    if (typeof correctAnswer === 'number' && Number.isFinite(correctAnswer)) {
      const val = Number(input);
      if (!Number.isFinite(val)) { 
        setFeedback(`Please enter a number. The correct answer is ${correctAnswer}`); 
        return; 
      }
      if (Math.abs(val - correctAnswer) < 1e-9){ 
        setScore(s => s+1); 
        setFeedback(`✓ Correct! You answered ${val}`);
        setInput('');
        setAsked(a => a+1);
      } else {
        setFeedback(`✗ Wrong. You answered ${val} but the correct answer is ${correctAnswer}`);
        setAsked(a => a+1);
      }
      return;
    }

    const norm = (v) => String(v).replace(/\s/g,'').toLowerCase();
    const user = norm(input);
    const expected = norm(correctAnswer);
    if (user === expected) {
      setScore(s => s+1);
      
      // Generate detailed explanation
      const inputLower = input.toLowerCase().trim();
      const correctLower = correctAnswer.toLowerCase();
      
      if (input.trim() === correctAnswer.trim()) {
        setFeedback(`✓ Correct! Your answer "${input}" matches the expected answer exactly`);
      } else if (correctLower.includes('does not match') || correctLower.includes('wrong') || correctLower.includes('symbols do not match')) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const identifiedDay = days.find(d => inputLower.includes(d));
        
        if (identifiedDay && (inputLower.includes('frequency') || inputLower.includes('tally'))) {
          setFeedback(`✓ Correct! You identified that ${identifiedDay.charAt(0).toUpperCase() + identifiedDay.slice(1)} has an error where the frequency doesn't match the tally marks. Your explanation clearly describes the issue`);
        } else if (identifiedDay && (inputLower.includes('symbol') || inputLower.includes('circle') || inputLower.includes('key'))) {
          setFeedback(`✓ Correct! You identified that ${identifiedDay.charAt(0).toUpperCase() + identifiedDay.slice(1)} has incorrect symbols in the pictogram. Your answer shows understanding of the key relationship`);
        } else if (identifiedDay) {
          setFeedback(`✓ Correct! You correctly identified ${identifiedDay.charAt(0).toUpperCase() + identifiedDay.slice(1)} as having an error. Your observation demonstrates understanding of data consistency`);
        } else {
          setFeedback(`✓ Correct! Your answer "${input}" accurately identifies the problem`);
        }
      } else {
        setFeedback(`✓ Correct! Your answer "${input}" is accurate and shows good understanding`);
      }
      
      setInput('');
      setAsked(a => a+1);
    } else {
      setFeedback(`✗ Wrong. You answered "${input}" but the correct answer is "${correctAnswer}"`);
      setAsked(a => a+1);
    }
  };

  const nextQuestion = () => {
    // forward slide (1) then update content
    slideTransition(1, () => {
      // Save current question state to history before moving
      setQuestionHistory(prev => {
        const updated = [...prev];
        updated[historyIndex] = {
          question: q,
          userInput: input,
          userPartInputs: partInputs,
          userFeedback: feedback,
          userDroppedTallies: droppedTallies,
          userDroppedCircles: droppedCircles,
          userFrequencyInputs: frequencyInputs,
          userKeyInput: keyInput
        };
        return updated;
      });
      setFeedback('');
      setInput('');
      // Generate a new question, retrying a few times if generator returns an invalid value
      let newQuestion = null;
      try {
        for (let attempts = 0; attempts < 5; attempts++) {
          const candidate = generateQuestion(topic);
          if (candidate && (candidate.expr || candidate.parts || candidate.table || candidate.coords || typeof candidate.answer !== 'undefined')) {
            newQuestion = candidate;
            break;
          }
        }
      } catch (e) {
        console.error('generateQuestion error', e);
      }
      if (!newQuestion) {
        // fallback: reuse current question to avoid blank screen
        newQuestion = q || { expr: 'Error generating question', parts: null, answer: null };
      }
      setQ(newQuestion);
      setCurrentPart(0);
      setQuestionNumber(n => n + 1);
      // If we're at the end of history, add new question
      // If we're in the middle of history, truncate and add new question
      setQuestionHistory(prev => {
        const saved = [...prev];
        saved[historyIndex] = {
          question: q,
          userInput: input,
          userPartInputs: partInputs,
          userFeedback: feedback,
          userDroppedTallies: droppedTallies,
          userDroppedCircles: droppedCircles,
          userFrequencyInputs: frequencyInputs,
          userKeyInput: keyInput
        };
        const newHistory = saved.slice(0, historyIndex + 1);
        return [...newHistory, {
          question: newQuestion,
          userInput: '',
          userPartInputs: [],
          userFeedback: '',
          userDroppedTallies: {},
          userDroppedCircles: {},
          userFrequencyInputs: {},
          userKeyInput: ''
        }];
      });
      setHistoryIndex(prev => prev + 1);
    });
  };
  
  const goToPreviousQuestion = () => {
    if (historyIndex > 0) {
      // backward slide (-1) then restore content
      slideTransition(-1, () => {
        // Save current state into history at current index
        setQuestionHistory(prev => {
          const updated = [...prev];
          updated[historyIndex] = {
            question: q,
            userInput: input,
            userPartInputs: partInputs,
            userFeedback: feedback,
            userDroppedTallies: droppedTallies,
            userDroppedCircles: droppedCircles,
            userFrequencyInputs: frequencyInputs,
            userKeyInput: keyInput
          };
          return updated;
        });

        const newIndex = historyIndex - 1;
        const savedState = questionHistory[newIndex];

        // Prevent the effect from clearing state while we restore
        setIsNavigating(true);
        setHistoryIndex(newIndex);
        setQuestionNumber(newIndex + 1);

        if (savedState && savedState.question) {
          setQ(savedState.question);
          setInput(savedState.userInput || '');
          setPartInputs(savedState.userPartInputs || []);
          setFeedback(savedState.userFeedback || '');
          setDroppedTallies(savedState.userDroppedTallies || {});
          setDroppedCircles(savedState.userDroppedCircles || {});
          setFrequencyInputs(savedState.userFrequencyInputs || {});
          setKeyInput(savedState.userKeyInput || '');
        }
        setCurrentPart(0);
      });
    }
  };
  
  const goToNextInHistory = () => {
    if (historyIndex < questionHistory.length - 1) {
      // forward slide (1) then restore content
      slideTransition(1, () => {
        setQuestionHistory(prev => {
          const updated = [...prev];
          updated[historyIndex] = {
            question: q,
            userInput: input,
            userPartInputs: partInputs,
            userFeedback: feedback,
            userDroppedTallies: droppedTallies,
            userDroppedCircles: droppedCircles,
            userFrequencyInputs: frequencyInputs,
            userKeyInput: keyInput
          };
          return updated;
        });
        const newIndex = historyIndex + 1;
        const savedState = questionHistory[newIndex];
        // Set flag to prevent reset
        setIsNavigating(true);
        setHistoryIndex(newIndex);
        setQuestionNumber(newIndex + 1);
        setQ(savedState.question);
        setInput(savedState.userInput);
        setPartInputs(savedState.userPartInputs);
        setFeedback(savedState.userFeedback);
        setDroppedTallies(savedState.userDroppedTallies);
        setDroppedCircles(savedState.userDroppedCircles);
        setFrequencyInputs(savedState.userFrequencyInputs);
        setKeyInput(savedState.userKeyInput);
        setCurrentPart(0);
      });
    }
  };

  // Render circles without vertical line (for pictogram-with-clues)
  const renderCirclesOnly = (count) => {
    if (count === null || count === undefined || isNaN(count)) return null;
    const fullCount = Math.floor(count);
    const decimal = count - fullCount;
    
    const items = [];
    
    const D = 30;  // diameter
    const R = 15;  // radius
    const B = 1.8; // border width
    const M = 7;   // margin

    // Draw full circles (no vertical line)
    for(let i = 0; i < fullCount; i++){
      items.push(
        <View key={`full-${i}`} style={{width:D, height:D, marginRight:M}}>
          <View style={{width:D, height:D, borderRadius:R, borderWidth:B, borderColor:'#000'}}/>
        </View>
      );
    }

    // Draw partial circles
    if(decimal >= 0.4 && decimal <= 0.6){
      // Half circle
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
    } else if(decimal >= 0.15 && decimal < 0.4){
      // Quarter circle (bottom half only)
      items.push(
        <View 
          key="partial" 
          style={{
            width: R,
            height: R,
            marginRight: M,
            overflow: 'hidden',
            borderRightWidth: B,
            borderRightColor: '#000',
            borderBottomWidth: B,
            borderBottomColor: '#000'
          }}
        >
          <View style={{width:D, height:D, borderRadius:R, borderWidth:B, borderColor:'#000', marginTop: -R}}/>
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

  const renderSymbols = (count, keyVal = 1, noLine = false) => {
    if (count === null || count === undefined || isNaN(count)) return null;
    const fullCount = Math.floor(count);
    const decimal = count - fullCount;
    
    const items = [];
    
    const D = 30;  // diameter
    const R = 15;  // radius
    const B = 1.8; // border width
    const M = 7;   // margin

    // Draw full circles (squares for multi-part-pictogram)
    for(let i = 0; i < fullCount; i++){
      items.push(
        <View key={`full-${i}`} style={{width:D, height:D, marginRight:M, position:'relative'}}>
          <View style={{width:D, height:D, borderRadius: noLine ? 0 : R, borderWidth:B, borderColor:'#000'}}/>
          {noLine && (
            <>
              {/* Vertical line through middle */}
              <View style={{position:'absolute', left:R-(B/2), top:0, width:B, height:D, backgroundColor:'#000'}}/>
              {/* Horizontal line through middle */}
              <View style={{position:'absolute', left:0, top:R-(B/2), width:D, height:B, backgroundColor:'#000'}}/>
            </>
          )}
          {!noLine && <View style={{position:'absolute', left:R-(B/2), top:0, width:B, height:D, backgroundColor:'#000'}}/>}
        </View>
      );
    }

    // Draw partial circle/square
    if(decimal > 0.15){
      if(decimal >= 0.4 && decimal <= 0.6){
        // Half circle/square with vertical line on right edge
        items.push(
          <View 
            key="partial" 
            style={{
              width: R,
              height: D,
              marginRight: M,
              overflow: 'hidden',
              borderRightWidth: B,
              borderRightColor: '#000',
              position: 'relative'
            }}
          >
            <View style={{width:D, height:D, borderRadius: noLine ? 0 : R, borderWidth:B, borderColor:'#000'}}/>
            {noLine && (
              <View style={{position:'absolute', left:0, top:R-(B/2), width:R, height:B, backgroundColor:'#000'}}/>
            )}
          </View>
        );
      } else if(decimal >= 0.15 && decimal < 0.4){
        // Quarter circle/square (bottom half only)
        items.push(
          <View 
            key="partial" 
            style={{
              width: R,
              height: R,
              marginRight: M,
              overflow: 'hidden',
              borderRightWidth: B,
              borderRightColor: '#000',
              borderBottomWidth: B,
              borderBottomColor: '#000'
            }}
          >
            <View style={{width:D, height:D, borderRadius: noLine ? 0 : R, borderWidth:B, borderColor:'#000', marginTop: noLine ? 0 : -R, marginLeft: noLine ? 0 : 0}}/>
          </View>
        );
      } else {
        // For values > 0.6, still show half (shouldn't happen in normal use)
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
            <View style={{width:D, height:D, borderRadius: noLine ? 0 : R, borderWidth:B, borderColor:'#000'}}/>
          </View>
        );
      }
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
  const isCompletion = q.table && q.table.isCompletion;

  // Helper to render single circle/square type (with or without vertical line)
  const renderSingleCircle = (circleType, withLine = true) => {
    const D = 30;
    const R = 15;
    const B = 1.8;
    const isSquare = q.questionType === 'multi-part-pictogram';
    
    if(circleType === 'full'){
      return (
        <View style={{width:D, height:D, position:'relative'}}>
          <View style={{width:D, height:D, borderRadius: isSquare ? 0 : R, borderWidth:B, borderColor:'#000'}}/>
          {isSquare && (
            <>
              {/* Vertical line through middle */}
              <View style={{position:'absolute', left:R-(B/2), top:0, width:B, height:D, backgroundColor:'#000'}}/>
              {/* Horizontal line through middle */}
              <View style={{position:'absolute', left:0, top:R-(B/2), width:D, height:B, backgroundColor:'#000'}}/>
            </>
          )}
          {withLine && !isSquare && <View style={{position:'absolute', left:R-(B/2), top:0, width:B, height:D, backgroundColor:'#000'}}/>}
        </View>
      );
    } else if(circleType === 'half'){
      if(isSquare){
        // Half square - left half of square with vertical line on right edge
        return (
          <View style={{width:R, height:D, overflow:'hidden', borderRightWidth:B, borderRightColor:'#000', position:'relative'}}>
            <View style={{width:D, height:D, borderWidth:B, borderColor:'#000'}}/>
            {/* Horizontal line through middle */}
            <View style={{position:'absolute', left:0, top:R-(B/2), width:R, height:B, backgroundColor:'#000'}}/>
          </View>
        );
      } else {
        // Half circle
        return (
          <View style={{width:R, height:D, overflow:'hidden', borderRightWidth:B, borderRightColor:'#000'}}>
            <View style={{width:D, height:D, borderRadius:R, borderWidth:B, borderColor:'#000'}}/>
          </View>
        );
      }
    } else {
      // Quarter
      if(isSquare){
        // Quarter square - bottom left corner with horizontal and vertical lines
        return (
          <View style={{width:R, height:R, overflow:'hidden', borderBottomWidth:B, borderBottomColor:'#000', borderRightWidth:B, borderRightColor:'#000'}}>
            <View style={{width:D, height:D, borderWidth:B, borderColor:'#000'}}/>
          </View>
        );
      } else {
        // Quarter circle
        return (
          <View style={{width:R, height:R, overflow:'hidden', borderBottomWidth:B, borderBottomColor:'#000', borderRightWidth:B, borderRightColor:'#000'}}>
            <View style={{width:D, height:D, borderRadius:R, borderWidth:B, borderColor:'#000'}}/>
          </View>
        );
      }
    }
  };

  // Draggable circle options for pictogram completion
  const renderDraggableCircles = () => {
    if (!isCompletion && q.questionType !== 'pictogram-with-clues' && q.questionType !== 'multi-part-pictogram' && q.questionType !== 'pictogram-with-calculation') return null;
    
    const hasQuarters = q.extraTable?.hasQuarters || false;
    const circleOptions = hasQuarters ? ['full', 'half', 'quarter'] : ['full', 'half'];
    const noLine = q.questionType === 'pictogram-with-clues' || q.questionType === 'multi-part-pictogram' || q.questionType === 'pictogram-with-calculation'; // No vertical line for these types
    
    const handleCircleDragStart = (circleType) => (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggedCircle(circleType);
      setIsDragging(true);
      setDragPosition({x: e.clientX, y: e.clientY});
    };

    const isSquare = q.questionType === 'multi-part-pictogram';
    
    return (
      <View style={{marginTop: 15, marginBottom: 10, alignItems: 'center'}}>
        <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>Drag {isSquare ? 'squares' : 'circles'} to complete the pictogram:</Text>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15}}>
          {circleOptions.map((circleType, idx) => {
            return (
              <View
                key={idx}
                onMouseDown={handleCircleDragStart(circleType)}
                style={{
                  padding: 12,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: '#666',
                  minWidth: 80,
                  alignItems: 'center',
                  userSelect: 'none',
                  cursor: 'grab',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
              >
                {renderSingleCircle(circleType, !noLine)}
              </View>
            );
          })}
          {/* Removal zone for circles */}
          <View
            ref={(ref) => {
              if (ref && isDragging && (draggedCircle !== null || dragFromCircleCell)) {
                const rect = ref.getBoundingClientRect();
                window.removalZone = {
                  x: rect.left,
                  y: rect.top,
                  width: rect.width,
                  height: rect.height
                };
              }
            }}
            style={{
              padding: 12,
              backgroundColor: isDragging && (draggedCircle !== null || dragFromCircleCell) ? '#ffebee' : '#fafafa',
              borderRadius: 8,
              borderWidth: 2,
              borderColor: isDragging && (draggedCircle !== null || dragFromCircleCell) ? '#f44336' : '#999',
              borderStyle: isDragging && (draggedCircle !== null || dragFromCircleCell) ? 'dashed' : 'solid',
              minWidth: 80,
              minHeight: 54,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{fontSize: 14, fontWeight: 'bold', color: isDragging && (draggedCircle !== null || dragFromCircleCell) ? '#f44336' : '#999'}}>
              {isDragging && (draggedCircle !== null || dragFromCircleCell) ? '🗑️ Drop to Remove' : '🗑️ Remove'}
            </Text>
          </View>
        </View>
        {/* Floating drag preview for circles */}
        {isDragging && (draggedCircle !== null || dragFromCircleCell) && (
          <View style={{
            position: 'fixed',
            left: dragPosition.x,
            top: dragPosition.y,
            backgroundColor: 'rgba(33, 150, 243, 0.9)',
            padding: 10,
            borderRadius: 8,
            zIndex: 10000,
            pointerEvents: 'none',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            transform: 'translate(-50%, -50%)'
          }}>
            {draggedCircle !== null ? (
              renderSingleCircle(draggedCircle, q.questionType !== 'pictogram-with-clues')
            ) : dragFromCircleCell ? (
              renderSingleCircle(droppedCircles[dragFromCircleCell.day]?.[dragFromCircleCell.index], q.questionType !== 'pictogram-with-clues')
            ) : null}
          </View>
        )}
      </View>
    );
  };

  // Draggable tally options for completion questions with true drag and drop
  const renderDraggableTallies = () => {
    if (!isCompletion) return null;
    
    const tallyOptions = [1, 2, 3, 4, 5];
    
    const handleDragStart = (count) => (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggedTally(count);
      setIsDragging(true);
      setDragPosition({x: e.clientX, y: e.clientY});
    };

    return (
      <View style={{marginVertical: 20, alignItems: 'center'}}>
        <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 12}}>Drag tally marks to the table cells:</Text>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15}}>
          {tallyOptions.map((count, idx) => {
            return (
              <View
                key={idx}
                onMouseDown={handleDragStart(count)}
                style={{
                  padding: 12,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: '#666',
                  minWidth: 80,
                  alignItems: 'center',
                  userSelect: 'none',
                  cursor: 'grab',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
              >
                <TallyGroup count={count} />
              </View>
            );
          })}
          {/* Removal zone */}
          <View
            ref={(ref) => {
              if (ref) {
                setTimeout(() => {
                  if (ref.getBoundingClientRect) {
                    const rect = ref.getBoundingClientRect();
                    window.removalZone = {
                      x: rect.left,
                      y: rect.top,
                      width: rect.width,
                      height: rect.height
                    };
                  }
                }, 200);
              }
            }}
            style={{
              padding: 12,
              backgroundColor: isDragging && (draggedTally !== null || dragFromCell) ? '#ffebee' : '#fafafa',
              borderRadius: 8,
              borderWidth: 2,
              borderColor: isDragging && (draggedTally !== null || dragFromCell) ? '#f44336' : '#999',
              borderStyle: isDragging && (draggedTally !== null || dragFromCell) ? 'dashed' : 'solid',
              minWidth: 80,
              minHeight: 54,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{fontSize: 14, fontWeight: 'bold', color: isDragging && (draggedTally !== null || dragFromCell) ? '#f44336' : '#999'}}>
              {isDragging && (draggedTally !== null || dragFromCell) ? '🗑️ Drop to Remove' : '🗑️ Remove'}
            </Text>
          </View>
        </View>
        {/* Floating drag preview for tallies */}
        {isDragging && (draggedTally !== null || dragFromCell) && (
          <View style={{
            position: 'fixed',
            left: dragPosition.x,
            top: dragPosition.y,
            backgroundColor: 'rgba(33, 150, 243, 0.9)',
            padding: 10,
            borderRadius: 8,
            zIndex: 10000,
            pointerEvents: 'none',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            transform: 'translate(-50%, -50%)'
          }}>
            <TallyGroup count={draggedTally || (dragFromCell && droppedTallies[dragFromCell.day]?.[dragFromCell.index])} />
          </View>
        )}
      </View>
    );
  };

  if (!q) {
    return (
      <View style={styles.root}>
        <Text style={styles.scenario}>Loading question…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.contentContainer, { transform: [{ translateX: slideAnim }] }]}> 
        <Text style={styles.title}>Quiz</Text>
        {isTimetable ? (
          <>
          <Text style={styles.routeTitle}>{q.table.route}</Text>
          {q.expr && (
            (() => {
              const raw = String(q.expr || '');
              const rawLines = raw.split('\n');
              const partsArr = [];
              for (let i = 0; i < rawLines.length; i++) {
                const txt = rawLines[i].trim();
                if (txt === '') continue;
                const breakBefore = i > 0 && rawLines[i - 1].trim() === '';
                partsArr.push({ text: txt, breakBefore });
              }
                return (
                <View style={{width:'95%', flexDirection:'row', alignItems:'flex-start', marginBottom:12}}>
                  <View style={{flex:1}}>
                    {partsArr.map((p, i) => (
                      <Text
                        key={i}
                        style={[
                          styles.scenario,
                          { marginTop: (p.breakBefore ? 36 : (i === 0 ? 0 : (i === 1 ? 2 : (i === 2 ? 4 : 6)))), marginBottom: 0 }
                        ]}
                      >
                        {formatSuperscripts(p.text)}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })()
          )}
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
              <Text style={styles.partIndicator}>Answer the {q.parts.length > 1 ? 'parts' : 'part'} below:</Text>
              {q.parts.map((p, idx) => (
                <View key={idx} style={styles.partRow}>
                  <Text style={styles.partLabel}>{q.parts.length > 1 ? `${questionNumber}${String.fromCharCode(97+idx)})` : `${questionNumber})`}</Text>
                  <Text style={[styles.scenario, {flex:1, marginVertical:6}]}>{formatSuperscripts(p.question.replace(/^\(.[^)]+\)\s*/,''))}</Text>
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
      ) : q.questionType === 'multi-part-pictogram' ? (
        <>
          <Text style={styles.routeTitle}>Grade 1 • 1.13 Pictograms</Text>
          <Text style={styles.scenario}>{formatSuperscripts(q.expr)}</Text>
          
          {/* Render pictogram table */}
          <View style={{flexDirection:'row', width:'100%', alignItems:'flex-start', justifyContent:'center', marginTop:12}}>
            <View style={{width:100}}></View>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                {q.extraTable.headers.map((header, idx) => (
                  <View key={idx} style={[styles.tableCell, styles.headerCell, {flex: idx === 0 ? 1 : 4}]}> 
                    <Text style={styles.headerText}>{header}</Text>
                  </View>
                ))}
              </View>
              {q.extraTable.rows.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.tableRow}>
                  <View style={[styles.tableCell, {flex:1}]}>
                    <Text style={styles.cellText}>{row[0]}</Text>
                  </View>
                  <View
                    ref={(ref) => {
                      if (ref && row[1] === null) {
                        setTimeout(() => {
                          if (ref && ref.getBoundingClientRect) {
                            const rect = ref.getBoundingClientRect();
                            setCircleDropTargets(prev => ({
                              ...prev,
                              [row[0]]: {x: rect.left, y: rect.top, width: rect.width, height: rect.height}
                            }));
                          }
                        }, 200);
                      }
                    }}
                    style={[styles.tableCell, {flex:4, alignItems: 'flex-start', justifyContent: 'flex-start'}]}
                  >
                    {row[1] === null ? (
                      <View style={{minWidth: 100, maxWidth: '100%', minHeight: 30, padding: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-start', alignItems: 'center', width: '100%'}}>
                        {(droppedCircles[row[0]] || []).map((circleType, idx) => (
                          <View
                            key={idx}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDraggedCircle(null);
                              setIsDragging(true);
                              setDragPosition({x: e.clientX, y: e.clientY});
                              setDragFromCircleCell({day: row[0], index: idx});
                            }}
                            style={{cursor: 'grab', userSelect: 'none', marginRight: 2}}
                          >
                            {circleType === 'full' ? renderSymbols(1, 1, true) : circleType === 'half' ? renderSymbols(0.5, 1, true) : renderSymbols(0.25, 1, true)}
                          </View>
                        ))}
                        {isDragging && draggedCircle !== null && (
                          <View style={{
                            minWidth: 40,
                            minHeight: 30,
                            padding: 3,
                            backgroundColor: 'rgba(33, 150, 243, 0.2)',
                            borderRadius: 4,
                            borderWidth: 2,
                            borderColor: '#2196F3',
                            borderStyle: 'dashed',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            <Text style={{color: '#2196F3', fontSize: 10}}>Drop here</Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 4}}>
                        {renderSymbols(row[1], q.extraTable.key, true)}
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
            
            {/* Key Box */}
            <View style={{marginLeft:20, marginTop:8}}>
              <View style={{borderWidth:2, borderColor:'#999', borderRadius:8, padding:12, backgroundColor:'#e3f2fd', minWidth:140}}>
                <View style={{flexDirection:'row', alignItems:'flex-start'}}>
                  <View style={{position:'relative', width:32, height:32, marginRight:12}}>
                    <View style={{width:32, height:32, borderWidth:2, borderColor:'#000', backgroundColor:'#f0f0f0'}}></View>
                    {/* Vertical line through middle */}
                    <View style={{position:'absolute', left:15, top:0, width:2, height:32, backgroundColor:'#000'}}/>
                    {/* Horizontal line through middle */}
                    <View style={{position:'absolute', left:0, top:15, width:32, height:2, backgroundColor:'#000'}}/>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={{fontSize:14, fontWeight:'bold', color:'#333', marginBottom:4}}>Key:</Text>
                    <Text style={{fontSize:13, color:'#333', lineHeight:18}}>Represents {q.extraTable.key}{'\n'}{q.context?.itemPlural || 'items'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          
          {/* Circle options for pictogram completion */}
          {renderDraggableCircles()}
          
          {/* Parts below pictogram */}
          <View style={{width:'95%', marginTop:20}}>
            <Text style={styles.partIndicator}>Answer the parts below:</Text>
            
            {/* Part (a) - Read value */}
            <View style={styles.partRow}>
              <Text style={styles.partLabel}>{questionNumber}a)</Text>
              <Text style={[styles.scenario, {flex:1, marginVertical:6}]}>{q.parts[0].question}</Text>
              <TextInput
                style={[styles.input, {width: '25%', marginLeft:8}]}
                value={partInputs[0]}
                onChangeText={(t)=> setPartInputs((arr)=>{ const copy=[...arr]; copy[0]=t; return copy; })}
                keyboardType='numeric'
                placeholder='Answer'
              />
            </View>
            
            {/* Part (b) - Instruction (shown as text, completion via drag-drop) */}
            <View style={{width:'100%', marginBottom:16}}>
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Text style={styles.partLabel}>{questionNumber}b)</Text>
                <Text style={[styles.scenario, {flex:1, marginVertical:6}]}>{q.parts[1].question}</Text>
              </View>
            </View>
            
            {/* Part (c) - Calculate total */}
            <View style={styles.partRow}>
              <Text style={styles.partLabel}>{questionNumber}c)</Text>
              <Text style={[styles.scenario, {flex:1, marginVertical:6}]}>{q.parts[2].question}</Text>
              <TextInput
                style={[styles.input, {width: '25%', marginLeft:8}]}
                value={partInputs[2]}
                onChangeText={(t)=> setPartInputs((arr)=>{ const copy=[...arr]; copy[2]=t; return copy; })}
                keyboardType='numeric'
                placeholder='Answer'
              />
            </View>
          </View>
          
          {/* Feedback */}
          {feedback && (
            <View style={[styles.feedbackContainer, {marginTop: 20}]}>
              {(() => {
                const lines = feedback.split('\n');
                const correctLines = lines.filter(line => line.includes('✓'));
                const errorLines = lines.filter(line => line.includes('✗'));
                const hasCorrect = correctLines.length > 0;
                const hasErrors = errorLines.length > 0;
                
                return (
                  <>
                    {hasCorrect && (
                      <>
                        <View style={styles.correctHeader}>
                          <Text style={styles.correctHeaderText}>CORRECT</Text>
                        </View>
                        {correctLines.map((line, idx) => (
                          <Text key={idx} style={styles.feedbackBold}>{line}</Text>
                        ))}
                      </>
                    )}
                    {hasErrors && (
                      <>
                        <View style={styles.errorHeader}>
                          <Text style={styles.errorHeaderText}>ERRORS</Text>
                        </View>
                        {errorLines.map((line, idx) => (
                          <Text key={idx} style={styles.feedbackBold}>{line}</Text>
                        ))}
                      </>
                    )}
                  </>
                );
                })()}
          </View>
        )}
        </>
      ) : q.questionType === 'pictogram-with-calculation' ? (
        <>
          <Text style={styles.routeTitle}>Grade 1 • 1.13 Pictograms</Text>
          <Text style={styles.scenario}>{formatSuperscripts(q.expr)}</Text>
          
          {/* Render pictogram table */}
          <View style={{flexDirection:'row', width:'100%', alignItems:'flex-start', justifyContent:'center', marginTop:12}}>
            <View style={{width:100}}></View>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                {q.extraTable.headers.map((header, idx) => (
                  <View key={idx} style={[styles.tableCell, styles.headerCell, {flex: idx === 0 ? 1 : 4}]}> 
                    <Text style={styles.headerText}>{header}</Text>
                  </View>
                ))}
              </View>
              {q.extraTable.rows.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.tableRow}>
                  <View style={[styles.tableCell, {flex:1}]}>
                    <Text style={styles.cellText}>{row[0]}</Text>
                  </View>
                  <View
                    ref={(ref) => {
                      if (ref && row[1] === null) {
                        setTimeout(() => {
                          if (ref && ref.getBoundingClientRect) {
                            const rect = ref.getBoundingClientRect();
                            setCircleDropTargets(prev => ({
                              ...prev,
                              [row[0]]: {x: rect.left, y: rect.top, width: rect.width, height: rect.height}
                            }));
                          }
                        }, 200);
                      }
                    }}
                    style={[styles.tableCell, {flex:4, alignItems: 'flex-start', justifyContent: 'flex-start'}]}
                  >
                    {row[1] === null ? (
                      <View style={{minWidth: 100, maxWidth: '100%', minHeight: 30, padding: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-start', alignItems: 'center', width: '100%'}}>
                        {(droppedCircles[row[0]] || []).map((circleType, idx) => (
                          <View
                            key={idx}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDraggedCircle(null);
                              setIsDragging(true);
                              setDragPosition({x: e.clientX, y: e.clientY});
                              setDragFromCircleCell({day: row[0], index: idx});
                            }}
                            style={{cursor: 'grab', userSelect: 'none', marginRight: 2}}
                          >
                            {renderSingleCircle(circleType, q.questionType !== 'pictogram-with-clues')}
                          </View>
                        ))}
                        {isDragging && draggedCircle !== null && (
                          <View style={{
                            minWidth: 40,
                            minHeight: 30,
                            padding: 3,
                            backgroundColor: 'rgba(33, 150, 243, 0.2)',
                            borderRadius: 4,
                            borderWidth: 2,
                            borderColor: '#2196F3',
                            borderStyle: 'dashed',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            <Text style={{color: '#2196F3', fontSize: 10}}>Drop here</Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      row[1] !== null && <View style={{flexDirection:'row', flexWrap:'wrap', gap:2}}>{renderCirclesOnly(row[1])}</View>
                    )}
                  </View>
                </View>
              ))}
            </View>
            <View style={{width:140, marginLeft:20}}>
              <View style={{borderWidth:2, borderColor:'#999', borderRadius:8, padding:12, backgroundColor:'#e3f2fd'}}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                  <View style={{position:'relative', width:32, height:32, marginRight:12}}>
                    <View style={{width:32, height:32, borderRadius:16, borderWidth:2, borderColor:'#000', backgroundColor:'#fff'}}></View>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={{fontSize:14, fontWeight:'bold', color:'#333', marginBottom:4}}>Key:</Text>
                    <Text style={{fontSize:13, color:'#333', lineHeight:18}}>Represents {q.extraTable.key}{'\n'}{q.context?.itemPlural || 'items'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          
          {/* Parts below pictogram */}
          <View style={{width:'95%', marginTop:20}}>
            <Text style={styles.partIndicator}>Answer the parts below:</Text>
            
            {/* Part (a) - Read values with sub-parts */}
            <View style={{width:'100%', marginBottom:16}}>
              <View style={{flexDirection:'row', alignItems:'flex-start', marginBottom:8}}>
                <Text style={styles.partLabel}>{questionNumber}a)</Text>
                <Text style={[styles.scenario, {flex:1, marginVertical:6, marginLeft:8}]}>{q.parts[0].question}</Text>
              </View>
              {q.parts[0].subParts.map((subPart, idx) => (
                <View key={idx} style={{flexDirection:'row', alignItems:'center', marginLeft:43, marginBottom:8}}>
                  <Text style={{minWidth:30, fontWeight:'600', fontSize:15}}>({['i', 'ii'][idx]})</Text>
                  <Text style={[styles.scenario, {marginLeft:8, marginVertical:6}]}>{subPart.question}</Text>
                  <TextInput
                    style={[styles.input, {width: 80, marginLeft:8}]}
                    value={partInputs[idx]}
                    onChangeText={(t)=> setPartInputs((arr)=>{ const copy=[...arr]; copy[idx]=t; return copy; })}
                    keyboardType='numeric'
                    placeholder='Answer'
                  />
                </View>
              ))}
            </View>
            
            {/* Part (b) - Complete pictogram instruction */}
            <View style={{width:'100%', marginBottom:16}}>
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Text style={styles.partLabel}>{questionNumber}b)</Text>
                <Text style={[styles.scenario, {flex:1, marginVertical:6}]}>{q.parts[1].question}</Text>
              </View>
              
              {/* Clue text under part b */}
              {q.clueText && (
                <View style={{width:'100%', marginTop:8, marginLeft:43}}>
                  <Text style={[styles.scenario, {marginTop:0}]}>{q.clueText}</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Circle drag options */}
          {renderDraggableCircles()}
          
          {/* Feedback */}
          {feedback && (
            <View style={[styles.feedbackContainer, {marginTop: 20}]}>
              {(() => {
                const lines = feedback.split('\n');
                const correctLines = lines.filter(line => line.includes('✓'));
                const errorLines = lines.filter(line => line.includes('✗'));
                const hasCorrect = correctLines.length > 0;
                const hasErrors = errorLines.length > 0;
                
                return (
                  <>
                    {hasCorrect && (
                      <>
                        <View style={styles.correctHeader}>
                          <Text style={styles.correctHeaderText}>CORRECT</Text>
                        </View>
                        {correctLines.map((line, idx) => (
                          <Text key={idx} style={styles.feedbackBold}>{line}</Text>
                        ))}
                      </>
                    )}
                    {hasErrors && (
                      <>
                        <View style={styles.errorHeader}>
                          <Text style={styles.errorHeaderText}>ERRORS</Text>
                        </View>
                        {errorLines.map((line, idx) => (
                          <Text key={idx} style={styles.feedbackBold}>{line}</Text>
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
            </View>
          )}
        </>
      ) : q.questionType === 'pictogram-with-clues' ? (
        <>
          <Text style={styles.routeTitle}>Grade 1 • 1.13 Pictograms</Text>
          {q.parts && q.parts.length > 0 && (
            <View style={{width:'95%', marginTop:20, marginBottom:16}}>
              <View style={{marginBottom:8}}>
                <Text style={styles.scenario}><Text style={styles.questionNumber}>{questionNumber})</Text>{' '}{formatSuperscripts(q.parts[0].question)}</Text>
              </View>
            </View>
          )}
          <Text style={styles.scenario}>{formatSuperscripts(q.expr)}</Text>
          
          {/* Render pictogram table */}
          <View style={{flexDirection:'row', width:'100%', alignItems:'flex-start', justifyContent:'center', marginTop:12}}>
            <View style={{width:100}}></View>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                {q.extraTable.headers.map((header, idx) => (
                  <View key={idx} style={[styles.tableCell, styles.headerCell, {flex: idx === 0 ? 1 : 4}]}> 
                    <Text style={styles.headerText}>{header}</Text>
                  </View>
                ))}
              </View>
              {q.extraTable.rows.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.tableRow}>
                  <View style={[styles.tableCell, {flex:1}]}> 
                    <Text style={styles.cellText}>{row[0]}</Text>
                  </View>
                  <View 
                    ref={(ref) => {
                      if (ref && row[1] === null && q.extraTable.isIncomplete) {
                        setTimeout(() => {
                          if (ref.getBoundingClientRect) {
                            const rect = ref.getBoundingClientRect();
                            setCircleDropTargets(prev => ({
                              ...prev,
                              [row[0]]: {x: rect.left, y: rect.top, width: rect.width, height: rect.height}
                            }));
                          }
                        }, 200);
                      }
                    }}
                    style={[styles.tableCell, {flex:4, alignItems: 'flex-start', justifyContent: 'flex-start'}]}
                  > 
                    {row[1] === null && q.extraTable.isIncomplete ? (
                      <View style={{
                        minWidth: 100,
                        maxWidth: '100%',
                        minHeight: 30,
                        padding: 2,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 2,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        width: '100%'
                      }}>
                        {(droppedCircles[row[0]] || []).map((circleType, idx) => (
                          <View
                            key={idx}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDraggedCircle(null);
                              setIsDragging(true);
                              setDragPosition({x: e.clientX, y: e.clientY});
                              setDragFromCircleCell({day: row[0], index: idx});
                            }}
                            style={{cursor: 'grab', userSelect: 'none', marginRight: 2}}
                          >
                            {renderSingleCircle(circleType, q.questionType !== 'pictogram-with-clues')}
                          </View>
                        ))}
                        {isDragging && draggedCircle !== null && (
                          <View style={{
                            minWidth: 40,
                            minHeight: 30,
                            padding: 3,
                            backgroundColor: 'rgba(33, 150, 243, 0.2)',
                            borderRadius: 4,
                            borderWidth: 2,
                            borderColor: '#2196F3',
                            borderStyle: 'dashed',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            <Text style={{color: '#2196F3', fontSize: 10}}>Drop here</Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      row[1] !== null && <View style={{flexDirection:'row', flexWrap:'wrap', gap:2}}>{renderCirclesOnly(row[1])}</View>
                    )}
                  </View>
                </View>
              ))}
            </View>
            <View style={{width:140, marginLeft:20}}>
              <View style={{borderWidth:2, borderColor:'#999', borderRadius:8, padding:12, backgroundColor:'#e3f2fd'}}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                  <View style={{position:'relative', width:32, height:32, marginRight:12}}>
                    <View style={{width:32, height:32, borderRadius:16, borderWidth:2, borderColor:'#000', backgroundColor:'#fff'}}></View>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={{fontSize:14, fontWeight:'bold', color:'#333', marginBottom:4}}>Key:</Text>
                    <Text style={{fontSize:11, color:'#333', marginBottom:2}}>Represents</Text>
                    <TextInput
                      style={{
                        width: 50,
                        height: 28,
                        borderWidth: 1,
                        borderColor: '#999',
                        borderRadius: 4,
                        paddingHorizontal: 6,
                        fontSize: 13,
                        textAlign: 'center',
                        backgroundColor: '#fff',
                        marginBottom: 2
                      }}
                      value={keyInput}
                      onChangeText={setKeyInput}
                      keyboardType="numeric"
                      placeholder="?"
                      placeholderTextColor="#999"
                    />
                    <Text style={{fontSize:11, color:'#333'}}>{q.context?.itemPlural || 'items'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          
          {/* Display text clues */}
          {q.cluesText && q.cluesText.length > 0 && (
            <View style={{width:'95%', marginTop:30}}>
              {q.cluesText.map((clue, idx) => (
                  <Text key={idx} style={[styles.scenario, {marginTop: idx === 0 ? 0 : 4, marginBottom:0}]}>{clue}</Text>
              ))}
            </View>
          )}
          

          
          {/* Circle drag options */}
          {renderDraggableCircles()}
          
          {/* Feedback for pictogram-with-clues questions */}
          {feedback && (
            <View style={[styles.feedbackContainer, {marginTop: 20}]}>
              {(() => {
                const lines = feedback.split('\n');
                const correctLines = lines.filter(line => line.includes('✓'));
                const errorLines = lines.filter(line => line.includes('✗'));
                const hasCorrect = correctLines.length > 0;
                const hasErrors = errorLines.length > 0;
                
                return (
                  <>
                    {hasCorrect && (
                      <>
                        <View style={styles.correctHeader}>
                          <Text style={styles.correctHeaderText}>CORRECT</Text>
                        </View>
                        {correctLines.map((line, idx) => {
                          const textWithBullet = `• ${line}`;
                          return (
                            <Text key={`correct-${idx}`} style={styles.feedbackBold}>
                              {textWithBullet.split(/(\d+\.?\d*|"[^"]*")/).map((part, i) => {
                                if (/^\d+\.?\d*$/.test(part) || /^"[^"]*"$/.test(part)) {
                                  return <Text key={i} style={styles.feedbackHighlight}>{part}</Text>;
                                }
                                return <Text key={i}>{part}</Text>;
                              })}
                            </Text>
                          );
                        })}
                      </>
                    )}
                    {hasErrors && (
                      <>
                        <View style={[styles.errorHeader, hasCorrect && {marginTop: 16}]}>
                          <Text style={styles.errorHeaderText}>ERRORS</Text>
                        </View>
                        {errorLines.map((line, idx) => {
                          const textWithBullet = `• ${line}`;
                          return (
                            <Text key={`error-${idx}`} style={styles.feedbackBold}>
                              {textWithBullet.split(/(\d+\.?\d*|"[^"]*")/).map((part, i) => {
                                if (/^\d+\.?\d*$/.test(part) || /^"[^"]*"$/.test(part)) {
                                  return <Text key={i} style={styles.feedbackHighlight}>{part}</Text>;
                                }
                                return <Text key={i}>{part}</Text>;
                              })}
                            </Text>
                          );
                        })}
                      </>
                    )}
                  </>
                );
              })()}
            </View>
          )}
        </>
      ) : q.table ? (
        <>
          {q.table.route && <Text style={styles.routeTitle}>{q.table.route}</Text>}
          {/* Part (a) for completion questions - shown after title */}
          {isCompletion && q.parts && q.parts.length > 0 && (
            <View style={{width:'95%', marginTop:20, marginBottom:16}}>
              <View style={{marginBottom:8}}>
                    <Text style={styles.scenario}><Text style={styles.questionNumber}>{questionNumber}a)</Text>{' '}{formatSuperscripts(q.parts[0].question)}</Text>
              </View>
            </View>
          )}
          {q.expr && (
            q.table && q.table.isCompletion ? (
              <View style={{width: '95%', marginTop: 6}}>
                {formatSuperscripts(q.expr).split('\n').map((para, pi) => {
                  const top = pi === 0 ? 0 : (pi === 1 ? 2 : 18);
                  return <Text key={pi} style={[styles.scenario, {marginTop: top, textAlign: 'left'}]}>{para}</Text>;
                })}
              </View>
            ) : (
              <View style={{width: '95%', marginTop: 6}}>
                {formatSuperscripts(q.expr).split('\n').map((para, pi) => {
                  const top = pi === 0 ? 0 : (pi === 1 ? 2 : 18);
                  return <Text key={pi} style={[styles.scenario, {marginTop: top, textAlign: 'left'}]}>{para}</Text>;
                })}
              </View>
            )
          )}
          <View style={styles.table}>
            {q.table.headers && (
              <View style={styles.tableRow}>
                {q.table.headers.map((header, idx) => {
                  // Ensure header column widths match body column widths for symmetry
                  const flexVal = q.table.isTally
                    ? ([1, 1.5, 1][idx] || 1)
                    : (idx === 0 ? 2 : 1);
                  return (
                    <View key={idx} style={[styles.tableCell, styles.headerCell, {flex: flexVal, minWidth: idx === 0 ? 200 : undefined}]}> 
                      <Text style={[styles.headerText, idx === 0 ? {textAlign: 'left'} : {}]}>{header}</Text>
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
                    <View 
                      ref={(ref) => {
                        if (ref && row.tallyCount === null) {
                          const measureTarget = () => {
                            if (ref.getBoundingClientRect) {
                              const rect = ref.getBoundingClientRect();
                              setDropTargets(prev => ({
                                ...prev,
                                [row.day]: {
                                  x: rect.left,
                                  y: rect.top,
                                  width: rect.width,
                                  height: rect.height
                                }
                              }));
                            }
                          };
                          setTimeout(measureTarget, 200);
                        }
                      }}
                      style={[styles.tableCell, {flex: 1.5, alignItems: 'flex-start'}]}
                    >
                      {row.tallyCount === null ? (
                        // Drop zone with progressive highlights
                        <View
                          style={{
                            minWidth: 80,
                            minHeight: 30,
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            padding: 2,
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 2
                          }}
                        >
                          {(droppedTallies[row.day] || []).map((tallyCount, idx) => (
                            <View
                              key={idx}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDraggedTally(null);
                                setIsDragging(true);
                                setDragPosition({x: e.clientX, y: e.clientY});
                                setDragFromCell({day: row.day, index: idx});
                              }}
                              style={{
                                cursor: 'grab',
                                userSelect: 'none',
                                marginRight: 2,
                                padding: 1,
                                backgroundColor: 'rgba(33, 150, 243, 0.05)',
                                borderRadius: 2
                              }}
                            >
                              <TallyGroup count={tallyCount} />
                            </View>
                          ))}
                          {isDragging && draggedTally !== null && (
                            <View
                              style={{
                                minWidth: 50,
                                minHeight: 30,
                                marginRight: 5,
                                padding: 3,
                                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                borderRadius: 4,
                                borderWidth: 2,
                                borderColor: '#2196F3',
                                borderStyle: 'dashed',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                              <Text style={{color: '#2196F3', fontSize: 10}}>Drop here</Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        <TallyGroup count={row.tallyCount} />
                      )}
                    </View>
                    <View style={[styles.tableCell, {flex: 1}]}>
                      {row.frequency === null ? (
                        // Input box for frequency
                        <TextInput
                          style={{
                            width: '90%',
                            height: 35,
                            borderWidth: 1,
                            borderColor: '#2196F3',
                            borderRadius: 4,
                            paddingHorizontal: 8,
                            fontSize: 16,
                            textAlign: 'center',
                            backgroundColor: '#fff'
                          }}
                          value={frequencyInputs[row.day] || ''}
                          onChangeText={(text) => {
                            setFrequencyInputs({...frequencyInputs, [row.day]: text});
                          }}
                          keyboardType="numeric"
                          placeholder="?"
                          placeholderTextColor="#999"
                        />
                      ) : (
                        <Text style={styles.cellText}>{row.frequency}</Text>
                      )}
                    </View>
                  </>
                ) : (
                  row.map((cell, cellIdx) => (
                    <View key={cellIdx} style={[styles.tableCell, {flex: cellIdx === 0 ? 2 : 1, minWidth: cellIdx === 0 ? 200 : undefined}]}> 
                      <Text style={[styles.cellText, cellIdx === 0 ? {textAlign: 'left'} : {}]}>{cell}</Text>
                    </View>
                  ))
                )}
              </View>
            ))}
          </View>
          {/* Tally options for completion questions */}
          {isCompletion && renderDraggableTallies()}
          {/* Part A feedback for completion questions */}
          {isCompletion && feedback && feedback.includes('a) ') && (
            <View style={[styles.feedbackContainer, {marginTop: 20}]}>
              {(() => {
                const lines = feedback.split('\n');
                let inPartA = false;
                const partALines = [];
                let currentHeader = null;
                
                for (const line of lines) {
                  if (line === '[CORRECT_HEADER]') {
                    currentHeader = 'correct';
                  } else if (line === '[ERROR_HEADER]') {
                    currentHeader = 'error';
                  } else if (line.includes('a) ')) {
                    inPartA = true;
                    partALines.push({line, header: currentHeader});
                  } else if (line.includes('b) ')) {
                    break;
                  } else if (inPartA && line.trim()) {
                    partALines.push({line, header: currentHeader});
                  }
                }
                
                const groups = [];
                let currentGroup = null;
                partALines.forEach(item => {
                  if (!currentGroup || currentGroup.header !== item.header) {
                    currentGroup = {header: item.header, lines: []};
                    groups.push(currentGroup);
                  }
                  currentGroup.lines.push(item.line);
                });
                
                return groups.map((group, idx) => (
                  <View key={idx} style={idx > 0 ? {marginTop: 16} : {}}>
                    {group.header === 'correct' && (
                      <View style={styles.correctHeader}>
                        <Text style={styles.correctHeaderText}>CORRECT</Text>
                      </View>
                    )}
                    {group.header === 'error' && (
                      <View style={styles.errorHeader}>
                        <Text style={styles.errorHeaderText}>ERRORS</Text>
                      </View>
                    )}
                    {group.lines.map((line, lineIdx) => {
                      const textWithBullet = (line.includes('✓') || line.includes('✗')) ? `• ${line}` : line;
                      return (
                        <Text key={lineIdx} style={styles.feedbackBold}>
                          {textWithBullet.split(/(\d+\.?\d*|"[^"]*")/).map((part, i) => {
                            if (/^\d+\.?\d*$/.test(part) || /^"[^"]*"$/.test(part)) {
                              return <Text key={i} style={styles.feedbackHighlight}>{part}</Text>;
                            }
                            return <Text key={i}>{part}</Text>;
                          })}
                        </Text>
                      );
                    })}
                  </View>
                ));
              })()}
            </View>
          )}
          {/* Part (a) for non-completion tally questions */}
          {q.table.isTally && !isCompletion && q.parts && q.parts.length > 0 && (
            <View style={{width:'95%'}}>
              <Text style={styles.partIndicator}>Answer the part below:</Text>
              <View style={{width:'100%'}}>
                <View style={{flexDirection:'row', alignItems:'center', marginBottom:8}}>
                  <Text style={styles.partLabel}>{q.parts.length > 1 ? `${questionNumber}a)` : `${questionNumber})`}</Text>
                  <Text style={[styles.scenario, {flex:1, marginVertical:6}]}>{q.parts[0].question.replace(/^\(.[^)]+\)\s*/,'')}</Text>
                </View>
                <TextInput
                  style={[styles.textAnswerInput]}
                  value={partInputs[0]}
                  onChangeText={(t)=> setPartInputs((arr)=>{ const copy=[...arr]; copy[0]=t; return copy; })}
                  keyboardType={typeof q.parts[0].answer === 'number' ? 'numeric' : 'default'}
                  placeholder='Answer'
                  multiline
                  numberOfLines={3}
                  textAlignVertical='top'
                />
              </View>
              {/* Part A feedback for non-completion tally questions */}
              {feedback && (
                <View style={[styles.feedbackContainer, {marginTop: 12, width: '100%'}]}>
                  {(() => {
                    const lines = feedback.split('\n');
                    // For single-part questions, look for lines with checkmark/x, for multi-part look for "a) "
                    const partALine = q.parts.length > 1 
                      ? lines.find(line => line.includes('a) '))
                      : lines.find(line => line.includes('✓') || line.includes('✗'));
                    if (!partALine) return null;
                    
                    const hasCorrect = partALine.includes('✓');
                    const hasError = partALine.includes('✗');
                    
                    return (
                      <>
                        {hasCorrect && (
                          <View style={styles.correctHeader}>
                            <Text style={styles.correctHeaderText}>CORRECT</Text>
                          </View>
                        )}
                        {hasError && (
                          <View style={styles.errorHeader}>
                            <Text style={styles.errorHeaderText}>ERRORS</Text>
                          </View>
                        )}
                        <Text style={styles.feedbackBold}>
                          {partALine.split(/(\d+\.?\d*|"[^"]*")/).map((part, i) => {
                            if (/^\d+\.?\d*$/.test(part) || /^"[^"]*"$/.test(part)) {
                              return <Text key={i} style={styles.feedbackHighlight}>{part}</Text>;
                            }
                            return <Text key={i}>{part}</Text>;
                          })}
                        </Text>
                      </>
                    );
                  })()}
                </View>
              )}
            </View>
          )}
          {q.extraTable && (
            <>
              {/* Part (b) for completion questions */}
              {isCompletion && q.parts && q.parts.length > 1 && (
                <View style={{width:'95%', marginTop:40}}>
                  <View style={{marginBottom:8}}>
                    <Text style={styles.scenario}><Text style={styles.questionNumber}>{questionNumber}b)</Text>{' '}{q.parts[1].question}</Text>
                  </View>
                </View>
              )}
              <Text style={[styles.scenario, {marginTop:70}]}>The pictogram shows the number of {q.context?.itemPlural || 'chocolate bars'} sold.</Text>
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
                      <View 
                        ref={(ref) => {
                          if (ref && row[1] === null && q.extraTable.isIncomplete) {
                            setTimeout(() => {
                              if (ref.getBoundingClientRect) {
                                const rect = ref.getBoundingClientRect();
                                setCircleDropTargets(prev => ({
                                  ...prev,
                                  [row[0]]: {x: rect.left, y: rect.top, width: rect.width, height: rect.height}
                                }));
                              }
                            }, 200);
                          }
                        }}
                        style={[styles.tableCell, {flex:2, alignItems: 'flex-start', justifyContent: 'flex-start'}]}
                      > 
                        {row[1] === null && q.extraTable.isIncomplete ? (
                          <View style={{
                            minWidth: 100,
                            minHeight: 30,
                            padding: 2,
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 2,
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            width: '100%'
                          }}>
                            {(droppedCircles[row[0]] || []).map((circleType, idx) => (
                              <View
                                key={idx}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDraggedCircle(null);
                                  setIsDragging(true);
                                  setDragPosition({x: e.clientX, y: e.clientY});
                                  setDragFromCircleCell({day: row[0], index: idx});
                                }}
                                style={{cursor: 'grab', userSelect: 'none', marginRight: 2}}
                              >
                                {circleType === 'full' ? renderSymbols(1, 1) : circleType === 'half' ? renderSymbols(0.5, 1) : renderSymbols(0.25, 1)}
                              </View>
                            ))}
                            {isDragging && draggedCircle !== null && (
                              <View style={{
                                minWidth: 40,
                                minHeight: 30,
                                padding: 3,
                                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                borderRadius: 4,
                                borderWidth: 2,
                                borderColor: '#2196F3',
                                borderStyle: 'dashed',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}>
                                <Text style={{color: '#2196F3', fontSize: 10}}>Drop here</Text>
                              </View>
                            )}
                          </View>
                        ) : (
                          renderSymbols(row[1], q.extraTable.key)
                        )}
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
                        <Text style={{fontSize:13, color:'#333', lineHeight:18}}>Represents {q.extraTable.key}{'\n'}{q.context?.itemPlural || 'items'}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              {/* Circle options for pictogram completion */}
              {isCompletion && q.extraTable.isIncomplete && renderDraggableCircles()}
              {/* Part B feedback for completion questions */}
              {isCompletion && feedback && feedback.includes('b) ') && (
                <View style={[styles.feedbackContainer, {marginTop: 20}]}>
                  {(() => {
                    const lines = feedback.split('\n');
                    let inPartB = false;
                    const partBLines = [];
                    let currentHeader = null;
                    
                    for (const line of lines) {
                      if (line === '[CORRECT_HEADER]') {
                        currentHeader = 'correct';
                      } else if (line === '[ERROR_HEADER]') {
                        currentHeader = 'error';
                      } else if (line.includes('b) ')) {
                        inPartB = true;
                        partBLines.push({line, header: currentHeader});
                      } else if (inPartB && line.trim()) {
                        partBLines.push({line, header: currentHeader});
                      }
                    }
                    
                    const groups = [];
                    let currentGroup = null;
                    partBLines.forEach(item => {
                      if (!currentGroup || currentGroup.header !== item.header) {
                        currentGroup = {header: item.header, lines: []};
                        groups.push(currentGroup);
                      }
                      currentGroup.lines.push(item.line);
                    });
                    
                    return groups.map((group, idx) => (
                      <View key={idx} style={idx > 0 ? {marginTop: 16} : {}}>
                        {group.header === 'correct' && (
                          <View style={styles.correctHeader}>
                            <Text style={styles.correctHeaderText}>CORRECT</Text>
                          </View>
                        )}
                        {group.header === 'error' && (
                          <View style={styles.errorHeader}>
                            <Text style={styles.errorHeaderText}>ERRORS</Text>
                          </View>
                        )}
                        {group.lines.map((line, lineIdx) => {
                          const textWithBullet = (line.includes('✓') || line.includes('✗')) ? `• ${line}` : line;
                          return (
                            <Text key={lineIdx} style={styles.feedbackBold}>
                              {textWithBullet.split(/(\d+\.?\d*|"[^"]*")/).map((part, i) => {
                                if (/^\d+\.?\d*$/.test(part) || /^"[^"]*"$/.test(part)) {
                                  return <Text key={i} style={styles.feedbackHighlight}>{part}</Text>;
                                }
                                return <Text key={i}>{part}</Text>;
                              })}
                            </Text>
                          );
                        })}
                      </View>
                    ));
                  })()}
                </View>
              )}
              {/* Parts below pictogram for non-completion questions */}
              {!isCompletion && q.parts && q.parts.length > 1 && (
                <View style={{width:'95%'}}>
                  <Text style={styles.partIndicator}>Answer the part below:</Text>
                  {q.parts.slice(1).map((p, idx) => (
                    <View key={idx+1}>
                      <View style={{width:'100%'}}>
                        <View style={{flexDirection:'row', alignItems:'center', marginBottom:8}}>
                          <Text style={styles.partLabel}>{questionNumber}{String.fromCharCode(98+idx)})</Text>
                          <Text style={[styles.scenario, {flex:1, marginVertical:6}]}>{formatSuperscripts(p.question.replace(/^\(.[^)]+\)\s*/,''))}</Text>
                        </View>
                        <TextInput
                          style={[styles.textAnswerInput]}
                          value={partInputs[idx+1]}
                          onChangeText={(t)=> setPartInputs((arr)=>{ const copy=[...arr]; copy[idx+1]=t; return copy; })}
                          keyboardType={typeof p.answer === 'number' ? 'numeric' : 'default'}
                          placeholder='Answer'
                          multiline
                          numberOfLines={3}
                          textAlignVertical='top'
                        />

                      </View>
                      {/* Inline feedback for each part */}
                      {feedback && (
                        <View style={[styles.feedbackContainer, {marginTop: 12, width: '100%'}]}>
                          {(() => {
                            const lines = feedback.split('\n');
                            const partLabel = String.fromCharCode(98+idx);
                            const partLine = lines.find(line => line.includes(`${partLabel}) `));
                            if (!partLine) return null;
                            
                            const hasCorrect = partLine.includes('✓');
                            const hasError = partLine.includes('✗');
                            
                            return (
                              <>
                                {hasCorrect && (
                                  <View style={styles.correctHeader}>
                                    <Text style={styles.correctHeaderText}>CORRECT</Text>
                                  </View>
                                )}
                                {hasError && (
                                  <View style={styles.errorHeader}>
                                    <Text style={styles.errorHeaderText}>ERRORS</Text>
                                  </View>
                                )}
                                <Text style={styles.feedbackBold}>
                                  {partLine.split(/(\d+\.?\d*|"[^"]*")/).map((part, i) => {
                                    if (/^\d+\.?\d*$/.test(part) || /^"[^"]*"$/.test(part)) {
                                      return <Text key={i} style={styles.feedbackHighlight}>{part}</Text>;
                                    }
                                    return <Text key={i}>{part}</Text>;
                                  })}
                                </Text>
                              </>
                            );
                          })()}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </>
      ) : q.parts && q.parts.length > 0 ? (
        <>
          {q.expr && <Text style={styles.scenario}>{formatSuperscripts(q.expr)}</Text>}
          {q.coords && <Grid points={q.coords} min={-5} max={5} width={300} height={300} />}
          {q.parts.map((p, idx) => (
            <View key={idx} style={styles.partRow}>
              <Text style={styles.partLabel}>{q.parts.length > 1 ? `${questionNumber}${String.fromCharCode(97+idx)})` : `${questionNumber})`}</Text>
              <Text style={[styles.scenario, {flex:1, marginVertical:6}]}>{formatSuperscripts(p.question.replace(/^\(.[^)]+\)\s*/,''))}</Text>
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
              <Text style={styles.scenario}><Text style={styles.questionNumber}>{questionNumber})</Text> Simplify </Text>
              <Fraction numerator={q.fraction?.num || ''} denominator={q.fraction?.denom || ''} size={24} />
            </View>
          )}
          {q.expr === 'equivalent' && (
            <View style={{width: '100%', alignItems: 'center'}}>
              <Text style={[styles.scenario, {alignSelf: 'flex-start'}]}>
                <Text style={styles.questionNumber}>{questionNumber})</Text> Work out the value of <Text style={{fontStyle: 'italic', fontWeight: '700'}}>x</Text>.
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10}}>
                <Fraction numerator={q.fraction1?.num || ''} denominator={q.fraction1?.denom || ''} size={24} />
                <Text style={[styles.question, {marginHorizontal: 10, fontSize: 18}]}> = </Text>
                <Fraction numerator={q.fraction2?.num || ''} denominator={q.fraction2?.denom || ''} size={24} />
              </View>
            </View>
          )}
          {q.expr === 'compare' && (
            <View style={{width: '100%', alignItems: 'flex-start'}}>
              <Text style={styles.question}><Text style={styles.questionNumber}>{questionNumber})</Text> Which fraction is larger.</Text>
              <View style={{width: '100%', alignItems: 'center', marginTop: 18, marginBottom: 18}}>
                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                  <View style={{margin: 8}}>
                    <Fraction numerator={q.fraction1?.num || ''} denominator={q.fraction1?.denom || ''} size={24} />
                  </View>
                  <Text style={{fontSize: 18, marginHorizontal: 18, alignSelf: 'center', fontWeight: '600'}}>or</Text>
                  <View style={{margin: 8}}>
                    <Fraction numerator={q.fraction2?.num || ''} denominator={q.fraction2?.denom || ''} size={24} />
                  </View>
                </View>
              </View>
            </View>
          )}
          {q.expr === 'non-equivalent' && q.targetFraction && (
            <View style={{alignItems: 'center', width: '100%'}}>
              <Text style={styles.question}><Text style={styles.questionNumber}>{questionNumber})</Text></Text>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                <Text style={styles.question}>One of these fractions is not equivalent to </Text>
                <Fraction numerator={q.targetFraction?.num || ''} denominator={q.targetFraction?.denom || ''} size={22} />
              </View>
              <Text style={styles.question}>Write down this fraction.</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10}}>
                {q.fractionList.map((f, idx) => (
                  <View key={idx} style={{margin: 8}}>
                    <Fraction numerator={f.num} denominator={f.denom} size={22} />
                  </View>
                ))}
              </View>
            </View>
          )}
          {q.expr === 'ordering' && (
            <View style={{alignItems: 'center', width: '100%'}}>
              <Text style={styles.question}><Text style={styles.questionNumber}>{questionNumber})</Text> Write the following fractions in order of size, start with the {q.orderDirection === 'smallest' ? 'smallest' : 'biggest'} fraction.</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10}}>
                {q.fractionList.map((f, idx) => (
                  <View key={idx} style={{margin: 8}}>
                    <Fraction numerator={f.num} denominator={f.denom} size={22} />
                  </View>
                ))}
              </View>
            </View>
          )}
          {q.expr === 'closer-to' && (
            <View style={{alignItems: 'center', width: '100%'}}>
              <Text style={styles.question}><Text style={styles.questionNumber}>{questionNumber})</Text> Work out which of the fractions is closer to {q.targetValue}.</Text>
              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10}}>
                <View style={{margin: 8}}>
                  <Fraction numerator={q.fraction1?.num || ''} denominator={q.fraction1?.denom || ''} size={24} />
                </View>
                <Text style={{fontSize: 18, marginHorizontal: 18, alignSelf: 'center', fontWeight: '600'}}>or</Text>
                <View style={{margin: 8}}>
                  <Fraction numerator={q.fraction2?.num || ''} denominator={q.fraction2?.denom || ''} size={24} />
                </View>
              </View>
            </View>
          )}
        </View>
      ) : q.table && !q.parts ? (
        <>
          <Text style={styles.scenario}>{formatSuperscripts(q.expr)}</Text>
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
        (() => {
          const raw = String(q.expr || '');
          const rawLines = raw.split('\n');
          const partsArr = [];
          for (let i = 0; i < rawLines.length; i++) {
            const txt = rawLines[i].trim();
            if (txt === '') continue;
            const breakBefore = i > 0 && rawLines[i - 1].trim() === '';
            partsArr.push({ text: txt, breakBefore });
          }
          if (partsArr.length === 0) return null;
          return (
            <View style={{width: '95%', flexDirection: 'row', alignItems: 'flex-start'}}>
              <View style={{flex:1}}>
                <Text style={[styles.scenario, {marginVertical:0}]}>
                  <Text style={styles.questionNumber}>{questionNumber})</Text>{' '}
                  {formatSuperscripts(partsArr[0].text)}
                </Text>
                {partsArr.slice(1).map((p, i) => {
                  const idx = i + 1; // original paragraph index
                  const top = p.breakBefore ? 36 : (idx === 1 ? 2 : (idx === 2 ? 4 : 6));
                  return (
                    <Text key={i} style={[styles.scenario, { marginTop: top, marginBottom: 0 }]}>
                      {formatSuperscripts(p.text)}
                    </Text>
                  );
                })}
              </View>
            </View>
          );
        })()
      )}

      {! (q.parts && q.parts.length) && (
        <TextInput
          style={[styles.input, { marginTop: 28 }]}
          value={input}
          onChangeText={setInput}
          keyboardType={(typeof q.answer === 'number') ? 'numeric' : 'default'}
          placeholder='Your answer'
          editable={!feedback}
        />
      )}
      
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navButton, historyIndex <= 0 && styles.navButtonDisabled]} 
          onPress={goToPreviousQuestion}
          disabled={historyIndex <= 0}
        >
          <Text style={styles.navArrow}>←</Text>
        </TouchableOpacity>
        
        {!feedback ? (
          <TouchableOpacity style={styles.btn} onPress={submit}>
            <Text style={styles.btnt}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btn} onPress={nextQuestion}>
            <Text style={styles.btnt}>Next Question</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.navButton, historyIndex >= questionHistory.length - 1 && styles.navButtonDisabled]} 
          onPress={goToNextInHistory}
          disabled={historyIndex >= questionHistory.length - 1}
        >
          <Text style={styles.navArrow}>→</Text>
        </TouchableOpacity>
      </View>
      
      {feedback && !isCompletion && !(q.parts && q.parts.length > 0) && q.questionType !== 'pictogram-with-clues' && (
        <View style={styles.feedbackContainer}>
          {(() => {
            const lines = feedback.split('\n');
            const correctLines = lines.filter(line => line.includes('✓'));
            const errorLines = lines.filter(line => line.includes('✗'));
            const hasCorrect = correctLines.length > 0;
            const hasErrors = errorLines.length > 0;
            
            // Check if this is a multi-part question with per-part headers
            const hasPartHeaders = lines.some(line => line === '[CORRECT_HEADER]' || line === '[ERROR_HEADER]');
            
            if (hasPartHeaders) {
              // Render with headers per part
              const parts = [];
              let currentPart = [];
              let currentHeader = null;
              
              lines.forEach((line, idx) => {
                if (line === '[CORRECT_HEADER]') {
                  if (currentPart.length > 0) {
                    parts.push({ header: currentHeader, lines: currentPart });
                  }
                  currentHeader = 'correct';
                  currentPart = [];
                } else if (line === '[ERROR_HEADER]') {
                  if (currentPart.length > 0) {
                    parts.push({ header: currentHeader, lines: currentPart });
                  }
                  currentHeader = 'error';
                  currentPart = [];
                } else if (line.trim()) {
                  currentPart.push(line);
                }
              });
              
              if (currentPart.length > 0) {
                parts.push({ header: currentHeader, lines: currentPart });
              }
              
              return parts.map((part, partIdx) => (
                <View key={partIdx} style={partIdx > 0 ? {marginTop: 16} : {}}>
                  {part.header === 'correct' && (
                    <View style={styles.correctHeader}>
                      <Text style={styles.correctHeaderText}>CORRECT</Text>
                    </View>
                  )}
                  {part.header === 'error' && (
                    <View style={styles.errorHeader}>
                      <Text style={styles.errorHeaderText}>ERRORS</Text>
                    </View>
                  )}
                  {part.lines.map((line, lineIdx) => {
                    const textWithBullet = (line.includes('✓') || line.includes('✗')) ? `• ${line}` : line;
                    return (
                      <Text key={lineIdx} style={styles.feedbackBold}>
                        {textWithBullet.split(/(\d+\.?\d*|"[^"]*")/).map((part, i) => {
                          if (/^\d+\.?\d*$/.test(part) || /^"[^"]*"$/.test(part)) {
                            return <Text key={i} style={styles.feedbackHighlight}>{part}</Text>;
                          }
                          return <Text key={i}>{part}</Text>;
                        })}
                      </Text>
                    );
                  })}
                </View>
              ));
            }
            
            // Original behavior for simple questions - always show headers
            return (
              <>
                {hasCorrect && (
                  <>
                    <View style={styles.correctHeader}>
                      <Text style={styles.correctHeaderText}>CORRECT</Text>
                    </View>
                    {correctLines.map((line, idx) => {
                      const textWithBullet = (line.startsWith('✓') || line.includes('✓')) ? `• ${line}` : line;
                      return (
                        <Text key={`correct-${idx}`} style={styles.feedbackBold}>
                          {textWithBullet.split(/(\d+\.?\d*|"[^"]*")/).map((part, i) => {
                            if (/^\d+\.?\d*$/.test(part) || /^"[^"]*"$/.test(part)) {
                              return <Text key={i} style={styles.feedbackHighlight}>{part}</Text>;
                            }
                            return <Text key={i}>{part}</Text>;
                          })}
                        </Text>
                      );
                    })}
                  </>
                )}
                {hasErrors && (
                  <>
                    <View style={[styles.errorHeader, hasCorrect && {marginTop: 16}]}>
                      <Text style={styles.errorHeaderText}>ERRORS</Text>
                    </View>
                    {errorLines.map((line, idx) => {
                      const textWithBullet = `• ${line}`;
                      return (
                        <Text key={`error-${idx}`} style={styles.feedbackBold}>
                          {textWithBullet.split(/(\d+\.?\d*|"[^"]*")/).map((part, i) => {
                            if (/^\d+\.?\d*$/.test(part) || /^"[^"]*"$/.test(part)) {
                              return <Text key={i} style={styles.feedbackHighlight}>{part}</Text>;
                            }
                            return <Text key={i}>{part}</Text>;
                          })}
                        </Text>
                      );
                    })}
                  </>
                )}
                {!hasCorrect && !hasErrors && (
                  lines.map((line, idx) => (
                    <Text key={idx} style={styles.feedbackBold}>
                      {line.split(/(\d+\.?\d*|"[^"]*")/).map((part, i) => {
                        if (/^\d+\.?\d*$/.test(part) || /^"[^"]*"$/.test(part)) {
                          return <Text key={i} style={styles.feedbackHighlight}>{part}</Text>;
                        }
                        return <Text key={i}>{part}</Text>;
                      })}
                    </Text>
                  ))
                )}
              </>
            );
          })()}
        </View>
            )}
          <Text style={styles.stat}>Score: {score} / {asked}</Text>
      <TouchableOpacity onPress={onBack} style={styles.link}><Text style={styles.linkt}>Back</Text></TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:{
    flex: 1,
    backgroundColor:'#f0f0f0',
    paddingHorizontal: 20,
    alignItems:'center',
    overflow:'visible'
  },
  contentContainer: {
    width: '100%',
    maxWidth: 1200,
    backgroundColor: '#ffffff',
    backgroundImage: 'linear-gradient(#e8f0fe 1px, transparent 1px), linear-gradient(90deg, #e8f0fe 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
  },
  title:{fontSize:24,fontWeight:'700',marginBottom:10},
  routeTitle:{fontSize:18,fontWeight:'600',marginTop:10,marginBottom:12,color:'#333'},
  table:{marginVertical:16,borderWidth:2,borderColor:'#999',overflow:'visible',minWidth:'50%',maxWidth:'80%'}, 
  tableRow:{flexDirection:'row',width:'100%'},
  tableCell:{borderRightWidth:2,borderBottomWidth:2,borderColor:'#999',padding:18,justifyContent:'center',alignItems:'center',minHeight:68},
  headerCell:{backgroundColor:'#e8f0fe'},
  headerText:{fontWeight:'700',fontSize:18,textAlign:'center'},
  cellText:{fontSize:17,textAlign:'center',fontWeight:'500'},
  scenario:{fontSize:22, marginVertical:2, lineHeight:30, textAlign:'left', width:'90%', color:'#000', fontWeight:'500', fontFamily: 'Times New Roman'},
  question:{fontSize:22, marginVertical:6, lineHeight:30, textAlign:'left', width:'90%', fontFamily: 'Times New Roman', color:'#000'},
  partIndicator:{fontSize:12, color:'#666', marginBottom:10, textAlign:'left'},
  input:{
    borderWidth:1,
    borderColor:'#d0d0d0',
    width:'60%',
    padding:8,
    borderRadius:4,
    textAlign:'center',
    backgroundColor:'#fefefe',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), inset 0 0 8px rgba(255,255,255,0.8)',
    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,250,0.95) 100%)',
  },
  btn:{backgroundColor:'#28a745',padding:10,borderRadius:6,marginTop:10,width:'60%'},
  btnt:{color:'#fff',textAlign:'center',fontWeight:'600'},
  feedbackContainer:{marginTop:16,backgroundColor:'#f8f9fa',padding:12,borderRadius:8,width:'90%',borderWidth:1,borderColor:'#dee2e6'},
  correctHeader:{backgroundColor:'#28a745',padding:10,borderRadius:6,marginBottom:12,alignItems:'center'},
  correctHeaderText:{color:'#fff',fontWeight:'700',fontSize:18,letterSpacing:1},
  errorHeader:{backgroundColor:'#dc3545',padding:10,borderRadius:6,marginBottom:12,alignItems:'center'},
  errorHeaderText:{color:'#fff',fontWeight:'700',fontSize:18,letterSpacing:1},
  feedbackBold:{marginVertical:4,fontWeight:'700',fontSize:17,lineHeight:24,color:'#000'},
  feedbackHighlight:{color:'#dc3545',fontWeight:'700',fontSize:17},
  stat:{marginTop:8,color:'#666'},
  link:{marginTop:20},
  linkt:{color:'#007bff'},
  partRow:{flexDirection:'row',alignItems:'center',width:'95%', marginBottom:8},
  partLabel:{minWidth:45, fontWeight:'700', textAlign:'right', marginRight:8, fontSize:20, fontFamily: 'Arial'},
  questionNumber:{fontWeight:'700', fontSize:20, marginRight:6, fontFamily: 'Arial', lineHeight: 26},
  textAnswerInput:{
    borderWidth:1,
    borderColor:'#d0d0d0',
    width:'100%',
    padding:12,
    borderRadius:4,
    fontSize:16,
    minHeight:80,
    backgroundColor:'#fefefe',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), inset 0 0 8px rgba(255,255,255,0.8)',
    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,250,0.95) 100%)',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
    width: '80%',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
  navArrow: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
});